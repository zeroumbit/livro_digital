import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ShieldCheck, 
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  ArrowRight
} from 'lucide-react';

// ============================================================================
// COMPONENTES UI (Variante "Premium Soft" - Reutilizados do Registo)
// ============================================================================

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={`text-[13px] font-bold text-slate-700 tracking-wide uppercase mb-1.5 block ${className}`} {...props} />
));
Label.displayName = "Label";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input 
    type={type} 
    ref={ref} 
    className={`flex h-12 w-full rounded-xl border border-transparent bg-slate-50/80 px-4 py-2 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} 
    {...props} 
  />
));
Input.displayName = "Input";

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' }>(({ className, variant = 'default', ...props }, ref) => {
  const baseStyle = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:pointer-events-none disabled:opacity-50 h-12 px-8 py-2";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-[1px]", 
    outline: "border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-900",
    ghost: "hover:bg-slate-100 text-slate-600" 
  };
  return <button ref={ref} className={`${baseStyle} ${variants[variant]} ${className}`} {...props} />;
});
Button.displayName = "Button";

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input type="checkbox" ref={ref} className={`peer h-5 w-5 shrink-0 rounded-md border-2 border-slate-300 bg-white transition-all checked:bg-indigo-600 checked:border-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${className}`} {...props} />
));
Checkbox.displayName = "Checkbox";

// ============================================================================
// SCHEMA DE VALIDAÇÃO (ZOD)
// ============================================================================

import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// ... (existing zod schema definition remains)
const loginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório.').email('Formato de e-mail inválido.'),
  password: z.string().min(1, 'A palavra-passe é obrigatória.'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setLoginError("Credenciais inválidas. Verifique o seu e-mail e palavra-passe.");
        setIsSubmitting(false);
        return;
      }

      // Redireciona de acordo com o perfil_acesso salvo em metadata
      const profileInfo = authData.user?.user_metadata?.perfil_acesso;

      if (profileInfo === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      console.error(err);
      setLoginError("Ocorreu um erro ao conectar ao servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center mt-2 text-[12px] font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded-md w-fit border border-rose-100 animate-in fade-in zoom-in duration-300">
        <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
        {error}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-0 sm:p-4 md:p-8 font-sans">
      <div className="flex flex-col lg:flex-row w-full max-w-[1000px] bg-white sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden lg:min-h-[650px]">
        
        {/* ================= LEFT SIDEBAR (Dark Premium) ================= */}
        <div className="w-full lg:w-[45%] bg-slate-950 p-12 text-white flex-col justify-between hidden lg:flex relative overflow-hidden">
          {/* Decoração de fundo sutil */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight leading-tight">Bem-vindo de volta.</h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-[280px]">
              Aceda ao seu painel de controlo para gerir a operação diária da Guarda Municipal.
            </p>
          </div>

          <div className="relative z-10">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/30">
                  <Lock className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Sistema Restrito</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Acesso monitorizado e auditado</p>
                </div>
              </div>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Esta plataforma é de uso exclusivo de agentes autorizados. Todo o acesso é registado para fins de auditoria de segurança.
              </p>
            </div>
          </div>
        </div>

        {/* ================= RIGHT CONTENT (Login Form) ================= */}
        <div className="w-full lg:w-[55%] p-8 sm:p-12 lg:px-20 lg:py-16 flex flex-col justify-center bg-white">
          
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="mb-10 text-center lg:text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 lg:hidden mx-auto">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Iniciar Sessão</h2>
              <p className="text-slate-500 text-base">Introduza as suas credenciais para aceder ao sistema.</p>
            </div>

            {/* Mensagem de Erro Global */}
            {loginError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 mr-3 shrink-0" />
                <p className="text-sm font-medium text-rose-700">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6 animate-in fade-in duration-500 delay-150">
                
                {/* E-mail */}
                <div>
                  <Label htmlFor="email">E-mail Institucional</Label>
                  <Input 
                    id="email" type="email" placeholder="nome.sobrenome@guarda.gov.br"
                    {...register('email')}
                    className={errors.email ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}
                  />
                  <ErrorMessage error={errors.email?.message} />
                </div>

                {/* Palavra-passe */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <Label htmlFor="password" className="mb-0">Palavra-passe</Label>
                    <a href="#recuperar" className="text-[13px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                      Esqueceu a palavra-passe?
                    </a>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                      {...register('password')}
                      className={`pr-12 ${errors.password ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}`}
                    />
                    <button 
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <ErrorMessage error={errors.password?.message} />
                </div>

                {/* Lembrar-me */}
                <div className="pt-1">
                  <label className="flex items-center space-x-3 group cursor-pointer w-fit">
                    <Checkbox id="rememberMe" {...register('rememberMe')} />
                    <span className="text-[14px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors select-none">
                      Lembrar-me neste dispositivo
                    </span>
                  </label>
                </div>

                {/* Botão Submeter */}
                <div className="pt-4">
                  <Button type="submit" disabled={isSubmitting} className="w-full text-base py-6 group">
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />A Autenticar...</>
                    ) : (
                      <>
                        Entrar no Sistema
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>

              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[14px] font-medium text-slate-500">
                A sua instituição ainda não tem conta?{' '}
                <a href="/registrar" className="text-indigo-600 hover:text-indigo-800 font-bold ml-1 transition-colors underline decoration-indigo-600/30 underline-offset-4">
                  Registe-se agora
                </a>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
