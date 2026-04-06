import { AnimalReport } from './types';

interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'ngo_alert' | 'reporter_update' | 'escalation_alert';
  reportId: string;
  timestamp: Date;
}

const messageLog: WhatsAppMessage[] = [];

/**
 * Mock WhatsApp sender - logs messages to console and in-memory storage
 * In production, replace with actual Twilio integration
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  type: WhatsAppMessage['type'],
  reportId: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const whatsappMessage: WhatsAppMessage = {
      to: phoneNumber,
      message,
      type,
      reportId,
      timestamp: new Date(),
    };

    messageLog.push(whatsappMessage);

    // Mock Twilio integration - log to console
    console.log('[WhatsApp] Message sent:', {
      to: phoneNumber,
      type,
      reportId,
      message,
      timestamp: new Date().toISOString(),
    });

    // In production, this would be:
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // const response = await client.messages.create({
    //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM_NUMBER}`,
    //   to: `whatsapp:${phoneNumber}`,
    //   body: message,
    // });
    // return { success: true, messageId: response.sid };

    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  } catch (error) {
    console.error('[WhatsApp] Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send NGO notification when a new report is submitted
 */
export async function notifyNGOOfReport(ngo: {
  name: string;
  phone: string;
  areas: string[];
}, report: AnimalReport): Promise<void> {
  const message = `🆘 PawAlert: New ${report.animalType.toUpperCase()} rescue needed!\n\n📍 Location: ${report.location}, ${report.area}\n🐾 Details: ${report.notes || 'No additional notes'}\n📞 Reporter: ${report.reporterContact}\n\nReply ACCEPT to help or DECLINE if unavailable.`;

  await sendWhatsAppMessage(ngo.phone, message, 'ngo_alert', report.id);
}

/**
 * Send update to reporter when NGO accepts
 */
export async function notifyReporterOfAcceptance(report: AnimalReport, ngoName: string, ngoContact: string): Promise<void> {
  const message = `✅ Good news! ${ngoName} has accepted your animal rescue request.\n\n📞 They will contact you soon at ${ngoContact}\n🆘 Report ID: ${report.id}\n\nThank you for helping save lives!`;

  await sendWhatsAppMessage(report.reporterContact, message, 'reporter_update', report.id);
}

/**
 * Send escalation alert when no NGO responds in 30 minutes
 */
export async function notifyEscalation(report: AnimalReport, nextNGO: {
  name: string;
  phone: string;
}): Promise<void> {
  const message = `🚨 PawAlert Escalation: Previous NGOs unavailable\n\n${report.animalType.toUpperCase()} rescue at ${report.location}\n\nThis is urgent! Please respond ASAP.\n\nReply ACCEPT to help or DECLINE.`;

  await sendWhatsAppMessage(nextNGO.phone, message, 'escalation_alert', report.id);
}

/**
 * Get all messages sent (for debugging/monitoring)
 */
export function getMessageLog(): WhatsAppMessage[] {
  return [...messageLog];
}

/**
 * Clear message log (for testing)
 */
export function clearMessageLog(): void {
  messageLog.length = 0;
}
