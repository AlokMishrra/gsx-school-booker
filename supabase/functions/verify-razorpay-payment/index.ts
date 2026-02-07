import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = await req.json();

    // Verify signature using HMAC SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(RAZORPAY_KEY_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Payment verification failed: Invalid signature");
    }

    // Update payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq("booking_id", booking_id);

    if (paymentError) throw paymentError;

    // Update booking status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", booking_id);

    if (bookingError) throw bookingError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error verifying payment:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage, success: false }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
