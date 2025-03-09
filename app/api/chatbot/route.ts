import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { supabase } from '../../../utils/supabase';
import { logger } from '../../../utils/logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  try {
    const start = Date.now();
    const body = await request.json();
    logger.info('Incoming chatbot request:', { body });

    const { From, Body } = body;
    if (!From || !Body) {
      logger.error('Invalid request: missing From or Body');
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Fetch property details based on the inquiry
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title, amenities, location, price');

    if (propertiesError) {
      logger.error('Error fetching properties:', propertiesError);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }
    
    // Generate a response based on the inquiry
    const response = generateResponse(Body, properties);

    // Send the response back to the user
    const twilioResponse = await client.messages.create({
      to: From,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      body: response,
    });

    logger.info('Successfully sent response:', {
      response,
      twilioResponse,
      duration: Date.now() - start
    });

    return NextResponse.json({ status: 'success', response });
  } catch (error) {
    logger.error('Error processing chatbot request:', error);
    console.error('Error processing chatbot request:', error);
    return NextResponse.json( 
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  } 
} 

function generateResponse(inquiry: string, properties: any[]) {
  const cleanedInquiry = inquiry.toLowerCase().trim();
  const responses: { [key: string]: string } = {};

  // Populate responses based on common inquiries

  properties.forEach(property => {
    responses[`amenities ${property.id}`] = `Property ${property.title} has the following amenities: ${property.amenities.join(', ')}`;
    responses[`location ${property.id}`] = `Property ${property.title} is located at ${property.location}.`;
    responses[`price ${property.id}`] = `The price for property ${property.title} is $${property.price}.`;
  });

  // Check for specific property inquiries
  if (cleanedInquiry.includes('property')) {
    const propertyId = cleanedInquiry.split(' ').pop();
    const matchingProperty = properties.find(p => p.id === propertyId);
    if (matchingProperty) {
      return `Here are the details for property ${matchingProperty.title}:\n- Location: ${matchingProperty.location}\n- Price: $${matchingProperty.price}\n- Amenities: ${matchingProperty.amenities.join(', ')}`;
    } else {
      return 'Property not found. Please check the property ID and try again.';
    }
  }

  // Handle general inquiries based on keywords in the message body   
  if (cleanedInquiry.includes('amenities')) {
    return properties.map(p => `${p.title}: ${p.amenities.join(', ')}`).join('\n');
  } else if (cleanedInquiry.includes('location')) {
    return properties.map(p => `${p.title}: ${p.location}`).join('\n');
  } else if (cleanedInquiry.includes('price')) {
    return properties.map(p => `${p.title}: $${p.price}`).join('\n');
  } else if (cleanedInquiry.includes('help')) {
    return 'How can I assist you today? I can provide information on property amenities, locations, prices, and more.';
  } else {
    return 'Thank you for your inquiry. We will get back to you soon with more details.';
  }
}
