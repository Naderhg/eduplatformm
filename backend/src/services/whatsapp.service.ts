import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Formats a phone number to standard international format (+20...) for WhatsApp
 * @param phone Raw phone number string
 */
export const formatWhatsAppNumber = (phone: string): string => {
  let formatted = phone.trim();
  
  // Remove any spaces, dashes, or parentheses
  formatted = formatted.replace(/[\s\-\(\)]/g, '');

  if (formatted.startsWith('whatsapp:')) {
    return formatted;
  }

  // Handle Egypt phone numbers starting with '01' (e.g. 01208349801 -> +201208349801)
  if (formatted.startsWith('01') && formatted.length === 11) {
    formatted = '+20' + formatted.substring(1);
  } else if (formatted.startsWith('1') && formatted.length === 10) {
    formatted = '+20' + formatted;
  } else if (formatted.startsWith('20') && !formatted.startsWith('+')) {
    formatted = '+' + formatted;
  } else if (!formatted.startsWith('+')) {
    // Fallback default: prepend '+'
    formatted = '+' + formatted;
  }

  return `whatsapp:${formatted}`;
};

/**
 * Sends a WhatsApp message using Twilio
 * @param to Destination phone number (e.g. +201208349801 or 01208349801)
 * @param body Message content
 */
export const sendWhatsAppMessage = async (
  to: string,
  body: string,
  contentSid?: string,
  contentVariables?: Record<string, string>
) => {
  if (!to) {
    console.log('Skipping WhatsApp notification: No recipient phone number provided.');
    return null;
  }

  if (!client) {
    console.warn('Twilio client is not initialized. Please verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in environment.');
    return null;
  }

  const formattedTo = formatWhatsAppNumber(to);
  const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

  try {
    console.log(`Sending WhatsApp message From: ${formattedFrom} To: ${formattedTo} (Template: ${contentSid || 'None'})`);
    
    const messagePayload: any = {
      from: formattedFrom,
      to: formattedTo,
    };

    if (contentSid) {
      messagePayload.contentSid = contentSid;
      if (contentVariables) {
        messagePayload.contentVariables = JSON.stringify(contentVariables);
      }
    } else {
      messagePayload.body = body;
    }

    const message = await client.messages.create(messagePayload);
    console.log(`WhatsApp message sent successfully. Message SID: ${message.sid}`);
    return message;
  } catch (error: any) {
    console.error('Failed to send WhatsApp message via Twilio:', error);
    // Don't throw to prevent interrupting the main request execution flow
    return null;
  }
};
