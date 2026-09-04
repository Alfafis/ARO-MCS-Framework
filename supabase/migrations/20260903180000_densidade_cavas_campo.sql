-- ============================================================================
-- 20260903180000_densidade_cavas_campo.sql
-- ============================================================================
-- Cavas gravava a densidade da rocha hardcoded na própria fórmula
-- ('Volume * 2.7', migration 20260903160000) enquanto Pilhas de Estéril
-- (migration seguinte, mesma sessão) usa campo "Densidade" próprio editável
-- — inconsistência entre as duas categorias do mesmo template, achada na
-- auditoria de hardcode. Fix: Cavas ganha o mesmo campo "Densidade" (2,7
-- t/m³, mesma constante da planilha "0. Síntese Por Setor"/K20), Tonelagem
-- passa a referenciar o campo em vez do literal. Valor de Tonelagem não
-- muda (315.600 × 2,7 = 852.120, idêntico ao anterior) — puro refactor,
-- sem efeito no custo de nenhum item.
insert into campos_operacionais_template (categoria_template_id, label, unidade, valor_referencia, ordem)
values ('68926503-3dbf-4168-bf2a-41921ce6cee9', 'Densidade', 't/m³', '2,7', 6);

update campos_operacionais_template
set formula = 'Volume * Densidade'
where id = 'a48d021e-05cf-4838-8351-0d37ac700488'; -- Tonelagem (Cavas)

-- Cross-check — fail-fast se o refactor mudar o valor de Tonelagem (não deveria).
do $$
declare
  v_tonelagem numeric;
begin
  select round(
    (select (replace(valor_referencia, '.', ''))::numeric
       from campos_operacionais_template
      where id = '4f6d1a98-d3fe-4706-bb6c-597c38814221') -- Volume (BR: "315.600" = 315600)
    * (select replace(valor_referencia, ',', '.')::numeric
         from campos_operacionais_template
        where categoria_template_id = '68926503-3dbf-4168-bf2a-41921ce6cee9' and label = 'Densidade'),
    0
  ) into v_tonelagem;

  if v_tonelagem <> 852120 then
    raise exception 'Refactor de densidade mudou o valor de Tonelagem: % (esperado 852120)', v_tonelagem;
  end if;
end $$;
