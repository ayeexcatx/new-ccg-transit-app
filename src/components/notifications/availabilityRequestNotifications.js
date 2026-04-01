import { base44 } from '@/api/base44Client';

export const AVAILABILITY_REQUEST_NOTIFICATION_CATEGORY = 'availability_request';
export const AVAILABILITY_REQUEST_NOTIFICATION_TYPE = 'owner_availability_request';

const toTimestampMs = (value) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

export function isAvailabilityRequestNotification(notification) {
  return notification?.notification_category === AVAILABILITY_REQUEST_NOTIFICATION_CATEGORY;
}

export function getAvailabilityRequestCreatedAtMs(notification) {
  return toTimestampMs(notification?.created_date);
}

export function getLatestAvailabilityUpdateMs({ defaults = [], overrides = [] } = {}) {
  const allRows = [...(Array.isArray(defaults) ? defaults : []), ...(Array.isArray(overrides) ? overrides : [])];
  return allRows.reduce((latest, row) => {
    const rowTs = Math.max(toTimestampMs(row?.updated_date), toTimestampMs(row?.created_date));
    return rowTs > latest ? rowTs : latest;
  }, 0);
}

export function isAvailabilityRequestUnresolved(notification, latestAvailabilityUpdateMs = 0) {
  if (!isAvailabilityRequestNotification(notification)) return false;
  const requestedAt = getAvailabilityRequestCreatedAtMs(notification);
  return requestedAt > latestAvailabilityUpdateMs;
}

export async function createAvailabilityRequestNotifications({
  companyId,
  companyName,
  requestedByLabel,
}) {
  if (!companyId) return { created: [], ownerCount: 0 };

  const ownerCodes = await base44.entities.AccessCode.filter({
    company_id: companyId,
    active_flag: true,
    code_type: 'CompanyOwner',
  }, '-created_date', 200);

  const eligibleOwnerCodes = (ownerCodes || []).filter((code) => code?.id && code?.code_type === 'CompanyOwner' && code?.active_flag !== false);
  if (!eligibleOwnerCodes.length) return { created: [], ownerCount: 0 };

  const title = 'Availability Requested';
  const actorLine = requestedByLabel ? `Requested by ${requestedByLabel}.` : 'Requested by CCG admin.';
  const message = [
    'CCG requested your availability.',
    'Please update your availability.',
    actorLine,
  ].join(' ');

  const created = await Promise.all(eligibleOwnerCodes.map((ownerCode) =>
    base44.entities.Notification.create({
      recipient_type: 'AccessCode',
      recipient_access_code_id: ownerCode.id,
      recipient_id: ownerCode.id,
      recipient_company_id: companyId,
      title,
      message,
      read_flag: false,
      notification_category: AVAILABILITY_REQUEST_NOTIFICATION_CATEGORY,
      notification_type: AVAILABILITY_REQUEST_NOTIFICATION_TYPE,
    })
  ));

  return {
    created,
    ownerCount: eligibleOwnerCodes.length,
    companyName: companyName || null,
  };
}
