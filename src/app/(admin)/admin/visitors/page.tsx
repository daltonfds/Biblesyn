import Link from 'next/link';
import {requireStaff} from '@/lib/admin';
import {supabaseAdmin} from '@/lib/supabase/admin';

type EventRow = {
  id: number; visitor_id: string; session_id: string; user_id: string | null; event_name: string;
  page_path: string; page_title: string | null; referrer_host: string | null;
  utm_source: string | null; utm_medium: string | null; utm_campaign: string | null;
  country: string | null; region: string | null; city: string | null; device_type: string | null;
  browser: string | null; operating_system: string | null; is_new_visitor: boolean; created_at: string;
};
const fmt = (date: string) => new Intl.DateTimeFormat('en-GB', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Maputo'}).format(new Date(date));
const duration = (seconds: number) => seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
const countBy = (rows: EventRow[], get: (r: EventRow) => string) => {
  const map = new Map<string, number>();
  rows.forEach(r => { const key = get(r) || 'Unknown'; map.set(key, (map.get(key) ?? 0) + 1); });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};
function Bars({title, rows, total}: {title: string; rows: [string, number][]; total: number}) {
  return <section className="rounded-2xl border border-line p-4">
    <h2 className="mb-4 font-semibold">{title}</h2>
    {rows.length ? <div className="space-y-3">{rows.slice(0, 8).map(([name, value]) => <div key={name}>
      <div className="mb-1 flex justify-between gap-3 text-sm"><span className="min-w-0 truncate">{name}</span><span className="shrink-0 text-mute">{value.toLocaleString()}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-ink" style={{width: `${Math.max(2, Math.round(value / Math.max(total, 1) * 100))}%`}} /></div>
    </div>)}</div> : <p className="text-sm text-mute">No data yet.</p>}
  </section>;
}
function Metric({label, value, note}: {label: string; value: string | number; note: string}) {
  return <div className="rounded-2xl border border-line p-4"><div className="label">{label}</div><div className="mt-2 font-serif text-3xl font-bold">{value}</div><p className="mt-1 text-xs text-mute">{note}</p></div>;
}

export default async function Visitors({searchParams}: {searchParams: {range?: string}}) {
  await requireStaff(true);
  const selected = ['24h','7d','30d','90d'].includes(searchParams.range ?? '') ? searchParams.range! : '30d';
  const days = selected === '24h' ? 1 : selected === '7d' ? 7 : selected === '90d' ? 90 : 30;
  const now = new Date();
  const from = new Date(now.getTime() - (selected === '24h' ? 86400000 : days * 86400000)).toISOString();
  const db = supabaseAdmin();
  const {data, error} = await db.from('visitor_events')
    .select('id,visitor_id,session_id,user_id,event_name,page_path,page_title,referrer_host,utm_source,utm_medium,utm_campaign,country,region,city,device_type,browser,operating_system,is_new_visitor,created_at')
    .gte('created_at', from).order('created_at', {ascending: false}).limit(25000);
  const rows = (data ?? []) as EventRow[];
  const visitors = new Set(rows.map(r => r.visitor_id));
  const newVisitors = new Set(rows.filter(r => r.is_new_visitor).map(r => r.visitor_id));
  const sessions = new Map<string, {visitor: string; first: number; last: number; pages: number; latest: EventRow}>();
  rows.forEach(r => {
    const ts = new Date(r.created_at).getTime();
    const current = sessions.get(r.session_id);
    if (!current) sessions.set(r.session_id, {visitor: r.visitor_id, first: ts, last: ts, pages: r.event_name === 'page_view' ? 1 : 0, latest: r});
    else { current.first = Math.min(current.first, ts); current.last = Math.max(current.last, ts); if (r.event_name === 'page_view') current.pages++; if (ts > new Date(current.latest.created_at).getTime()) current.latest = r; }
  });
  const sessionRows = [...sessions.values()];
  const active = new Set(rows.filter(r => new Date(r.created_at).getTime() >= now.getTime() - 5 * 60000).map(r => r.visitor_id)).size;
  const avgPages = sessionRows.length ? (sessionRows.reduce((n, s) => n + s.pages, 0) / sessionRows.length).toFixed(1) : '0';
  const bounce = sessionRows.length ? Math.round(sessionRows.filter(s => s.pages <= 1).length / sessionRows.length * 100) : 0;
  const avgDuration = sessionRows.length ? Math.round(sessionRows.reduce((n, s) => n + Math.max(0, s.last - s.first) / 1000, 0) / sessionRows.length) : 0;
  const pageRows = countBy(rows.filter(r => r.event_name === 'page_view'), r => r.page_path);
  const sources = countBy(rows, r => r.utm_source || r.referrer_host || 'Direct');
  const countries = countBy(rows, r => r.country || 'Unknown');
  const cities = countBy(rows, r => [r.city, r.country].filter(Boolean).join(', ') || 'Unknown');
  const devices = countBy(rows, r => r.device_type || 'Unknown');
  const browsers = countBy(rows, r => r.browser || 'Unknown');
  const systems = countBy(rows, r => r.operating_system || 'Unknown');
  const campaigns = countBy(rows.filter(r => r.utm_campaign), r => r.utm_campaign || 'Unknown');
  const daysToShow = selected === '90d' ? 30 : selected === '24h' ? 1 : 14;
  const trend = Array.from({length: daysToShow}, (_, i) => {
    const d = new Date(now.getTime() - (daysToShow - 1 - i) * 86400000);
    return {key: d.toISOString().slice(0,10), label: d.toLocaleDateString('en-GB', {day:'2-digit', month:'short', timeZone:'UTC'})};
  }).map(d => ({...d, value: rows.filter(r => r.created_at.slice(0,10) === d.key).length}));
  const maxTrend = Math.max(1, ...trend.map(d => d.value));
  const recent = sessionRows.sort((a,b) => b.last - a.last).slice(0, 20);
  const rangeLink = (r: string) => `/admin/visitors?range=${r}`;

  return <div>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div><p className="label">Analytics</p><h1 className="mt-1 font-serif text-3xl font-bold">Visitors & traffic</h1><p className="mt-1 text-sm text-mute">Understand who visits Biblesyn, where they come from and what they read.</p></div>
      <div className="flex flex-wrap gap-1 rounded-full bg-mist p-1">{[['24h','24 hours'],['7d','7 days'],['30d','30 days'],['90d','90 days']].map(([key,label]) => <Link key={key} href={rangeLink(key)} className={`rounded-full px-3 py-2 text-xs font-semibold ${selected === key ? 'bg-ink text-white' : 'text-ink'}`}>{label}</Link>)}</div>
    </div>
    {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">Analytics could not be loaded: {error.message}</p>}
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      <Metric label="Active visitors" value={active} note="Seen in the last 5 minutes" />
      <Metric label="Unique visitors" value={visitors.size.toLocaleString()} note={`${newVisitors.size} first-time · ${Math.max(0, visitors.size-newVisitors.size)} returning`} />
      <Metric label="Sessions" value={sessionRows.length.toLocaleString()} note={`${rows.length.toLocaleString()} page views and events`} />
      <Metric label="Pages / session" value={avgPages} note={`${bounce}% single-page sessions`} />
      <Metric label="Average session" value={duration(avgDuration)} note="Time between first and last tracked page" />
      <Metric label="Tracked page views" value={rows.filter(r => r.event_name === 'page_view').length.toLocaleString()} note="Within selected period" />
      <Metric label="Registered members" value={new Set(rows.filter(r => r.user_id).map(r => r.visitor_id)).size.toLocaleString()} note="Visitors signed in during a visit" />
      <Metric label="Guest visitors" value={new Set(rows.filter(r => !r.user_id).map(r => r.visitor_id)).size.toLocaleString()} note="Visitors not signed in at page view" />
    </div>

    <section className="mb-6 rounded-2xl border border-line p-4">
      <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Traffic over time</h2><p className="text-xs text-mute">Daily page views · Maputo time zone</p></div><span className="text-xs text-mute">{selected}</span></div>
      <div className="flex h-36 items-end gap-1">{trend.map(d => <div key={d.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${d.label}: ${d.value}`}>
        <span className="text-[9px] text-mute">{d.value || ''}</span><div className="w-full rounded-t bg-ink" style={{height: `${Math.max(d.value ? 4 : 1, d.value / maxTrend * 100)}%`, opacity: d.value ? 1 : .12}} />
        <span className="text-[9px] text-mute">{daysToShow <= 14 ? d.label : (d.key.slice(8,10) === '01' ? d.label : '')}</span>
      </div>)}</div>
    </section>

    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Bars title="Top pages" rows={pageRows} total={pageRows.reduce((n,r)=>n+r[1],0)} />
      <Bars title="Traffic sources" rows={sources} total={rows.length} />
      <Bars title="Countries" rows={countries} total={rows.length} />
      <Bars title="Cities / regions" rows={cities} total={rows.length} />
      <Bars title="Devices" rows={devices} total={rows.length} />
      <Bars title="Browsers" rows={browsers} total={rows.length} />
      <Bars title="Operating systems" rows={systems} total={rows.length} />
      <Bars title="Campaigns (UTM)" rows={campaigns} total={rows.length} />
      <section className="rounded-2xl border border-line p-4"><h2 className="mb-3 font-semibold">Engagement summary</h2>
        <dl className="space-y-3 text-sm"><div className="flex justify-between"><dt className="text-mute">Bounce rate</dt><dd className="font-semibold">{bounce}%</dd></div><div className="flex justify-between"><dt className="text-mute">Avg. pages per session</dt><dd className="font-semibold">{avgPages}</dd></div><div className="flex justify-between"><dt className="text-mute">Avg. session duration</dt><dd className="font-semibold">{duration(avgDuration)}</dd></div><div className="flex justify-between"><dt className="text-mute">Tracking coverage</dt><dd className="font-semibold">{rows.length >= 25000 ? '25,000+ (capped)' : 'Complete for period'}</dd></div></dl>
      </section>
    </div>

    <section className="rounded-2xl border border-line p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-semibold">Recent visitor sessions</h2><p className="text-xs text-mute">Anonymous visitor IDs; no IP addresses or email addresses are stored.</p></div><span className="text-xs text-mute">Latest 20</span></div>
      <div className="overflow-x-auto"><table className="tbl min-w-[760px]"><thead><tr><th>Last seen</th><th>Visitor</th><th>Location</th><th>Device / browser</th><th>Last page</th><th>Pages</th><th>Account</th></tr></thead><tbody>
        {recent.map((s, i) => { const r=s.latest; return <tr key={r.session_id}><td className="whitespace-nowrap">{fmt(r.created_at)}</td><td className="font-mono text-xs">{r.visitor_id.slice(0,8)}…</td><td>{[r.city,r.country].filter(Boolean).join(', ') || 'Unknown'}</td><td>{r.device_type || '—'}<div className="text-xs text-mute">{r.browser || '—'} · {r.operating_system || '—'}</div></td><td className="max-w-[190px] truncate" title={r.page_path}>{r.page_path}</td><td>{s.pages}</td><td>{r.user_id ? 'Member' : 'Guest'}</td></tr>; })}
        {!recent.length && <tr><td colSpan={7} className="py-8 text-center text-mute">No visitor data yet. Visits will appear after the new tracking code is deployed and the database migration is active.</td></tr>}
      </tbody></table></div>
    </section>
    <p className="mt-4 text-xs text-mute">Location is approximate and depends on the visitor’s network. Ad blockers, browser privacy settings and disabled JavaScript can reduce measured visits. Internal admin pages are excluded. {rows.length >= 25000 ? 'The displayed dataset is capped at 25,000 records for performance.' : ''}</p>
  </div>;
}
