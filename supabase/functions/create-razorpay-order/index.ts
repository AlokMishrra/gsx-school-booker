import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = "rzp_live_SCRcvtqJ5ouvgY";
    const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured");
    }

    const { amount, currency = "INR", receipt, notes } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Create Razorpay order
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes,
      }),
    });

    const order = await response.json();

    if (!response.ok) {
      throw new Error(`Razorpay API error [${response.status}]: ${JSON.stringify(order)}`);
    }

    return new Response(JSON.stringify({ order_id: order.id, amount: order.amount, currency: order.currency }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating Razorpay order:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
