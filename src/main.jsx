import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Instagram, ArrowUp, ArrowUpRight, ShieldCheck, PartyPopper, Heart, CheckCircle2, Menu, X } from 'lucide-react';
import './styles.css';
import Admin from './Admin';
import { supabase, mediaUrl } from './supabaseClient';

const defaultContent = {
  "whatsapp_phone": "5531999857343",
  "whatsapp_message": "Olá! Tenho interesse nos produtos da Sonho Kids Brinquedos. Gostaria de receber informações e fazer um orçamento para meu evento.",
  "instagram_url": "https://www.instagram.com/sonhokidsbrinquedos/",
  "hero_eyebrow": "ALEGRIA QUE VIRA MEMÓRIA",
  "hero_title": "Uma festa cheia de cor, sorrisos e diversão!",
  "hero_description": "Brinquedos e máquinas para deixar sua comemoração ainda mais especial. A Sonho Kids leva a diversão até você!",
  "hero_button": "Conheça as opções",
  "about_eyebrow": "SOBRE A SONHO KIDS",
  "about_title": "Mais do que alugar brinquedos, queremos fazer parte da sua alegria.",
  "about_description": "Acreditamos que as melhores lembranças nascem de momentos simples: brincar, sorrir e estar junto. Por isso, cuidamos de cada detalhe para sua comemoração ter aquele gostinho especial.",
  "contact_eyebrow": "VAMOS FAZER SUA FESTA ACONTECER?",
  "contact_title": "O próximo sorriso pode ser da sua festa!",
  "contact_description": "Conheça nossos produtos e acompanhe as novidades da Sonho Kids.",
  "footer_text": "Levando diversão e criando memórias felizes. 💛",
  "catalog_display_mode": "inline",
  "toy_1_name": "Cama elástica",
  "toy_1_detail": "Pulos, energia e muita diversão para a criançada.",
  "toy_2_name": "Piscina de bolinhas",
  "toy_2_detail": "Um espaço colorido para brincar e se divertir.",
  "toy_3_name": "Máquina de pipoca",
  "toy_3_detail": "O cheirinho e o sabor que combinam com festa.",
  "toy_4_name": "Máquina de algodão-doce",
  "toy_4_detail": "Um toque doce e especial para seu evento."
};
const settingValue = (content, key) => content[key] || defaultContent[key];
const whatsappLink = (content) => `https://wa.me/${(settingValue(content, 'whatsapp_phone').match(/\d/g) || []).join('')}?text=${encodeURIComponent(settingValue(content, 'whatsapp_message'))}`;

function WhatsAppIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.55 0 .22 5.33.22 11.88c0 2.1.55 4.15 1.6 5.96L.13 24l6.32-1.66a11.9 11.9 0 0 0 5.65 1.44h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.15-3.47-8.42ZM12.1 21.76h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.75.98 1-3.65-.24-.38a9.86 9.86 0 0 1-1.52-5.24c0-5.47 4.45-9.92 9.93-9.92a9.85 9.85 0 0 1 7.02 2.91 9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.93 9.92Zm5.45-7.43c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.7.64.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"/></svg>;
}
const toys = [
  { name: 'Cama elástica', detail: 'Pulos, energia e muita diversão para a criançada.', emoji: '🤸', color: 'pink', imageCategory: 'cama-elastica', visualLabel: 'ENERGIA E MOVIMENTO', kind: 'BRINQUEDO' },
  { name: 'Piscina de bolinhas', detail: 'Um espaço colorido para brincar e se divertir.', emoji: '🟡', color: 'blue', imageCategory: 'piscina-bolinhas', visualLabel: 'UM MAR DE CORES', kind: 'BRINQUEDO' },
  { name: 'Máquina de pipoca', detail: 'O cheirinho e o sabor que combinam com festa.', emoji: '🍿', color: 'yellow', imageCategory: 'maquina-pipoca', visualLabel: 'SABOR DE FESTA', kind: 'MÁQUINA' },
  { name: 'Máquina de algodão-doce', detail: 'Um toque doce e especial para seu evento.', emoji: '🍭', color: 'purple', imageCategory: 'algodao-doce', visualLabel: 'UM TOQUE DE DOÇURA', kind: 'MÁQUINA' },
];

const moments = [
  { emoji: '🎪', title: 'Brincadeira que reúne', text: 'Nossos brinquedos em momentos de diversão.' },
  { emoji: '🍿', title: 'Sabor de festa', text: 'Máquinas e delícias que fazem parte da comemoração.' },
  { emoji: '💛', title: 'Sorrisos de verdade', text: 'A alegria acontecendo em eventos reais.' },
];

