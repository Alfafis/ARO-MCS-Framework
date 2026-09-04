// Política de Privacidade — LGPD (Lei nº 13.709/2018). Texto único em pt-BR,
// deliberadamente sem i18n: o app roda pt-BR/en/es pro consultor, mas a base
// legal (LGPD) é territorial — trata de dado pessoal de indivíduo no Brasil
// independente do idioma da interface. Traduzir esse documento criaria a
// impressão de regime legal diferente por idioma, o que não é o caso.
//
// [RAZÃO SOCIAL]/[CNPJ] — identidade do controlador ainda não informada,
// placeholder deliberado (ver ADR "Auditoria de segurança + LGPD",
// 2026-09-03/04) — substituir assim que o usuário confirmar.
export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-c-bg px-4 py-10 sm:py-16">
      <div className="max-w-[720px] mx-auto bg-c-card rounded-[20px] shadow-[var(--shadow-1)] border border-c-line p-6 sm:p-10 flex flex-col gap-6 text-[14px] leading-relaxed text-c-text">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight mb-1">Política de Privacidade</h1>
          <p className="text-[12px] text-c-text-2">Última atualização: 04 de setembro de 2026</p>
        </div>

        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold">1. Controlador dos dados</h2>
          <p>
            Esta plataforma ("Be Planned") é operada por <strong>[RAZÃO SOCIAL]</strong>, CNPJ{' '}
            <strong>[CNPJ]</strong>, doravante "Controlador".
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold">2. Encarregado de Proteção de Dados (DPO)</h2>
          <p>
            Nome: <strong>Khaled Tomeh</strong>
            <br />
            Contato: <a href="mailto:contato@beplanned.com.br">contato@beplanned.com.br</a>
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold">3. Quais dados coletamos e para quê</h2>
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-left border-b border-[rgba(20,21,26,.1)]">
                <th className="py-1.5 pr-2 font-semibold">Dado</th>
                <th className="py-1.5 pr-2 font-semibold">De quem</th>
                <th className="py-1.5 pr-2 font-semibold">Finalidade</th>
                <th className="py-1.5 font-semibold">Base legal</th>
              </tr>
            </thead>
            <tbody className="align-top">
              <tr className="border-b border-c-line">
                <td className="py-1.5 pr-2">Nome, e-mail, telefone, profissão, foto</td>
                <td className="py-1.5 pr-2">Consultor (usuário da plataforma)</td>
                <td className="py-1.5 pr-2">Autenticação e identificação no uso da plataforma</td>
                <td className="py-1.5">Execução de contrato (art. 7, V)</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-2">Dados financeiros e operacionais de projeto</td>
                <td className="py-1.5 pr-2">Cliente (empresa contratante)</td>
                <td className="py-1.5 pr-2">Elaboração do provisionamento de fechamento de mina</td>
                <td className="py-1.5">Execução de contrato (art. 7, V)</td>
              </tr>
            </tbody>
          </table>
          <p className="text-[12px] text-c-text-2">
            O Portal do Cliente (acesso via código, sem cadastro) não coleta nome, e-mail ou qualquer dado pessoal
            do visitante — apenas exibe o relatório do projeto vinculado ao código informado.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold">4. Prazo de retenção</h2>
          <p>
            <strong>[DEFINIR]</strong> — política de retenção por tipo de dado em elaboração. Enquanto não
            publicada, dados de perfil do consultor são mantidos durante a vigência da conta, e dados de projeto
            durante a relação contratual com o cliente.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold">5. Compartilhamento com terceiros</h2>
          <p>Os seguintes prestadores de serviço (operadores de dados) têm acesso técnico aos dados tratados:</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>
              <strong>Supabase</strong> — banco de dados e autenticação
            </li>
            <li>
              <strong>Cloudflare</strong> — hospedagem da aplicação
            </li>
          </ul>
          <p>Não compartilhamos dados com terceiros para fins de marketing ou publicidade.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold">6. Cookies e armazenamento local</h2>
          <p>
            Usamos apenas armazenamento estritamente necessário: sessão de autenticação e preferência de idioma.
            Não usamos cookies de rastreamento, analytics ou publicidade de terceiros.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold">7. Seus direitos (art. 18 da LGPD)</h2>
          <p>Você pode solicitar, a qualquer momento, mediante contato com o Encarregado (seção 2):</p>
          <ul className="list-disc pl-5 flex flex-col gap-1">
            <li>Confirmação da existência de tratamento</li>
            <li>Acesso aos seus dados</li>
            <li>Correção de dados incompletos ou desatualizados</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
            <li>Eliminação dos dados tratados com base no seu consentimento</li>
            <li>Informação sobre com quem seus dados são compartilhados</li>
            <li>Revogação do consentimento</li>
          </ul>
          <p>Respondemos em até 15 dias úteis, conforme orientação da ANPD.</p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-[15px] font-semibold">8. Segurança</h2>
          <p>
            Dados são transmitidos via HTTPS, o acesso é controlado por autenticação e permissões por perfil de
            usuário, e o banco de dados aplica controle de acesso por linha (Row-Level Security).
          </p>
        </section>

        <p className="text-[12px] text-c-text-2 pt-2 border-t border-c-line">
          Esta política é regida pela Lei nº 13.709/2018 (LGPD).
        </p>
      </div>
    </div>
  )
}
