import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '../../../utils/supabase';

const stripe = new Stripe(process.env.STRIPE_API_KEY || '', {
  apiVersion: '2024-12-18.acacia',
  types: {
    PaymentMethod: {
      type: 'string',
    },
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, paymentMethodId, propertyId } = body;

    if (!amount || !currency || !paymentMethodId || !propertyId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      confirm: true,
    });

    if (paymentIntent.status === 'succeeded') {
      // Extract payment method type safely
      const paymentMethod = paymentIntent.payment_method;
      const paymentMethodType = paymentMethod ? paymentMethod.type : 'unknown';

      // Record the payment in the database
      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            property_id: propertyId,
            user_id: paymentIntent.receipt_email,
            amount: amount,
            currency: currency,
            payment_method: paymentMethodType,
            status: paymentIntent.status,
          },
        ]);

      if (error) {
        console.error('Error recording payment:', error);
        return NextResponse.json(
          { error: 'Failed to record payment' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: 'success',
        paymentIntent,
        data,
      });
    }

    return NextResponse.json(
      { error: 'Payment failed' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
