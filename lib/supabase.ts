import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// Client-side Supabase client.
// Realtime is disabled if keys are placeholders to prevent WebSocket crashes on mobile.
const isConfigured =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    // Only enable Realtime if env keys are actually set — prevents WebSocket
    // connection errors on mobile when the app is not yet configured.
    params: isConfigured ? {} : { eventsPerSecond: 0 },
  },
  global: {
    fetch: (url, options) => {
      // Add a timeout to prevent hanging requests on slow mobile networks
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      if (options?.signal) {
        options.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }

      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timeout));
    },
  },
});

// Server-side Supabase admin client using Service Role key for elevated operations
export const getSupabaseAdmin = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined. Admin queries will fallback to anon key.');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
};
