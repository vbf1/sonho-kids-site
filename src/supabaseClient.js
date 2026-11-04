import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://odnvspjizoufclhtzxuh.supabase.co',
  'sb_publishable_BSB6imjs8bV3TAgwxhWdAQ_SHdMs5_o'
);

export const mediaUrl = (path) => path ? supabase.storage.from('site-media').getPublicUrl(path).data.publicUrl : '';
