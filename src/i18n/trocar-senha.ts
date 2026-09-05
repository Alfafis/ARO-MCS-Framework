import type { Lang } from './LangContext'

export const trocarSenhaT: Record<
  Lang,
  {
    sectionTitle: string
    sectionDescription: string
    currentPasswordLabel: string
    newPasswordLabel: string
    confirmPasswordLabel: string
    submit: string
    submitting: string
    tooShort: string
    mismatch: string
    wrongCurrentPassword: string
    samePassword: string
    weakPassword: string
    reauthNeeded: string
    genericError: string
    successToast: string
    showPassword: string
    hidePassword: string
  }
> = {
  'pt-BR': {
    sectionTitle: 'Alterar senha',
    sectionDescription: 'Troca a senha da sua conta — precisamos confirmar a senha atual antes.',
    currentPasswordLabel: 'Senha atual',
    newPasswordLabel: 'Nova senha',
    confirmPasswordLabel: 'Confirmar nova senha',
    submit: 'Alterar senha',
    submitting: 'Alterando…',
    tooShort: 'A nova senha precisa ter no mínimo 8 caracteres.',
    mismatch: 'As senhas não coincidem.',
    wrongCurrentPassword: 'Senha atual incorreta.',
    samePassword: 'A nova senha precisa ser diferente da atual.',
    weakPassword: 'Essa senha é fraca demais. Tente uma mais forte.',
    reauthNeeded:
      'Por segurança, sua sessão é antiga demais pra trocar a senha direto. Use "Esqueceu a senha?" na tela de login.',
    genericError: 'Não foi possível alterar a senha. Tente novamente.',
    successToast: 'Senha alterada com sucesso.',
    showPassword: 'Mostrar senhas',
    hidePassword: 'Ocultar senhas',
  },
  en: {
    sectionTitle: 'Change password',
    sectionDescription: "Change your account's password — we need to confirm the current one first.",
    currentPasswordLabel: 'Current password',
    newPasswordLabel: 'New password',
    confirmPasswordLabel: 'Confirm new password',
    submit: 'Change password',
    submitting: 'Changing…',
    tooShort: 'The new password must be at least 8 characters.',
    mismatch: 'Passwords do not match.',
    wrongCurrentPassword: 'Incorrect current password.',
    samePassword: 'The new password must be different from the current one.',
    weakPassword: 'This password is too weak. Try a stronger one.',
    reauthNeeded: 'For security, your session is too old to change the password directly. Use "Forgot your password?" on the login screen.',
    genericError: 'Could not change the password. Try again.',
    successToast: 'Password changed successfully.',
    showPassword: 'Show passwords',
    hidePassword: 'Hide passwords',
  },
  es: {
    sectionTitle: 'Cambiar contraseña',
    sectionDescription: 'Cambia la contraseña de tu cuenta — necesitamos confirmar la actual primero.',
    currentPasswordLabel: 'Contraseña actual',
    newPasswordLabel: 'Nueva contraseña',
    confirmPasswordLabel: 'Confirmar nueva contraseña',
    submit: 'Cambiar contraseña',
    submitting: 'Cambiando…',
    tooShort: 'La nueva contraseña debe tener al menos 8 caracteres.',
    mismatch: 'Las contraseñas no coinciden.',
    wrongCurrentPassword: 'Contraseña actual incorrecta.',
    samePassword: 'La nueva contraseña debe ser diferente de la actual.',
    weakPassword: 'Esta contraseña es demasiado débil. Prueba una más fuerte.',
    reauthNeeded:
      'Por seguridad, tu sesión es demasiado antigua para cambiar la contraseña directamente. Usa "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.',
    genericError: 'No se pudo cambiar la contraseña. Intenta de nuevo.',
    successToast: 'Contraseña cambiada con éxito.',
    showPassword: 'Mostrar contraseñas',
    hidePassword: 'Ocultar contraseñas',
  },
}
