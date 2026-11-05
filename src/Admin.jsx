import React, { useEffect, useRef, useState } from 'react';
import { supabase, mediaUrl } from './supabaseClient';
import { ExternalLink, Upload, ImagePlus, Trash2, Save, LogOut, LoaderCircle, CheckCircle2, AlertCircle, Images, Settings2, X, ShieldAlert, RotateCw, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import './admin.css';

const OWNER = 'victor.vbf99@gmail.com';
const categories = [['eventos', 'Fotos de eventos'], ['hero', 'Foto principal da primeira seção']];
const defaultCatalogItems = [{"id":"cama-elastica","name":"Cama elástica","detail":"Pulos, energia e muita diversão para a criançada.","kind":"BRINQUEDO","emoji":"🤸","color":"pink","visualLabel":"ENERGIA E MOVIMENTO","active":true},{"id":"piscina-bolinhas","name":"Piscina de bolinhas","detail":"Um espaço colorido para brincar e se divertir.","kind":"BRINQUEDO","emoji":"🟡","color":"blue","visualLabel":"UM MAR DE CORES","active":true},{"id":"maquina-pipoca","name":"Máquina de pipoca","detail":"O cheirinho e o sabor que combinam com festa.","kind":"MÁQUINA","emoji":"🍿","color":"yellow","visualLabel":"SABOR DE FESTA","active":true},{"id":"algodao-doce","name":"Máquina de algodão-doce","detail":"Um toque doce e especial para seu evento.","kind":"MÁQUINA","emoji":"🍭","color":"purple","visualLabel":"UM TOQUE DE DOÇURA","active":true}];
const textFieldGroups = [
  { id: 'hero', title: '1. Primeira seção — apresentação', fields: [
    ["hero_eyebrow","Chamada pequena da primeira seção"],
    ["hero_title","Título principal"],
    ["hero_description","Descrição principal"],
    ["hero_button","Texto do botão principal"]
  ]},
  { id: 'about', title: '2. Sobre a Sonho Kids', fields: [
    ["about_eyebrow","Chamada da seção sobre"],
    ["about_title","Título da seção sobre"],
    ["about_description","Texto sobre a empresa"]
  ]},
  { id: 'contact', title: '3. Contato', fields: [
    ["contact_eyebrow","Chamada da seção de contato"],
    ["contact_title","Título da seção de contato"],
    ["contact_description","Texto da seção de contato"],
    ["whatsapp_phone","WhatsApp (somente números, com DDI e DDD)"],
    ["whatsapp_message","Mensagem inicial do WhatsApp"],
    ["instagram_url","Link do Instagram"]
  ]},
  { id: 'footer', title: '4. Rodapé', fields: [
    ["footer_text","Texto do rodapé"]
  ]}
];
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


const createEditedImageFile = async (file, settings) => {
  const bitmap = await createImageBitmap(file);
  const sideways = Math.abs(settings.rotation % 180) === 90;
  const rotatedWidth = sideways ? bitmap.height : bitmap.width;
  const rotatedHeight = sideways ? bitmap.width : bitmap.height;
  const rotated = document.createElement('canvas');
  rotated.width = rotatedWidth; rotated.height = rotatedHeight;
  const rotatedContext = rotated.getContext('2d');
  if (!rotatedContext) throw new Error('Não foi possível preparar a edição da imagem.');
  rotatedContext.translate(rotatedWidth / 2, rotatedHeight / 2);
  rotatedContext.rotate(settings.rotation * Math.PI / 180);
  rotatedContext.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close?.();
  let baseWidth = rotatedWidth, baseHeight = rotatedHeight;
  if (settings.ratio !== 'original') {
    const [ratioW, ratioH] = settings.ratio.split(':').map(Number);
    const target = ratioW / ratioH;
    if (rotatedWidth / rotatedHeight > target) baseWidth = rotatedHeight * target;
    else baseHeight = rotatedWidth / target;
  }
  const selection = settings.cropRect || { x: 0, y: 0, w: 100, h: 100 };
  const sourceX = rotatedWidth * Math.max(0, Math.min(100, selection.x)) / 100;
  const sourceY = rotatedHeight * Math.max(0, Math.min(100, selection.y)) / 100;
  const cropWidth = rotatedWidth * Math.max(1, Math.min(100, selection.w)) / 100;
  const cropHeight = rotatedHeight * Math.max(1, Math.min(100, selection.h)) / 100;
  const output = document.createElement('canvas');
  output.width = Math.max(1, Math.round(cropWidth)); output.height = Math.max(1, Math.round(cropHeight));
  const context = output.getContext('2d');
  if (!context) throw new Error('Não foi possível finalizar a edição.');
  context.filter = 'brightness(' + settings.brightness + '%) contrast(' + settings.contrast + '%) saturate(' + settings.saturation + '%)';
  context.drawImage(rotated, sourceX, sourceY, cropWidth, cropHeight, 0, 0, output.width, output.height);
  const blob = await new Promise((resolve) => output.toBlob(resolve, 'image/webp', 0.9));
  if (!blob) throw new Error('Não foi possível gerar a imagem editada.');
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'foto';
  return new File([blob], baseName + '.webp', { type: 'image/webp', lastModified: Date.now() });
};


function AdminSelect({ value, options, onChange, title, description = 'Escolha uma das opções disponíveis.', ariaLabel }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  return <div className="admin-custom-select">
    <button type="button" className="admin-custom-select-trigger" aria-label={ariaLabel || title} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <span><small>SELECIONADO</small><strong>{selected?.label || 'Selecione uma opção'}</strong></span><ChevronDown size={18}/>
    </button>
    {open && <div className="admin-custom-select-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="admin-custom-select-modal" role="dialog" aria-modal="true" aria-label={title}>
        <header className="admin-custom-select-header">
          <div className="admin-custom-select-icon"><Settings2 size={21}/></div>
          <button type="button" className="admin-custom-select-close" onClick={() => setOpen(false)} aria-label="Fechar"><X size={19}/></button>
          <span>CONFIGURAÇÃO DO PAINEL</span><h2>{title}</h2><p>{description}</p>
        </header>
        <div className="admin-custom-select-options">
          {options.map((option) => <button type="button" key={option.value} className={'admin-custom-select-option' + (value === option.value ? ' is-selected' : '')} onClick={() => { onChange(option.value); setOpen(false); }}>
            <span className="admin-custom-select-option-copy"><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
            <span className="admin-custom-select-check">{value === option.value ? <Check size={16}/> : null}</span>
          </button>)}
        </div>
        <footer className="admin-custom-select-footer"><button type="button" onClick={() => setOpen(false)}>Cancelar</button></footer>
      </section>
    </div>}
  </div>;
}

export default function Admin() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState(OWNER);
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingImage, setEditingImage] = useState(null);
  const [editSettings, setEditSettings] = useState({ rotation: 0, brightness: 100, contrast: 100, saturation: 100, ratio: '1:1' });
  const [previewSize, setPreviewSize] = useState(null);
  const [cropRect, setCropRect] = useState({ x: 25, y: 0, w: 50, h: 100 });
  const cropGesture = useRef(null);
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('cama-elastica');
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [logoPath, setLogoPath] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [siteSettings, setSiteSettings] = useState(defaultSettings);
  const [catalogItems, setCatalogItems] = useState(defaultCatalogItems);
  const [newItemName, setNewItemName] = useState('');
  const [newItemKind, setNewItemKind] = useState('BRINQUEDO');
  const categoryOptions = [...catalogItems.map((item) => [item.id, item.name]), ...categories];
  const categoryLabel = (value) => categoryOptions.find(([key]) => key === value)?.[1] || 'Categoria não identificada';
  const groupedImages = categoryOptions.map(([key, label]) => ({ key, label, items: images.filter((image) => image.category === key) })).filter((group) => group.items.length);

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
    try {
      const savedCatalog = settingMap.catalog_items ? JSON.parse(settingMap.catalog_items) : null;
      setCatalogItems(Array.isArray(savedCatalog) ? savedCatalog : defaultCatalogItems);
    } catch { setCatalogItems(defaultCatalogItems); }
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
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: OWNER, password });
      if (authError) throw authError;
      if (data.session?.user?.email?.toLowerCase() !== OWNER) {
        await supabase.auth.signOut();
        throw new Error('Esta conta não está autorizada a acessar o painel.');
      }
      setSession(data.session);
    } catch (e) { setError(e.message || 'Não foi possível autenticar.'); }
    finally { setBusy(false); }
  };

  const startImageEditing = (file, target, index = null) => {
    if (!file || !file.type.startsWith('image/') || ['image/gif','image/svg+xml'].includes(file.type)) {
      setError('O editor está disponível para fotos JPG, PNG e WebP. GIF e SVG são mantidos sem alterações.');
      return;
    }
    setEditingImage({ file, target, index, preview: URL.createObjectURL(file) });
    setPreviewSize(null); setCropDrag(null);
    setEditSettings({ rotation: 0, brightness: 100, contrast: 100, saturation: 100, ratio: 'original', cropX: 50, cropY: 50, zoom: 1 });
  };
  const startExistingImageEditing = async (item) => {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(mediaUrl(item.path), { cache: 'no-store' });
      if (!response.ok) throw new Error('Não foi possível carregar a foto publicada para edição.');
      const blob = await response.blob();
      const type = blob.type || 'image/jpeg';
      if (!type.startsWith('image/') || ['image/gif','image/svg+xml'].includes(type)) throw new Error('Esta foto não é compatível com o editor.');
      const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
      const file = new File([blob], (item.title || 'foto') + '.' + extension, { type });
      setEditingImage({ file, target: 'existing', item, preview: URL.createObjectURL(file) });
      setPreviewSize(null); cropGesture.current = null;
      setEditSettings({ rotation: 0, brightness: 100, contrast: 100, saturation: 100, ratio: '1:1' });
      setCropRect({ x: 25, y: 0, w: 50, h: 100 });
    } catch (e) { setError(e.message || 'Não foi possível abrir esta foto.'); }
    finally { setBusy(false); }
  };
  const buildCropRect = (width, height, ratio) => {
    const imageRatio = width / Math.max(1, height);
    const targetRatio = ratio === 'original' ? imageRatio : ratio.split(':').map(Number).reduce((w, h) => w / h);
    let w = 100, h = 100;
    if (imageRatio > targetRatio) w = 100 * targetRatio / imageRatio;
    else h = 100 * imageRatio / targetRatio;
    return { x: (100 - w) / 2, y: (100 - h) / 2, w, h };
  };
  const handleCropPointerDown = (event) => {
    const handle = event.target.closest('[data-crop-handle]')?.getAttribute('data-crop-handle') || 'move';
    const rect = event.currentTarget.getBoundingClientRect();
    cropGesture.current = { x: event.clientX, y: event.clientY, crop: { ...cropRect }, width: rect.width, height: rect.height, handle };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const handleCropPointerMove = (event) => {
    const gesture = cropGesture.current;
    if (!gesture) return;
    const dx = (event.clientX - gesture.x) / Math.max(1, gesture.width) * 100;
    const dy = (event.clientY - gesture.y) / Math.max(1, gesture.height) * 100;
    const original = gesture.crop;
    if (gesture.handle === 'move') {
      setCropRect({ ...original, x: Math.max(0, Math.min(100 - original.w, original.x + dx)), y: Math.max(0, Math.min(100 - original.h, original.y + dy)) });
      return;
    }
    const aspect = original.w / original.h;
    const right = original.x + original.w, bottom = original.y + original.h;
    let w = original.w, h = original.h, x = original.x, y = original.y;
    if (gesture.handle.includes('e')) w = Math.max(8, Math.min(100 - original.x, original.w + dx));
    if (gesture.handle.includes('w')) { w = Math.max(8, Math.min(right, original.w - dx)); x = right - w; }
    if (gesture.handle.includes('s')) h = Math.max(8, Math.min(100 - original.y, original.h + dy));
    if (gesture.handle.includes('n')) { h = Math.max(8, Math.min(bottom, original.h - dy)); y = bottom - h; }
    if (Math.abs(dx) >= Math.abs(dy)) h = w / aspect; else w = h * aspect;
    if (gesture.handle.includes('w')) x = right - w;
    if (gesture.handle.includes('n')) y = bottom - h;
    if (x < 0) { w += x; x = 0; h = w / aspect; if (gesture.handle.includes('n')) y = bottom - h; }
    if (y < 0) { h += y; y = 0; w = h * aspect; if (gesture.handle.includes('w')) x = right - w; }
    if (x + w > 100) { w = 100 - x; h = w / aspect; if (gesture.handle.includes('n')) y = bottom - h; }
    if (y + h > 100) { h = 100 - y; w = h * aspect; if (gesture.handle.includes('w')) x = right - w; }
    setCropRect({ x: Math.max(0, x), y: Math.max(0, y), w: Math.max(1, w), h: Math.max(1, h) });
  };
  const handleCropPointerEnd = () => { cropGesture.current = null; };
  const closeImageEditor = () => {
    if (editingImage?.preview) URL.revokeObjectURL(editingImage.preview);
    setEditingImage(null);
  };
  const applyImageEditing = async () => {
    if (!editingImage) return;
    setBusy(true); setError('');
    try {
      const editedFile = await createEditedImageFile(editingImage.file, editSettings);
      const preview = URL.createObjectURL(editedFile);
      if (editingImage.target === 'hero') {
        setHeroFile(editedFile); setHeroPreview(preview);
        closeImageEditor();
        setNotice('Edição aplicada. A foto editada será enviada quando você publicar as imagens.');
      } else if (editingImage.target === 'existing') {
        const item = editingImage.item;
        const path = item.category + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '.webp';
        const { error: uploadError } = await supabase.storage.from('site-media').upload(path, editedFile, { contentType: 'image/webp', cacheControl: '3600' });
        if (uploadError) throw uploadError;
        const { error: updateError } = await supabase.from('site_images').update({ path }).eq('id', item.id);
        if (updateError) {
          await supabase.storage.from('site-media').remove([path]);
          throw updateError;
        }
        await supabase.storage.from('site-media').remove([item.path]);
        setImages((current) => current.map((img) => img.id === item.id ? { ...img, path } : img));
        closeImageEditor();
        setNotice('Foto publicada atualizada com sucesso. A versão editada já está no site.');
      } else {
        setSelectedFiles((current) => current.map((file, index) => index === editingImage.index ? editedFile : file));
        closeImageEditor();
        setNotice('Edição aplicada. A foto editada será enviada quando você publicar as imagens.');
      }
    } catch (e) { setError(e.message || 'Não foi possível editar a imagem.'); }
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
    setBusy(true); setError(''); setNotice('');
    const { error: rowError } = await supabase.from('site_images').delete().eq('id', item.id);
    if (rowError) { setError(rowError.message); setBusy(false); return; }
    const { error: storageError } = await supabase.storage.from('site-media').remove([item.path]);
    if (storageError) setError('Registro removido, mas o arquivo não pôde ser apagado: ' + storageError.message);
    setImages((current) => current.filter((img) => img.id !== item.id));
    setBusy(false);
    if (!storageError) setNotice('Imagem excluída.');
    setDeleteTarget(null);
  };


  const saveSiteSettings = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const rows = [...Object.entries(siteSettings), ['catalog_items', JSON.stringify(catalogItems)]].map(([key, value]) => ({ key, value: String(value ?? ''), updated_at: new Date().toISOString() }));
      const { error: saveError } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
      if (saveError) throw saveError;
      setNotice('Informações do site salvas! As alterações já estão disponíveis para os visitantes.');
    } catch (e) { setError(e.message || 'Não foi possível salvar as informações.'); }
    finally { setBusy(false); }
  };

  const logout = async () => { await supabase.auth.signOut(); setSession(null); };

  if (checking) return <div className="admin-loading"><LoaderCircle className="spin"/> Preparando painel...</div>;
  if (!session) return <main className="admin-page admin-login-page"><section className="admin-login"><div className="admin-mark">{logoPreview ? <img src={logoPreview} alt="Logo Sonho Kids Brinquedos"/> : <span>SONHO KIDS</span>}</div><span className="admin-kicker">SONHO KIDS BRINQUEDOS</span><h1>Área administrativa</h1><p>Entre para atualizar as fotos, os brinquedos e a identidade visual do site.</p><form onSubmit={authenticate}><label>E-mail autorizado</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/><label>Senha</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength="8" required placeholder="Mínimo de 8 caracteres"/><button className="admin-primary" disabled={busy}>{busy ? 'Aguarde...' : 'Entrar no painel'}</button></form>{error && <div className="admin-alert error"><AlertCircle size={16}/>{error}</div>}{notice && <div className="admin-alert success"><CheckCircle2 size={16}/>{notice}</div>}<small>Acesso exclusivo à conta administrativa já cadastrada.</small></section></main>;

  return <main className="admin-page"><header className="admin-top"><a className="admin-back" href="../"><ExternalLink size={17}/> Ir para o site</a><div className="admin-top-brand">{logoPreview ? <img src={logoPreview} alt="Logo Sonho Kids Brinquedos"/> : <b>Sonho Kids</b>}<span>Painel de conteúdo</span></div><button className="admin-logout" onClick={logout}><LogOut size={16}/> Sair</button></header><div className="admin-content"><div className="admin-heading"><span className="admin-kicker">GERENCIAMENTO DO SITE</span><h1>Olá! Vamos atualizar sua vitrine?</h1><p>As alterações salvas aqui aparecem no site público, inclusive no celular dos visitantes.</p></div>
  <nav className="admin-workflow" aria-label="Atalhos do painel">
    <strong>O que você deseja gerenciar?</strong>
    <div><a href="#textos">Textos do site</a><a href="#produtos">Brinquedos e máquinas</a><a href="#identidade">Logo</a><a href="#foto-principal">Foto principal</a><a href="#enviar-fotos">Enviar fotos</a><a href="#fotos-publicadas">Organizar fotos</a></div>
    <small>Use esta sequência como guia: primeiro ajuste as informações, depois os produtos e por último as imagens.</small>
  </nav>{error && <div className="admin-alert error"><AlertCircle size={16}/>{error}</div>}{notice && <div className="admin-alert success"><CheckCircle2 size={16}/>{notice}</div>}

  <section className="admin-panel" id="textos"><div className="admin-panel-title"><div className="admin-icon"><Settings2/></div><div><h2>1. Textos e informações do site</h2><p>Os campos estão organizados na mesma sequência em que as seções aparecem na página pública. Edite e salve ao final.</p></div></div><form className="site-settings-form" onSubmit={saveSiteSettings}>
    {textFieldGroups.map((group) => <React.Fragment key={group.id}>
      <div className="site-settings-group">
        <h3>{group.title}</h3>
        <div className="site-settings-grid">{group.fields.map(([key,label])=><label className={['whatsapp_message','hero_description','about_title','about_description','contact_title','contact_description','footer_text'].includes(key) ? 'site-setting-field wide' : 'site-setting-field'} key={key}><span>{label}</span>{['whatsapp_message','hero_description','about_title','about_description','contact_title','contact_description','footer_text'].includes(key) ? <textarea rows="3" value={siteSettings[key] ?? ''} onChange={(e)=>setSiteSettings((current)=>({...current,[key]:e.target.value}))}/> : <input value={siteSettings[key] ?? ''} onChange={(e)=>setSiteSettings((current)=>({...current,[key]:e.target.value}))}/>}</label>)}</div>
      </div>
      {group.id === 'hero' && (<section className="admin-panel catalog-manager" id="produtos">
    <div className="admin-panel-title"><div className="admin-icon"><Images/></div><div><h2>Brinquedos e máquinas do site</h2><p>Cadastre novos produtos, altere nomes e descrições e escolha quais aparecem na vitrine. Produtos desativados ficam ocultos, mas suas fotos são preservadas.</p></div></div>
    <div className="catalog-display-setting">
      <h3>Como os produtos serão exibidos no site?</h3>
      <p>Você pode mostrar os brinquedos na página inicial ou reunir todos em uma página exclusiva de catálogo.</p>
      <div className="catalog-display-options">
        <label className={siteSettings.catalog_display_mode !== 'catalog' ? 'is-selected' : ''}>
          <input type="radio" name="catalog_display_mode" value="inline" checked={siteSettings.catalog_display_mode !== 'catalog'} onChange={() => setSiteSettings((current) => ({ ...current, catalog_display_mode: 'inline' }))}/>
          <span><strong>Na página inicial</strong><small>Os produtos aparecem um abaixo do outro, como atualmente.</small></span>
        </label>
        <label className={siteSettings.catalog_display_mode === 'catalog' ? 'is-selected' : ''}>
          <input type="radio" name="catalog_display_mode" value="catalog" checked={siteSettings.catalog_display_mode === 'catalog'} onChange={() => setSiteSettings((current) => ({ ...current, catalog_display_mode: 'catalog' }))}/>
          <span><strong>Em uma página Catálogo</strong><small>A página inicial terá um convite para o cliente abrir o catálogo completo.</small></span>
        </label>
      </div>
      <small className="catalog-display-hint">A escolha será publicada junto com o botão “Salvar brinquedos e máquinas”.</small>
    </div>
    <div className="catalog-add-row">
      <input aria-label="Nome do novo produto" placeholder="Nome do novo brinquedo ou máquina" value={newItemName} onChange={(e)=>setNewItemName(e.target.value)}/>
      <AdminSelect title="Tipo do novo produto" ariaLabel="Tipo do novo produto" value={newItemKind} onChange={setNewItemKind} options={[{value:'BRINQUEDO',label:'Brinquedo',description:'Produto recreativo para as crianças'},{value:'MÁQUINA',label:'Máquina',description:'Equipamento para complementar a festa'}]}/>
      <button type="button" className="admin-primary" disabled={!newItemName.trim() || busy} onClick={()=>{
        const base = newItemName.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
        if (!base) return;
        const id = base + '-' + Date.now().toString(36);
        setCatalogItems((items)=>[...items,{id,name:newItemName.trim(),detail:'Consulte disponibilidade e solicite seu orçamento.',kind:newItemKind,emoji:newItemKind==='MÁQUINA'?'🎉':'🎈',color:['pink','blue','yellow','purple'][items.length%4],visualLabel:'DIVERSÃO PARA SUA FESTA',active:true}]);
        setNewItemName('');
        setNotice('Produto adicionado. Preencha os detalhes e salve as informações para publicar.');
      }}><ImagePlus size={16}/> Adicionar produto</button>
    </div>
    <div className="catalog-items-list">{catalogItems.map((item,index)=><article className="catalog-item-editor" key={item.id}>
      <div className="catalog-item-top"><strong>{item.kind}</strong><label className="catalog-active-toggle"><input type="checkbox" checked={item.active!==false} onChange={(e)=>setCatalogItems((items)=>items.map((entry,i)=>i===index?{...entry,active:e.target.checked}:entry))}/> Exibir no site</label></div>
      <div className="catalog-item-fields">
        <label>Nome<input value={item.name} onChange={(e)=>setCatalogItems((items)=>items.map((entry,i)=>i===index?{...entry,name:e.target.value}:entry))}/></label>
        <label>Descrição<textarea rows="2" value={item.detail} onChange={(e)=>setCatalogItems((items)=>items.map((entry,i)=>i===index?{...entry,detail:e.target.value}:entry))}/></label>
        <label>Tipo<AdminSelect title="Tipo do produto" value={item.kind} onChange={(nextValue)=>setCatalogItems((items)=>items.map((entry,i)=>i===index?{...entry,kind:nextValue}:entry))} options={[{value:'BRINQUEDO',label:'Brinquedo',description:'Produto recreativo para as crianças'},{value:'MÁQUINA',label:'Máquina',description:'Equipamento para complementar a festa'}]}/></label>
      </div>
      <small>Categoria de fotos: {item.id} — use esta categoria ao enviar as fotos deste produto.</small>
    </article>)}</div>
    <button className="admin-primary" type="button" disabled={busy} onClick={saveSiteSettings}><Save size={16}/> Salvar brinquedos e máquinas</button>
  </section>)}
    </React.Fragment>)}
    <button className="admin-primary" type="submit" disabled={busy}><Save size={16}/>{busy ? 'Salvando...' : 'Salvar todas as informações'}</button>
  </form></section>
  <section className="admin-panel" id="identidade"><div className="admin-panel-title"><div className="admin-icon"><Settings2/></div><div><h2>3. Logo e identidade visual</h2><p>Troque a logo que aparece no cabeçalho e no rodapé do site.</p></div></div><div className="logo-editor">{logoPreview ? <img src={logoPreview} alt="Logo atual da Sonho Kids"/> : <div className="logo-placeholder">Sua logo aparecerá aqui</div>}<div className="logo-controls"><label className="admin-upload"><Upload size={17}/> Escolher nova logo<input type="file" accept="image/*" onChange={(e) => {const f=e.target.files?.[0];if(f){setLogoFile(f);setLogoPreview(URL.createObjectURL(f));}}}/></label><button className="admin-primary" onClick={uploadLogo} disabled={!logoFile || busy}><Save size={16}/> Salvar logo</button><small>PNG, JPG, WebP ou SVG • até 8 MB</small></div></div></section>
  <section className="admin-panel" id="foto-principal"><div className="admin-panel-title"><div className="admin-icon"><ImagePlus/></div><div><h2>4. Foto principal da página inicial</h2><p>Troque a foto que aparece ao lado do título “Uma festa cheia de cor, sorrisos e diversão!”.</p></div></div><div className="hero-image-editor">{images.find((image) => image.category === 'hero') && !heroPreview ? <img className="hero-image-current" src={mediaUrl(images.find((image) => image.category === 'hero').path)} alt="Imagem principal atual do site"/> : heroPreview ? <img className="hero-image-current" src={heroPreview} alt="Prévia da nova imagem principal"/> : <div className="hero-image-current hero-image-empty">Nenhuma foto principal cadastrada</div>}<div className="hero-image-controls"><label className="admin-upload"><Upload size={17}/> Escolher nova imagem<input type="file" accept="image/*" onChange={(e) => {const f=e.target.files?.[0];if(f){setHeroFile(f);setHeroPreview(URL.createObjectURL(f));}}}/></label>{heroFile && <button type="button" className="image-edit-trigger" onClick={()=>startImageEditing(heroFile,'hero')}><SlidersHorizontal size={16}/> Editar foto</button>}<button className="admin-primary" type="button" onClick={uploadHeroImage} disabled={!heroFile || busy}><Save size={16}/> {busy ? 'Enviando...' : 'Salvar imagem principal'}</button><small>JPG, PNG ou WebP • até 8 MB. A nova imagem substitui visualmente a atual no site.</small></div></div></section>
  <section className="admin-panel" id="enviar-fotos"><div className="admin-panel-title"><div className="admin-icon"><ImagePlus/></div><div><h2>5. Enviar fotos para o site</h2><p>Envie fotos reais dos brinquedos e dos eventos direto do celular ou computador.</p></div></div><div className="upload-row"><div className="admin-select-label category-picker-field"><span>Onde a foto será exibida</span><button type="button" className="category-picker-trigger" onClick={()=>setCategoryPickerOpen(true)} aria-haspopup="dialog" aria-expanded={categoryPickerOpen}><span><small>SEÇÃO SELECIONADA</small><strong>{categoryLabel(category)}</strong></span><ChevronDown size={19}/></button></div><label className="admin-file-drop"><Upload/><b>Selecionar fotos</b><span>Você pode escolher várias imagens</span><input type="file" accept="image/*" multiple onChange={(e)=>setSelectedFiles(Array.from(e.target.files || []))}/></label></div>{selectedFiles.length>0 && <div className="selected-files image-edit-list">{selectedFiles.map((f,index)=><div className="image-edit-file" key={f.name+'-'+index}><span>{f.name}</span><button type="button" className="image-edit-trigger" onClick={()=>startImageEditing(f,'gallery',index)}><SlidersHorizontal size={14}/> Editar</button></div>)}</div>}<button className="admin-primary upload-submit" onClick={uploadImages} disabled={!selectedFiles.length || busy}>{busy ? 'Enviando...' : <><Upload size={17}/> Enviar {selectedFiles.length || ''} foto(s)</>}</button><small className="admin-hint">Fotos JPG, PNG e WebP são redimensionadas automaticamente (máximo 1600 × 1200), sem deformar. GIF e SVG são preservados.</small></section>
  <section className="admin-panel" id="fotos-publicadas"><div className="admin-panel-title"><div className="admin-icon"><Images/></div><div><h2>6. Organizar fotos publicadas</h2><p>Aqui você identifica exatamente onde cada foto aparece. As imagens estão separadas por seção do site.</p></div><strong className="admin-count">{images.length} fotos</strong></div>
  <div className="photo-manager-guide"><strong>Como organizar:</strong><span><b>Nome da foto:</b> identificação interna para você reconhecer a imagem.</span><span><b>Seção do site:</b> escolha onde a imagem será exibida.</span><span><b>Excluir:</b> remove a foto do site e do armazenamento. Essa ação não pode ser desfeita.</span></div>
  {images.length ? groupedImages.map((group)=><div className="photo-category-group" key={group.key}><div className="photo-category-heading"><h3>{group.label}</h3><span>{group.items.length} {group.items.length===1?'foto':'fotos'}</span></div><div className="admin-image-grid">{group.items.map((item)=><article className="admin-image-card" key={item.id}><img src={mediaUrl(item.path)} alt={item.title || group.label}/><div className="admin-image-fields"><div className="photo-card-location"><span>APARECE EM</span><strong>{categoryLabel(item.category)}</strong></div><label className="photo-field-label">Nome/identificação da foto<input aria-label="Nome ou identificação da foto" defaultValue={item.title || ''} placeholder="Ex.: Festa de aniversário" onBlur={(e)=>e.target.value!==item.title && updateImage(item,{title:e.target.value})}/></label><label className="photo-field-label">Seção onde será exibida<AdminSelect title="Onde esta foto será exibida?" ariaLabel="Seção onde será exibida" description="Escolha em qual seção do site esta foto deve aparecer." value={item.category} onChange={(nextValue)=>updateImage(item,{category:nextValue})} options={categoryOptions.map(([value,label],index)=>({value,label,description:index<catalogItems.length?'Fotos deste brinquedo ou máquina':'Seção de conteúdo do site'}))}/></label><details className="photo-technical-details"><summary>Informações técnicas (somente painel)</summary><small>Arquivo: {item.path.split('/').pop()}</small><small>Caminho: {item.path}</small><small>ID: {item.id}</small></details><button type="button" className="image-edit-trigger photo-edit-published" onClick={()=>startExistingImageEditing(item)} disabled={busy}><SlidersHorizontal size={15}/> Editar foto publicada</button><button className="admin-delete" onClick={()=>setDeleteTarget(item)} disabled={busy}><Trash2 size={15}/> Excluir esta foto</button></div></article>)}</div></div>) : <div className="admin-empty">Ainda não há fotos cadastradas. Use “Enviar fotos para o site” acima e escolha a seção correta para cada imagem.</div>}</section>{categoryPickerOpen && <div className="category-picker-backdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget)setCategoryPickerOpen(false);}}><section className="category-picker-modal" role="dialog" aria-modal="true" aria-labelledby="category-picker-title"><header className="category-picker-header"><div className="category-picker-icon"><ImagePlus size={21}/></div><button type="button" className="category-picker-close" onClick={()=>setCategoryPickerOpen(false)} aria-label="Fechar"><X size={19}/></button><span>ORGANIZE SUAS FOTOS</span><h2 id="category-picker-title">Onde a foto será exibida?</h2><p>Escolha a seção do site em que as imagens enviadas vão aparecer.</p></header><div className="category-picker-options">{categoryOptions.map(([value,label],index)=><button type="button" key={value} className={'category-picker-option'+(category===value?' is-selected':'')} onClick={()=>{setCategory(value);setCategoryPickerOpen(false);}}><span className="category-picker-option-icon">{index<catalogItems.length?'🎈':'🖼️'}</span><span className="category-picker-option-copy"><strong>{label}</strong><small>{index<catalogItems.length?'Fotos deste brinquedo ou máquina':'Seção de conteúdo do site'}</small></span><span className="category-picker-check">{category===value?<Check size={17}/>:null}</span></button>)}</div><footer className="category-picker-footer"><button type="button" onClick={()=>setCategoryPickerOpen(false)}>Cancelar</button></footer></section></div>}{editingImage && <div className="image-editor-backdrop"><section className="image-editor-modal" role="dialog" aria-modal="true" aria-labelledby="image-editor-title"><header className="image-editor-header"><div><span>AJUSTES DA FOTO</span><h2 id="image-editor-title">Editar imagem</h2><p>Faça os ajustes e confira a prévia antes de publicar.</p></div><button type="button" onClick={closeImageEditor} disabled={busy} aria-label="Fechar editor"><X size={20}/></button></header><div className="image-editor-preview-wrap">
  <div className="image-editor-preview" style={{aspectRatio:previewSize?((Math.abs(editSettings.rotation%180)===90?previewSize.height:previewSize.width)+' / '+(Math.abs(editSettings.rotation%180)===90?previewSize.width:previewSize.height)):'4 / 3'}}>
    <img src={editingImage.preview} alt="Prévia da foto" onLoad={(e)=>{const size={width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight};setPreviewSize(size);setCropRect(buildCropRect(Math.abs(editSettings.rotation%180)===90?size.height:size.width,Math.abs(editSettings.rotation%180)===90?size.width:size.height,editSettings.ratio));}} style={{filter:'brightness('+editSettings.brightness+'%) contrast('+editSettings.contrast+'%) saturate('+editSettings.saturation+'%)',transform:'rotate('+editSettings.rotation+'deg)'}}/>
    <div className="image-editor-crop-selection" style={{left:cropRect.x+'%',top:cropRect.y+'%',width:cropRect.w+'%',height:cropRect.h+'%'}} onPointerDown={handleCropPointerDown} onPointerMove={handleCropPointerMove} onPointerUp={handleCropPointerEnd} onPointerCancel={handleCropPointerEnd} onLostPointerCapture={handleCropPointerEnd}>
      <span className="image-editor-crop-grid" aria-hidden="true"><i/><i/><i/><i/></span>
      {['nw','n','ne','e','se','s','sw','w'].map((handle)=><span key={handle} className={'image-editor-crop-handle handle-'+handle} data-crop-handle={handle} onPointerDown={handleCropPointerDown} aria-hidden="true"/>)}
    </div>
  </div>
  <small className="image-editor-drag-hint">Arraste o quadrado para escolher a área. Puxe os cantos ou as laterais para redimensionar.</small>
</div><div className="image-editor-tools"><button type="button" className="image-editor-rotate" onClick={()=>setEditSettings((v)=>({...v,rotation:(v.rotation+90)%360}))}><RotateCw size={16}/> Girar 90°</button><label className="image-editor-ratio">Formato de corte<AdminSelect title="Formato de corte" value={editSettings.ratio} onChange={(nextValue)=>{setEditSettings((v)=>({...v,ratio:nextValue}));if(previewSize)setCropRect(buildCropRect(Math.abs(editSettings.rotation%180)===90?previewSize.height:previewSize.width,Math.abs(editSettings.rotation%180)===90?previewSize.width:previewSize.height,nextValue));}} options={[{value:'original',label:'Original',description:'Mantém as proporções da foto'},{value:'1:1',label:'Quadrado (1:1)',description:'Ideal para imagens quadradas'},{value:'4:3',label:'Paisagem (4:3)',description:'Formato horizontal tradicional'},{value:'16:9',label:'Horizontal (16:9)',description:'Formato panorâmico'},{value:'3:4',label:'Retrato (3:4)',description:'Formato vertical'}]}/></label><div className="image-editor-crop-controls"><strong>Área selecionada</strong><small>Mova a seleção inteira ou ajuste seu tamanho pelos pontos brancos nos cantos e nas laterais.</small></div><div className="image-editor-sliders">{[['brightness','Brilho'],['contrast','Contraste'],['saturation','Saturação']].map(([key,label])=><label key={key}><span>{label}<b>{editSettings[key]}%</b></span><input type="range" min="50" max="150" step="1" value={editSettings[key]} onChange={(e)=>setEditSettings((v)=>({...v,[key]:Number(e.target.value)}))}/></label>)}</div></div><footer className="image-editor-actions"><button type="button" className="image-editor-reset" onClick={()=>{setEditSettings({rotation:0,brightness:100,contrast:100,saturation:100,ratio:'1:1'});setCropRect({x:25,y:0,w:50,h:100});cropGesture.current=null;}}>Redefinir</button><button type="button" className="image-editor-cancel" onClick={closeImageEditor} disabled={busy}>Cancelar</button><button type="button" className="image-editor-apply" onClick={applyImageEditing} disabled={busy}>{busy?'Aplicando...':'Aplicar edição'}</button></footer></section></div>}{deleteTarget && <div className="delete-modal-backdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget && !busy)setDeleteTarget(null);}}><section className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title"><button className="delete-modal-close" type="button" aria-label="Fechar" onClick={()=>setDeleteTarget(null)} disabled={busy}><X size={19}/></button><div className="delete-modal-icon"><ShieldAlert size={27}/></div><span className="delete-modal-eyebrow">CONFIRMAÇÃO DE EXCLUSÃO</span><h2 id="delete-modal-title">Tem certeza que deseja excluir?</h2><p>Esta foto será removida do site e do armazenamento. Essa ação não poderá ser desfeita.</p><div className="delete-modal-preview"><img src={mediaUrl(deleteTarget.path)} alt={deleteTarget.title || 'Foto selecionada para exclusão'}/><div><strong>{deleteTarget.title || 'Foto sem identificação'}</strong><span>{categoryLabel(deleteTarget.category)}</span></div></div><div className="delete-modal-actions"><button type="button" className="delete-modal-cancel" onClick={()=>setDeleteTarget(null)} disabled={busy}>Manter foto</button><button type="button" className="delete-modal-confirm" onClick={()=>deleteImage(deleteTarget)} disabled={busy}><Trash2 size={16}/>{busy ? 'Excluindo...' : 'Excluir foto'}</button></div></section></div>}<p className="admin-footer-note">Painel privado • Conteúdo armazenado com segurança no Supabase</p></div></main>;
}
