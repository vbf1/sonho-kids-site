import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Instagram, MessageCircle, ArrowUpRight, ShieldCheck, Sparkles, PartyPopper, Heart, Star, CheckCircle2 } from 'lucide-react';
import './styles.css';
import Admin from './Admin';
import { supabase, mediaUrl } from './supabaseClient';

const whatsapp = 'https://wa.me/5531999857343?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20or%C3%A7amento%20para%20meu%20evento.';
const instagram = 'https://www.instagram.com/sonhokidsbrinquedos/';

const toys = [
  { number: '01', name: 'Cama elástica', detail: 'Pulos, energia e muita diversão para a criançada.', emoji: '🤸', color: 'pink', imageCategory: 'cama-elastica' },
  { number: '02', name: 'Piscina de bolinhas', detail: 'Um espaço colorido para brincar e se divertir.', emoji: '🟡', color: 'blue', imageCategory: 'piscina-bolinhas' },
  { number: '03', name: 'Máquina de pipoca', detail: 'O cheirinho e o sabor que combinam com festa.', emoji: '🍿', color: 'yellow', imageCategory: 'maquina-pipoca' },
  { number: '04', name: 'Máquina de algodão-doce', detail: 'Um toque doce e especial para seu evento.', emoji: '🍭', color: 'purple', imageCategory: 'algodao-doce' },
];

const moments = [
  { emoji: '🎪', title: 'Brincadeira que reúne', text: 'Nossos brinquedos em momentos de diversão.' },
  { emoji: '🍿', title: 'Sabor de festa', text: 'Máquinas e delícias que fazem parte da comemoração.' },
  { emoji: '💛', title: 'Sorrisos de verdade', text: 'A alegria acontecendo em eventos reais.' },
];

function Brand({ footer = false, logoUrl = '' }) {
  return <a className={`brand ${footer ? 'brand-footer' : ''}`} href="#inicio" aria-label="Sonho Kids Brinquedos - início">
    {logoUrl ? <img className="brand-logo" src={logoUrl} alt="Logo Sonho Kids"/> : <span className="brand-rainbow" aria-hidden="true">🌈</span>}
    <span className="brand-name">sonho<span>kids</span><small>LOCAÇÃO DE BRINQUEDOS</small></span>
  </a>;
}

