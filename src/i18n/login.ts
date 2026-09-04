import type { Lang } from './LangContext'

export const loginT: Record<
  Lang,
  {
    subtitle: string
    emailLabel: string
    passwordLabel: string
    emailPlaceholder: string
    enter: string
    entering: string
    wrongCredentials: string
    emailNotConfirmed: string
    showPassword: string
    hidePassword: string
  }
> = {
  'pt-BR': {
    subtitle: 'Asset Retirement Obligation · Aro Simulação',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha',
    emailPlaceholder: 'seu@email.com',
    enter: 'Entrar',
    entering: 'Entrando…',
    wrongCredentials: 'E-mail ou senha incorretos.',
    emailNotConfirmed: 'Confirme seu e-mail antes de entrar — verifique sua caixa de entrada.',
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
  },
  en: {
    subtitle: 'Asset Retirement Obligation · Aro Simulação',
    emailLabel: 'E-mail',
    passwordLabel: 'Password',
    emailPlaceholder: 'your@email.com',
    enter: 'Sign in',
    entering: 'Signing in…',
    wrongCredentials: 'Incorrect e-mail or password.',
    emailNotConfirmed: 'Confirm your e-mail before signing in — check your inbox.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  es: {
    subtitle: 'Asset Retirement Obligation · Aro Simulação',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    emailPlaceholder: 'tu@correo.com',
    enter: 'Iniciar sesión',
    entering: 'Iniciando…',
    wrongCredentials: 'Correo electrónico o contraseña incorrectos.',
    emailNotConfirmed: 'Confirma tu correo antes de iniciar sesión — revisa tu bandeja de entrada.',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
  },
}
