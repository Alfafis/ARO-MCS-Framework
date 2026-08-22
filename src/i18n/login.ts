import type { Lang } from './LangContext'

export const loginT: Record<Lang, {
  subtitle:      string
  emailLabel:    string
  passwordLabel: string
  emailPlaceholder: string
  enter:         string
  entering:      string
  wrongCredentials: string
  emailNotConfirmed: string
  feature1Label: string
  feature1Desc:  string
  feature2Label: string
  feature2Desc:  string
  feature3Label: string
  feature3Desc:  string
}> = {
  'pt-BR': {
    subtitle:         'Asset Retirement Obligation · Monte Carlo Simulation',
    emailLabel:       'E-mail',
    passwordLabel:    'Senha',
    emailPlaceholder: 'seu@email.com',
    enter:            'Entrar',
    entering:         'Entrando…',
    wrongCredentials: 'E-mail ou senha incorretos.',
    emailNotConfirmed: 'Confirme seu e-mail antes de entrar — verifique sua caixa de entrada.',
    feature1Label:    'Simulação Monte Carlo',
    feature1Desc:     '10.000 iterações por projeto',
    feature2Label:    'Revisões auditáveis',
    feature2Desc:     'Hash blockchain por versão',
    feature3Label:    'Portal do cliente',
    feature3Desc:     'Preenchimento colaborativo',
  },
  'en': {
    subtitle:         'Asset Retirement Obligation · Monte Carlo Simulation',
    emailLabel:       'E-mail',
    passwordLabel:    'Password',
    emailPlaceholder: 'your@email.com',
    enter:            'Sign in',
    entering:         'Signing in…',
    wrongCredentials: 'Incorrect e-mail or password.',
    emailNotConfirmed: 'Confirm your e-mail before signing in — check your inbox.',
    feature1Label:    'Monte Carlo Simulation',
    feature1Desc:     '10,000 iterations per project',
    feature2Label:    'Auditable revisions',
    feature2Desc:     'Blockchain hash per version',
    feature3Label:    'Client portal',
    feature3Desc:     'Collaborative data entry',
  },
  'es': {
    subtitle:         'Asset Retirement Obligation · Monte Carlo Simulation',
    emailLabel:       'Correo electrónico',
    passwordLabel:    'Contraseña',
    emailPlaceholder: 'tu@correo.com',
    enter:            'Iniciar sesión',
    entering:         'Iniciando…',
    wrongCredentials: 'Correo electrónico o contraseña incorrectos.',
    emailNotConfirmed: 'Confirma tu correo antes de iniciar sesión — revisa tu bandeja de entrada.',
    feature1Label:    'Simulación Monte Carlo',
    feature1Desc:     '10.000 iteraciones por proyecto',
    feature2Label:    'Revisiones auditables',
    feature2Desc:     'Hash blockchain por versión',
    feature3Label:    'Portal del cliente',
    feature3Desc:     'Completado colaborativo',
  },
}
