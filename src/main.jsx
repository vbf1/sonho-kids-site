import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Instagram, ArrowUpRight, ShieldCheck, Sparkles, PartyPopper, Heart, CheckCircle2, Menu, X } from 'lucide-react';
import './styles.css';
import Admin from './Admin';
import { supabase, mediaUrl } from './supabaseClient';

const whatsappMessage = 'Olá! Tenho interesse nos produtos da Sonho Kids Brinquedos. Gostaria de receber informações e fazer um orçamento para meu evento.';
const whatsapp = `https://wa.me/5531999857343?text=${encodeURIComponent(whatsappMessage)}`;
const whatsappForToy = (toyName) => `https://wa.me/5531999857343?text=${encodeURIComponent(`Olá! Tenho interesse no brinquedo: ${toyName}. Gostaria de consultar a disponibilidade e receber um orçamento para meu evento.`)}`;

function WhatsAppIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.55 0 .22 5.33.22 11.88c0 2.1.55 4.15 1.6 5.96L.13 24l6.32-1.66a11.9 11.9 0 0 0 5.65 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.15-3.47-8.42ZM12.1 21.76h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.75.98 1-3.65-.24-.38a9.86 9.86 0 0 1-1.52-5.24c0-5.47 4.45-9.92 9.93-9.92a9.85 9.85 0 0 1 7.02 2.91 9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.93 9.92Zm5.45-7.43c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.7.64.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>;
}
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
  </a>;
}

