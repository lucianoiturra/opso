import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { FOLDER_MIME } from "./classify.js";
import { buildFolderViewUrl, listChildren, toItem } from "./drive.js";

const YEAR_PATTERN = /\b(19\d{2}|20\d{2}|2100)\b/;

export function inferYear(itemPath, modifiedTime) {
  const match = itemPath.match(YEAR_PATTERN);
  if (match) {
    return Number(match[1]);
  }

  if (modifiedTime) {
    const year = new Date(modifiedTime).getUTCFullYear();
    if (Number.isFinite(year) && year >= 1900 && year <= 2100) {
      return year;
    }
  }

  return null;
}

export async function walk(rootId, rootName, { listChildrenImpl }) {
  const items = [];
  const folders = [];
  let folderCount = 0;

  async function visit(folderId, folderName, folderPath, parentPath) {
    folderCount += 1;
    folders.push({
      id: folderId,
      name: folderName,
      path: folderPath,
      parentPath,
      viewUrl: buildFolderViewUrl(folderId),
    });

    const children = await listChildrenImpl(folderId);

    for (const child of children) {
      if (child.mimeType === FOLDER_MIME) {
        await visit(child.id, child.name, `${folderPath} / ${child.name}`, folderPath);
        continue;
      }

      const item = toItem(child, folderPath);
      item.year = inferYear(folderPath, child.modifiedTime);
      items.push(item);
    }
  }

  await visit(rootId, rootName, rootName, null);
  return { items, folders, folderCount };
}

export function buildIndex({ items, folders, folderCount }) {
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      fileCount: items.length,
      folderCount,
    },
    folders,
    items,
  };
}

export async function writeIndexAtomic(filePath, indexObject) {
  const tempPath = `${filePath}.tmp`;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(tempPath, JSON.stringify(indexObject, null, 2));
  await fs.rename(tempPath, filePath);
}

export async function main() {
  dotenv.config();

  const apiKey = process.env.DRIVE_API_KEY;
  const rootId = process.env.ROOT_FOLDER_ID;
  const rootName = process.env.ROOT_FOLDER_NAME || "OPSO";

  if (!apiKey || !rootId) {
    console.error("Faltan DRIVE_API_KEY o ROOT_FOLDER_ID en .env");
    process.exit(1);
  }

  const listChildrenImpl = (folderId) => listChildren(folderId, { apiKey });
  const { items, folders, folderCount } = await walk(rootId, rootName, { listChildrenImpl });
  const index = buildIndex({ items, folders, folderCount });
  const outputPath = path.resolve("public/index.json");

  await writeIndexAtomic(outputPath, index);

  const bytes = Buffer.byteLength(JSON.stringify(index));
  const megabytes = (bytes / 1024 / 1024).toFixed(1);
  console.log(`${items.length} archivos en ${folderCount} carpetas, índice de ${megabytes} MB`);
}

const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : null;
const currentFile = fileURLToPath(import.meta.url);

if (entryFile === currentFile) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
