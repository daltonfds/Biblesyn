import {requireStaff} from '@/lib/admin';
import {supabaseAdmin} from '@/lib/supabase/admin';
export async function GET() {
  await requireStaff(true); const {data} = await supabaseAdmin().from('payments').select('paid_at,currency,amount_cents,country,refunded,stripe_invoice_id,profiles(email)').order('paid_at', {ascending: false}).limit(50000);
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = ['date,email,country,currency,amount,refunded,invoice', ...(data ?? []).map((p: any) => [p.paid_at, p.profiles?.email, p.country, p.currency, (p.amount_cents / 100).toFixed(2), p.refunded, p.stripe_invoice_id].map(esc).join(','))].join('\n');
  return new Response(csv, {headers: {'content-type': 'text/csv', 'content-disposition': 'attachment; filename="biblesyn-payments.csv"'}});
}
