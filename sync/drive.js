import { classify } from "./classify.js";

const DRIVE_FILES_API = "https://www.googleapis.com/drive/v3/files";

function isTransientStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function buildDownloadUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

export function buildViewUrl(id) {
  return `https://drive.google.com/file/d/${id}/view`;
}

export function buildFolderViewUrl(id) {
  return `https://drive.google.com/drive/folders/${id}`;
}

export function toItem(file, path) {
  return {
    id: file.id,
    name: file.name,
    path,
    mimeType: file.mimeType,
    type: classify(file.mimeType, file.name),
    size: file.size ? Number(file.size) : 0,
    modifiedTime: file.modifiedTime,
    downloadUrl: buildDownloadUrl(file.id),
    viewUrl: buildViewUrl(file.id),
  };
}

async function fetchPage(url, { fetchImpl, baseDelayMs, maxRetries, folderId }) {
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetchImpl(url);

    if (response.ok) {
      return response.json();
    }

    if (!isTransientStatus(response.status) || attempt >= maxRetries) {
      throw new Error(`Drive API error ${response.status} listing folder ${folderId}`);
    }

    await sleep(baseDelayMs * 2 ** attempt);
  }
}

export async function listChildren(folderId, options) {
  const {
    apiKey,
    fetchImpl = fetch,
    baseDelayMs = 500,
    maxRetries = 4,
  } = options;

  const children = [];
  let pageToken;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      key: apiKey,
      fields: "nextPageToken,files(id,name,mimeType,size,modifiedTime)",
      pageSize: "1000",
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const data = await fetchPage(`${DRIVE_FILES_API}?${params.toString()}`, {
      fetchImpl,
      baseDelayMs,
      maxRetries,
      folderId,
    });

    children.push(...(data.files ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return children;
}
