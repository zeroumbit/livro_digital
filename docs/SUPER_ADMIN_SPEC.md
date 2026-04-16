# Documento de Especificação e Regras de Negócio - Perfil: SUPER ADMIN

## 1. Escopo de Acesso e Isolamento de Plataforma (Tenant Blindness)
- **Gestão Exclusiva do SaaS**: Controle total sobre planos, faturamento, aprovações e configurações globais.
- **Isolamento de Dados**: NÃO possui acesso a dados operacionais (Ocorrências, Chamados, Viaturas, etc). Bloqueado via RLS.
- **Ambiente Visual Isolado**: Identidade visual distinta (Dark/Azul) e menus exclusivos.

## 2. Gestão de Tenants (Instituições)
- **Aprovação de Cadastro**: Analisa e aprova novas Guardas (ativa status e registra `data_ativacao`).
- **Suspensão de Tenants**: Pode suspender instituições com motivo obrigatório. Bloqueia login de todos os usuários daquela instituição.
- **Monitorização Geral**: Métricas globais (volumes, contagem de usuários) sem acesso ao conteúdo dos documentos.

## 3. Gestão de Faturamento e Planos SaaS
- **Criação de Planos**: Define nome, descrição, preço, limite de usuários e módulos ativos.
- **Gestão de Assinaturas**: Acompanha status de pagamento (Ativa, Atrasada, Trial, etc).

## 4. Manutenção, Suporte e Auditoria Global
- **Tickets de Suporte**: Responde aos tickets abertos pelos Gestores.
- **Configurações Globais**: Altera variáveis como dias de Trial ou ativa Modo Manutenção Global.
- **Auditoria do SaaS**: Registro imutável de todas as ações administrativas tomadas à nível de plataforma.

## 5. Restrições e Proibições (Irrevogáveis)
- **Operação Diária**: Não pode ver nem gerir Ocorrências, Chamados, KM Diário ou Vistorias.
- **Gestão de Tropa**: Não pode gerir usuários comuns das instituições.
- **Escalas e Equipes**: Não interfere na organização operacional interna.
- **Configuração Local**: Não altera nomes de cargos ou territórios municipais.

## Resumo
O Super Admin gere o "prédio" (SaaS) e as "chaves da porta principal," mas nunca entra nos "apartamentos" (Tenants) nem vê a "mobília" (Dados Operacionais).
