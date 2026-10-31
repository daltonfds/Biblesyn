import Link from 'next/link';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
import LangTabs from '@/components/LangTabs';
import {saveArticle, deleteArticle} from '../../actions';
export default async function ArticleEditor({params, searchParams}: {params: {group: string}; searchParams: {lang?: string; saved?: string; err?: string}}) {
  await requireStaff(); const db = supabaseAdmin();
  const [{data: langs}, {data: vers}, {data: topics}] = await Promise.all([db.from('languages').select('code,name').eq('active', true).order('sort'), db.from('articles').select('*').eq('group_id', params.group), db.from('topics').select('id,slug,topic_names(locale,name)').order('sort')]);
  const lang = searchParams.lang && langs?.some((l: any) => l.code === searchParams.lang) ? searchParams.lang : langs?.[0]?.code ?? 'en'; const a: any = vers?.find((v: any) => v.locale === lang);
  const {data: b} = a ? await db.from('article_bodies').select('body').eq('article_id', a.id).maybeSingle() : {data: null};
  const tn = (t: any) => (t.topic_names?.find((n: any) => n.locale === lang) ?? t.topic_names?.[0])?.name ?? t.slug;
  return (<div><Link href="/admin/articles" className="text-sm text-mute underline">‹ Articles</Link><h1 className="mb-3 mt-2 font-serif text-3xl font-bold">{a?.title ?? 'New article'}</h1>
    <LangTabs base={`/admin/articles/${params.group}`} langs={langs ?? []} cur={lang} has={new Set((vers ?? []).map((v: any) => v.locale))} />
    {searchParams.saved && <p className="mb-2 text-sm text-leaf">Saved.</p>}{searchParams.err && <p role="alert" className="mb-2 text-sm text-red-600">{searchParams.err}</p>}
    <form action={saveArticle} className="grid gap-3 md:grid-cols-2"><input type="hidden" name="group" value={params.group} /><input type="hidden" name="locale" value={lang} />
      <label className="md:col-span-2 text-sm font-semibold">Title ({lang})<input name="title" required defaultValue={a?.title} className="ai mt-1" /></label>
      <label className="text-sm font-semibold">Slug (URL)<input name="slug" defaultValue={a?.slug} placeholder="auto from title" className="ai mt-1" /></label>
      <label className="text-sm font-semibold">Topic<select name="topic_id" defaultValue={a?.topic_id ?? ''} className="ai mt-1"><option value="">None</option>{topics?.map((t: any) => <option key={t.id} value={t.id}>{tn(t)}</option>)}</select></label>
      <label className="md:col-span-2 text-sm font-semibold">Excerpt (shown to visitors without access)<textarea name="excerpt" rows={3} defaultValue={a?.excerpt ?? ''} className="ai mt-1" /></label>
      <label className="text-sm font-semibold">Reading time (minutes)<input name="read_minutes" type="number" min={1} defaultValue={a?.read_minutes ?? 8} className="ai mt-1" /></label>
      <label className="text-sm font-semibold">Audio URL (optional, otherwise generated)<input name="audio_url" defaultValue={a?.audio_url ?? ''} className="ai mt-1" /></label>
      <label className="md:col-span-2 text-sm font-semibold">Body<textarea name="body" rows={22} defaultValue={b?.body ?? ''} className="ai mt-1 font-mono" /><span className="text-xs font-normal text-mute">Separate paragraphs with a blank line. A short line without a final period becomes a section title.</span></label>
      <div className="flex flex-wrap items-center gap-5 md:col-span-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_free" defaultChecked={a?.is_free} />Free for members</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={a?.published} />Published</label><button className="ab">Save {lang}</button></div></form>
    {a && <form action={deleteArticle} className="mt-6"><input type="hidden" name="group" value={params.group} /><input type="hidden" name="locale" value={lang} /><button className="ab-line !text-red-700">Delete {lang} version</button></form>}</div>);
}
