-- ============================================================================
-- 20260903170000_formula_template_pilhas_planta_areas.sql
-- ============================================================================
-- Estende o motor de fórmula (20260903150000/160000) pra Pilhas de Estéril,
-- Planta Industrial e Áreas de Apoio — reavaliação item a item contra a aba
-- fonte da planilha NX Gold mostrou que "categoria inteira ambígua" (decisão
-- original do ADR de 2026-09-03) era grosseiro demais: a ambiguidade é POR
-- ITEM, não por categoria. Barragem continua de fora (nenhum item resolve —
-- ver ADR).
--
-- ===== Pilhas de Estéril =====
-- Planilha "3. Pilha de Estéril" tem DOIS sub-blocos (Pilha de Rejeitos,
-- coluna L; Pilha Final, coluna M) — a migration original
-- (20260829130000_reseed_planilha_nx_gold) só migrou os campos operacionais
-- do sub-bloco Pilha Final (Perímetro/Volume/Tonelagem/Área já no banco batem
-- com colunas M9/M12/M13/M15), descartando o sub-bloco menor. Faltavam
-- Largura Berma/Altura Bancada (L10/M10=10, L11/M11=10 — idênticos nos dois
-- sub-blocos, adicionados aqui como folha) pra fechar a cadeia
-- Perímetro→Volume→Tonelagem igual Cavas, e falta o campo derivado Drenagem
-- (M18 = Perímetro × 0,25).
--
-- "[Retaludamento] Reconformação topográfica" fica de fora — a própria
-- planilha (D21) usa a Área do sub-bloco DESCARTADO (Pilha de Rejeitos,
-- 0,59 ha), não a Área que o banco guarda (Pilha Final, 19,98 ha). Forçar
-- fórmula aqui reproduziria uma referência cruzada errada da fonte, não
-- corrigiria nada — mesma doutrina de "fonte ambígua, não forçar" do Cavas.
insert into campos_operacionais_template (categoria_template_id, label, unidade, valor_referencia, ordem)
values
  ('5560faa5-4273-4885-b3f5-043e14259654', 'Largura Berma', 'm', '10', 5),
  ('5560faa5-4273-4885-b3f5-043e14259654', 'Altura Bancada', 'm', '10', 6),
  ('5560faa5-4273-4885-b3f5-043e14259654', 'Drenagem', 'm³', '626,285', 7);

update campos_operacionais_template
set formula = 'Perímetro * Largura Berma * Altura Bancada'
where id = 'e4e295c1-b3c1-4cb3-a294-d5d7438a3df8'; -- Volume (Pilhas)

update campos_operacionais_template
set formula = 'Volume * Densidade'
where id = '1bb9ca20-e5ff-440a-a1ca-95cd591c98c9'; -- Tonelagem (Pilhas)

update campos_operacionais_template
set formula = 'Perímetro * 0.25'
where categoria_template_id = '5560faa5-4273-4885-b3f5-043e14259654' and label = 'Drenagem';

-- Escavação/transporte — quantidade = Tonelagem / 3 (D22 = M13/3 na planilha)
update itens_template
set custo_unitario_min = round(custo_min / 225462.6, 6),
    custo_unitario_max = round(custo_max / 225462.6, 6),
    formula_quantidade = 'Tonelagem / 3'
where id = '26cda61f-1ae3-4b41-86ca-4fb863fa4f1e'; -- [Retaludamento] Escavação, carga, transporte, descarga

-- Drenagem — quantidade = Drenagem × 4 (D26 = M18*4 na planilha)
update itens_template
set custo_unitario_min = round(custo_min / 2505.14, 6),
    custo_unitario_max = round(custo_max / 2505.14, 6),
    formula_quantidade = 'Drenagem * 4'
where id = '4034681a-5006-4665-b8d8-06b886b835e6'; -- [Drenagem] Escavação mecanizada de vala (≤1,5m)

-- Revegetação (4 itens) — quantidade = Área direto (D31..D37 = M$15 na planilha)
update itens_template
set custo_unitario_min = round(custo_min / 19.9844, 6),
    custo_unitario_max = round(custo_max / 19.9844, 6),
    formula_quantidade = 'Área'
where id in (
  '2c3f92d8-7255-404d-b7f5-cf83d42df74c', -- Descompactação de solo
  'bfa56c4c-9aaf-42ad-a2f1-13930a334f24', -- Aplicação de solo orgânico
  'a3d57011-3ea1-4d2c-b953-dc84d1ad6dff', -- Insumos (adubos e corretivos)
  'cc8d89c1-739c-4a8a-a2c3-cbe8cf5c0ac0'  -- Plantio de mudas + manutenção
);

