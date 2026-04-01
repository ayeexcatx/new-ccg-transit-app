import {
  buildConfirmedTruckSetForStatus,
  parseStatusFromDispatchStatusKey,
  reconcileRequiredTruckList,
} from './confirmationStateHelpers';
import { NON_CONFIRMATION_NOTIFICATION_CATEGORIES } from './ownerActionStatus';

const dedupeTruckRows = (rows) => {
  const seen = new Set();
  return rows.filter((row) => {
    const key = `${row.notificationId}:${row.truckNumber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const parseStatusFromDedupKey = (notification) => parseStatusFromDispatchStatusKey(notification?.dispatch_status_key);

const resolveRequiredTrucks = (notification, dispatch, ownerScopeTrucks = []) => {
  const baseRequired = Array.isArray(notification?.required_trucks)
    ? notification.required_trucks
    : [];

  if (!baseRequired.length) return [];
  if (!ownerScopeTrucks?.length) {
    const dispatchTruckSet = new Set(dispatch?.trucks_assigned || []);
    return baseRequired.filter((truck) => dispatchTruckSet.has(truck));
  }

  return reconcileRequiredTruckList({
    existingRequired: baseRequired,
    dispatchTrucks: dispatch?.trucks_assigned || [],
    ownerAllowedTrucks: ownerScopeTrucks,
  });
};

export function buildOpenConfirmationRows({
  notifications = [],
  confirmations = [],
  dispatches = [],
  companies = [],
  accessCodes = [],
}) {
  const dispatchById = new Map(dispatches.map((dispatch) => [dispatch.id, dispatch]));
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const accessCodeById = new Map(accessCodes.map((accessCode) => [accessCode.id, accessCode]));

  const rows = [];

  notifications.forEach((notification) => {
    const isOwnerNotification = notification.recipient_type === 'AccessCode';
    const isConfirmationCategory = !NON_CONFIRMATION_NOTIFICATION_CATEGORIES.has(notification.notification_category);

    if (!isOwnerNotification || !isConfirmationCategory) return;

    const status = parseStatusFromDedupKey(notification);
    if (!status) return;

    const dispatch = dispatchById.get(notification.related_dispatch_id);
    if (!dispatch) return;
    if (String(dispatch.status || '').trim() !== status) return;

    const ownerCodeId = notification.recipient_access_code_id || notification.recipient_id;
    const ownerCode = accessCodeById.get(ownerCodeId);
    if (ownerCode && ownerCode.code_type !== 'CompanyOwner') return;
    const ownerCompany = companyById.get(dispatch.company_id);
    const ownerScopeTrucks = Array.isArray(ownerCompany?.trucks) ? ownerCompany.trucks : [];

    const requiredTrucks = resolveRequiredTrucks(notification, dispatch, ownerScopeTrucks);
    if (!requiredTrucks.length) return;

    const confirmedTrucks = buildConfirmedTruckSetForStatus({
      confirmations,
      dispatchId: dispatch.id,
      status,
    });

    const pendingTrucks = requiredTrucks.filter((truckNumber) => !confirmedTrucks.has(truckNumber));
    if (!pendingTrucks.length) return;

    const companyName = companyById.get(dispatch.company_id)?.name || 'Unknown Company';

    pendingTrucks.forEach((truckNumber) => {
      rows.push({
        id: `${notification.id}:${truckNumber}`,
        notificationId: notification.id,
        dispatchId: dispatch.id,
        status,
        companyName,
        dispatchDate: dispatch.date,
        truckNumber,
        clientName: dispatch.client_name || '',
        jobNumber: dispatch.job_number || '',
        referenceTag: dispatch.reference_tag || '',
        createdAt: notification.created_date || notification.created_at || null,
      });
    });
  });

  return dedupeTruckRows(rows).sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}
