import {requireStaff} from '@/lib/admin';
import {supabaseAdmin} from '@/lib/supabase/admin';

export async function GET() {
  await requireStaff(true);
  const {data} = await supabaseAdmin().from('payment_transactions')
    .select('paid_at,currency,amount_cents,country,refunded,status,provider,provider_order_id,profiles(email)')
    .order('paid_at', {ascending: false}).limit(50000);
  const escape = (value: unknown) => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  const csv = ['date,email,country,currency,amount,refunded,status,provider,order_reference',
    ...(data ?? []).map((payment: any) => [
      payment.paid_at, payment.profiles?.email, payment.country, payment.currency,
      (Number(payment.amount_cents || 0) / 100).toFixed(2), payment.refunded, payment.status,
      payment.provider, payment.provider_order_id,
    ].map(escape).join(','))].join('\n');
  return new Response(csv, {headers: {'content-type': 'text/csv', 'content-disposition': 'attachment; filename="biblesyn-payments.csv"'}});
}
