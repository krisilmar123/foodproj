import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type ReviewStatus = "pending" | "approved" | "rejected";

interface FoodPhoto {
  id: string;
  image_url: string;
  caption: string;
  cuisine: string;
  photographer: string;
  review_status: ReviewStatus;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const VALID_STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status: number): Response {
  return jsonResponse({ error: message }, status);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    return errorResponse("Server configuration error", 500);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/photos-api/, "");

  try {
    // GET /photos — list photos with optional status & cuisine filters
    if (req.method === "GET" && (path === "/photos" || path === "")) {
      const statusParam = url.searchParams.get("status");
      const cuisineParam = url.searchParams.get("cuisine");

      let query = supabase
        .from("food_photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusParam && VALID_STATUSES.includes(statusParam as ReviewStatus)) {
        query = query.eq("review_status", statusParam);
      }

      if (cuisineParam) {
        query = query.ilike("cuisine", cuisineParam);
      }

      const { data, error } = await query;

      if (error) {
        return errorResponse("Failed to fetch photos", 500);
      }

      return jsonResponse(data as FoodPhoto[]);
    }

    // GET /photos/:id — get a single photo
    const singleMatch = path.match(/^\/photos\/([\w-]+)$/);
    if (req.method === "GET" && singleMatch) {
      const id = singleMatch[1];
      const { data, error } = await supabase
        .from("food_photos")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        return errorResponse("Failed to fetch photo", 500);
      }

      if (!data) {
        return errorResponse("Photo not found", 404);
      }

      return jsonResponse(data as FoodPhoto);
    }

    // PATCH /photos/:id — update review status
    if (req.method === "PATCH" && singleMatch) {
      const id = singleMatch[1];
      const body = await req.json().catch(() => null);

      if (!body || typeof body.review_status !== "string") {
        return errorResponse("Missing or invalid review_status", 400);
      }

      const newStatus = body.review_status as ReviewStatus;
      if (!VALID_STATUSES.includes(newStatus)) {
        return errorResponse(
          `Invalid review_status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          400,
        );
      }

      const updatePayload: Record<string, unknown> = {
        review_status: newStatus,
        reviewed_at: new Date().toISOString(),
      };

      if (typeof body.review_notes === "string") {
        updatePayload.review_notes = body.review_notes;
      } else if (body.review_notes === null) {
        updatePayload.review_notes = null;
      }

      const { data, error } = await supabase
        .from("food_photos")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) {
        return errorResponse("Failed to update photo", 500);
      }

      if (!data) {
        return errorResponse("Photo not found", 404);
      }

      return jsonResponse(data as FoodPhoto);
    }

    return errorResponse("Not found", 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
