import React, { useEffect, useState } from 'react';
import { supabase, mediaUrl } from './supabaseClient';
import { ExternalLink, Upload, ImagePlus, Trash2, Save, LogOut, LoaderCircle, CheckCircle2, AlertCircle, Images, Settings2 } from 'lucide-react';
import './admin.css';

const OWNER = 'victor.vbf99@gmail.com';
const categories = [
  ['cama-elastica', 'Cama elástica'],
  ['piscina-bolinhas', 'Piscina de bolinhas'],
  ['maquina-pipoca', 'Máquina de pipoca'],
  ['algodao-doce', 'Máquina de algodão-doce'],
  ['eventos', 'Fotos de eventos'],
  ['hero', 'Foto principal da primeira seção']
];
const editableFields = [["whatsapp_phone","WhatsApp (somente números, com DDI e DDD)"],["whatsapp_message","Mensagem inicial do WhatsApp"],["instagram_url","Link do Instagram"],["hero_eyebrow","Chamada pequena da primeira seção"],["hero_title","Título principal"],["hero_description","Descrição principal"],["hero_button","Texto do botão principal"],["about_eyebrow","Chamada da seção sobre"],["about_title","Título da seção sobre"],["about_description","Texto sobre a empresa"],["contact_eyebrow","Chamada da seção de contato"],["contact_title","Título da seção de contato"],["contact_description","Texto da seção de contato"],["footer_text","Texto do rodapé"],["toy_1_name","Nome — Cama elástica"],["toy_1_detail","Descrição — Cama elástica"],["toy_2_name","Nome — Piscina de bolinhas"],["toy_2_detail","Descrição — Piscina de bolinhas"],["toy_3_name","Nome — Máquina de pipoca"],["toy_3_detail","Descrição — Máquina de pipoca"],["toy_4_name","Nome — Máquina de algodão-doce"],["toy_4_detail","Descrição — Máquina de algodão-doce"]];
const defaultSettings = {
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
  "toy_1_name": "Cama elástica",
  "toy_1_detail": "Pulos, energia e muita diversão para a criançada.",
  "toy_2_name": "Piscina de bolinhas",
  "toy_2_detail": "Um espaço colorido para brincar e se divertir.",
  "toy_3_name": "Máquina de pipoca",
  "toy_3_detail": "O cheirinho e o sabor que combinam com festa.",
  "toy_4_name": "Máquina de algodão-doce",
  "toy_4_detail": "Um toque doce e especial para seu evento."
};
const labelFor = (key) => categories.find(([value]) => value === key)?.[1] || key;

const prepareImageForUpload = async (file) => {
  // GIFs and SVGs stay untouched to preserve animation and vector quality.
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxWidth = 1600;
    const maxHeight = 1200;
    const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close?.();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
    if (!blob) return file;
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto';
    return new File([blob], baseName + '.webp', {
      type: 'image/webp',
      lastModified: Date.now()
    });
  } catch (error) {
    console.warn('Não foi possível otimizar esta imagem; o arquivo original será enviado.', error);
    return file;
  }
};


