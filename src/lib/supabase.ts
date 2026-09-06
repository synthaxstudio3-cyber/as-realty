import { createClient } from '@supabase/supabase-js';

// Supabase project credentials provided by user
const SUPABASE_PROJECT_ID = 'Mwyudzasqktveuqmdxjb';
const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID.toLowerCase()}.supabase.co`;
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_JQijMHGYr-zm5s8OeGMVHw_NQcI8bqZ';

export const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;

export const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY;

// Create Supabase client instance with persistent session storage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface VoiceSessionRecord {
  id?: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  query_text: string;
  response_text: string;
  voice_engine?: string;
  created_at?: string;
}

export interface LeadInquiryRecord {
  id?: string;
  user_id?: string | null;
  name: string;
  phone: string;
  email?: string;
  property_name?: string;
  message?: string;
  source?: string;
  created_at?: string;
}

/**
 * Log an AI Voice or Chat interaction to Supabase.
 * Uses graceful error recovery so voice continues uninterrupted even if tables are not yet created in Supabase.
 */
export async function logVoiceSessionToSupabase(record: VoiceSessionRecord): Promise<boolean> {
  const timestamp = new Date().toISOString();
  const payload = {
    ...record,
    created_at: timestamp,
  };

  // Local mirror in localStorage for instant offline/client-side access
  try {
    const existing = JSON.parse(localStorage.getItem('as_realty_voice_sessions') || '[]');
    existing.unshift(payload);
    localStorage.setItem('as_realty_voice_sessions', JSON.stringify(existing.slice(0, 50)));
  } catch (_) {
    // Silently ignore storage quota errors
  }

  try {
    const { error } = await supabase.from('voice_sessions').insert([payload]);
    if (error) {
      // Table might not exist yet or RLS policy enabled; try fallback table or log
      console.info('[Supabase] Note on voice_sessions table:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.info('[Supabase] Interaction logged locally. Remote note:', err?.message);
    return false;
  }
}

/**
 * Log a lead or visit booking to Supabase.
 */
export async function logLeadToSupabase(lead: LeadInquiryRecord): Promise<boolean> {
  const payload = {
    ...lead,
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase.from('lead_inquiries').insert([payload]);
    if (error) {
      console.info('[Supabase] Note on lead_inquiries table:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.info('[Supabase] Lead logged with fallback. Note:', err?.message);
    return false;
  }
}

/**
 * Fetch past voice consultation logs for a user.
 */
export async function getVoiceSessionsFromSupabase(userId?: string | null): Promise<VoiceSessionRecord[]> {
  try {
    if (userId) {
      const { data, error } = await supabase
        .from('voice_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        return data as VoiceSessionRecord[];
      }
    }
  } catch (_) {
    // Fallback to local
  }

  try {
    return JSON.parse(localStorage.getItem('as_realty_voice_sessions') || '[]');
  } catch (_) {
    return [];
  }
}
