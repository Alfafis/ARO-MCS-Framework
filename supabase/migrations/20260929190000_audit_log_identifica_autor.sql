-- ============================================================================
-- 20260929190000_audit_log_identifica_autor.sql
-- ============================================================================
-- A tela de Auditoria mostrava "Usuário removido" em TODA linha, inclusive nas
-- de contas ativas. A trilha estava íntegra (1.007 de 1.296 linhas com
-- `usuario_id` gravado) — o problema era de identificação: `listar_audit_log`
-- devolvia só `perfis.nome`, que é opcional e estava NULL nos perfis reais, e
-- o frontend traduzia "sem nome" como "usuário removido".
--
-- Numa trilha de auditoria, afirmar que uma conta foi removida quando ela está
-- ativa é pior que não mostrar nome nenhum: convida a conclusão errada sobre
-- quem respondeu por uma alteração financeira.
--
-- A RPC passa a devolver também o e-mail (de auth.users) e um booleano dizendo
-- se o perfil ainda existe. Com isso o frontend distingue os três casos reais:
-- perfil com nome · perfil sem nome (cai no e-mail) · perfil inexistente
-- (aí sim "usuário removido"). Ler `auth.users` aqui é seguro: a função é
-- `security definer` e já barra quem não é consultor logo na primeira linha.
-- ============================================================================

create or replace function public.listar_audit_log(
  p_tabela text default null,
  p_operacao text default null,
  p_desde timestamptz default null,
  p_ate timestamptz default null,
  p_limit int default 50,
  p_offset int default 0
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_rows jsonb;
  v_total bigint;
begin
  if not public.is_consultor() then
    raise exception 'Acesso restrito a consultores.';
  end if;

  select coalesce(jsonb_agg(row_data), '[]'::jsonb), coalesce(max(total), 0)
  into v_rows, v_total
  from (
    select
      count(*) over() as total,
      jsonb_build_object(
        'id', a.id,
        'tabela', a.tabela,
        'operacao', a.operacao,
        'registro_id', a.registro_id,
        'usuario_id', a.usuario_id,
        'usuario_nome', p.nome,
        'usuario_email', u.email,
        -- Distingue "perfil existe mas está sem nome" de "perfil não existe
        -- mais". Sem isso as duas situações eram indistinguíveis no frontend.
        'usuario_existe', (p.id is not null),
        'criado_em', a.criado_em
      ) as row_data
    from public.audit_log a
    left join public.perfis p on p.id = a.usuario_id
    left join auth.users u on u.id = a.usuario_id
    where (p_tabela is null or a.tabela = p_tabela)
      and (p_operacao is null or a.operacao = p_operacao)
      and (p_desde is null or a.criado_em >= p_desde)
      and (p_ate is null or a.criado_em <= p_ate)
    order by a.criado_em desc
    limit p_limit offset p_offset
  ) sub;

  return jsonb_build_object('rows', v_rows, 'total', v_total);
end;
$function$;

revoke execute on function public.listar_audit_log(text, text, timestamptz, timestamptz, int, int) from public, anon;
grant  execute on function public.listar_audit_log(text, text, timestamptz, timestamptz, int, int) to authenticated;