function Brand({ footer = false, logoUrl = '', loading = false }) {
  return <a className={`brand ${footer ? 'brand-footer' : ''}`} href="#inicio" aria-label="Sonho Kids Brinquedos - início">
    {logoUrl ? <img className="brand-logo" src={logoUrl} alt="Logo Sonho Kids"/> : loading ? <span className="brand-logo-loading" aria-hidden="true"/> : <span className="brand-rainbow" aria-hidden="true">🌈</span>}
  </a>;
}

function App() {
  const [images, setImages] = useState([]);
  const [content, setContent] = useState(defaultContent);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoReady, setLogoReady] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    if (window.location.pathname.replace(/\/+$/, '').endsWith('/admin') || window.location.hash === '#/admin') return;
    let active = true;
    Promise.all([
      supabase.from('site_images').select('*').order('sort_order').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('key,value')
    ]).then(([imageResult, settingResult]) => {
      if (!active) return;
      if (!imageResult.error) setImages(imageResult.data || []);
      if (!settingResult.error) {
        const settings = Object.fromEntries((settingResult.data || []).map((item) => [item.key, item.value]));
        setContent({ ...defaultContent, ...settings });
        if (settings.logo_path) setLogoUrl(mediaUrl(settings.logo_path));
      }
    }).catch((e) => console.error('Não foi possível carregar as imagens do site:', e)).finally(() => {
      if (active) setLogoReady(true);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (window.location.pathname.replace(/\/+$/, '').endsWith('/admin') || window.location.hash === '#/admin') return;
    const updateScrollState = () => setShowScrollTop(window.scrollY > 320);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);
  if (window.location.pathname.replace(/\/+$/, '').endsWith('/admin') || window.location.hash === '#/admin') return <Admin />;
  let savedCatalog = null;
  try { savedCatalog = content.catalog_items ? JSON.parse(content.catalog_items) : null; } catch { savedCatalog = null; }
  const configuredToys = (Array.isArray(savedCatalog) ? savedCatalog : toys.map((toy, index) => ({ ...toy, id: toy.imageCategory, active: true, name: settingValue(content, `toy_${index + 1}_name`), detail: settingValue(content, `toy_${index + 1}_detail`) })))
    .filter((toy) => toy.active !== false)
    .map((toy) => ({ ...toy, imageCategory: toy.id || toy.imageCategory, visualLabel: toy.visualLabel || 'DIVERSÃO PARA SUA FESTA', emoji: toy.emoji || '🎈', color: toy.color || 'pink' }));
  const queryParams = new URLSearchParams(window.location.search);
  const selectedToy = configuredToys.find((toy) => toy.imageCategory === queryParams.get('produto'));
  const catalogMode = content.catalog_display_mode === 'catalog';
  const catalogPage = queryParams.get('catalogo') === '1';
  const whatsapp = whatsappLink(content);
  const instagram = settingValue(content, 'instagram_url');
  const heroImage = images.find((image) => image.category === 'hero');
  const eventImages = images.filter((image) => image.category === 'eventos');
  const galleryItems = eventImages.length
    ? eventImages.map((image) => ({ image }))
    : moments.map((moment) => ({ ...moment, image: null }));
  if (selectedToy) {
    const productImages = images.filter((image) => image.category === selectedToy.imageCategory);
    return <div className="product-page">
      <header className="product-page-header"><Brand logoUrl={logoReady ? logoUrl : ''} loading={!logoReady}/><a className="product-back-link" href={window.location.pathname}>← Voltar aos brinquedos</a></header>
      <main className="product-page-main">
        <div className="product-page-heading"><span className="toy-kind">{selectedToy.kind}</span><h1>{selectedToy.name}</h1><p>{selectedToy.detail}</p><span className="product-photo-count">{productImages.length} {productImages.length === 1 ? 'foto disponível' : 'fotos disponíveis'}</span></div>
        {productImages.length ? <div className="product-gallery">{productImages.map((photo, index) => <button className="product-gallery-item" type="button" key={photo.id || photo.path} onClick={() => setPreviewPhoto({ src: mediaUrl(photo.path), title: photo.title || `${selectedToy.name} — foto ${index + 1}` })} aria-label={`Ampliar foto ${index + 1} de ${selectedToy.name}`}><img src={mediaUrl(photo.path)} alt={photo.title || `${selectedToy.name} — foto ${index + 1}`} loading="lazy" decoding="async"/><span>Ampliar <ArrowUpRight size={15}/></span></button>)}</div> : <div className="product-gallery-empty"><span>{selectedToy.emoji}</span><h2>Fotos em breve</h2><p>Estamos preparando mais imagens deste produto. Volte em breve para conferir!</p></div>}
      </main>
      <footer className="site-footer product-page-footer"><Brand footer logoUrl={logoReady ? logoUrl : ''} loading={!logoReady}/><p>{settingValue(content, 'footer_text')}</p><div className="footer-social"><a href={instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram/></a></div><small>© {new Date().getFullYear()} Sonho Kids Brinquedos. Todos os direitos reservados.</small></footer>
    {previewPhoto && <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={previewPhoto.title} onClick={() => setPreviewPhoto(null)}><button className="photo-lightbox-close" type="button" aria-label="Fechar foto" onClick={() => setPreviewPhoto(null)}>×</button><img src={previewPhoto.src} alt={previewPhoto.title} onClick={(event) => event.stopPropagation()}/></div>}
      <a className="whatsapp-float" href={whatsapp} aria-label="Fale conosco pelo WhatsApp" target="_blank" rel="noreferrer"><WhatsAppIcon size={27}/></a>
      {showScrollTop && <button className="scroll-top-float" type="button" aria-label="Voltar ao topo" title="Voltar ao topo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={23}/></button>}
    </div>;
  }
  if (catalogPage) {
    return <div className="catalog-page">
      <header className="product-page-header"><Brand logoUrl={logoReady ? logoUrl : ''} loading={!logoReady}/><a className="product-back-link" href={window.location.pathname}>← Voltar ao início</a></header>
      <main className="catalog-page-main">
        <section className="section toys-section catalog-page-section">
          <div className="section-heading"><div className="eyebrow">SONHO KIDS BRINQUEDOS</div><h1>Nosso <span>catálogo</span></h1><p>Conheça todos os brinquedos e máquinas disponíveis para deixar sua comemoração ainda mais especial.</p></div>
          <div className="toy-grid">{configuredToys.map((toy) => {
            const toyImage = images.find((image) => image.category === toy.imageCategory);
            return <a className={`toy-card ${toy.color}`} key={toy.imageCategory} href={`?produto=${encodeURIComponent(toy.imageCategory)}`} aria-label={`Ver fotos de ${toy.name}`}>
              <div className="toy-art">{toyImage ? <img className="real-site-photo" src={mediaUrl(toyImage.path)} alt={toy.name} loading="lazy" decoding="async"/> : <div className="toy-placeholder"><span className="toy-placeholder-glow"/><span className="toy-emoji">{toy.emoji}</span><small>IMAGEM EM BREVE</small></div>}<span className="toy-art-caption">{toy.visualLabel}</span><span className="toy-spark">✦</span></div>
              <div className="toy-info"><span className="toy-kind">{toy.kind}</span><h3>{toy.name}</h3><p>{toy.detail}</p><span className="toy-card-cta">Ver fotos do produto <ArrowUpRight size={16}/></span></div>
            </a>;
          })}</div>
          {!configuredToys.length && <div className="product-gallery-empty"><span>🎈</span><h2>Catálogo em atualização</h2><p>Em breve teremos novidades por aqui.</p></div>}
        </section>
      </main>
      <footer className="site-footer product-page-footer"><Brand footer logoUrl={logoReady ? logoUrl : ''} loading={!logoReady}/><p>{settingValue(content, 'footer_text')}</p><div className="footer-social"><a href={instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram/></a></div><small>© {new Date().getFullYear()} Sonho Kids Brinquedos. Todos os direitos reservados.</small></footer>
      <a className="whatsapp-float" href={whatsappLink(content)} aria-label="Fale conosco pelo WhatsApp" target="_blank" rel="noreferrer"><WhatsAppIcon size={27}/></a>
    </div>;
  }
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sonho Kids Brinquedos",
    "url": "https://vbf1.github.io/sonho-kids-site/",
    "description": "Locação de brinquedos para festas e eventos em Belo Horizonte e região: cama elástica, piscina de bolinhas, máquina de pipoca e máquina de algodão-doce.",
    "telephone": "+5531999857343",
    "sameAs": ["https://www.instagram.com/sonhokidsbrinquedos/"],
    "areaServed": {
      "@type": "Place",
      "name": "Belo Horizonte e região, Minas Gerais"
    },
    "knowsAbout": ["Aluguel de cama elástica", "Locação de piscina de bolinhas", "Aluguel de máquina de pipoca", "Aluguel de máquina de algodão-doce", "Brinquedos para festas e eventos"]
  };
  return <>
    <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    <header className="site-header">
      <Brand logoUrl={logoReady ? logoUrl : ''} loading={!logoReady} />
      <nav id="site-navigation" className={mobileMenuOpen ? 'is-open' : ''} aria-label="Navegação principal">
        <a href={catalogMode ? "?catalogo=1" : "#brinquedos"} onClick={() => setMobileMenuOpen(false)}>{catalogMode ? "Catálogo" : "Brinquedos"}</a>
        <a href="#sobre" onClick={() => setMobileMenuOpen(false)}>A Sonho Kids</a>
        <a href="#eventos" onClick={() => setMobileMenuOpen(false)}>Eventos</a>
      </nav>
      <button className="mobile-menu-toggle" type="button" aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileMenuOpen} aria-controls="site-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X size={21}/> : <Menu size={21}/>}</button>
    </header>

    <main id="inicio">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> {settingValue(content, 'hero_eyebrow')}</div>
          <h1>{settingValue(content, 'hero_title')}</h1>
          <p>{settingValue(content, 'hero_description')}</p>
          <div className="hero-actions">
            <a className="button button-quiet" href={catalogMode ? "?catalogo=1" : "#brinquedos"}>{settingValue(content, 'hero_button')} <ArrowUpRight size={16}/></a>
          </div>
          <div className="hero-points"><span><ShieldCheck/> Cuidado em cada detalhe</span><span><Heart/> Diversão com carinho</span></div>
        </div>
        <div className={heroImage ? "hero-visual hero-visual-photo" : "hero-visual"} aria-label={heroImage ? "Foto principal da Sonho Kids" : "Ilustração colorida de festa infantil"}>
          {heroImage ? <img className="hero-main-photo" src={mediaUrl(heroImage.path)} alt={heroImage.title || "Brinquedos Sonho Kids em uma festa"}/> : <>
            <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
            <div className="hero-cloud cloud-one">☁️</div><div className="hero-cloud cloud-two">☁️</div>
            <div className="hero-burst">✦</div>
            <div className="hero-playground"><div className="castle-roof"/><div className="castle-body"><span>🎈</span><b>SONHO<br/>KIDS</b><span>🎉</span></div><div className="castle-base"/></div>
            <div className="hero-sticker sticker-top">🌟 <b>Festa feliz</b></div>
            <div className="hero-sticker sticker-bottom"><span>💛</span><b>Momentos<br/>inesquecíveis</b></div>
            <span className="hero-confetti confetti-a">✿</span><span className="hero-confetti confetti-b">✦</span>
          </>}
        </div>
      </section>

      <section className="ticker"><span>🎉 Diversão para comemorar</span><i>✦</i><span>🌈 Cores que encantam</span><i>✦</i><span>💛 Atendimento com carinho</span><i>✦</i><span>🎈 Memórias felizes</span></section>

      {catalogMode ? <section className="section catalog-teaser" id="brinquedos">
        <div className="catalog-teaser-card"><div className="eyebrow">SONHO KIDS BRINQUEDOS</div><h2>Conheça nosso <span>catálogo</span></h2><p>Reunimos nossos brinquedos e máquinas em um só lugar para você escolher a diversão ideal para sua festa.</p><a className="button button-quiet" href="?catalogo=1">Ver catálogo completo <ArrowUpRight size={16}/></a></div>
      </section> : (
      <section className="section toys-section" id="brinquedos">
        <div className="section-heading"><div className="eyebrow">NOSSO MUNDO DE DIVERSÃO</div><h2>Escolha a alegria da <span>sua festa</span></h2><p>Opções para transformar aniversários, encontros e comemorações em momentos especiais.</p></div>
        <div className="toy-grid">{configuredToys.map((toy) => {
          const toyImage = images.find((image) => image.category === toy.imageCategory);
          return <a className={`toy-card ${toy.color}`} key={toy.imageCategory} href={`?produto=${encodeURIComponent(toy.imageCategory)}`} target="_blank" rel="noreferrer" aria-label={`Ver fotos de ${toy.name} em uma nova aba`}>
            <div className="toy-art">{toyImage ? <img className="real-site-photo" src={mediaUrl(toyImage.path)} alt={toy.name} loading="lazy" decoding="async"/> : <div className="toy-placeholder"><span className="toy-placeholder-glow"/><span className="toy-emoji">{toy.emoji}</span><small>IMAGEM EM BREVE</small></div>}<span className="toy-art-caption">{toy.visualLabel}</span><span className="toy-spark">✦</span></div>
            <div className="toy-info"><span className="toy-kind">{toy.kind}</span><h3>{toy.name}</h3><p>{toy.detail}</p><span className="toy-card-cta">Ver fotos do produto <ArrowUpRight size={16}/></span></div>
          </a>;
        })}</div>
        <div className="section-bottom"><span><CheckCircle2/> Consulte disponibilidade para sua data</span></div>
      </section>
      )}

      <section className="about-section" id="sobre">
        
        <div className="about-copy"><div className="eyebrow">{settingValue(content, 'about_eyebrow')}</div><h2>{settingValue(content, 'about_title')}</h2><p>{settingValue(content, 'about_description')}</p><div className="about-values"><div><span className="value-icon value-yellow"><Heart/></span><b>Carinho em cada atendimento</b></div><div><span className="value-icon value-blue"><ShieldCheck/></span><b>Atenção e cuidado</b></div><div><span className="value-icon value-pink"><PartyPopper/></span><b>Diversão para celebrar</b></div></div></div>
      </section>

      <section className="events-section" id="eventos">
        <div className="section-heading"><div className="eyebrow">A ALEGRIA ACONTECE DE VERDADE</div><h2>Momentos especiais com a <span>Sonho Kids</span></h2><p>Veja mais registros dos nossos brinquedos e máquinas em ação nas comemorações.</p></div>
        <div className="moments-grid">{galleryItems.map((item, i) => <div className={`moment-card moment-${(i % 3) + 1}`} key={item.image?.id || item.title || i}><div className="moment-art">{item.image ? <img className="real-site-photo" src={mediaUrl(item.image.path)} alt="Foto de demonstração de evento da Sonho Kids" loading="lazy" decoding="async"/> : <span>{item.emoji}</span>}<small>SONHO KIDS • EVENTOS</small></div></div>)}</div>
        <div className="instagram-note"><Instagram/><p>Quer ver mais fotos dos nossos eventos?</p><a href={instagram} target="_blank" rel="noreferrer">Acompanhe nosso Instagram <ArrowUpRight size={16}/></a></div>
      </section>

      <section className="seo-intro-section" aria-labelledby="seo-intro-title">
        <div className="seo-intro-content">
          <div className="eyebrow">SONHO KIDS BRINQUEDOS</div>
          <h2 id="seo-intro-title">Aluguel de brinquedos para festas em BH e região</h2>
          <p>Vai comemorar um aniversário, reunir a família ou organizar um evento? A Sonho Kids Brinquedos oferece locação de cama elástica, piscina de bolinhas, máquina de pipoca e máquina de algodão-doce para deixar sua festa ainda mais divertida. Atendemos Belo Horizonte e região. Consulte a disponibilidade para sua data e solicite seu orçamento pelo WhatsApp.</p>
          <a href={whatsapp} target="_blank" rel="noreferrer" className="seo-intro-link">Peça seu orçamento pelo WhatsApp <ArrowUpRight size={16}/></a>
        </div>
      </section>

      <section className="location-section" id="localizacao">
        <div className="location-heading">
          <h2>Sonho Kids Brinquedos</h2>
          <p>Atendemos BH e região</p>
        </div>
      </section>

      <section className="contact-section" id="contato"><div className="contact-decoration">🎈</div><div><div className="eyebrow">{settingValue(content, 'contact_eyebrow')}</div><h2>{settingValue(content, 'contact_title')}</h2><p>{settingValue(content, 'contact_description')}</p></div></section>
    </main>

    <footer className="site-footer"><Brand footer logoUrl={logoReady ? logoUrl : ''} loading={!logoReady}/><p>{settingValue(content, 'footer_text')}</p><div className="footer-social"><a href={instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram/></a></div><small>© {new Date().getFullYear()} Sonho Kids Brinquedos. Todos os direitos reservados.</small></footer>
    {previewPhoto && <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={previewPhoto.title} onClick={() => setPreviewPhoto(null)}>
      <button className="photo-lightbox-close" type="button" aria-label="Fechar foto" onClick={() => setPreviewPhoto(null)}>×</button>
      <img src={previewPhoto.src} alt={previewPhoto.title} onClick={(event) => event.stopPropagation()}/>
    </div>}
    <a className="whatsapp-float" href={whatsapp} aria-label="Fale conosco pelo WhatsApp" target="_blank" rel="noreferrer"><WhatsAppIcon size={24}/></a>
    {showScrollTop && <button className="scroll-top-float" type="button" aria-label="Voltar ao topo" title="Voltar ao topo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={23}/></button>}
  </>;
}
createRoot(document.getElementById('root')).render(<App/>);
