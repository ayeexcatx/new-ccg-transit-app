export function resolveProfileName(user) {
  const candidates = [
    user?.full_name,
    user?.display_name,
    user?.name,
  ];

  const resolved = candidates.find((value) => String(value || '').trim());
  return resolved ? String(resolved).trim() : '';
}

export function resolveAdminDisplayName(user) {
  const profileName = resolveProfileName(user);
  if (profileName) return profileName;

  const email = String(user?.email || '').trim();
  if (email) return email;

  return 'Admin';
}

export function resolveAdminDisplayNameFromSession(session) {
  const candidates = [
    session?.admin_display_name,
    session?.label,
    session?.name,
    session?.email,
  ];
  const resolved = candidates.find((value) => String(value || '').trim());
  return resolved ? String(resolved).trim() : 'Admin';
}
