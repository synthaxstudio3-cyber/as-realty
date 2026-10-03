import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase project credentials provided by user
const SUPABASE_PROJECT_ID = 'rmkalviluxpknpaaviyb';
const FALLBACK_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID.toLowerCase()}.supabase.co`;
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_MHGPpgxpwFv25g27wVUblQ_AQm7Z_WK';

/**
 * Sanitizes any raw input or environment variable into a valid HTTP/HTTPS Supabase URL.
 * Handles project IDs without domain, URLs without protocol, undefined/null strings, etc.
 */
export function sanitizeSupabaseUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return FALLBACK_SUPABASE_URL;
  }
  let trimmed = rawUrl.trim();
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed === '""' ||
    trimmed === "''"
  ) {
    return FALLBACK_SUPABASE_URL;
  }

  // If the user provided only the project ref e.g. "rmkalviluxpknpaaviyb"
  if (/^[a-zA-Z0-9_-]{15,35}$/.test(trimmed)) {
    return `https://${trimmed.toLowerCase()}.supabase.co`;
  }

  // Prepend https:// if protocol is omitted
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname) {
      return parsed.origin;
    }
  } catch (_) {
    // Malformed URL string
  }

  return FALLBACK_SUPABASE_URL;
}

/**
 * Sanitizes the Supabase anonymous/publishable key.
 */
export function sanitizeSupabaseKey(rawKey?: string | null): string {
  if (!rawKey || typeof rawKey !== 'string') {
    return FALLBACK_SUPABASE_ANON_KEY;
  }
  const trimmed = rawKey.trim();
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed === '""' ||
    trimmed === "''"
  ) {
    return FALLBACK_SUPABASE_ANON_KEY;
  }
  return trimmed;
}

const rawEnvUrl =
  typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_SUPABASE_URL as string | undefined)
    : undefined;

const rawEnvKey =
  typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
    : undefined;

export const supabaseUrl = sanitizeSupabaseUrl(rawEnvUrl);
export const supabaseAnonKey = sanitizeSupabaseKey(rawEnvKey);

function initSupabaseClient(): SupabaseClient {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.error('[Supabase] Initial createClient failed, using fallback:', err);
    return createClient(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
}

// Create Supabase client instance with persistent session storage
export const supabase: SupabaseClient = initSupabaseClient();

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
