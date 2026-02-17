import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const {
      items,
      fulfillment_type,
      region_id,
      pickup_location_id,
      delivery_address,
      delivery_fee_tier_id,
      delivery_fee_cents,
      tax_cents,
      age_verified,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!age_verified) {
      return NextResponse.json(
        { error: "Age verification required" },
        { status: 400 }
      );
    }

    // Server-side price validation: look up each product from DB
    const skus = items.map((i: any) => i.sku);
    const { data: products } = await supabase
      .from("products")
      .select("sku, product_name, price_in_cents")
      .in("sku", skus);

    if (!products || products.length !== items.length) {
      return NextResponse.json(
        { error: "Some products not found" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.sku, p]));

    const line_items = items.map((item: any) => {
      const product = productMap.get(item.sku)!;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.product_name,
          },
          unit_amount: product.price_in_cents,
        },
        quantity: item.quantity,
      };
    });

    // Add delivery fee as a line item if applicable
    if (fulfillment_type === "delivery" && delivery_fee_cents > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: delivery_fee_cents,
        },
        quantity: 1,
      });
    }

    // Add tax as a line item
    if (tax_cents > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Sales Tax",
          },
          unit_amount: tax_cents,
        },
        quantity: 1,
      });
    }

    // Calculate server-side subtotal for validation
    const subtotalCents = items.reduce((sum: number, item: any) => {
      const product = productMap.get(item.sku)!;
      return sum + product.price_in_cents * item.quantity;
    }, 0);

    // Create the order in our database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        fulfillment_type,
        region_id,
        pickup_location_id,
        delivery_address,
        delivery_fee_tier_id,
        subtotal_cents: subtotalCents,
        delivery_fee_cents: delivery_fee_cents || 0,
        tax_cents: tax_cents || 0,
        total_cents: subtotalCents + (delivery_fee_cents || 0) + (tax_cents || 0),
        status: "pending",
        age_verified,
        payment_method: "stripe",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation failed:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Insert order items
    const orderItems = items.map((item: any) => {
      const product = productMap.get(item.sku)!;
      return {
        order_id: order.id,
        sku: item.sku,
        product_name: product.product_name,
        quantity: item.quantity,
        price_in_cents: product.price_in_cents,
      };
    });

    await supabase.from("order_items").insert(orderItems);

    // Create Stripe checkout session
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/checkout/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
    });

    // Update order with stripe session ID
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
