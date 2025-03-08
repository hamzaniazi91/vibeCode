import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { handleChatbot } from '../../chatbot/handler';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message.text;
    
    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful real estate agent. Answer questions about properties and availability.",
        },
        {
          role: "user",
          content: message,
        }
      ],
    });

    const responseText = completion.choices[0].message.content;

    // Use chatbot handler to format the response
    const twilioResponse = handleChatbot(responseText, body.message.from);

    return NextResponse.json(twilioResponse);
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to process message' },
      { status: 500 }
    );
  }
}
