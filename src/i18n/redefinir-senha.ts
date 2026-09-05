import type { Lang } from './LangContext'

export const redefinirSenhaT: Record<
  Lang,
  {
    title: string
    subtitle: string
    newPasswordLabel: string
    confirmPasswordLabel: string
    submit: string
    submitting: string
    tooShort: string
    mismatch: string
    genericError: string
    invalidLinkTitle: string
    invalidLinkMessage: string
    requestNewLink: string
    showPassword: string
    hidePassword: string
  }
> = {
  'pt-BR': {
    title: 'Escolher nova senha',
    subtitle: 'Defina uma nova senha pra sua conta.',
    newPasswordLabel: 'Nova senha',
    confirmPasswordLabel: 'Confirmar nova senha',
    submit: 'Salvar nova senha',
    submitting: 'Salvando…',
    tooShort: 'A senha precisa ter no mínimo 8 caracteres.',
    mismatch: 'As senhas não coincidem.',
    genericError: 'Não foi possível redefinir a senha. Tente pedir um novo link.',
    invalidLinkTitle: 'Link inválido ou expirado',
    invalidLinkMessage: 'Esse link de redefinição já não é mais válido — peça um novo.',
    requestNewLink: 'Pedir novo link',
    showPassword: 'Mostrar senha',
    hidePassword: 'Ocultar senha',
  },
  en: {
    title: 'Choose a new password',
    subtitle: 'Set a new password for your account.',
    newPasswordLabel: 'New password',
    confirmPasswordLabel: 'Confirm new password',
    submit: 'Save new password',
    submitting: 'Saving…',
    tooShort: 'Password must be at least 8 characters.',
    mismatch: 'Passwords do not match.',
    genericError: 'Could not reset the password. Try requesting a new link.',
    invalidLinkTitle: 'Invalid or expired link',
    invalidLinkMessage: 'This reset link is no longer valid — request a new one.',
    requestNewLink: 'Request new link',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  },
  es: {
    title: 'Elegir nueva contraseña',
    subtitle: 'Define una nueva contraseña para tu cuenta.',
    newPasswordLabel: 'Nueva contraseña',
    confirmPasswordLabel: 'Confirmar nueva contraseña',
    submit: 'Guardar nueva contraseña',
    submitting: 'Guardando…',
    tooShort: 'La contraseña debe tener al menos 8 caracteres.',
    mismatch: 'Las contraseñas no coinciden.',
    genericError: 'No se pudo restablecer la contraseña. Intenta pedir un nuevo enlace.',
    invalidLinkTitle: 'Enlace inválido o expirado',
    invalidLinkMessage: 'Este enlace de restablecimiento ya no es válido — pide uno nuevo.',
    requestNewLink: 'Pedir nuevo enlace',
    showPassword: 'Mostrar contraseña',
    hidePassword: 'Ocultar contraseña',
  },
}
