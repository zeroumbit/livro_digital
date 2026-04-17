-- Garante que os planos existam antes do cadastro de novas instituições
INSERT INTO public.planos (nome, valor_mensal, limite_usuarios, status) 
VALUES 
    ('Básico', 0, 10, 'ativo'), 
    ('Profissional', 499.00, 50, 'ativo'), 
    ('Enterprise', 1200.00, 1000, 'ativo')
ON CONFLICT (nome) DO UPDATE 
SET status = 'ativo', valor_mensal = EXCLUDED.valor_mensal;
