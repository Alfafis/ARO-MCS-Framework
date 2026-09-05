-- ============================================================================
-- 20260904180000_atualizar_meu_tema_rpc.sql
-- ============================================================================
-- Fix: `perfis.tema` (20260904170000_perfis_tema.sql) nasceu sem RPC de
-- escrita nem policy de UPDATE — `perfis` só tem `perfis_select_own` (SELECT)
-- desde o schema inicial (20260821165630_initial_schema.sql:179-181). O
-- frontend (`TemaContext.tsx`) chamava `.from('perfis').update({tema})`
-- direto, quebrando o padrão RPC-first já estabelecido pra este mesmo perfil
-- (`atualizar_meu_perfil`/`atualizar_foto_perfil`, ver
-- 20260821215356_perfil_consultor.sql) — e caindo no default-deny do RLS
-- sem policy: PATCH retorna 204 (sucesso aparente), zero linha afetada, sem
-- erro nenhum. Mesmo mecanismo já documentado na ADR de audit trail
-- ("data:[] sem error é RLS filtrando zero linhas, não sucesso vazio").
--
-- Efeito prático: a preferência de tema nunca persistia no banco — só vivia
-- em localStorage. Toda vez que `onAuthStateChange` refirava (login, token
-- refresh periódico, volta de foco de aba), o fetch de `perfis.tema` em
-- `TemaContext.tsx` reaplicava o valor travado no default ('light'),
-- sobrescrevendo o que o consultor tinha acabado de escolher. Isso bate com
-- o relato "às vezes, de uma tela pra outra, perde o tema escolhido" — não é
-- race de navegação, é escrita que nunca chegou a acontecer.
-- ============================================================================

create or replace function public.atualizar_meu_tema(p_tema text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if auth.uid() is null then
    raise exception 'Sem permissão';
  end if;

  if p_tema not in ('light', 'dark') then
    raise exception 'Tema inválido';
  end if;

  update public.perfis set tema = p_tema where id = auth.uid();
end;
$function$;

revoke execute on function public.atualizar_meu_tema(text) from public, anon;
grant execute on function public.atualizar_meu_tema(text) to authenticated;
