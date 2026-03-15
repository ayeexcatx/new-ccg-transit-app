import { base44 } from '@/api/base44Client';
import { formatDispatchDateTimeLine } from '@/components/notifications/dispatchDateTimeFormat';

const SMS_PROVIDER = 'signalwire';

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}


function normalizeSmsPhone(value) {
  const raw = normalizeText(value);
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return raw;
}

async function buildSmsMessage(notification) {
  const fallback = normalizeText(notification?.message);
  if (!notification?.related_dispatch_id) return fallback;

  const headline = normalizeText(notification?.title) || 'Dispatch Update.';

  try {
    const dispatchRecords = await base44.entities.Dispatch.filter({ id: notification.related_dispatch_id }, '-created_date', 1);
    const dispatch = dispatchRecords?.[0] || null;
    const dateLine = formatDispatchDateTimeLine(dispatch);

    if (!dateLine) return `CCG Transit: ${headline}\n\nPlease open the app to view and confirm.`;

    return `CCG Transit: ${headline}\n${dateLine}\n\nPlease open the app to view and confirm.`;
  } catch (error) {
    console.error('SMS message formatting fallback used', {
      notificationId: notification?.id || null,
      error,
    });
    return `CCG Transit: ${headline}\n\nPlease open the app to view and confirm.`;
  }
}

function maskPhone(value) {
  const normalized = String(value || '').trim();
  if (!normalized) return null;

  const lastFour = normalized.slice(-4);
  return `***${lastFour}`;
}

async function createSmsLog({
  notification,
  recipient,
  phone,
  message,
  status,
  skipReason = null,
  errorMessage = null,
  provider = SMS_PROVIDER,
  providerMessageId = null,
  sentAt = null,
}) {
  try {
    await base44.entities.General.create({
      record_type: 'sms_log',
      notification_id: notification?.id || null,
      dispatch_id: notification?.related_dispatch_id || null,
      recipient_access_code_id: recipient?.id || notification?.recipient_access_code_id || notification?.recipient_id || null,
      recipient_type: notification?.recipient_type || null,
      recipient_name: recipient?.label || recipient?.name || recipient?.code || null,
      phone: phone || null,
      message: message || null,
      status,
      skip_reason: skipReason,
      error_message: errorMessage,
      provider,
      provider_message_id: providerMessageId,
      sent_at: sentAt,
    });

    console.log('SMS debug: General log create succeeded', {
      notificationId: notification?.id || null,
      status,
      skipReason: skipReason || null,
    });
  } catch (error) {
    console.error('SMS debug: General log create failed', {
      notificationId: notification?.id || null,
      status,
      skipReason: skipReason || null,
      error,
    });
  }
}

async function resolveRecipientAccessCode(notification) {
  const recipientId = notification?.recipient_access_code_id || notification?.recipient_id;
  if (!recipientId) return null;

  const records = await base44.entities.AccessCode.filter({ id: recipientId }, '-created_date', 1);
  return records?.[0] || null;
}

export async function sendNotificationSmsIfEligible(notification) {
  try {
    if (!notification?.id) return;

    const smsMessage = await buildSmsMessage(notification);

    console.log('SMS debug: sendNotificationSmsIfEligible invoked', {
      notificationId: notification.id,
      recipientType: notification.recipient_type,
      recipientAccessCodeId: notification.recipient_access_code_id || null,
      recipientId: notification.recipient_id || null,
      title: notification.title || null,
    });

    if (notification.recipient_type !== 'AccessCode') {
      console.log('SMS debug exit: recipient not AccessCode', {
        notificationId: notification.id,
        recipientType: notification.recipient_type,
        recipientAccessCodeId: notification.recipient_access_code_id || null,
        recipientId: notification.recipient_id || null,
      });

      await createSmsLog({
        notification,
        recipient: null,
        phone: null,
        message: smsMessage || null,
        status: 'skipped',
        skipReason: 'recipient_not_access_code',
      });
      return;
    }

    const recipient = await resolveRecipientAccessCode(notification);
    if (!recipient) {
      console.log('SMS debug exit: recipient access code not found', {
        notificationId: notification.id,
        recipientAccessCodeId: notification.recipient_access_code_id || null,
        recipientId: notification.recipient_id || null,
      });

      await createSmsLog({
        notification,
        recipient: null,
        phone: null,
        message: smsMessage || null,
        status: 'skipped',
        skipReason: 'recipient_access_code_not_found',
      });
      return;
    }

    const smsEnabled = recipient.sms_enabled === true;
    const smsPhone = normalizeSmsPhone(recipient.sms_phone);

    if (!smsEnabled) {
      console.log('SMS debug exit: sms disabled', {
        notificationId: notification.id,
        recipientAccessCodeId: recipient.id,
      });

      await createSmsLog({
        notification,
        recipient,
        phone: smsPhone || null,
        message: smsMessage || null,
        status: 'skipped',
        skipReason: 'sms_disabled',
      });
      return;
    }

    if (!smsPhone) {
      console.log('SMS debug exit: missing sms phone', {
        notificationId: notification.id,
        recipientAccessCodeId: recipient.id,
      });

      await createSmsLog({
        notification,
        recipient,
        phone: null,
        message: smsMessage || null,
        status: 'skipped',
        skipReason: 'missing_sms_phone',
      });
      return;
    }

    console.log('SMS debug: before invoking backend function', {
      notificationId: notification.id,
      recipientAccessCodeId: recipient.id,
      phoneMasked: maskPhone(smsPhone),
      relatedDispatchId: notification.related_dispatch_id || null,
    });

    const response = await base44.functions.invoke('sendNotificationSms/entry', {
      phone: smsPhone,
      message: smsMessage,
      notificationId: notification.id,
      dispatchId: notification.related_dispatch_id || null,
      recipientAccessCodeId: recipient.id,
    });

    const responseData = response?.data || response || {};

    console.log('SMS debug: after backend function response', {
      notificationId: notification.id,
      recipientAccessCodeId: recipient.id,
      responseData,
    });

    if (responseData?.ok) {
      await createSmsLog({
        notification,
        recipient,
        phone: smsPhone,
        message: smsMessage || null,
        status: 'sent',
        provider: responseData.provider || SMS_PROVIDER,
        providerMessageId: responseData.providerMessageId || null,
        sentAt: responseData.sentAt || new Date().toISOString(),
      });
      return;
    }

    const reason = responseData?.reason || null;
    const isProviderNotConfigured = reason === 'provider_not_configured';
    const errorMessage = responseData?.error || 'Unknown SignalWire provider error';

    await createSmsLog({
      notification,
      recipient,
      phone: smsPhone,
      message: smsMessage || null,
      status: isProviderNotConfigured ? 'skipped' : 'failed',
      skipReason: isProviderNotConfigured ? 'provider_not_configured' : null,
      errorMessage,
      provider: responseData?.provider || SMS_PROVIDER,
      providerMessageId: responseData?.providerMessageId || null,
    });
  } catch (error) {
    console.error('SMS delivery attempt failed:', error);

    await createSmsLog({
      notification,
      recipient: null,
      phone: null,
      message: notification?.message || null,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
}
