import type { SupabaseClient } from '@supabase/supabase-js';

export type SignupCount = {
  total: number;
  customers: number;
  businesses: number;
  lastSignupAt: string | null;
};

/** Counts every waitlist registration. It returns only counts and a date: no names or contact details. */
export async function getSignupCount(supabase: SupabaseClient): Promise<SignupCount> {
  const [customers, businesses, lastCustomer, lastBusiness] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }),
    supabase.from('customers').select('created_at').order('created_at', { ascending: false }).limit(1),
    supabase.from('businesses').select('created_at').order('created_at', { ascending: false }).limit(1),
  ]);

  const failed = customers.error ?? businesses.error ?? lastCustomer.error ?? lastBusiness.error;
  if (failed) throw new Error(failed.message);

  const times = [...(lastCustomer.data ?? []), ...(lastBusiness.data ?? [])]
    .map((row) => new Date(row.created_at).getTime())
    .filter((t) => Number.isFinite(t));
  const lastSignupAt = times.length ? new Date(Math.max(...times)).toISOString() : null;

  const customerCount = customers.count ?? 0;
  const businessCount = businesses.count ?? 0;
  return {
    total: customerCount + businessCount,
    customers: customerCount,
    businesses: businessCount,
    lastSignupAt,
  };
}
