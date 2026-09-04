import type { Lang } from './LangContext'

export const configuracoesPlataformaT: Record<
  Lang,
  {
    headerTitle: string
    headerSubtitle: string
    sectionLogos: string
    labelLogoIcone: string
    hintLogoIcone: string
    labelLogoCompleto: string
    hintLogoCompleto: string
    sectionCor: string
    labelCor: string
    hintCor: string
    sectionFundo: string
    labelFundoAtivo: string
    hintFundoAtivo: string
    labelFundoImagem: string
    hintFundoImagem: string
    change: string
    remove: string
    save: string
    saving: string
    savedToast: string
    saveErrorToast: string
    uploadTypeError: string
    uploadSizeError: string
    uploadErrorToast: string
  }
> = {
  'pt-BR': {
    headerTitle: 'Configurações da plataforma',
    headerSubtitle: 'Logo, cor e fundo — vale pra toda a plataforma, inclusive o Portal do Cliente.',
    sectionLogos: 'Logo',
    labelLogoIcone: 'Ícone (menu lateral, tela de carregamento)',
    hintLogoIcone: 'PNG com fundo transparente, quadrado, até 2MB.',
    labelLogoCompleto: 'Marca completa (login, cabeçalho do relatório)',
    hintLogoCompleto: 'PNG com fundo transparente, até 2MB.',
    sectionCor: 'Cor primária',
    labelCor: 'Cor',
    hintCor: 'Usada em botões, links e destaques. Os tons mais claro/escuro são calculados automaticamente.',
    sectionFundo: 'Fundo',
    labelFundoAtivo: 'Mostrar textura de fundo',
    hintFundoAtivo: 'Desative pra usar fundo liso.',
    labelFundoImagem: 'Imagem de fundo',
    hintFundoImagem: 'PNG ou JPG, até 4MB.',
    change: 'Trocar',
    remove: 'Remover',
    save: 'Salvar',
    saving: 'Salvando…',
    savedToast: 'Configurações salvas.',
    saveErrorToast: 'Não foi possível salvar.',
    uploadTypeError: 'Envie um arquivo de imagem (PNG, JPG…).',
    uploadSizeError: 'Arquivo excede o tamanho máximo.',
    uploadErrorToast: 'Não foi possível enviar o arquivo.',
  },
  en: {
    headerTitle: 'Platform settings',
    headerSubtitle: 'Logo, color and background — applies to the whole platform, including the Client Portal.',
    sectionLogos: 'Logo',
    labelLogoIcone: 'Icon (sidebar, loading screen)',
    hintLogoIcone: 'PNG with transparent background, square, up to 2MB.',
    labelLogoCompleto: 'Full mark (login, report header)',
    hintLogoCompleto: 'PNG with transparent background, up to 2MB.',
    sectionCor: 'Primary color',
    labelCor: 'Color',
    hintCor: 'Used in buttons, links and highlights. Lighter/darker tones are computed automatically.',
    sectionFundo: 'Background',
    labelFundoAtivo: 'Show background texture',
    hintFundoAtivo: 'Turn off for a flat background.',
    labelFundoImagem: 'Background image',
    hintFundoImagem: 'PNG or JPG, up to 4MB.',
    change: 'Change',
    remove: 'Remove',
    save: 'Save',
    saving: 'Saving…',
    savedToast: 'Settings saved.',
    saveErrorToast: 'Could not save.',
    uploadTypeError: 'Upload an image file (PNG, JPG…).',
    uploadSizeError: 'File exceeds the maximum size.',
    uploadErrorToast: 'Could not upload the file.',
  },
  es: {
    headerTitle: 'Configuración de la plataforma',
    headerSubtitle: 'Logo, color y fondo — aplica a toda la plataforma, incluido el Portal del Cliente.',
    sectionLogos: 'Logo',
    labelLogoIcone: 'Ícono (menú lateral, pantalla de carga)',
    hintLogoIcone: 'PNG con fondo transparente, cuadrado, hasta 2MB.',
    labelLogoCompleto: 'Marca completa (login, encabezado del informe)',
    hintLogoCompleto: 'PNG con fondo transparente, hasta 2MB.',
    sectionCor: 'Color primario',
    labelCor: 'Color',
    hintCor: 'Usado en botones, enlaces y destacados. Los tonos más claro/oscuro se calculan automáticamente.',
    sectionFundo: 'Fondo',
    labelFundoAtivo: 'Mostrar textura de fondo',
    hintFundoAtivo: 'Desactiva para usar fondo liso.',
    labelFundoImagem: 'Imagen de fondo',
    hintFundoImagem: 'PNG o JPG, hasta 4MB.',
    change: 'Cambiar',
    remove: 'Quitar',
    save: 'Guardar',
    saving: 'Guardando…',
    savedToast: 'Configuración guardada.',
    saveErrorToast: 'No se pudo guardar.',
    uploadTypeError: 'Sube un archivo de imagen (PNG, JPG…).',
    uploadSizeError: 'El archivo excede el tamaño máximo.',
    uploadErrorToast: 'No se pudo subir el archivo.',
  },
}
