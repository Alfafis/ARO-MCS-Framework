-- ============================================================================
-- 20260903160000_formula_template_cavas.sql
-- ============================================================================
-- Popula fórmulas reais do template NX Gold (fechamento-mina) pra categoria
-- Cavas — única com verificação ponta a ponta contra a aba "2. Cavas" da
-- planilha de referência (Perímetro em km na planilha, formula precisa
-- converter pra metro: 7,89 km × 1000 = 7890 m, batendo com Volume=315.600
-- e Tonelagem=852.120 já seedados).
--
-- Escopo deliberadamente restrito a Cavas nesta migration — Pilhas/Barragem/
-- Planta Industrial/Áreas de Apoio têm formas de fórmula genuinamente
-- diferentes (Pilhas referencia campo "Drenagem" que não existe no banco e
-- tem inconsistência L15/M15 na própria planilha entre dois sub-blocos;
-- Barragem não tem Volume por Perímetro×Largura×Altura, é espessura×área
-- específica por item; Planta/Áreas de Apoio não têm Volume/Tonelagem) —
-- forçar fórmula onde a fonte é ambígua é pior que deixar sem, mesma
-- doutrina já registrada no spec (2026-09-03-timing-formula-...-design.md).
--
-- Só 3 dos 11 itens de Cavas derivam quantidade de campo operacional na
-- planilha original (confirmado lendo as fórmulas da célula D, não só o
-- valor): Perfuração/Desmontagem usam Tonelagem; Construção de proteção usa
-- Perímetro. Os demais (Drenagem, Revegetação) têm quantidade LITERAL na
-- planilha original (não fórmula), mantidos como itens estáticos.
--
-- custo_unitario_min/max = custo_min/max ATUAL (já rescalado pela migration
-- 20260829130000_reseed_planilha_nx_gold, que ajustou proporcionalmente pra
-- bater com Tabela 1) dividido pela quantidade real — não o preço unitário
-- original da planilha (que não bate mais com os totais rescalados).
-- ============================================================================

-- Volume e Tonelagem viram campos derivados (eram estáticos)
update campos_operacionais_template
set formula = 'Perímetro * 1000 * Largura Berma * Altura Bancada'
where id = '4f6d1a98-d3fe-4706-bb6c-597c38814221'; -- Volume (Cavas)

update campos_operacionais_template
set formula = 'Volume * 2.7'
where id = 'a48d021e-05cf-4838-8351-0d37ac700488'; -- Tonelagem (Cavas)

-- Perfuração e Desmontagem — quantidade = Tonelagem
update itens_template
set custo_unitario_min = round(custo_min / 852120, 6),
    custo_unitario_max = round(custo_max / 852120, 6),
    formula_quantidade = 'Tonelagem'
where id in (
  '0831ef5c-3800-470f-9128-be386f00eeeb', -- [Retaludamento] Perfuração
  '4c470007-dc34-43a1-98d8-700729ba1006'  -- [Retaludamento] Desmontagem
);

-- Construção de proteção — quantidade = Perímetro (km→m)
update itens_template
set custo_unitario_min = round(custo_min / 7890, 6),
    custo_unitario_max = round(custo_max / 7890, 6),
    formula_quantidade = 'Perímetro * 1000'
where id = 'bef6ff76-dd13-4c13-b1ad-d966a21a275f'; -- [Retaludamento] Construção de proteção para segurança

-- Cross-check — fail-fast se quantidade × custo_unitario não reproduzir o
-- custo_min/max original dentro de 0,01% (tolerância relativa, não R$ fixo —
-- custo_unitario_min/max é numeric(14,4); com quantidade grande (852.120 t),
-- o próprio arredondamento da COLUNA já impõe até ~R$42 de erro possível,
-- então tolerância fixa de centavos rejeitaria toda linha de Tonelagem).
do $$
declare
  rec record;
begin
  for rec in
    select it.id, it.nome, it.custo_min, it.custo_max, it.custo_unitario_min, it.custo_unitario_max,
           case
             when it.formula_quantidade = 'Tonelagem' then 852120
             when it.formula_quantidade = 'Perímetro * 1000' then 7890
           end as quantidade
      from itens_template it
      join categorias_template ct on ct.id = it.categoria_template_id
     where ct.id = '68926503-3dbf-4168-bf2a-41921ce6cee9' -- Cavas (fechamento-mina)
       and it.formula_quantidade is not null
  loop
    if abs(rec.quantidade * rec.custo_unitario_min - rec.custo_min) > greatest(1, rec.custo_min * 0.0001)
       or abs(rec.quantidade * rec.custo_unitario_max - rec.custo_max) > greatest(1, rec.custo_max * 0.0001) then
      raise exception 'Fórmula de % não reproduz custo_min/max original (min: % vs %, max: % vs %)',
        rec.nome, rec.quantidade * rec.custo_unitario_min, rec.custo_min,
        rec.quantidade * rec.custo_unitario_max, rec.custo_max;
    end if;
  end loop;
end $$;
