import { createClient } from '@supabase/supabase-js';

// Supabase project credentials provided by user
const SUPABASE_PROJECT_ID = 'rmkalviluxpknpaaviyb';
const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID.toLowerCase()}.supabase.co`;
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_MHGPpgxpwFv25g27wVUblQ_AQm7Z_WK';

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

export interface ConsultationRecord {
  id?: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  query_text: string;
  response_text: string;
  interaction_type?: string;
  created_at?: string;
}

export type VoiceSessionRecord = ConsultationRecord;

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
 * Log a consultation inquiry or interaction to Supabase.
 */
export async function logConsultationToSupabase(record: ConsultationRecord): Promise<boolean> {
  const timestamp = new Date().toISOString();
  const payload = {
    ...record,
    created_at: timestamp,
  };

  try {
    const existing = JSON.parse(localStorage.getItem('as_realty_consultations') || '[]');
    existing.unshift(payload);
    localStorage.setItem('as_realty_consultations', JSON.stringify(existing.slice(0, 50)));
  } catch (_) {
    // Silently ignore storage quota errors
  }

  try {
    const { error } = await supabase.from('consultations').insert([payload]);
    if (error) {
      console.info('[Supabase] Note on consultations table:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.info('[Supabase] Interaction logged locally. Remote note:', err?.message);
    return false;
  }
}

export const logVoiceSessionToSupabase = logConsultationToSupabase;

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
