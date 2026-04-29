# CHECKLIST FINAL - SISTEMA DE OCORRÊNCIAS ISOLADAS

## ✅ O QUE JÁ FOI FEITO (CÓDIGO)

### 1. Páginas Isoladas Criadas
- [x] `src/pages/dashboard/OcorrenciasPadraoPage.tsx` - Apenas ocorrências padrão
- [x] `src/pages/dashboard/EmbriaguezPage.tsx` - Apenas ocorrências de embriaguez
- [x] `src/pages/dashboard/MariaDaPenhaPage.tsx` - Apenas ocorrências Maria da Penha
- [x] `src/pages/dashboard/ChamadosOcorrenciasPage.tsx` - Apenas ocorrências de chamados

### 2. Rotas Atualizadas (`src/routes/index.tsx`)
- [x] `/ocorrencias` → OcorrenciasPadraoPage
- [x] `/ocorrencias/embriaguez` → EmbriaguezPage
- [x] `/ocorrencias/maria-da-penha` → MariaDaPenhaPage
- [x] `/ocorrencias/chamados` → ChamadosOcorrenciasPage
- [x] Rotas de edição isoladas por tipo (`/editar/ocorrencia/:tipo/:id`)

### 3. Backend Isolado (`src/hooks/useOccurrences.ts`)
- [x] Hook direciona para tabela correta baseado no parâmetro `categoria`
- [x] Sem consultas cruzadas entre tabelas

### 4. Edição Isolada (`src/pages/dashboard/EditOccurrencePage.tsx`)
- [x] Aceita prop `tipo` para buscar apenas na tabela correta
- [x] Não faz busca em múltiplas tabelas

### 5. Criação de Usuários Corrigida (`src/hooks/useUsuarios.ts`)
- [x] Atualizado para usar Edge Function `create-user`
- [x] Garante criação no Supabase Auth e na tabela `usuarios`

### 6. Edge Function para Criar Usuários
- [x] `supabase/functions/create-user/index.ts` criada

### 7. SQLs Locais Criados
- [x] `fix_usuario_especifico.sql` - Corrige usuário administrativo existente
- [x] `RLS_isolation_policies.sql` - Políticas RLS para isolamento
- [x] `isolation_policies.sql` - Políticas alternativas

---

## 🔧 O QUE VOCÊ PRECISA FAZER MANUALMENTE

### 1. CORRIGIR USUÁRIO ADMINISTRATIVO (ERRO 400 NO LOGIN)
Execute no **SQL Editor do Supabase**:
```sql
-- Arquivo: fix_usuario_especifico.sql
-- ID: c15b4f15-290c-4417-b2a4-2627a9aaa678
```
**Senha após execução:** `Temp@2024!`

### 2. APLICAR POLÍTICAS RLS (ISOLAMENTO NO BANCO)
Execute no **SQL Editor do Supabase**:
```sql
-- Arquivo: RLS_isolation_policies.sql
```
Isso garante que nem mesmo com SQL manual um usuário veja dados de outro tipo.

### 3. DEPLOY DA EDGE FUNCTION
No terminal, na pasta do projeto:
```bash
supabase functions deploy create-user --project-ref wpobqzflqblydkszajcn
```
Isso é necessário para que novos usuários sejam criados corretamente no Auth.

### 4. VERIFICAR VARIÁVEIS DE AMBIENTE
No arquivo `.env` ou nas configurações do Supabase, garantir que:
```
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```
A Edge Function precisa dessa chave.

---

## 🧪 TESTES RECOMENDADOS

1. Login com usuário administrativo (senha: `Temp@2024!`)
2. Criar ocorrência de cada tipo e verificar se aparece apenas na página correta
3. Editar ocorrência de cada tipo
4. Verificar se filtros e buscas funcionam apenas no tipo atual
5. Testar criação de novo usuário administrativo

---

## 📝 RESUMO DO ISOLAMENTO

| Tipo | Tabela | Página | Rota |
|------|--------|--------|------|
| Padrão | `ocorrencias` | OcorrenciasPadraoPage | `/ocorrencias` |
| Embriaguez | `embriaguez` | EmbriaguezPage | `/ocorrencias/embriaguez` |
| Maria da Penha | `maria_da_penha` | MariaDaPenhaPage | `/ocorrencias/maria-da-penha` |
| Chamados | `chamados_ocorrencias` | ChamadosOcorrenciasPage | `/ocorrencias/chamados` |

**Garantia:** Em hipótese alguma uma ocorrência de um tipo aparecerá na página de outro tipo, tanto no frontend quanto no backend (via RLS).