-- ===== Planta Industrial =====
-- Único item cuja quantidade deriva de campo operacional na planilha
-- ("5. Planta Industrial", D15..D21 = L$6 = Área) — os 6 itens de
-- Desativação/Demolição têm quantidade LITERAL na planilha (100, 2000, 800...),
-- sem fórmula nenhuma na fonte, corretamente estáticos.
update itens_template
set custo_unitario_min = round(custo_min / 5.47, 6),
    custo_unitario_max = round(custo_max / 5.47, 6),
    formula_quantidade = 'Área'
where id = '50bfc6d2-a859-4c67-bc33-cd2ad291f74d'; -- [Revegetação] Descompactação + solo orgânico + mudas

-- ===== Áreas de Apoio =====
-- 4 itens de Revegetação — quantidade = "Área total" direto (D5..D11 = U$6 na
-- planilha). Os 3 itens de Desmontagem ficam estáticos — quantidade literal
-- (2100, 3000) ou derivada de outra quantidade literal (D18 = D16*1,35), sem
-- ligação nenhuma com Área/Perímetro.
update itens_template
set custo_unitario_min = round(custo_min / 90.726, 6),
    custo_unitario_max = round(custo_max / 90.726, 6),
    formula_quantidade = 'Área total'
where id in (
  '1ed84e92-b700-40c4-aa9f-a9d09dbf75ab', -- Descompactação de solo
  'a425cf3a-b567-4cc8-8539-b9aeff44e7ae', -- Aplicação de solo orgânico
  '64dd670c-8077-4d26-a953-81599907817f', -- Insumos (adubos e corretivos)
  '0bd7d085-e1d5-4e3c-9d29-adfc3572af4b'  -- Plantio de mudas + manutenção
);

-- Cross-check — fail-fast se quantidade × custo_unitario não reproduzir o
-- custo_min/max original dentro de tolerância relativa (mesma razão do
-- Cavas: custo_unitario_min/max é numeric(14,4), arredondamento da própria
-- coluna já impõe erro possível com quantidade grande).
do $$
declare
  rec record;
begin
  for rec in
    select it.id, it.nome, it.custo_min, it.custo_max, it.custo_unitario_min, it.custo_unitario_max,
           case
             when it.id = '26cda61f-1ae3-4b41-86ca-4fb863fa4f1e' then 225462.6
             when it.id = '4034681a-5006-4665-b8d8-06b886b835e6' then 2505.14
             when it.id in ('2c3f92d8-7255-404d-b7f5-cf83d42df74c','bfa56c4c-9aaf-42ad-a2f1-13930a334f24',
                            'a3d57011-3ea1-4d2c-b953-dc84d1ad6dff','cc8d89c1-739c-4a8a-a2c3-cbe8cf5c0ac0') then 19.9844
             when it.id = '50bfc6d2-a859-4c67-bc33-cd2ad291f74d' then 5.47
             when it.id in ('1ed84e92-b700-40c4-aa9f-a9d09dbf75ab','a425cf3a-b567-4cc8-8539-b9aeff44e7ae',
                            '64dd670c-8077-4d26-a953-81599907817f','0bd7d085-e1d5-4e3c-9d29-adfc3572af4b') then 90.726
           end as quantidade
      from itens_template it
     where it.formula_quantidade is not null
       and it.categoria_template_id in (
         '5560faa5-4273-4885-b3f5-043e14259654', -- Pilhas
         'b3aebaf7-514f-4b8a-96ef-a6dfaa9c9aa0',  -- Planta Industrial
         '9e8a63fb-4581-4c5d-9dc1-6d8d80d0863f'   -- Áreas de Apoio
       )
       and it.custo_unitario_min is not null
  loop
    if rec.quantidade is null then
      raise exception 'Item % com formula_quantidade mas sem quantidade mapeada no cross-check', rec.nome;
    end if;
    if abs(rec.quantidade * rec.custo_unitario_min - rec.custo_min) > greatest(1, rec.custo_min * 0.0001)
       or abs(rec.quantidade * rec.custo_unitario_max - rec.custo_max) > greatest(1, rec.custo_max * 0.0001) then
      raise exception 'Fórmula de % não reproduz custo_min/max original (min: % vs %, max: % vs %)',
        rec.nome, rec.quantidade * rec.custo_unitario_min, rec.custo_min,
        rec.quantidade * rec.custo_unitario_max, rec.custo_max;
    end if;
  end loop;
end $$;
