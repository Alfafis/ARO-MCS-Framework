import type { Lang } from './LangContext'

export const mfaT: Record<
  Lang,
  {
    sectionTitle: string
    sectionDescription: string
    enabledBadge: string
    disabledBadge: string
    enableButton: string
    disableButton: string
    disabling: string
    disableConfirmTitle: string
    disableConfirm: string
    disableConfirmAction: string
    disableErrorToast: string
    disableSuccessToast: string
    enrollModalTitle: string
    scanInstruction: string
    manualSecretLabel: string
    codeLabel: string
    codePlaceholder: string
    verifyButton: string
    verifying: string
    invalidCode: string
    enrollStartError: string
    enrollSuccessToast: string
    noRecoveryWarning: string
    cancelButton: string
  }
> = {
  'pt-BR': {
    sectionTitle: 'Autenticação em dois fatores',
    sectionDescription:
      'Adiciona uma segunda etapa de verificação no login, com código gerado por um app autenticador.',
    enabledBadge: 'Ativado',
    disabledBadge: 'Desativado',
    enableButton: 'Ativar 2FA',
    disableButton: 'Desativar 2FA',
    disabling: 'Desativando…',
    disableConfirmTitle: 'Desativar autenticação em dois fatores',
    disableConfirm: 'Desativar a autenticação em dois fatores? Sua conta ficará protegida só por senha.',
    disableConfirmAction: 'Desativar',
    disableErrorToast: 'Não foi possível desativar o 2FA.',
    disableSuccessToast: '2FA desativado.',
    enrollModalTitle: 'Ativar autenticação em dois fatores',
    scanInstruction:
      'Escaneie o código abaixo com um app autenticador (Google Authenticator, Authy, 1Password…).',
    manualSecretLabel: 'Ou insira esse código manualmente no app:',
    codeLabel: 'Código de 6 dígitos',
    codePlaceholder: '000000',
    verifyButton: 'Verificar e ativar',
    verifying: 'Verificando…',
    invalidCode: 'Código inválido. Tente novamente.',
    enrollStartError: 'Não foi possível iniciar a ativação. Tente novamente.',
    enrollSuccessToast: 'Autenticação em dois fatores ativada.',
    noRecoveryWarning:
      'Guarde o acesso ao seu app autenticador — não existe código de recuperação. Se perder o acesso, será preciso suporte manual pra desativar.',
    cancelButton: 'Cancelar',
  },
  en: {
    sectionTitle: 'Two-factor authentication',
    sectionDescription: 'Adds a second verification step at login, with a code from an authenticator app.',
    enabledBadge: 'Enabled',
    disabledBadge: 'Disabled',
    enableButton: 'Enable 2FA',
    disableButton: 'Disable 2FA',
    disabling: 'Disabling…',
    disableConfirmTitle: 'Disable two-factor authentication',
    disableConfirm: 'Disable two-factor authentication? Your account will only be protected by password.',
    disableConfirmAction: 'Disable',
    disableErrorToast: 'Could not disable 2FA.',
    disableSuccessToast: '2FA disabled.',
    enrollModalTitle: 'Enable two-factor authentication',
    scanInstruction: 'Scan the code below with an authenticator app (Google Authenticator, Authy, 1Password…).',
    manualSecretLabel: 'Or enter this code manually in the app:',
    codeLabel: '6-digit code',
    codePlaceholder: '000000',
    verifyButton: 'Verify and enable',
    verifying: 'Verifying…',
    invalidCode: 'Invalid code. Try again.',
    enrollStartError: 'Could not start enrollment. Try again.',
    enrollSuccessToast: 'Two-factor authentication enabled.',
    noRecoveryWarning:
      "Keep access to your authenticator app safe — there's no recovery code. Losing access requires manual support to disable it.",
    cancelButton: 'Cancel',
  },
  es: {
    sectionTitle: 'Autenticación en dos factores',
    sectionDescription:
      'Agrega un segundo paso de verificación al iniciar sesión, con un código generado por una app autenticadora.',
    enabledBadge: 'Activado',
    disabledBadge: 'Desactivado',
    enableButton: 'Activar 2FA',
    disableButton: 'Desactivar 2FA',
    disabling: 'Desactivando…',
    disableConfirmTitle: 'Desactivar autenticación en dos factores',
    disableConfirm: '¿Desactivar la autenticación en dos factores? Tu cuenta quedará protegida solo por contraseña.',
    disableConfirmAction: 'Desactivar',
    disableErrorToast: 'No se pudo desactivar el 2FA.',
    disableSuccessToast: '2FA desactivado.',
    enrollModalTitle: 'Activar autenticación en dos factores',
    scanInstruction: 'Escanea el código con una app autenticadora (Google Authenticator, Authy, 1Password…).',
    manualSecretLabel: 'O ingresa este código manualmente en la app:',
    codeLabel: 'Código de 6 dígitos',
    codePlaceholder: '000000',
    verifyButton: 'Verificar y activar',
    verifying: 'Verificando…',
    invalidCode: 'Código inválido. Intenta de nuevo.',
    enrollStartError: 'No se pudo iniciar la activación. Intenta de nuevo.',
    enrollSuccessToast: 'Autenticación en dos factores activada.',
    noRecoveryWarning:
      'Guarda bien el acceso a tu app autenticadora — no existe código de recuperación. Si lo pierdes, necesitarás soporte manual para desactivarlo.',
    cancelButton: 'Cancelar',
  },
}