export default function Admin() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState(OWNER);
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('cama-elastica');
  const [logoPath, setLogoPath] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [siteSettings, setSiteSettings] = useState(defaultSettings);

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'logo_path').maybeSingle().then(({ data, error: logoError }) => {
      if (!logoError && data?.value) {
        setLogoPath(data.value);
        setLogoPreview(mediaUrl(data.value));
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      const current = data.session;
      if (current?.user?.email?.toLowerCase() === OWNER) setSession(current);
      else if (current) supabase.auth.signOut();
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, current) => {
      if (current?.user?.email?.toLowerCase() === OWNER) setSession(current);
      else setSession(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadContent = async () => {
    const [{ data, error: imageError }, { data: settings, error: settingsError }] = await Promise.all([
      supabase.from('site_images').select('*').order('sort_order').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('key,value')
    ]);
    if (imageError || settingsError) throw imageError || settingsError;
    setImages(data || []);
    const settingMap = Object.fromEntries((settings || []).map((item) => [item.key, item.value]));
    setLogoPath(settingMap.logo_path || '');
    setLogoPreview(settingMap.logo_path ? mediaUrl(settingMap.logo_path) : '');
    setSiteSettings({ ...defaultSettings, ...settingMap });
  };

  useEffect(() => {
    if (session) loadContent().catch((e) => setError(e.message));
  }, [session]);

  const authenticate = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    if (email.trim().toLowerCase() !== OWNER) {
      setError('Este painel é restrito ao e-mail autorizado.'); setBusy(false); return;
    }
    try {
      if (authMode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({ email: OWNER, password, options: { emailRedirectTo: window.location.origin + window.location.pathname } });
        if (authError) throw authError;
        if (data.session) setSession(data.session);
        else setNotice('Cadastro iniciado. Confira sua caixa de entrada para confirmar o e-mail e depois entre no painel.');
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email: OWNER, password });
        if (authError) throw authError;
        setSession(data.session);
      }
    } catch (e) { setError(e.message || 'Não foi possível autenticar.'); }
    finally { setBusy(false); }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (!logoFile.type.startsWith('image/') || logoFile.size > 8 * 1024 * 1024) throw new Error('Escolha uma imagem de até 8 MB.');
      const ext = logoFile.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
      const path = 'branding/logo-' + Date.now() + '.' + ext;
      const { error: uploadError } = await supabase.storage.from('site-media').upload(path, logoFile, { contentType: logoFile.type, cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { error: settingError } = await supabase.from('site_settings').upsert({ key: 'logo_path', value: path, updated_at: new Date().toISOString() });
      if (settingError) throw settingError;
      if (logoPath) await supabase.storage.from('site-media').remove([logoPath]);
      setLogoPath(path); setLogoPreview(mediaUrl(path)); setLogoFile(null);
      setNotice('Logo atualizada! Ela já está disponível no site público.');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const uploadHeroImage = async () => {
    if (!heroFile) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (!heroFile.type.startsWith('image/') || heroFile.size > 8 * 1024 * 1024) {
        throw new Error('Escolha uma imagem de até 8 MB.');
      }
      const file = await prepareImageForUpload(heroFile);
      const ext = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = 'hero/' + Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.' + ext;
      const { error: uploadError } = await supabase.storage.from('site-media').upload(path, file, { contentType: file.type, cacheControl: '3600' });
      if (uploadError) throw uploadError;
      const { error: rowError } = await supabase.from('site_images').insert({
        category: 'hero',
        title: 'Imagem principal',
        path,
        sort_order: -1
      });
      if (rowError) {
        await supabase.storage.from('site-media').remove([path]);
        throw rowError;
      }
      setHeroFile(null);
      setHeroPreview('');
      await loadContent();
      setNotice('Imagem principal atualizada! A nova foto já está selecionada para a primeira seção do site.');
    } catch (e) { setError(e.message || 'Não foi possível atualizar a imagem principal.'); }
    finally { setBusy(false); }
  };

  const uploadImages = async () => {
    if (!selectedFiles.length) return;
    setBusy(true); setError(''); setNotice('');
    try {
      for (const file of selectedFiles) {
        if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) throw new Error(file.name + ': use uma imagem de até 8 MB.');
      }
      for (const originalFile of selectedFiles) {
        const file = await prepareImageForUpload(originalFile);
        const ext = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
        const path = category + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.' + ext;
        const { error: uploadError } = await supabase.storage.from('site-media').upload(path, file, { contentType: file.type, cacheControl: '3600' });
        if (uploadError) throw uploadError;
        const title = originalFile.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        const { error: rowError } = await supabase.from('site_images').insert({ category, title, path, sort_order: 0 });
        if (rowError) throw rowError;
      }
      setSelectedFiles([]);
      await loadContent();
      setNotice('Imagens enviadas e ajustadas automaticamente! O site público já pode exibi-las.');
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const updateImage = async (item, changes) => {
    setError(''); setNotice('');
    const { error: updateError } = await supabase.from('site_images').update(changes).eq('id', item.id);
    if (updateError) setError(updateError.message);
    else { setImages((current) => current.map((img) => img.id === item.id ? { ...img, ...changes } : img)); setNotice('Alterações salvas.'); }
  };

  const deleteImage = async (item) => {
    if (!window.confirm('Excluir esta imagem do site?')) return;
    setBusy(true); setError(''); setNotice('');
    const { error: rowError } = await supabase.from('site_images').delete().eq('id', item.id);
    if (rowError) { setError(rowError.message); setBusy(false); return; }
    const { error: storageError } = await supabase.storage.from('site-media').remove([item.path]);
    if (storageError) setError('Registro removido, mas o arquivo não pôde ser apagado: ' + storageError.message);
    setImages((current) => current.filter((img) => img.id !== item.id));
    setBusy(false);
    if (!storageError) setNotice('Imagem excluída.');
  };


  const saveSiteSettings = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const rows = Object.entries(siteSettings).map(([key, value]) => ({ key, value: String(value ?? ''), updated_at: new Date().toISOString() }));
      const { error: saveError } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
      if (saveError) throw saveError;
      setNotice('Informações do site salvas! As alterações já estão disponíveis para os visitantes.');
    } catch (e) { setError(e.message || 'Não foi possível salvar as informações.'); }
    finally { setBusy(false); }
  };

  const logout = async () => { await supabase.auth.signOut(); setSession(null); };

  if (checking) return <div className="admin-loading"><LoaderCircle className="spin"/> Preparando painel...</div>;
  if (!session) return <main className="admin-page admin-login-page"><section className="admin-login"><div className="admin-mark">{logoPreview ? <img src={logoPreview} alt="Logo Sonho Kids Brinquedos"/> : <span>SONHO KIDS</span>}</div><span className="admin-kicker">SONHO KIDS BRINQUEDOS</span><h1>Área administrativa</h1><p>Entre para atualizar as fotos, os brinquedos e a identidade visual do site.</p><form onSubmit={authenticate}><label>E-mail autorizado</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/><label>Senha</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="8" required placeholder="Mínimo de 8 caracteres"/><button className="admin-primary" disabled={busy}>{busy ? 'Aguarde...' : authMode === 'login' ? 'Entrar no painel' : 'Criar meu acesso'}</button></form><button className="admin-switch" onClick={() => {setAuthMode(authMode === 'login' ? 'signup' : 'login');setError('');setNotice('');}}>{authMode === 'login' ? 'Primeiro acesso? Criar senha' : 'Já tem acesso? Entrar'}</button>{error && <div className="admin-alert error"><AlertCircle size={16}/>{error}</div>}{notice && <div className="admin-alert success"><CheckCircle2 size={16}/>{notice}</div>}<small>Somente a conta {OWNER} tem permissão para alterar o conteúdo.</small></section></main>;

  return <main className="admin-page"><header className="admin-top"><a className="admin-back" href="../"><ExternalLink size={17}/> Ir para o site</a><div className="admin-top-brand">{logoPreview ? <img src={logoPreview} alt="Logo Sonho Kids Brinquedos"/> : <b>Sonho Kids</b>}<span>Painel de conteúdo</span></div><button className="admin-logout" onClick={logout}><LogOut size={16}/> Sair</button></header><div className="admin-content"><div className="admin-heading"><span className="admin-kicker">GERENCIAMENTO DO SITE</span><h1>Olá! Vamos atualizar sua vitrine?</h1><p>As alterações salvas aqui aparecem no site público, inclusive no celular dos visitantes.</p></div>{error && <div className="admin-alert error"><AlertCircle size={16}/>{error}</div>}{notice && <div className="admin-alert success"><CheckCircle2 size={16}/>{notice}</div>}

  <section className="admin-panel"><div className="admin-panel-title"><div className="admin-icon"><Settings2/></div><div><h2>Informações e contatos do site</h2><p>Edite telefone, redes sociais, textos da página inicial e informações dos produtos. Salve para publicar no site.</p></div></div><form className="site-settings-form" onSubmit={saveSiteSettings}><div className="site-settings-grid">{editableFields.map(([key,label])=><label className={['whatsapp_message','hero_description','about_title','about_description','contact_title','contact_description','footer_text'].includes(key) || key.endsWith('_detail') ? 'site-setting-field wide' : 'site-setting-field'} key={key}><span>{label}</span>{['whatsapp_message','hero_description','about_title','about_description','contact_title','contact_description','footer_text'].includes(key) || key.endsWith('_detail') ? <textarea rows="3" value={siteSettings[key] ?? ''} onChange={(e)=>setSiteSettings((current)=>({...current,[key]:e.target.value}))}/> : <input value={siteSettings[key] ?? ''} onChange={(e)=>setSiteSettings((current)=>({...current,[key]:e.target.value}))}/>}</label>)}</div><button className="admin-primary" type="submit" disabled={busy}><Save size={16}/>{busy ? 'Salvando...' : 'Salvar todas as informações'}</button></form></section>
  <section className="admin-panel"><div className="admin-panel-title"><div className="admin-icon"><Settings2/></div><div><h2>Logo e identidade visual</h2><p>Troque a logo que aparece no cabeçalho e no rodapé do site.</p></div></div><div className="logo-editor">{logoPreview ? <img src={logoPreview} alt="Logo atual da Sonho Kids"/> : <div className="logo-placeholder">Sua logo aparecerá aqui</div>}<div className="logo-controls"><label className="admin-upload"><Upload size={17}/> Escolher nova logo<input type="file" accept="image/*" onChange={(e) => {const f=e.target.files?.[0];if(f){setLogoFile(f);setLogoPreview(URL.createObjectURL(f));}}}/></label><button className="admin-primary" onClick={uploadLogo} disabled={!logoFile || busy}><Save size={16}/> Salvar logo</button><small>PNG, JPG, WebP ou SVG • até 8 MB</small></div></div></section>
  <section className="admin-panel"><div className="admin-panel-title"><div className="admin-icon"><ImagePlus/></div><div><h2>Imagem principal da página inicial</h2><p>Troque a foto que aparece ao lado do título “Uma festa cheia de cor, sorrisos e diversão!”.</p></div></div><div className="hero-image-editor">{images.find((image) => image.category === 'hero') && !heroPreview ? <img className="hero-image-current" src={mediaUrl(images.find((image) => image.category === 'hero').path)} alt="Imagem principal atual do site"/> : heroPreview ? <img className="hero-image-current" src={heroPreview} alt="Prévia da nova imagem principal"/> : <div className="hero-image-current hero-image-empty">Nenhuma foto principal cadastrada</div>}<div className="hero-image-controls"><label className="admin-upload"><Upload size={17}/> Escolher nova imagem<input type="file" accept="image/*" onChange={(e) => {const f=e.target.files?.[0];if(f){setHeroFile(f);setHeroPreview(URL.createObjectURL(f));}}}/></label><button className="admin-primary" type="button" onClick={uploadHeroImage} disabled={!heroFile || busy}><Save size={16}/> {busy ? 'Enviando...' : 'Salvar imagem principal'}</button><small>JPG, PNG ou WebP • até 8 MB. A nova imagem substitui visualmente a atual no site.</small></div></div></section>
  <section className="admin-panel"><div className="admin-panel-title"><div className="admin-icon"><ImagePlus/></div><div><h2>Adicionar fotos</h2><p>Envie fotos reais dos brinquedos e dos eventos direto do celular ou computador.</p></div></div><div className="upload-row"><label className="admin-select-label">Onde a foto será exibida<select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label className="admin-file-drop"><Upload/><b>Selecionar fotos</b><span>Você pode escolher várias imagens</span><input type="file" accept="image/*" multiple onChange={(e)=>setSelectedFiles(Array.from(e.target.files || []))}/></label></div>{selectedFiles.length>0 && <div className="selected-files">{selectedFiles.map((f)=><span key={f.name}>{f.name}</span>)}</div>}<button className="admin-primary upload-submit" onClick={uploadImages} disabled={!selectedFiles.length || busy}>{busy ? 'Enviando...' : <><Upload size={17}/> Enviar {selectedFiles.length || ''} foto(s)</>}</button><small className="admin-hint">Fotos JPG, PNG e WebP são redimensionadas automaticamente (máximo 1600 × 1200), sem deformar. GIF e SVG são preservados.</small></section>
  <section className="admin-panel"><div className="admin-panel-title"><div className="admin-icon"><Images/></div><div><h2>Fotos publicadas</h2><p>Edite o título, mude a categoria ou remova uma imagem.</p></div><strong className="admin-count">{images.length}</strong></div>{images.length ? <div className="admin-image-grid">{images.map((item)=><article className="admin-image-card" key={item.id}><img src={mediaUrl(item.path)} alt={item.title}/><div className="admin-image-fields"><input aria-label="Título da imagem" defaultValue={item.title} onBlur={(e)=>e.target.value!==item.title && updateImage(item,{title:e.target.value})}/><select aria-label="Categoria da imagem" value={item.category} onChange={(e)=>updateImage(item,{category:e.target.value})}>{categories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button className="admin-delete" onClick={()=>deleteImage(item)} disabled={busy}><Trash2 size={15}/> Excluir</button></div></article>)}</div> : <div className="admin-empty">Ainda não há fotos cadastradas. Envie as primeiras imagens acima.</div>}</section><p className="admin-footer-note">Painel privado • Conteúdo armazenado com segurança no Supabase</p></div></main>;
}
