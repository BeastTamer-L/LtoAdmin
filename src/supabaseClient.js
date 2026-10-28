import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing! Check your .env file.')
}

// Its own storage key (LTO admin): the other CAMOTE sites use the same Supabase project and may run on the same
// localhost address; with the default key one site's login replaced (and signed out) the other's.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storageKey: 'camote-lto-admin-auth' },
})