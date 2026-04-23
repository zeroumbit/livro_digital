-- Migration: Criação do Bucket de Armazenamento para Ocorrências
-- Garante que o bucket 'ocorrencias' exista e tenha as políticas de acesso corretas.

-- 1. Criar o bucket se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('ocorrencias', 'ocorrencias', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Acesso ao Bucket
-- Permitir que qualquer usuário autenticado faça upload
DROP POLICY IF EXISTS "Permitir Upload Autenticado" ON storage.objects;
CREATE POLICY "Permitir Upload Autenticado" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'ocorrencias' AND 
        auth.role() = 'authenticated'
    );

-- Permitir que qualquer pessoa visualize as fotos (público)
DROP POLICY IF EXISTS "Permitir Visualização Pública" ON storage.objects;
CREATE POLICY "Permitir Visualização Pública" ON storage.objects
    FOR SELECT USING (bucket_id = 'ocorrencias');

-- Permitir que o criador delete suas próprias fotos
DROP POLICY IF EXISTS "Permitir Deleção pelo Dono" ON storage.objects;
CREATE POLICY "Permitir Deleção pelo Dono" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'ocorrencias' AND 
        (auth.uid()::text = (storage.foldername(name))[1])
    );
