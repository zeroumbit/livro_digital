import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';

// ============================================================================
// COMPONENTES UI (Variante "Premium Soft")
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

const SelectNative = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={`flex h-12 w-full appearance-none rounded-xl border border-transparent bg-slate-50/80 px-4 py-2 pr-10 text-sm text-slate-900 shadow-sm transition-all focus-visible:border-indigo-500 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
  </div>
));
SelectNative.displayName = "SelectNative";

// ============================================================================
// SCHEMAS DE VALIDAÇÃO (ZOD)
// ============================================================================

const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;

const step1Schema = z.object({
  primeiro_nome: z.string().min(2, 'O primeiro nome deve ter pelo menos 2 caracteres.'),
  sobrenome: z.string().min(2, 'O sobrenome deve ter pelo menos 2 caracteres.'),
  email: z.string().min(1, 'O e-mail é obrigatório.').email('Formato de e-mail inválido.'),
  password: z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .regex(passwordRegex, 'A senha deve conter pelo menos uma letra maiúscula.'),
  acceptTerms: z.boolean().refine((val) => val === true, 'Deve aceitar os Termos de Uso.'),
  acceptPrivacy: z.boolean().refine((val) => val === true, 'Deve aceitar a Política de Privacidade.'),
});

const step2Schema = z.object({
  razaoSocial: z.string().min(3, 'A razão social deve ter pelo menos 3 caracteres.').max(255, 'A razão social é muito longa.'),
  cnpj: z.string().min(18, 'O CNPJ deve estar completo.').regex(cnpjRegex, 'Formato de CNPJ inválido.'),
  telefone: z.string().optional(),
});

const step3Schema = z.object({
  cep: z.string().min(8, 'CEP inválido.').max(9, 'CEP inválido.'),
  logradouro: z.string().min(1, 'O logradouro é obrigatório.'),
  numero: z.string().min(1, 'O número é obrigatório.'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'O bairro é obrigatório.'),
  cidade: z.string().min(1, 'A cidade é obrigatória.'),
  estado: z.string().length(2, 'O estado deve ter 2 letras (Ex: CE).'),
});

const step4Schema = z.object({
  gestorNomeCompleto: z.string().min(3, 'O nome completo deve ter pelo menos 3 caracteres.'),
  gestorComoChamado: z.string().optional(),
  gestorTelefone: z.string().min(10, 'Telefone inválido.'),
  gestorEmail: z.string().min(1, 'O e-mail é obrigatório.').email('Formato de e-mail inválido.'),
});

const registrationSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatCNPJ, formatPhone, formatCEP, isValidCNPJ } from '@/lib/validations';
import { fetchCEP, fetchCNPJ } from '@/lib/api-services';
import { toast } from 'sonner';

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isValidatingDoc, setIsValidatingDoc] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const navigate = useNavigate();

  const stepFields: Record<number, (keyof RegistrationFormData)[]> = {
    1: ['primeiro_nome', 'sobrenome', 'email', 'password', 'acceptTerms', 'acceptPrivacy'],
    2: ['razaoSocial', 'cnpj', 'telefone'],
    3: ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado'],
    4: ['gestorNomeCompleto', 'gestorComoChamado', 'gestorTelefone', 'gestorEmail'],
  };

  const { register, trigger, getValues, setValue, watch, setError, clearErrors, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password', '');
  const cepValue = watch('cep', '');
  const cnpjValue = watch('cnpj', '');

  // Auto-fill CNPJ logic
  React.useEffect(() => {
    const handleCnpj = async () => {
      const cleanCnpj = cnpjValue?.replace(/\D/g, '');
      if (cleanCnpj && cleanCnpj.length === 14 && !isValidatingDoc) {
        setIsValidatingDoc(true);
        const data = await fetchCNPJ(cleanCnpj);
        if (data) {
          setValue('razaoSocial', data.razao_social, { shouldValidate: true });
          // If we want to pre-fill address too
          setValue('cep', data.cep, { shouldValidate: true });
          setValue('logradouro', data.rua, { shouldValidate: true });
          setValue('bairro', data.bairro, { shouldValidate: true });
          setValue('cidade', data.cidade, { shouldValidate: true });
          setValue('estado', data.estado, { shouldValidate: true });
          setValue('numero', data.numero, { shouldValidate: true });
          toast.success('Dados da empresa carregados automaticamente!');
        }
        setIsValidatingDoc(false);
      }
    };
    handleCnpj();
  }, [cnpjValue]);

  // Auto-fill CEP logic
  React.useEffect(() => {
     const handleCep = async () => {
         const cepClean = cepValue?.replace(/\D/g, '');
         if (cepClean && cepClean.length === 8 && !isFetchingCep) {
             setIsFetchingCep(true);
             const address = await fetchCEP(cepClean);
             if (address) {
                 setValue('logradouro', address.rua, { shouldValidate: true });
                 setValue('bairro', address.bairro, { shouldValidate: true });
                 setValue('cidade', address.cidade, { shouldValidate: true });
                 setValue('estado', address.estado, { shouldValidate: true });
                 document.getElementById('numero')?.focus();
             } else {
                 setError('cep', { type: 'manual', message: 'CEP não encontrado.' });
             }
             setIsFetchingCep(false);
         }
     }
     handleCep();
  }, [cepValue]);

  const handleNextStep = async () => {
    const fieldsToValidate = stepFields[step];
    let isStepValid = await trigger(fieldsToValidate);
    
    // Validação profunda de CNPJ
    if (step === 2 && isStepValid) {
        const cnpjStr = getValues('cnpj')?.replace(/\D/g, '');
        if (!isValidCNPJ(cnpjStr)) {
            setError('cnpj', { type: 'manual', message: 'CNPJ inválido (Dígito verificador incorreto).' });
            isStepValid = false;
        }
    }

    if (isStepValid) setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => setStep((prev) => prev - 1);

  const onSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const data = getValues();
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            perfil_acesso: 'gestor',
            primeiro_nome: data.primeiro_nome,
            sobrenome: data.sobrenome,
            funcao_operacional: 'SECRETÁRIO',
            razaoSocial: data.razaoSocial,
            cnpj: data.cnpj,
            telefone: data.telefone,
            endereco: {
              cep: data.cep,
              logradouro: data.logradouro,
              numero: data.numero,
              complemento: data.complemento,
              bairro: data.bairro,
              cidade: data.cidade,
              estado: data.estado,
            }
          }
        }
      });

      if (error) {
        setGlobalError(error.message);
        setIsSubmitting(false);
        return;
      }
      
      setIsSuccess(true);
      setIsSubmitting(false);

    } catch (err) {
      console.error('Erro de registo:', err);
      setGlobalError('Não foi possível finalizar o registo.');
      setIsSubmitting(false);
    }
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    value = formatCNPJ(value);
    setValue('cnpj', value, { shouldValidate: true });
  };

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center mt-2 text-[12px] font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded-md w-fit border border-rose-100">
        <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
        {error}
      </div>
    );
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-[2rem] text-center py-16 px-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h3 className="font-extrabold tracking-tight text-3xl mb-3 text-slate-900">Tudo Certo!</h3>
          <p className="text-slate-500 mb-10 text-lg leading-relaxed">
            A instituição foi registada com sucesso. O seu perfil de Gestor será avaliado pela equipa de administração.
          </p>
          <Button onClick={() => window.location.hash = '#login'} className="w-full text-base py-6">
            Voltar para o Login
          </Button>
        </div>
      </div>
    );
  }

  const stepTitles: Record<number, { title: string, subtitle: string }> = {
    1: { title: "Dados de Acesso", subtitle: "Crie as credenciais para o perfil de Gestor." },
    2: { title: "Identificação", subtitle: "Informações oficiais da Guarda Municipal." },
    3: { title: "Localização", subtitle: "Endereço da sede ou base operacional." },
    4: { title: "Dados do Gestor", subtitle: "Informações do Secretário responsável." }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-0 sm:p-4 md:p-8 font-sans">
      <div className="flex flex-col lg:flex-row w-full max-w-[1080px] bg-white sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden lg:min-h-[720px]">
        
        {/* ================= LEFT SIDEBAR (Dark Premium) ================= */}
        <div className="w-full lg:w-[38%] bg-slate-950 p-12 text-white flex-col hidden lg:flex relative overflow-hidden">
          {/* Decoração de fundo sutil */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 tracking-tight leading-tight">Gestão Inteligente<br/>para a sua Guarda.</h1>
            <p className="text-slate-400 text-base mb-14">
              Configure a sua instituição e tenha controle total sobre escalas, viaturas e ocorrências.
            </p>
          </div>

            <div className="flex-1 space-y-0 mt-4 relative z-10 pl-2">
             <TimelineStep step={1} currentStep={step} title="Credenciais" isLast={false} />
             <TimelineStep step={2} currentStep={step} title="Instituição" isLast={false} />
             <TimelineStep step={3} currentStep={step} title="Endereço Sede" isLast={false} />
             <TimelineStep step={4} currentStep={step} title="Dados do Gestor" isLast={false} />
             <TimelineStep step={5} currentStep={step} title="Revisão" isLast={false} isGhost />
             <TimelineStep step={6} currentStep={step} title="Conclusão" isLast={true} isGhost />
           </div>
        </div>

        {/* ================= RIGHT CONTENT ================= */}
        <div className="w-full lg:w-[62%] p-8 sm:p-12 lg:px-20 lg:py-16 flex flex-col bg-white">
          
          <div className="flex-1">
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold mb-4 uppercase tracking-wider">
                Passo {step} de 3
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{stepTitles[step].title}</h2>
              <p className="text-slate-500 text-lg">{stepTitles[step].subtitle}</p>
            </div>

            {globalError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 mr-3 shrink-0" />
                <p className="text-sm font-medium text-rose-700">{globalError}</p>
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              
              {/* === ETAPA 1 === */}
              {step === 1 && (
                <div className="space-y-7 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="primeiro_nome">Primeiro Nome *</Label>
                      <Input 
                        id="primeiro_nome" placeholder="Ex: João"
                        {...register('primeiro_nome')}
                        className={errors.primeiro_nome ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}
                      />
                      <ErrorMessage error={errors.primeiro_nome?.message} />
                    </div>
                    <div>
                      <Label htmlFor="sobrenome">Sobrenome *</Label>
                      <Input 
                        id="sobrenome" placeholder="Ex: Silva"
                        {...register('sobrenome')}
                        className={errors.sobrenome ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}
                      />
                      <ErrorMessage error={errors.sobrenome?.message} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail Institucional *</Label>
                    <Input 
                      id="email" type="email" placeholder="gestor@guarda.gov.br"
                      {...register('email')}
                      className={errors.email ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}
                    />
                    <ErrorMessage error={errors.email?.message} />
                  </div>

                  <div>
                    <Label htmlFor="password">Senha de Acesso *</Label>
                    <div className="relative">
                      <Input 
                        id="password" type={showPassword ? "text" : "password"} placeholder="Crie uma senha forte"
                        {...register('password')}
                        className={`pr-12 ${errors.password ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}`}
                      />
                      <button 
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <ErrorMessage error={errors.password?.message} />
                  </div>

                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                    <ul className="space-y-2.5 text-[13px] font-medium text-slate-600">
                      <li className="flex items-center">
                        <Check className={`w-4 h-4 mr-2.5 transition-colors ${passwordValue.length >= 8 ? 'text-emerald-500' : 'text-slate-300'}`} />
                        Pelo menos 8 caracteres de comprimento
                      </li>
                      <li className="flex items-center">
                        <Check className={`w-4 h-4 mr-2.5 transition-colors ${/[A-Z]/.test(passwordValue) ? 'text-emerald-500' : 'text-slate-300'}`} />
                        Pelo menos uma letra maiúscula
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 space-y-4">
                    <label className="flex items-start space-x-3 group cursor-pointer">
                      <Checkbox id="terms" {...register('acceptTerms')} className="mt-0.5" />
                      <span className="text-[14px] font-medium text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                        Li e concordo com os <a href="#" className="text-indigo-600 hover:text-indigo-700 underline decoration-indigo-600/30 underline-offset-4">Termos de Uso</a> da plataforma.
                      </span>
                    </label>
                    <ErrorMessage error={errors.acceptTerms?.message} />

                    <label className="flex items-start space-x-3 group cursor-pointer">
                      <Checkbox id="privacy" {...register('acceptPrivacy')} className="mt-0.5" />
                      <span className="text-[14px] font-medium text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                        Li e concordo com a <a href="#" className="text-indigo-600 hover:text-indigo-700 underline decoration-indigo-600/30 underline-offset-4">Política de Privacidade</a>.
                      </span>
                    </label>
                    <ErrorMessage error={errors.acceptPrivacy?.message} />
                  </div>
                </div>
              )}

              {/* === ETAPA 2 === */}
              {step === 2 && (
                <div className="space-y-7 animate-in fade-in duration-500">
                  <div>
                    <Label htmlFor="razaoSocial">Razão Social Oficial *</Label>
                    <Input 
                      id="razaoSocial" placeholder="Ex: Prefeitura Municipal de..."
                      {...register('razaoSocial')}
                      className={errors.razaoSocial ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}
                    />
                    <ErrorMessage error={errors.razaoSocial?.message} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="cnpj">CNPJ Institucional *</Label>
                      <Input 
                        id="cnpj" placeholder="00.000.000/0000-00"
                        {...register('cnpj')} 
                        onChange={(e) => {
                          e.target.value = formatCNPJ(e.target.value);
                          register('cnpj').onChange(e);
                        }}
                        className={errors.cnpj ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}
                      />
                      <ErrorMessage error={errors.cnpj?.message} />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone <span className="text-slate-400 font-normal lowercase">(Opcional)</span></Label>
                      <Input 
                        id="telefone" placeholder="(00) 0000-0000" 
                        {...register('telefone')}
                        onChange={(e) => {
                          e.target.value = formatPhone(e.target.value);
                          register('telefone').onChange(e);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

               {/* === ETAPA 3 === */}
               {step === 3 && (
                 <div className="space-y-7 animate-in fade-in duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                     <div className="md:col-span-1">
                       <Label htmlFor="cep">CEP *</Label>
                       <div className="relative">
                           <Input 
                             id="cep" placeholder="00000-000"
                             {...register('cep')} 
                             onChange={(e) => {
                                 e.target.value = formatCEP(e.target.value);
                                 register('cep').onChange(e);
                             }}
                             className={errors.cep ? 'border-rose-300 bg-rose-50/50 pr-10' : 'pr-10'}
                           />
                           {isFetchingCep && (
                               <Loader2 className="w-4 h-4 text-indigo-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                           )}
                       </div>
                       <ErrorMessage error={errors.cep?.message} />
                     </div>
                     <div className="md:col-span-2">
                        <Label htmlFor="logradouro">Rua / Logradouro</Label>
                        <Input id="logradouro" {...register('logradouro')} className={errors.logradouro ? "border-rose-500 focus-visible:ring-rose-500/20" : ""} />
                        <ErrorMessage error={errors.logradouro?.message} />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                     <div className="md:col-span-1">
                       <Label htmlFor="numero">Número *</Label>
                       <Input 
                         id="numero" {...register('numero')}
                         className={errors.numero ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}
                       />
                       <ErrorMessage error={errors.numero?.message} />
                     </div>
                     <div className="md:col-span-2">
                       <Label htmlFor="complemento">Complemento</Label>
                       <Input id="complemento" {...register('complemento')} placeholder="Bloco, Andar, Sala..." />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 gap-5">
                     <div>
                       <Label htmlFor="bairro">Bairro *</Label>
                       <Input id="bairro" {...register('bairro')} className={errors.bairro ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''} />
                       <ErrorMessage error={errors.bairro?.message} />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                     <div className="md:col-span-2">
                       <Label htmlFor="cidade">Cidade *</Label>
                       <SelectNative id="cidade" {...register('cidade')} className={errors.cidade ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}>
                         <option value="">Selecione a cidade</option>
                         {watch('cidade') && <option value={watch('cidade')}>{watch('cidade')}</option>}
                         <option value="Fortaleza">Fortaleza</option>
                         <option value="Caucaia">Caucaia</option>
                         <option value="Canindé">Canindé</option>
                         {/* As outras opções seriam carregadas pela sua API de Municípios */}
                       </SelectNative>
                       <ErrorMessage error={errors.cidade?.message} />
                     </div>
                     <div className="md:col-span-1">
                       <Label htmlFor="estado">Estado *</Label>
                       <SelectNative id="estado" {...register('estado')} className={errors.estado ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}>
                         <option value="">UF</option>
                         {watch('estado') && <option value={watch('estado')}>{watch('estado')}</option>}
                         <option value="CE">CE</option>
                         <option value="SP">SP</option>
                         <option value="RJ">RJ</option>
                         <option value="MG">MG</option>
                       </SelectNative>
                       <ErrorMessage error={errors.estado?.message} />
                     </div>
                   </div>
                 </div>
               )}

               {/* === ETAPA 4: DADOS DO GESTOR (SECRETÁRIO) === */}
               {step === 4 && (
                 <div className="space-y-7 animate-in fade-in duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div className="md:col-span-2">
                       <Label htmlFor="gestorNomeCompleto">Nome Completo do Secretário *</Label>
                       <Input 
                         id="gestorNomeCompleto" placeholder="Ex: João Silva"
                         {...register('gestorNomeCompleto')}
                         className={errors.gestorNomeCompleto ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}
                       />
                       <ErrorMessage error={errors.gestorNomeCompleto?.message} />
                     </div>
                     <div>
                       <Label htmlFor="gestorComoChamado">Como é chamado <span className="text-slate-400 font-normal lowercase">(Opcional)</span></Label>
                       <Input 
                         id="gestorComoChamado" placeholder="Ex: João"
                         {...register('gestorComoChamado')}
                       />
                     </div>
                     <div>
                       <Label htmlFor="gestorTelefone">Telefone/WhatsApp *</Label>
                       <Input 
                         id="gestorTelefone" placeholder="(00) 00000-0000"
                         {...register('gestorTelefone')}
                         onChange={(e) => {
                           e.target.value = formatPhone(e.target.value);
                           register('gestorTelefone').onChange(e);
                         }}
                         className={errors.gestorTelefone ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}
                       />
                       <ErrorMessage error={errors.gestorTelefone?.message} />
                     </div>
                     <div className="md:col-span-2">
                       <Label htmlFor="gestorEmail">E-mail Institucional *</Label>
                       <Input 
                         id="gestorEmail" type="email" placeholder="secretario@prefeitura.gov.br"
                         {...register('gestorEmail')}
                         className={errors.gestorEmail ? 'border-rose-300 bg-rose-50/50 focus-visible:ring-rose-500/20' : ''}
                       />
                       <ErrorMessage error={errors.gestorEmail?.message} />
                     </div>
                   </div>
                 </div>
               )}
            </form>
          </div>

          {/* ================= NAVEGAÇÃO E RODAPÉ ================= */}
          <div className="mt-12 pt-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevStep}
              className={step === 1 ? 'opacity-0 pointer-events-none' : 'px-2'} 
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {step < 3 ? (
              <Button onClick={handleNextStep}>
                Próximo Passo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />A Processar...</>
                ) : (
                  'Concluir Registo'
                )}
              </Button>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[13px] font-medium text-slate-500">
            <p>Já possui uma conta? <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-bold ml-1">Fazer Login</a></p>
            <p className="mt-2 sm:mt-0 text-slate-400">© 2026 Livro Digital</p>
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE DE TIMELINE VERTICAL (Design Conectado)
// ============================================================================

function TimelineStep({ step, currentStep, title, isLast, isGhost = false }: { step: number, currentStep: number, title: string, isLast: boolean, isGhost?: boolean }) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;
  
  if (isGhost) {
    return (
      <div className="flex flex-col opacity-30">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-800 bg-slate-900 text-slate-600 font-bold text-xs z-10">
            {step}
          </div>
          <span className="text-sm font-semibold tracking-wide text-slate-500">{title}</span>
        </div>
        {!isLast && <div className="w-0.5 h-10 bg-slate-800 ml-[15px] my-1"></div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-4">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all duration-500 ${
            isActive 
              ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/30' 
              : isCompleted
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 border-2 border-slate-700'
          }`}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : step}
        </div>
        <span className={`text-sm font-semibold tracking-wide transition-colors duration-300 ${isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
          {title}
        </span>
      </div>
      {!isLast && (
        <div className={`w-0.5 h-10 ml-[15px] my-1 transition-colors duration-500 ${isCompleted ? 'bg-emerald-500/50' : 'bg-slate-800'}`}></div>
      )}
    </div>
  );
}
