import CheckoutButton from "@/components/CheckoutButton";
import {redirect} from "next/navigation";
import {getCountry} from "@/lib/locale";
import { BONUSES, TEASERS, FAQ, getOffer, getDiscountPercent, formatOfferCurrency, isCheckoutConfigured } from "@/lib/offer";

const Acc = ({ items }: { items: { q: string; a: string }[] }) => (
  <>{items.map((i) => (
    <details key={i.q}><summary>{i.q}</summary><div>{i.a}</div></details>
  ))}</>
);

export async function generateMetadata({params}: {params: {locale: string}}) {
  const {getStrings} = await import('@/lib/i18n');
  const strings = await getStrings(params.locale);
  return {title: strings['seo.offer'], description: strings['seo.description'], robots: {index: false, follow: false}};
}

export default function Page({params}: {params: {locale: string}}) {
  const country = (getCountry() || process.env.NEXT_COUNTRY || 'US').toUpperCase();
  if (params.locale !== "pt-BR" || country !== "BR") redirect(`/${params.locale}/premium`);
  const offer = getOffer(country);
  const oldPrice = formatOfferCurrency(params.locale, offer, offer.oldPrice);
  const price = formatOfferCurrency(params.locale, offer, offer.price);
  const discount = getDiscountPercent(offer);
  const checkoutDisabled = !isCheckoutConfigured(offer) || offer.price <= 0;
  return (
    <main className="bs">
      <div className="top">OFERTA DE LANÇAMENTO NO BRASIL · POR TEMPO LIMITADO</div>

      <section className="intro"><div className="w">
        <h1><b>Biblesyn</b> é um sistema cristão <span className="h">completo e acessível</span>, feito <span className="a">para ajudar você a</span>:</h1>
        <ul className="dots">
          <li><span className="k">Entender</span> a Bíblia <span className="a">de verdade</span>, sem complicação</li>
          <li>Manter a <span className="a">oração e a constância</span> <span className="k">todos os dias</span></li>
          <li><span className="k">Vencer</span> as batalhas espirituais <span className="a">com a Palavra</span></li>
          <li>Crescer na fé <span className="a">com direção</span>, dia após dia</li>
        </ul>
        <p>Em vez de depender de <b>leituras soltas</b>, vídeos aleatórios e uma motivação que <b>passa em poucos dias</b>...</p>
        <p>O Biblesyn <span className="a">caminha com o seu ritmo</span>, usando <span className="h">planos de estudo, devocional diário, áudio e um Assistente de Bíblia</span>, tudo <b>baseado na Palavra de Deus</b>.</p>
      </div></section>

      <section className="band"><div className="w">
        <h2>O Biblesyn Fortalece a Sua Jornada, Para Você <span className="b">Entender a Palavra</span>, <span className="s">Orar com Constância</span> &amp; <span className="b">Crescer Todos os Dias</span></h2>
        <p>Tudo em um só lugar, no seu celular, em português.</p>
      </div></section>

      <section className="sec"><div className="w">
        <h2>Veja exatamente o que você recebe</h2>
        <p className="sub">O sistema completo, mais 8 materiais espirituais incluídos.</p>
        <div className="core">
          <h3>🎁 Sistema Biblesyn completo</h3>
          <p>Assistente de Bíblia com IA, planos de estudo personalizados, devocional diário, painel de crescimento e áudio (ler, ouvir ou os dois).</p>
          <p style={{ marginTop: 12 }}><s className="no">DE {oldPrice}</s> <b className="h">POR {price}</b> <span className="text-xs">({discount}% de desconto)</span></p>
        </div>
        {BONUSES.map((b) => (
          <div className="it" key={b.t}>
            <h3>{b.t}</h3><p>{b.d}</p>
            <div className="v"><b>INCLUÍDO</b></div>
          </div>
        ))}
      </div></section>

      <section className="band"><div className="w">
        <h2>Hoje, Para o Brasil, <span className="b">Tudo Isso</span> Por Apenas</h2>
        <div className="price"><s>{PRICE.old}</s><b>{PRICE.now}</b><span>{PRICE.discount}% de desconto</span></div>
        <ul className="ticks"><li>Sistema Biblesyn completo</li><li>8 materiais espirituais incluídos</li><li>Acesso imediato</li></ul>
        <CheckoutButton disabled={checkoutDisabled}>QUERO COMEÇAR MINHA JORNADA</CheckoutButton>
        <div className="note">Promoção de lançamento · por tempo limitado</div>
      </div></section>

      <section className="sec"><div className="w">
        <h2>Conteúdo que já edifica</h2>
        <p className="sub">Um gostinho do que você vai encontrar. Toque para ler.</p>
        <Acc items={TEASERS} />
        <h2 style={{ marginTop: 44 }}>Perguntas frequentes</h2>
        <Acc items={FAQ} />
        <CheckoutButton disabled={checkoutDisabled} className="btn dark">QUERO ACESSO POR {PRICE.now.toUpperCase()}</CheckoutButton>
      </div></section>

      <footer>© Biblesyn · Entenda a Palavra. Fortaleça o seu espírito.</footer>

      <div className="sticky">
        <span><s>{PRICE.old}</s> <b>{PRICE.now}</b><br />{PRICE.discount}% de desconto · Acesso imediato</span>
        <CheckoutButton disabled={checkoutDisabled}>QUERO AGORA</CheckoutButton>
      </div>
    </main>
  );
}
