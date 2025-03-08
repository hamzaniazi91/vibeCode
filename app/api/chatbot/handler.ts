import twilio from 'twilio';

export async function handleChatbot(message: string, senderId: string): Promise<{ body: any }> {
  try {
    const cleanedMessage = message.toLowerCase().trim();
    
    // Define responses based on common inquiries
    const responses: { [key: string]: string } = {
      'hello': 'Hello! How can I assist you today?',
      'help': "I'm here to help. What do you need assistance with?",
      'thank you': 'You\'re welcome!',
      'goodbye': 'Goodbye! Have a great day!',
    };

    // Check for specific keywords
    const inquiryType = Object.keys(responses).find(key => 
      cleanedMessage.includes(key)
    );

    let responseText = 'I didn\'t understand your request. Please try again.';
    
    if (inquiryType) {
      responseText = responses[inquiryType];
    }

    return {
      body: {
        messaging_product: 'WHATSAPP',
        to: senderId,
        type: 'text',
        text: responseText
      }
    };

  } catch (error) {
    console.error('Error in chatbot handler:', error);
    return {
      body: {
        messaging_product: 'WHATSAPP',
        to: senderId,
        type: 'text',
        text: 'Sorry, there was an error processing your request. Please try again.'
      }
    };
  }
}
