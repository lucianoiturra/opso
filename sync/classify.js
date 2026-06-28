export const FOLDER_MIME = "application/vnd.google-apps.folder";

const EXTENSION_TYPE = {
  ppt: "presentacion",
  pptx: "presentacion",
  odp: "presentacion",
  key: "presentacion",
  pdf: "pdf",
  png: "imagen",
  jpg: "imagen",
  jpeg: "imagen",
  gif: "imagen",
  webp: "imagen",
  svg: "imagen",
  bmp: "imagen",
  tif: "imagen",
  tiff: "imagen",
  psd: "imagen",
  ai: "imagen",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  flac: "audio",
  m4a: "audio",
  aac: "audio",
  mp4: "video",
  mov: "video",
  avi: "video",
  mkv: "video",
  wmv: "video",
  webm: "video",
  doc: "documento",
  docx: "documento",
  odt: "documento",
  txt: "documento",
  rtf: "documento",
  xls: "documento",
  xlsx: "documento",
  csv: "documento",
};

const GOOGLE_MIME_TYPE = {
  "application/vnd.google-apps.presentation": "presentacion",
  "application/vnd.google-apps.document": "documento",
  "application/vnd.google-apps.spreadsheet": "documento",
};

const KEYWORD_TYPE = {
  ppt: "presentacion",
  pptx: "presentacion",
  presentacion: "presentacion",
  presentaciones: "presentacion",
  diapositiva: "presentacion",
  diapositivas: "presentacion",
  pdf: "pdf",
  logo: "imagen",
  logos: "imagen",
  imagen: "imagen",
  imagenes: "imagen",
  foto: "imagen",
  fotos: "imagen",
  img: "imagen",
  audio: "audio",
  audios: "audio",
  cancion: "audio",
  canciones: "audio",
  pista: "audio",
  pistas: "audio",
  mp3: "audio",
  video: "video",
  videos: "video",
  clip: "video",
  clips: "video",
  documento: "documento",
  documentos: "documento",
  doc: "documento",
  word: "documento",
  excel: "documento",
};

function getExtension(name) {
  const index = name.lastIndexOf(".");
  return index === -1 ? "" : name.slice(index + 1).toLowerCase();
}

export function classify(mimeType, name) {
  if (mimeType && GOOGLE_MIME_TYPE[mimeType]) {
    return GOOGLE_MIME_TYPE[mimeType];
  }

  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (mimeType?.startsWith("image/")) {
    return "imagen";
  }

  if (mimeType?.startsWith("audio/")) {
    return "audio";
  }

  if (mimeType?.startsWith("video/")) {
    return "video";
  }

  const extensionType = EXTENSION_TYPE[getExtension(name ?? "")];
  return extensionType ?? "otro";
}

export function typeFromKeyword(word) {
  return KEYWORD_TYPE[word] ?? null;
}
