import "./biblesyn.css";
import CheckoutButton from "@/components/CheckoutButton";
import { PRICE, BONUSES, TEASERS, FAQ } from "@/lib/offer";

const Acc = ({ items }: { items: { q: string; a: string }[] }) => (
  <>{items.map((i) => (
    <details key={i.q}><summary>{i.q}</summary><div>{i.a}</div></details>
  ))}</>
);

export default function Page() {
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
          <p style={{ marginTop: 12 }}><s className="no">DE {PRICE.old}</s> <b className="h">POR {PRICE.now}</b></p>
        </div>
        {BONUSES.map((b) => (
          <div className="it" key={b.t}>
            <h3>{b.t}</h3><p>{b.d}</p>
            <div className="v"><s>DE R$ 10</s><b>POR R$ 0</b></div>
          </div>
        ))}
        <p className="tot">🎉 Tudo isso valorado em mais de <s>{PRICE.total}</s></p>
      </div></section>

      <section className="band"><div className="w">
        <h2>Hoje, Para o Brasil, <span className="b">Tudo Isso</span> Por Apenas</h2>
        <div className="price"><s>{PRICE.old}</s><b>{PRICE.now}</b></div>
        <ul className="ticks"><li>Sistema Biblesyn completo</li><li>8 materiais espirituais incluídos</li><li>Acesso imediato</li></ul>
        <CheckoutButton>QUERO COMEÇAR MINHA JORNADA</CheckoutButton>
        <div className="note">Promoção de lançamento · por tempo limitado</div>
      </div></section>

      <section className="sec"><div className="w">
        <h2>Conteúdo que já edifica</h2>
        <p className="sub">Um gostinho do que você vai encontrar. Toque para ler.</p>
        <Acc items={TEASERS} />
        <h2 style={{ marginTop: 44 }}>Perguntas frequentes</h2>
        <Acc items={FAQ} />
        <CheckoutButton className="btn dark">QUERO ACESSO POR {PRICE.now.toUpperCase()}</CheckoutButton>
      </div></section>

      <footer>© Biblesyn · Entenda a Palavra. Fortaleça o seu espírito.</footer>

      <div className="sticky">
        <span><s>{PRICE.old}</s> <b>{PRICE.now}</b><br />Acesso imediato</span>
        <CheckoutButton>QUERO AGORA</CheckoutButton>
      </div>
    </main>
  );
}
