/**
 * Multi-Tenancy Utility
 * Provides helpers for filtering data by tenant_id (RLS context)
 */

export const getTenantFilter = (tenantId: string) => {
  return { tenant_id: tenantId };
};

// Example of a hook that could be used post-auth
// export const useTenant = () => {
//   const { user } = useAuthStore();
//   return user?.user_metadata?.tenant_id;
// };
