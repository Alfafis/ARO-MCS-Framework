import type { Lang } from './LangContext'

export const perfilT: Record<Lang, {
  headerTitle:      string
  headerSubtitle:   string
  photoChange:      string
  photoRemove:      string
  photoHint:        string
  labelName:        string
  labelProfession:  string
  labelPhone:       string
  labelEmail:       string
  labelRole:        string
  placeholderName:       string
  placeholderProfession: string
  placeholderPhone:      string
  save:             string
  saving:           string
  savedToast:       string
  saveErrorToast:   string
  photoUploadErrorToast: string
  photoRemoveErrorToast: string
  photoTypeError:   string
  photoSizeError:   string
  roleConsultant:   string
  roleClient:       string
}> = {
  'pt-BR': {
    headerTitle:      'Meu perfil',
    headerSubtitle:   'Dados da sua conta — visíveis só para você.',
    photoChange:      'Trocar foto',
    photoRemove:      'Remover foto',
    photoHint:        'JPG ou PNG, até 2MB. Ou arraste a imagem sobre o círculo.',
    labelName:        'Nome',
    labelProfession:  'Profissão',
    labelPhone:       'Telefone',
    labelEmail:       'E-mail',
    labelRole:        'Papel',
    placeholderName:       'Seu nome completo',
    placeholderProfession: 'Ex.: Engenheiro de Minas',
    placeholderPhone:      '+55 11 90000-0000',
    save:             'Salvar',
    saving:           'Salvando…',
    savedToast:       'Perfil atualizado.',
    saveErrorToast:   'Não foi possível salvar o perfil.',
    photoUploadErrorToast: 'Não foi possível enviar a foto.',
    photoRemoveErrorToast: 'Não foi possível remover a foto.',
    photoTypeError:   'Envie um arquivo de imagem (JPG, PNG…).',
    photoSizeError:   'A imagem deve ter até 2MB.',
    roleConsultant:   'Consultor',
    roleClient:       'Cliente',
  },
  'en': {
    headerTitle:      'My profile',
    headerSubtitle:   'Your account data — visible only to you.',
    photoChange:      'Change photo',
    photoRemove:      'Remove photo',
    photoHint:        'JPG or PNG, up to 2MB. Or drag the image onto the circle.',
    labelName:        'Name',
    labelProfession:  'Profession',
    labelPhone:       'Phone',
    labelEmail:       'Email',
    labelRole:        'Role',
    placeholderName:       'Your full name',
    placeholderProfession: 'e.g. Mining Engineer',
    placeholderPhone:      '+1 555 000-0000',
    save:             'Save',
    saving:           'Saving…',
    savedToast:       'Profile updated.',
    saveErrorToast:   'Could not save the profile.',
    photoUploadErrorToast: 'Could not upload the photo.',
    photoRemoveErrorToast: 'Could not remove the photo.',
    photoTypeError:   'Upload an image file (JPG, PNG…).',
    photoSizeError:   'The image must be up to 2MB.',
    roleConsultant:   'Consultant',
    roleClient:       'Client',
  },
  'es': {
    headerTitle:      'Mi perfil',
    headerSubtitle:   'Datos de tu cuenta — visibles solo para ti.',
    photoChange:      'Cambiar foto',
    photoRemove:      'Quitar foto',
    photoHint:        'JPG o PNG, hasta 2MB. O arrastra la imagen sobre el círculo.',
    labelName:        'Nombre',
    labelProfession:  'Profesión',
    labelPhone:       'Teléfono',
    labelEmail:       'Correo electrónico',
    labelRole:        'Rol',
    placeholderName:       'Tu nombre completo',
    placeholderProfession: 'Ej.: Ingeniero de Minas',
    placeholderPhone:      '+55 11 90000-0000',
    save:             'Guardar',
    saving:           'Guardando…',
    savedToast:       'Perfil actualizado.',
    saveErrorToast:   'No se pudo guardar el perfil.',
    photoUploadErrorToast: 'No se pudo subir la foto.',
    photoRemoveErrorToast: 'No se pudo quitar la foto.',
    photoTypeError:   'Sube un archivo de imagen (JPG, PNG…).',
    photoSizeError:   'La imagen debe tener hasta 2MB.',
    roleConsultant:   'Consultor',
    roleClient:       'Cliente',
  },
}
