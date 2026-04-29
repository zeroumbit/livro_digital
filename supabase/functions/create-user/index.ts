import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configurações do Supabase não encontradas no ambiente.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await req.json().catch(() => ({}));
    const { email, password, user_metadata, id } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const instituicao_id = user_metadata?.instituicao_id;
    let instituicao_nome = 'Nossa Instituição';

    if (instituicao_id) {
      const { data: instData } = await supabase
        .from('instituicoes')
        .select('razao_social')
        .eq('id', instituicao_id)
        .single();
      if (instData) instituicao_nome = instData.razao_social;
    }

    const tempPassword = password || (Math.random().toString(36).slice(-8) + 'A1!');

    // Criar usuário no Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: user_metadata || {},
      id: id || undefined,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enviar E-mail via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');
    let emailSent = false;

    if (resendKey && data.user) {
      try {
        const cargo = user_metadata?.perfil_acesso || 'Membro';
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: 'GCM Digital <noreply@resend.dev>',
            to: email,
            subject: `Bem-vindo ao Livro Digital - ${instituicao_nome}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5;">Bem-vindo ao Livro Digital GCM</h2>
                <p>Olá, <strong>${user_metadata?.primeiro_nome || 'Novo Membro'}</strong>!</p>
                <p>Você foi cadastrado no sistema <strong>Livro Digital</strong> pela instituição <strong>${instituicao_nome}</strong> como <strong>${cargo}</strong>.</p>
                <p>Abaixo estão suas credenciais para o primeiro acesso:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>E-mail:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Senha:</strong> ${tempPassword}</p>
                </div>
                <p>Recomendamos que você altere sua senha após o primeiro acesso.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #64748b;">Este é um e-mail automático, por favor não responda.</p>
              </div>
            `,
          }),
        });
        emailSent = res.ok;
      } catch (emailErr) {
        console.error('Erro ao enviar e-mail:', emailErr);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: data.user,
      emailSent,
      tempPassword: password ? undefined : 'Senha enviada por e-mail'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

