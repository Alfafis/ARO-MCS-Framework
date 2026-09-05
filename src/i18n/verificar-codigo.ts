import type { Lang } from './LangContext'

export const verificarCodigoT: Record<
  Lang,
  {
    title: string
    subtitle: string
    codeLabel: string
    codePlaceholder: string
    submit: string
    submitting: string
    invalidCode: string
    genericError: string
    backToLogin: string
  }
> = {
  'pt-BR': {
    title: 'Verificação em duas etapas',
    subtitle: 'Digite o código gerado pelo seu app autenticador.',
    codeLabel: 'Código',
    codePlaceholder: '000000',
    submit: 'Verificar',
    submitting: 'Verificando…',
    invalidCode: 'Código inválido. Tente novamente.',
    genericError: 'Não foi possível verificar o código. Tente novamente.',
    backToLogin: 'Usar outra conta',
  },
  en: {
    title: 'Two-step verification',
    subtitle: 'Enter the code from your authenticator app.',
    codeLabel: 'Code',
    codePlaceholder: '000000',
    submit: 'Verify',
    submitting: 'Verifying…',
    invalidCode: 'Invalid code. Try again.',
    genericError: 'Could not verify the code. Try again.',
    backToLogin: 'Use another account',
  },
  es: {
    title: 'Verificación en dos pasos',
    subtitle: 'Ingresa el código de tu app autenticadora.',
    codeLabel: 'Código',
    codePlaceholder: '000000',
    submit: 'Verificar',
    submitting: 'Verificando…',
    invalidCode: 'Código inválido. Intenta de nuevo.',
    genericError: 'No se pudo verificar el código. Intenta de nuevo.',
    backToLogin: 'Usar otra cuenta',
  },
}
