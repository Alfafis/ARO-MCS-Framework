import type { Lang } from './LangContext'

export const perfilT: Record<
  Lang,
  {
    headerTitle: string
    headerSubtitle: string
    photoChange: string
    photoRemove: string
    photoHint: string
    labelName: string
    labelProfession: string
    labelPhone: string
    labelEmail: string
    labelRole: string
    placeholderName: string
    placeholderProfession: string
    placeholderPhone: string
    save: string
    saving: string
    savedToast: string
    saveErrorToast: string
    photoUploadErrorToast: string
    photoRemoveErrorToast: string
    photoTypeError: string
    photoSizeError: string
    roleConsultant: string
    roleClient: string
    lgpdSectionTitle: string
    exportButton: string
    exportErrorToast: string
    deleteButton: string
    deleteConfirm: string
    deleteRequestedToast: string
    deleteErrorToast: string
    deletePendingNotice: (date: string) => string
  }
> = {
  'pt-BR': {
    headerTitle: 'Meu perfil',
    headerSubtitle: 'Dados da sua conta — visíveis só para você.',
    photoChange: 'Trocar foto',
    photoRemove: 'Remover foto',
    photoHint: 'JPG ou PNG, até 2MB. Ou arraste a imagem sobre o círculo.',
    labelName: 'Nome',
    labelProfession: 'Profissão',
    labelPhone: 'Telefone',
    labelEmail: 'E-mail',
    labelRole: 'Papel',
    placeholderName: 'Seu nome completo',
    placeholderProfession: 'Ex.: Engenheiro de Minas',
    placeholderPhone: '+55 11 90000-0000',
    save: 'Salvar',
    saving: 'Salvando…',
    savedToast: 'Perfil atualizado.',
    saveErrorToast: 'Não foi possível salvar o perfil.',
    photoUploadErrorToast: 'Não foi possível enviar a foto.',
    photoRemoveErrorToast: 'Não foi possível remover a foto.',
    photoTypeError: 'Envie um arquivo de imagem (JPG, PNG…).',
    photoSizeError: 'A imagem deve ter até 2MB.',
    roleConsultant: 'Consultor',
    roleClient: 'Cliente',
    lgpdSectionTitle: 'Privacidade e dados (LGPD)',
    exportButton: 'Exportar meus dados',
    exportErrorToast: 'Não foi possível exportar os dados.',
    deleteButton: 'Solicitar exclusão da conta',
    deleteConfirm:
      'Isso apaga nome, profissão, telefone e foto do seu perfil e abre uma solicitação de exclusão de conta. Seu e-mail permanece até o encerramento ser processado. Confirmar?',
    deleteRequestedToast: 'Solicitação enviada. Seus dados pessoais foram removidos do perfil.',
    deleteErrorToast: 'Não foi possível enviar a solicitação.',
    deletePendingNotice: (date) => `Solicitação de exclusão enviada em ${date}. Em processamento.`,
  },
  en: {
    headerTitle: 'My profile',
    headerSubtitle: 'Your account data — visible only to you.',
    photoChange: 'Change photo',
    photoRemove: 'Remove photo',
    photoHint: 'JPG or PNG, up to 2MB. Or drag the image onto the circle.',
    labelName: 'Name',
    labelProfession: 'Profession',
    labelPhone: 'Phone',
    labelEmail: 'Email',
    labelRole: 'Role',
    placeholderName: 'Your full name',
    placeholderProfession: 'e.g. Mining Engineer',
    placeholderPhone: '+1 555 000-0000',
    save: 'Save',
    saving: 'Saving…',
    savedToast: 'Profile updated.',
    saveErrorToast: 'Could not save the profile.',
    photoUploadErrorToast: 'Could not upload the photo.',
    photoRemoveErrorToast: 'Could not remove the photo.',
    photoTypeError: 'Upload an image file (JPG, PNG…).',
    photoSizeError: 'The image must be up to 2MB.',
    roleConsultant: 'Consultant',
    roleClient: 'Client',
    lgpdSectionTitle: 'Privacy and data (LGPD)',
    exportButton: 'Export my data',
    exportErrorToast: 'Could not export the data.',
    deleteButton: 'Request account deletion',
    deleteConfirm:
      'This erases name, profession, phone and photo from your profile and opens an account deletion request. Your email stays until the closure is processed. Confirm?',
    deleteRequestedToast: 'Request sent. Your personal data was removed from the profile.',
    deleteErrorToast: 'Could not send the request.',
    deletePendingNotice: (date) => `Deletion request sent on ${date}. Being processed.`,
  },
  es: {
    headerTitle: 'Mi perfil',
    headerSubtitle: 'Datos de tu cuenta — visibles solo para ti.',
    photoChange: 'Cambiar foto',
    photoRemove: 'Quitar foto',
    photoHint: 'JPG o PNG, hasta 2MB. O arrastra la imagen sobre el círculo.',
    labelName: 'Nombre',
    labelProfession: 'Profesión',
    labelPhone: 'Teléfono',
    labelEmail: 'Correo electrónico',
    labelRole: 'Rol',
    placeholderName: 'Tu nombre completo',
    placeholderProfession: 'Ej.: Ingeniero de Minas',
    placeholderPhone: '+55 11 90000-0000',
    save: 'Guardar',
    saving: 'Guardando…',
    savedToast: 'Perfil actualizado.',
    saveErrorToast: 'No se pudo guardar el perfil.',
    photoUploadErrorToast: 'No se pudo subir la foto.',
    photoRemoveErrorToast: 'No se pudo quitar la foto.',
    photoTypeError: 'Sube un archivo de imagen (JPG, PNG…).',
    photoSizeError: 'La imagen debe tener hasta 2MB.',
    roleConsultant: 'Consultor',
    roleClient: 'Cliente',
    lgpdSectionTitle: 'Privacidad y datos (LGPD)',
    exportButton: 'Exportar mis datos',
    exportErrorToast: 'No se pudieron exportar los datos.',
    deleteButton: 'Solicitar eliminación de la cuenta',
    deleteConfirm:
      'Esto borra nombre, profesión, teléfono y foto de tu perfil y abre una solicitud de eliminación de cuenta. Tu correo permanece hasta que el cierre sea procesado. ¿Confirmar?',
    deleteRequestedToast: 'Solicitud enviada. Tus datos personales fueron eliminados del perfil.',
    deleteErrorToast: 'No se pudo enviar la solicitud.',
    deletePendingNotice: (date) => `Solicitud de eliminación enviada el ${date}. En proceso.`,
  },
}
