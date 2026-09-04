-- Solicitação criada durante o teste ao vivo do fluxo de exclusão LGPD
-- (2026-09-04), na própria conta de teste do consultor. Processada como
-- qualquer solicitação real seria — marcada 'concluida' pelo operador, não
-- apagada (o registro em si é o rastro exigido, não dado a esconder).
update public.solicitacoes_exclusao
set status = 'concluida'
where usuario_id = '6f03d847-9a18-4467-88e5-13ca7252b699' and status = 'pendente';
