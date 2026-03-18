import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useConfirmationsQuery } from './useConfirmationsQuery';
import { getOwnerNotificationActionStatus } from './ownerActionStatus';

export function useOwnerNotifications(session) {
  const queryClient = useQueryClient();

  const queryKey = ['notifications', session?.id];

  const { data: rawNotifications = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!session) return [];
      if (session.code_type === 'Admin') {
        return base44.entities.Notification.filter({ recipient_type: 'Admin' }, '-created_date', 200);
      }
      // Fetch all AccessCode notifications then client-filter to tolerate either recipient field
      const all = await base44.entities.Notification.filter({ recipient_type: 'AccessCode' }, '-created_date', 200);
      return all.filter(n =>
        n.recipient_access_code_id === session.id || n.recipient_id === session.id
      );
    },
    enabled: !!session,
    refetchInterval: 30000,
  });


  const { data: driverAssignments = [] } = useQuery({
    queryKey: ['driver-dispatch-assignments', session?.driver_id],
    queryFn: () => base44.entities.DriverDispatchAssignment.filter({ driver_id: session.driver_id }, '-assigned_datetime', 500),
    enabled: session?.code_type === 'Driver' && !!session?.driver_id,
  });


  const { data: confirmations = [] } = useConfirmationsQuery(session?.code_type === 'CompanyOwner');

  const { data: dispatches = [] } = useQuery({
    queryKey: ['portal-dispatches', session?.company_id],
    queryFn: () => base44.entities.Dispatch.filter({ company_id: session.company_id }, '-date', 200),
    enabled: !!session?.company_id && session?.code_type !== 'Admin',
  });

  const driverDispatchIds = new Set(
    driverAssignments
      .filter((assignment) => assignment?.active_flag !== false)
      .map((assignment) => assignment.dispatch_id)
      .filter(Boolean)
  );

  const validDispatchIds = new Set(dispatches.map((dispatch) => dispatch.id));

  // Unread first, then newest first
  const notifications = rawNotifications.filter((notification) => {
    if (!notification.related_dispatch_id) return true;
    if (session?.code_type === 'Admin') return true;
    if (session?.code_type === 'Driver') {
      if (notification.notification_category === 'driver_dispatch_update') return true;
      return driverDispatchIds.has(notification.related_dispatch_id);
    }
    return validDispatchIds.has(notification.related_dispatch_id);
  }).sort((a, b) => {
    if (a.read_flag !== b.read_flag) return a.read_flag ? 1 : -1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const notificationsWithStatus = notifications.map((notification) => ({
    ...notification,
    effectiveReadFlag: session?.code_type === 'CompanyOwner'
      ? getOwnerNotificationActionStatus({
          notification,
          dispatch: notification.related_dispatch_id ? dispatches.find((dispatch) => dispatch.id === notification.related_dispatch_id) || null : null,
          confirmations,
          ownerAllowedTrucks: session?.allowed_trucks || [],
        }).effectiveReadFlag
      : Boolean(notification.read_flag),
  }));

  const unreadCount = notificationsWithStatus.filter((notification) => !notification.effectiveReadFlag).length;

  const markReadMutation = useMutation({
    mutationFn: (id) => {
      return base44.entities.Notification.update(id, { read_flag: true });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });

      const previousNotifications = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (current = []) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read_flag: true } : notification
        )
      );

      return { previousNotifications };
    },
    onError: (_error, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKey, context.previousNotifications);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['portal-dispatches', session?.company_id] });
      queryClient.invalidateQueries({ queryKey: ['driver-dispatch-assignments', session?.driver_id] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read_flag);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read_flag: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey }),
    queryClient.invalidateQueries({ queryKey: ['portal-dispatches', session?.company_id] }),
  ]);

  const markRead = (id) => markReadMutation.mutate(id);
  const markReadAsync = (id) => markReadMutation.mutateAsync(id);
  const markAllRead = () => markAllReadMutation.mutate();

  return {
    notifications: notificationsWithStatus,
    unreadCount,
    isLoading,
    refresh,
    markRead,
    markReadAsync,
    markAllRead,
    markAllReadPending: markAllReadMutation.isPending,
  };
}
