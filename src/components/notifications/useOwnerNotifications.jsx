import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const getOwnerNotificationsQueryKey = (session) => ['notifications', session?.id];

export function useOwnerNotifications(session) {
  const queryClient = useQueryClient();

  const queryKey = getOwnerNotificationsQueryKey(session);

  const updateCachedNotifications = (updater) => {
    queryClient.setQueryData(queryKey, (current = []) => updater(current));
  };

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


  const { data: dispatches = [] } = useQuery({
    queryKey: ['portal-dispatches', session?.company_id],
    queryFn: () => base44.entities.Dispatch.filter({ company_id: session.company_id }, '-date', 200),
    enabled: !!session?.company_id && session?.code_type !== 'Admin',
  });

  const validDispatchIds = new Set(dispatches.map((dispatch) => dispatch.id));

  // Unread first, then newest first
  const notifications = rawNotifications.filter((notification) => {
    if (!notification.related_dispatch_id) return true;
    if (session?.code_type === 'Admin') return true;
    return validDispatchIds.has(notification.related_dispatch_id);
  }).sort((a, b) => {
    if (a.read_flag !== b.read_flag) return a.read_flag ? 1 : -1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const unreadCount = notifications.filter(n => !n.read_flag).length;

  const markReadMutation = useMutation({
    mutationFn: (id) => {
      return base44.entities.Notification.update(id, { read_flag: true });
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey, exact: true });
      const previous = queryClient.getQueryData(queryKey) || [];

      updateCachedNotifications((current) => current.map((notification) => (
        notification.id === id ? { ...notification, read_flag: true } : notification
      )));

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey, exact: true, refetchType: 'active' });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.read_flag);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read_flag: true })));
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey, exact: true });
      const previous = queryClient.getQueryData(queryKey) || [];

      updateCachedNotifications((current) => current.map((notification) => ({
        ...notification,
        read_flag: true,
      })));

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey, exact: true, refetchType: 'active' }),
  });

  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey, exact: true, refetchType: 'active' }),
    queryClient.invalidateQueries({ queryKey: ['portal-dispatches', session?.company_id] }),
  ]);

  const markRead = (id) => markReadMutation.mutate(id);
  const markReadAsync = (id) => markReadMutation.mutateAsync(id);
  const markAllRead = () => markAllReadMutation.mutate();

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh,
    markRead,
    markReadAsync,
    markAllRead,
    markAllReadPending: markAllReadMutation.isPending,
  };
}
