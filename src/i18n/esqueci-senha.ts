import type { Lang } from './LangContext'

export const esqueciSenhaT: Record<
  Lang,
  {
    title: string
    subtitle: string
    emailLabel: string
    emailPlaceholder: string
    submit: string
    submitting: string
    sentMessage: string
    backToLogin: string
  }
> = {
  'pt-BR': {
    title: 'Redefinir senha',
    subtitle: 'Informe seu e-mail e enviaremos um link pra você escolher uma nova senha.',
    emailLabel: 'E-mail',
    emailPlaceholder: 'seu@email.com',
    submit: 'Enviar link',
    submitting: 'Enviando…',
    sentMessage: 'Se esse e-mail estiver cadastrado, você vai receber um link de redefinição em instantes.',
    backToLogin: 'Voltar ao login',
  },
  en: {
    title: 'Reset password',
    subtitle: "Enter your e-mail and we'll send a link to choose a new password.",
    emailLabel: 'E-mail',
    emailPlaceholder: 'your@email.com',
    submit: 'Send link',
    submitting: 'Sending…',
    sentMessage: "If that e-mail is registered, you'll receive a reset link shortly.",
    backToLogin: 'Back to login',
  },
  es: {
    title: 'Restablecer contraseña',
    subtitle: 'Ingresa tu correo y te enviaremos un enlace para elegir una nueva contraseña.',
    emailLabel: 'Correo electrónico',
    emailPlaceholder: 'tu@correo.com',
    submit: 'Enviar enlace',
    submitting: 'Enviando…',
    sentMessage: 'Si ese correo está registrado, recibirás un enlace de restablecimiento en instantes.',
    backToLogin: 'Volver al inicio de sesión',
  },
}
