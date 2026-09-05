// ============================================================================
// send-transactional-email
// ============================================================================
// Primeira Edge Function do projeto. Pipe fino entre o frontend (consultor
// autenticado) e a API do Resend — não usa o SMTP configurado no Dashboard
// (esse é só pros e-mails de Auth do GoTrue). Gate de autorização replica o
// padrão RPC-first do projeto: exige JWT válido + is_consultor() == true,
// senão qualquer holder da anon key poderia mandar e-mail arbitrário em nome
// da plataforma (spam/phishing usando o domínio verificado do Resend).
//
// Ver spec 2026-09-05-emails-transacionais-design.md no vault.
// ============================================================================

import { createClient } from 'jsr:@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const FROM_ADDRESS = 'Be Planned <contato@beplanned.com.br>'
const SITE_URL = 'https://beplanned.com.br'

type TemplateName = 'projeto_enviado' | 'revisao_publicada'

interface RequestPayload {
  to: string
  template: TemplateName
  data: Record<string, string>
}

function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f3f1; -webkit-text-size-adjust:100%; text-size-adjust:100%;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f3f1;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" border="0" style="width:480px; max-width:100%; background-color:#ffffff; border-radius:20px; box-shadow:0 16px 40px -12px rgba(20,21,26,0.18);">
            <tr>
              <td style="padding:40px 40px 8px 40px;" align="center">
                <img
                  src="${SITE_URL}/BePlanned%20Logo.png"
                  width="160"
                  alt="Be Planned"
                  style="display:block; width:160px; max-width:160px; height:auto; border:0;"
                />
              </td>
            </tr>
            ${bodyHtml}
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <div style="height:1px; background-color:rgba(20,21,26,0.08); line-height:1px; font-size:1px;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 36px 40px;" align="center">
                <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:11.5px; line-height:1.6; color:#9198a3;">
                  Be Planned · Asset Retirement Obligation<br />
                  <a href="${SITE_URL}/privacidade" style="color:#9198a3; text-decoration:underline;">Política de Privacidade</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function heading(text: string): string {
  return `<tr><td style="padding:24px 40px 0 40px;" align="center"><p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:19px; line-height:1.3; font-weight:700; color:#14151a;">${text}</p></td></tr>`
}

function paragraph(text: string): string {
  return `<tr><td style="padding:14px 40px 0 40px;" align="center"><p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:14px; line-height:1.6; color:#6c7280;">${text}</p></td></tr>`
}

function button(label: string, href: string): string {
  return `<tr><td style="padding:28px 40px 8px 40px;" align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#2e7d32" style="border-radius:999px;"><a href="${href}" target="_blank" style="display:inline-block; padding:13px 32px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:999px;">${label}</a></td></tr></table></td></tr>`
}

function codeBlock(label: string, code: string): string {
  return `<tr><td style="padding:20px 40px 0 40px;" align="center"><p style="margin:0 0 6px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#9198a3;">${label}</p><p style="margin:0; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:20px; font-weight:700; letter-spacing:0.08em; color:#14151a; background-color:#f6f5f3; border-radius:11px; padding:12px 20px; display:inline-block;">${code}</p></td></tr>`
}

function renderTemplate(template: TemplateName, data: Record<string, string>): { subject: string; html: string } {
  const projectName = data.projectName ?? ''
  const clientName = data.clientName ?? ''
  const portalUrl = data.portalUrl ?? SITE_URL

  if (template === 'projeto_enviado') {
    const subject = `Relatório disponível — ${projectName}`
    const html = emailShell(
      subject,
      [
        heading('Seu relatório está disponível'),
        paragraph(
          `Olá${clientName ? `, ${clientName}` : ''}. O relatório do projeto <strong>${projectName}</strong> já está disponível no portal Be Planned.`
        ),
        button('Acessar relatório', portalUrl),
        data.code ? codeBlock('Código de acesso', data.code) : '',
        paragraph('Guarde esse código — ele é pedido toda vez que o relatório for acessado.'),
      ].join('\n')
    )
    return { subject, html }
  }

  // revisao_publicada
  const subject = `Nova revisão disponível — ${projectName}`
  const html = emailShell(
    subject,
    [
      heading('Nova revisão publicada'),
      paragraph(
        `Olá${clientName ? `, ${clientName}` : ''}. Uma nova revisão${data.revisionCode ? ` (${data.revisionCode})` : ''} do projeto <strong>${projectName}</strong> foi publicada.`
      ),
      button('Ver relatório atualizado', portalUrl),
      paragraph('Use o mesmo código de acesso que você já tem — ele não muda entre revisões.'),
    ].join('\n')
  )
  return { subject, html }
}

// CORS: a function é chamada direto do browser (supabase.functions.invoke), não só
// server-to-server — sem esses headers o navegador derruba a resposta antes do
// client SDK conseguir lê-la (some como "Failed to send a request", sem detalhe).
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }
  if (!RESEND_API_KEY) {
    return json({ error: 'resend_not_configured' }, 500)
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return json({ error: 'unauthorized' }, 401)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: isConsultor, error: authError } = await supabase.rpc('is_consultor')
  if (authError || !isConsultor) {
    return json({ error: 'forbidden' }, 403)
  }

  let payload: RequestPayload
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  if (!payload.to || !payload.template) {
    return json({ error: 'missing_fields' }, 400)
  }

  const { subject, html } = renderTemplate(payload.template, payload.data ?? {})

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [payload.to],
      subject,
      html,
    }),
  })

  if (!resendRes.ok) {
    const detail = await resendRes.text()
    return json({ error: 'resend_failed', detail }, 502)
  }

  return json({ ok: true }, 200)
})