function App() {
  const [images, setImages] = useState([]);
  const [logoUrl, setLogoUrl] = useState('');
  useEffect(() => {
    if (window.location.pathname.replace(/\/+$/, '').endsWith('/admin') || window.location.hash === '#/admin') return;
    let active = true;
    Promise.all([
      supabase.from('site_images').select('*').order('sort_order').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('value').eq('key', 'logo_path').maybeSingle()
    ]).then(([imageResult, settingResult]) => {
      if (!active) return;
      if (!imageResult.error) setImages(imageResult.data || []);
      if (!settingResult.error && settingResult.data?.value) setLogoUrl(mediaUrl(settingResult.data.value));
    }).catch((e) => console.error('Não foi possível carregar as imagens do site:', e));
    return () => { active = false; };
  }, []);
  if (window.location.pathname.replace(/\/+$/, '').endsWith('/admin') || window.location.hash === '#/admin') return <Admin />;
  const eventImages = images.filter((image) => image.category === 'eventos');
  return <>
    <div className="announcement"><Sparkles size={14}/> Sua festa merece momentos incríveis <span>•</span> Atendimento pelo WhatsApp</div>
    <header className="site-header">
      <Brand logoUrl={logoUrl} />
      <nav aria-label="Navegação principal">
        <a href="#brinquedos">Brinquedos</a><a href="#sobre">A Sonho Kids</a><a href="#eventos">Eventos</a>
      </nav>
      <a className="header-cta" href={whatsapp}>Faça seu orçamento <ArrowUpRight size={17}/></a>
    </header>

    <main id="inicio">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> ALEGRIA QUE VIRA MEMÓRIA</div>
          <h1>Uma festa cheia de <span>cor, sorrisos</span> e diversão!</h1>
          <p>Brinquedos e máquinas para deixar sua comemoração ainda mais especial. A Sonho Kids leva a diversão até você!</p>
          <div className="hero-actions">
            <a className="button button-primary" href={whatsapp}><MessageCircle size={19}/> Quero fazer um orçamento</a>
            <a className="button button-quiet" href="#brinquedos">Conheça as opções <ArrowUpRight size={16}/></a>
          </div>
          <div className="hero-points"><span><ShieldCheck/> Cuidado em cada detalhe</span><span><Heart/> Diversão com carinho</span></div>
        </div>
        <div className="hero-visual" aria-label="Ilustração colorida de festa infantil">
          <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
          <div className="hero-cloud cloud-one">☁️</div><div className="hero-cloud cloud-two">☁️</div>
          <div className="hero-burst">✦</div>
          <div className="hero-playground"><div className="castle-roof"/><div className="castle-body"><span>🎈</span><b>SONHO<br/>KIDS</b><span>🎉</span></div><div className="castle-base"/></div>
          <div className="hero-sticker sticker-top">🌟 <b>Festa feliz</b></div>
          <div className="hero-sticker sticker-bottom"><span>💛</span><b>Momentos<br/>inesquecíveis</b></div>
          <span className="hero-confetti confetti-a">✿</span><span className="hero-confetti confetti-b">✦</span>
        </div>
      </section>

      <section className="ticker"><span>🎉 Diversão para comemorar</span><i>✦</i><span>🌈 Cores que encantam</span><i>✦</i><span>💛 Atendimento com carinho</span><i>✦</i><span>🎈 Memórias felizes</span></section>

      <section className="section toys-section" id="brinquedos">
        <div className="section-heading"><div className="eyebrow">NOSSO MUNDO DE DIVERSÃO</div><h2>Escolha a alegria da <span>sua festa</span></h2><p>Opções para transformar aniversários, encontros e comemorações em momentos especiais.</p></div>
        <div className="toy-grid">{toys.map((toy) => <article className={`toy-card ${toy.color}`} key={toy.number}>
          <div className="toy-art"><span className="toy-number">{toy.number}</span>{images.find((image) => image.category === toy.imageCategory) ? <img className="real-site-photo" src={mediaUrl(images.find((image) => image.category === toy.imageCategory).path)} alt={toy.name}/> : <span className="toy-emoji">{toy.emoji}</span>}<span className="toy-spark">✦</span></div>
          <div className="toy-info"><h3>{toy.name}</h3><p>{toy.detail}</p><a href={whatsapp}>Consultar disponibilidade <ArrowUpRight size={15}/></a></div>
        </article>)}</div>
        <div className="section-bottom"><span><CheckCircle2/> Consulte disponibilidade para sua data</span><a className="button button-primary" href={whatsapp}>Pedir orçamento <ArrowUpRight size={17}/></a></div>
      </section>

      <section className="about-section" id="sobre">
        <div className="about-art"><div className="rainbow-arc arc-1"/><div className="rainbow-arc arc-2"/><div className="rainbow-arc arc-3"/><div className="about-center">🎠<strong>SONHO<br/>KIDS</strong><span>💛</span></div><span className="about-star star-left">✦</span><span className="about-star star-right">✿</span></div>
        <div className="about-copy"><div className="eyebrow">SOBRE A SONHO KIDS</div><h2>Mais do que alugar brinquedos, queremos <span>fazer parte da sua alegria.</span></h2><p>Acreditamos que as melhores lembranças nascem de momentos simples: brincar, sorrir e estar junto. Por isso, cuidamos de cada detalhe para sua comemoração ter aquele gostinho especial.</p><div className="about-values"><div><span className="value-icon value-yellow"><Heart/></span><b>Carinho em cada atendimento</b></div><div><span className="value-icon value-blue"><ShieldCheck/></span><b>Atenção e cuidado</b></div><div><span className="value-icon value-pink"><PartyPopper/></span><b>Diversão para celebrar</b></div></div></div>
      </section>

      <section className="events-section" id="eventos">
        <div className="section-heading"><div className="eyebrow">A ALEGRIA ACONTECE DE VERDADE</div><h2>Momentos especiais com a <span>Sonho Kids</span></h2><p>Veja mais registros dos nossos brinquedos e máquinas em ação nas comemorações.</p></div>
        <div className="moments-grid">{moments.map((m,i)=>{const eventPhoto=eventImages[i];return <a className={`moment-card moment-${i+1}`} href={eventPhoto ? mediaUrl(eventPhoto.path) : instagram} target="_blank" rel="noreferrer" key={m.title}><div className="moment-art">{eventPhoto ? <img className="real-site-photo" src={mediaUrl(eventPhoto.path)} alt={eventPhoto.title || m.title}/> : <span>{m.emoji}</span>}<small>SONHO KIDS • EVENTOS</small></div><div className="moment-info"><h3>{eventPhoto?.title || m.title}</h3><p>{m.text}</p><span>{eventPhoto ? 'Ver foto' : 'Ver no Instagram'} <ArrowUpRight size={15}/></span></div></a>})}</div>
        <div className="instagram-note"><Instagram/><p>Quer ver mais fotos dos nossos eventos?</p><a href={instagram} target="_blank" rel="noreferrer">Acompanhe nosso Instagram <ArrowUpRight size={16}/></a></div>
      </section>

      <section className="contact-section" id="contato"><div className="contact-decoration">🎈</div><div><div className="eyebrow">VAMOS FAZER SUA FESTA ACONTECER?</div><h2>O próximo sorriso pode ser <span>da sua festa!</span></h2><p>Chame a Sonho Kids e consulte as opções para sua data.</p></div><a className="contact-button" href={whatsapp}><MessageCircle/> Conversar pelo WhatsApp <ArrowUpRight/></a></section>
    </main>

    <footer className="site-footer"><Brand footer logoUrl={logoUrl}/><p>Levando diversão e criando memórias felizes. 💛</p><div className="footer-social"><a href={instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram/></a><a href={whatsapp} aria-label="WhatsApp"><MessageCircle/></a></div><small>© {new Date().getFullYear()} Sonho Kids Brinquedos. Todos os direitos reservados.</small></footer>
    <a className="whatsapp-float" href={whatsapp} aria-label="Fale pelo WhatsApp"><MessageCircle/></a>
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
