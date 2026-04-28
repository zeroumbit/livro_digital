import { supabase } from './src/lib/supabase';

async function insertPatenteAdministrativo() {
  try {
    // Buscar todas as instituições
    const { data: instituicoes, error: instError } = await supabase
      .from('instituicoes')
      .select('id, razao_social');

    if (instError) {
      console.error('Erro ao buscar instituições:', instError);
      return;
    }

    console.log(`Encontradas ${instituicoes.length} instituições`);

    // Para cada instituição, verificar se já existe a patente e inserir se não existir
    for (const inst of instituicoes) {
      const { data: existing, error: checkError } = await supabase
        .from('patentes')
        .select('id')
        .eq('instituicao_id', inst.id)
        .eq('nome', 'Administrativo')
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error(`Erro ao verificar patente para ${inst.razao_social}:`, checkError);
        continue;
      }

      if (existing) {
        console.log(`Patente "Administrativo" já existe para ${inst.razao_social}`);
        continue;
      }

      // Inserir a nova patente
      const { data: inserted, error: insertError } = await supabase
        .from('patentes')
        .insert([{
          instituicao_id: inst.id,
          nome: 'Administrativo',
          ordem: 100,
          ativo: true
        }])
        .select()
        .single();

      if (insertError) {
        console.error(`Erro ao inserir patente para ${inst.razao_social}:`, insertError);
      } else {
        console.log(`Patente "Administrativo" inserida com sucesso para ${inst.razao_social}`);
      }
    }

    console.log('Processo concluído!');
  } catch (error) {
    console.error('Erro inesperado:', error);
  }
}

insertPatenteAdministrativo();
