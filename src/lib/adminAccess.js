// Who may use the LTO admin site: only LTO staff accounts, profiles.role 'lto_admin' or 'lto_superadmin'
// (migration 20261029120000_lto_admin_roles.sql). PSTDM admins, enforcers and LTMS portal drivers get the
// wrong-password answer.
export const LTO_ROLES = ['lto_superadmin', 'lto_admin'];

export const mayUseAdminSite = (profile, user) =>
  !!profile && LTO_ROLES.includes(profile.role?.toLowerCase()) && user?.user_metadata?.portal !== 'driver';
