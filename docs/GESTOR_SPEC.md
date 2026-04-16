# Documento de Especificação e Regras de Negócio - Perfil: GESTOR

## 1. Escopo de Acesso e Multi-Tenancy (Tenant Isolation)
- **Poder Absoluto Local**: O Gestor possui 100% das permissões administrativas dentro da sua própria instituição (Tenant).
- **Isolamento Rigoroso**: O Gestor não tem qualquer acesso a dados de outras instituições. Garantido via Supabase RLS.
- **Subordinação ao SaaS**: O Gestor não gere o seu próprio plano de assinatura ou limites técnicos; isso cabe ao `super_admin`.

## 2. Gestão de Utilizadores e Hierarquia
- **Criação Segura (Edge Function)**: Novos usuários via Edge Function (Service Role) para isolamento e segurança.
- **Gestão de Papéis (Roles)**: Define `perfil_acesso` e `funcao_operacional`.
- **Personalização de Nomenclaturas**: Pode renomear cargos/patentes para a realidade local.
- **Gestão de Parceiros**: Ativa parceiros padrão ou cadastra novos (PM, SAMU, etc).

## 3. Onboarding e Configurações Iniciais (Setup Wizard)
1. **Zonas e Territórios**: Bairros, distritos, setores.
2. **Recursos e Veículos**: Frota e equipamentos.
3. **Equipe**: Cadastro e convite de membros.
4. **Unidades de Serviço**: Agrupamentos de usuários.
5. **Escalas de Serviço**: Lógica de turnos e regimes.

## 4. Permissões de Visualização e Exportação
- **Relatórios**: PDF, Excel, CSV de Ocorrências, Vistorias, Chamados, Escalas.
- **Dashboard de Insumos**: Visão financeira e de consumo (combustível/manutenção).

## 5. Configurações Exclusivas e Auditoria
- **Auditoria Local**: Logs de atividades internos (rastreabilidade).
- **Visibilidade de Módulos**: Ativa/Desativa funcionalidades conforme necessidade local.
- **Perfil da Instituição**: Logo, identidade visual, dados cadastrais.

## 6. Restrições do Gestor (Imutabilidade e Segurança)
- **Imutabilidade**: Não edita ocorrências "Finalizadas".
- **Janela de Anotações**: Limite de 5 minutos para edição/exclusão de anotações.
- **Rate Limits**: Proteção contra sobrecarga de criação de registros.
