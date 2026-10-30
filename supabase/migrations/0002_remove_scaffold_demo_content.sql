-- Remove only the exact demo rows previously inserted by the initial scaffold.
delete from public.article_bodies
where article_id in (select id from public.articles where slug in ('why-does-god-remain-silent','how-to-recognize-gods-voice'));
delete from public.articles
where slug in ('why-does-god-remain-silent','how-to-recognize-gods-voice');
delete from public.study_plan_days
where plan_id in (select id from public.study_plans where slug in (
  '21-days-of-daniel','30-days-of-prayer','14-days-with-the-holy-spirit',
  '21-days-of-spiritual-warfare','7-days-to-strengthen-your-faith'
));
delete from public.study_plans
where slug in (
  '21-days-of-daniel','30-days-of-prayer','14-days-with-the-holy-spirit',
  '21-days-of-spiritual-warfare','7-days-to-strengthen-your-faith'
);
delete from public.devotions
where day = current_date
  and verse_ref = 'Psalm 46:10'
  and verse_text = 'Be still, and know that I am God.';
drop table if exists public.prices;
