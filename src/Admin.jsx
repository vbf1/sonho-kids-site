import React, { useEffect, useState } from 'react';
import { supabase, mediaUrl } from './supabaseClient';
import { ArrowLeft, Upload, ImagePlus, Trash2, Save, LogOut, LoaderCircle, CheckCircle2, AlertCircle, Images, Settings2 } from 'lucide-react';
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
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
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
      supabase.from('site_settings').select('value').eq('key', 'logo_path').maybeSingle()
    ]);
    if (imageError || settingsError) throw imageError || settingsError;
    setImages(data || []);
    setLogoPath(settings?.value || '');
    setLogoPreview(settings?.value ? mediaUrl(settings.value) : '');
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

  const logout = async () => { await supabase.auth.signOut(); setSession(null); };

  if (checking) return <div className="admin-loading"><LoaderCircle className="spin"/> Preparando painel...</div>;
  if (!session) return <main className="admin-page"><a className="admin-back" href="../"><ArrowLeft size={17}/> Voltar ao site</a><section className="admin-login"><div className="admin-mark">🌈</div><span className="admin-kicker">SONHO KIDS BRINQUEDOS</span><h1>Área administrativa</h1><p>Entre para atualizar as fotos, os brinquedos e a identidade visual do site.</p><form onSubmit={authenticate}><label>E-mail autorizado</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/><label>Senha</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="8" required placeholder="Mínimo de 8 caracteres"/><button className="admin-primary" disabled={busy}>{busy ? 'Aguarde...' : authMode === 'login' ? 'Entrar no painel' : 'Criar meu acesso'}</button></form><button className="admin-switch" onClick={() => {setAuthMode(authMode === 'login' ? 'signup' : 'login');setError('');setNotice('');}}>{authMode === 'login' ? 'Primeiro acesso? Criar senha' : 'Já tem acesso? Entrar'}</button>{error && <div className="admin-alert error"><AlertCircle size={16}/>{error}</div>}{notice && <div className="admin-alert success"><CheckCircle2 size={16}/>{notice}</div>}<small>Somente a conta {OWNER} tem permissão para alterar o conteúdo.</small></section></main>;

  return <main className="admin-page"><header className="admin-top"><a className="admin-back" href="../"><ArrowLeft size={17}/> Ver site</a><div><b>Sonho Kids</b><span>Painel de conteúdo</span></div><button className="admin-logout" onClick={logout}><LogOut size={16}/> Sair</button></header><div className="admin-content"><div className="admin-heading"><span className="admin-kicker">GERENCIAMENTO DO SITE</span><h1>Olá! Vamos atualizar sua vitrine?</h1><p>As alterações salvas aqui aparecem no site público, inclusive no celular dos visitantes.</p></div>{error && <div className="admin-alert error"><AlertCircle size={16}/>{error}</div>}{notice && <div className="admin-alert success"><CheckCircle2 size={16}/>{notice}</div>}
  <section className="admin-panel"><div className="admin-panel-title"><div className="admin-icon"><Settings2/></div><div><h2>Logo e identidade visual</h2><p>Troque a logo que aparece no cabeçalho e no rodapé do site.</p></div></div><div className="logo-editor">{logoPreview ? <img src={logoPreview} alt="Logo atual da Sonho Kids"/> : <div className="logo-placeholder">Sua logo aparecerá aqui</div>}<div className="logo-controls"><label className="admin-upload"><Upload size={17}/> Escolher nova logo<input type="file" accept="image/*" onChange={(e) => {const f=e.target.files?.[0];if(f){setLogoFile(f);setLogoPreview(URL.createObjectURL(f));}}}/></label><button className="admin-primary" onClick={uploadLogo} disabled={!logoFile || busy}><Save size={16}/> Salvar logo</button><small>PNG, JPG, WebP ou SVG • até 8 MB</small></div></div></section>
  <section className="admin-panel"><div className="admin-panel-title"><div className="admin-icon"><ImagePlus/></div><div><h2>Adicionar fotos</h2><p>Envie fotos reais dos brinquedos e dos eventos direto do celular ou computador.</p></div></div><div className="upload-row"><label className="admin-select-label">Onde a foto será exibida<select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label><label className="admin-file-drop"><Upload/><b>Selecionar fotos</b><span>Você pode escolher várias imagens</span><input type="file" accept="image/*" multiple onChange={(e)=>setSelectedFiles(Array.from(e.target.files || []))}/></label></div>{selectedFiles.length>0 && <div className="selected-files">{selectedFiles.map((f)=><span key={f.name}>{f.name}</span>)}</div>}<button className="admin-primary upload-submit" onClick={uploadImages} disabled={!selectedFiles.length || busy}>{busy ? 'Enviando...' : <><Upload size={17}/> Enviar {selectedFiles.length || ''} foto(s)</>}</button><small className="admin-hint">Fotos JPG, PNG e WebP são redimensionadas automaticamente (máximo 1600 × 1200), sem deformar. GIF e SVG são preservados.</small></section>
  <section className="admin-panel"><div className="admin-panel-title"><div className="admin-icon"><Images/></div><div><h2>Fotos publicadas</h2><p>Edite o título, mude a categoria ou remova uma imagem.</p></div><strong className="admin-count">{images.length}</strong></div>{images.length ? <div className="admin-image-grid">{images.map((item)=><article className="admin-image-card" key={item.id}><img src={mediaUrl(item.path)} alt={item.title}/><div className="admin-image-fields"><input aria-label="Título da imagem" defaultValue={item.title} onBlur={(e)=>e.target.value!==item.title && updateImage(item,{title:e.target.value})}/><select aria-label="Categoria da imagem" value={item.category} onChange={(e)=>updateImage(item,{category:e.target.value})}>{categories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><button className="admin-delete" onClick={()=>deleteImage(item)} disabled={busy}><Trash2 size={15}/> Excluir</button></div></article>)}</div> : <div className="admin-empty">Ainda não há fotos cadastradas. Envie as primeiras imagens acima.</div>}</section><p className="admin-footer-note">Painel privado • Conteúdo armazenado com segurança no Supabase</p></div></main>;
}
