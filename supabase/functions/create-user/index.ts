import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { email, password, user_metadata, id } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Criar usuário no Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: password || Math.random().toString(36).slice(-8) + 'A1!',
      email_confirm: true,
      user_metadata: user_metadata || {},
      id: id || undefined,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: data.user,
      tempPassword: password ? undefined : 'Verifique a senha temporária gerada'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