function App() {
  const [images, setImages] = useState([]);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoReady, setLogoReady] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    }).catch((e) => console.error('Não foi possível carregar as imagens do site:', e)).finally(() => {
      if (active) setLogoReady(true);
    });
    return () => { active = false; };
  }, []);
  if (window.location.pathname.replace(/\/+$/, '').endsWith('/admin') || window.location.hash === '#/admin') return <Admin />;
  const eventImages = images.filter((image) => image.category === 'eventos');
  const galleryItems = eventImages.length
    ? eventImages.map((image) => ({ image, title: image.title || 'Evento Sonho Kids', text: 'Nossos brinquedos e máquinas em momentos especiais.' }))
    : moments.map((moment) => ({ ...moment, image: null }));
  return <>
    <div className="announcement"><Sparkles size={14}/> Sua festa merece momentos incríveis <span>•</span> Atendimento pelo WhatsApp</div>
    <header className="site-header">
      <Brand logoUrl={logoReady ? logoUrl : ''} />
      <nav id="site-navigation" className={mobileMenuOpen ? 'is-open' : ''} aria-label="Navegação principal">
        <a href="#brinquedos" onClick={() => setMobileMenuOpen(false)}>Brinquedos</a>
        <a href="#sobre" onClick={() => setMobileMenuOpen(false)}>A Sonho Kids</a>
        <a href="#eventos" onClick={() => setMobileMenuOpen(false)}>Eventos</a>
      </nav>
      <button className="mobile-menu-toggle" type="button" aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileMenuOpen} aria-controls="site-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X size={21}/> : <Menu size={21}/>}</button>
      <a className="header-cta" href={whatsapp}><span>Faça seu orçamento</span> <ArrowUpRight size={17}/></a>
    </header>

    <main id="inicio">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> ALEGRIA QUE VIRA MEMÓRIA</div>
          <h1>Uma festa cheia de <span>cor, sorrisos</span> e diversão!</h1>
          <p>Brinquedos e máquinas para deixar sua comemoração ainda mais especial. A Sonho Kids leva a diversão até você!</p>
          <div className="hero-actions">
            <a className="button button-primary" href={whatsapp}><WhatsAppIcon size={19}/> Quero fazer um orçamento</a>
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
        <div className="toy-grid">{toys.map((toy) => {
          const toyImage = images.find((image) => image.category === toy.imageCategory);
          return <a className={`toy-card ${toy.color}`} key={toy.number} href={whatsappForToy(toy.name)} target="_blank" rel="noreferrer" aria-label={`Consultar ${toy.name} pelo WhatsApp`}>
            <div className="toy-art"><span className="toy-number">{toy.number}</span>{toyImage ? <img className="real-site-photo" src={mediaUrl(toyImage.path)} alt={toy.name} loading="lazy" decoding="async"/> : <span className="toy-emoji">{toy.emoji}</span>}<span className="toy-spark">✦</span></div>
            <div className="toy-info"><h3>{toy.name}</h3><p>{toy.detail}</p><span className="toy-card-cta">Consultar disponibilidade <ArrowUpRight size={15}/></span></div>
          </a>;
        })}</div>
        <div className="section-bottom"><span><CheckCircle2/> Consulte disponibilidade para sua data</span><a className="button button-primary" href={whatsapp}>Pedir orçamento <ArrowUpRight size={17}/></a></div>
      </section>

      <section className="about-section" id="sobre">
        <div className="about-art"><div className="rainbow-arc arc-1"/><div className="rainbow-arc arc-2"/><div className="rainbow-arc arc-3"/><div className="about-center">🎠<strong>SONHO<br/>KIDS</strong><span>💛</span></div><span className="about-star star-left">✦</span><span className="about-star star-right">✿</span></div>
        <div className="about-copy"><div className="eyebrow">SOBRE A SONHO KIDS</div><h2>Mais do que alugar brinquedos, queremos <span>fazer parte da sua alegria.</span></h2><p>Acreditamos que as melhores lembranças nascem de momentos simples: brincar, sorrir e estar junto. Por isso, cuidamos de cada detalhe para sua comemoração ter aquele gostinho especial.</p><div className="about-values"><div><span className="value-icon value-yellow"><Heart/></span><b>Carinho em cada atendimento</b></div><div><span className="value-icon value-blue"><ShieldCheck/></span><b>Atenção e cuidado</b></div><div><span className="value-icon value-pink"><PartyPopper/></span><b>Diversão para celebrar</b></div></div></div>
      </section>

      <section className="events-section" id="eventos">
        <div className="section-heading"><div className="eyebrow">A ALEGRIA ACONTECE DE VERDADE</div><h2>Momentos especiais com a <span>Sonho Kids</span></h2><p>Veja mais registros dos nossos brinquedos e máquinas em ação nas comemorações.</p></div>
        <div className="moments-grid">{galleryItems.map((item, i) => <button type="button" className={`moment-card moment-${(i % 3) + 1}`} onClick={() => item.image ? setPreviewPhoto({ src: mediaUrl(item.image.path), title: item.title }) : window.open(instagram, '_blank', 'noopener,noreferrer')} key={item.image?.id || item.title}><div className="moment-art">{item.image ? <img className="real-site-photo" src={mediaUrl(item.image.path)} alt={item.title} loading="lazy" decoding="async"/> : <span>{item.emoji}</span>}<small>SONHO KIDS • EVENTOS</small></div><div className="moment-info"><h3>{item.title}</h3><p>{item.text}</p><span>{item.image ? 'Ampliar foto' : 'Ver no Instagram'} <ArrowUpRight size={15}/></span></div></button>)}</div>
        <div className="instagram-note"><Instagram/><p>Quer ver mais fotos dos nossos eventos?</p><a href={instagram} target="_blank" rel="noreferrer">Acompanhe nosso Instagram <ArrowUpRight size={16}/></a></div>
      </section>

      <section className="contact-section" id="contato"><div className="contact-decoration">🎈</div><div><div className="eyebrow">VAMOS FAZER SUA FESTA ACONTECER?</div><h2>O próximo sorriso pode ser <span>da sua festa!</span></h2><p>Chame a Sonho Kids e consulte as opções para sua data.</p></div><a className="contact-button" href={whatsapp}><WhatsAppIcon/> Conversar pelo WhatsApp <ArrowUpRight/></a></section>
    </main>

    <footer className="site-footer"><Brand footer logoUrl={logoReady ? logoUrl : ''}/><p>Levando diversão e criando memórias felizes. 💛</p><div className="footer-social"><a href={instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram/></a><a href={whatsapp} aria-label="WhatsApp"><WhatsAppIcon/></a></div><small>© {new Date().getFullYear()} Sonho Kids Brinquedos. Todos os direitos reservados.</small></footer>
    <a className="whatsapp-float" href={whatsapp} aria-label="Fale pelo WhatsApp"><WhatsAppIcon/></a>
    {previewPhoto && <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={previewPhoto.title} onClick={() => setPreviewPhoto(null)}>
      <button className="photo-lightbox-close" type="button" aria-label="Fechar foto" onClick={() => setPreviewPhoto(null)}>×</button>
      <img src={previewPhoto.src} alt={previewPhoto.title} onClick={(event) => event.stopPropagation()}/>
      <span>{previewPhoto.title}</span>
    </div>}
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
