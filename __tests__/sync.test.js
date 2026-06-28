import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FOLDER_MIME } from "../sync/classify.js";
import {
  buildIndex,
  inferYear,
  walk,
  writeIndexAtomic,
} from "../sync/sync.js";

describe("inferYear", () => {
  it("prefers a 4-digit year in the path", () => {
    expect(inferYear("OPSO / 2024 / Cantos", "2019-01-01T00:00:00Z")).toBe(2024);
  });

  it("falls back to modifiedTime year", () => {
    expect(inferYear("OPSO / Cantos", "2019-06-01T00:00:00Z")).toBe(2019);
  });

  it("returns null when neither is present", () => {
    expect(inferYear("OPSO / Cantos")).toBeNull();
  });

  it("ignores non-year 4-digit tokens", () => {
    expect(inferYear("OPSO / 9999 / x")).toBeNull();
  });
});

describe("walk", () => {
  it("traverses folders depth-first and builds paths, years, folder count", async () => {
    const tree = {
      ROOT: [
        { id: "F2024", name: "2024", mimeType: FOLDER_MIME },
        { id: "IMG", name: "Logo.png", mimeType: "image/png", size: "10" },
      ],
      F2024: [
        {
          id: "PPT",
          name: "Canto.pptx",
          mimeType: "application/octet-stream",
          size: "20",
          modifiedTime: "2024-05-01T00:00:00Z",
        },
      ],
    };

    const listChildrenImpl = async (folderId) => tree[folderId] ?? [];
    const result = await walk("ROOT", "OPSO", { listChildrenImpl });

    expect(result.folderCount).toBe(2);
    expect(result.items).toEqual([
      {
        id: "PPT",
        name: "Canto.pptx",
        path: "OPSO / 2024",
        mimeType: "application/octet-stream",
        type: "presentacion",
        size: 20,
        modifiedTime: "2024-05-01T00:00:00Z",
        year: 2024,
        downloadUrl: "https://drive.google.com/uc?export=download&id=PPT",
        viewUrl: "https://drive.google.com/file/d/PPT/view",
      },
      {
        id: "IMG",
        name: "Logo.png",
        path: "OPSO",
        mimeType: "image/png",
        type: "imagen",
        size: 10,
        modifiedTime: undefined,
        year: null,
        downloadUrl: "https://drive.google.com/uc?export=download&id=IMG",
        viewUrl: "https://drive.google.com/file/d/IMG/view",
      },
    ]);
  });
});

describe("buildIndex", () => {
  it("produces meta and items", () => {
    const index = buildIndex({
      items: [{ id: "1" }],
      folderCount: 3,
    });

    expect(index.items).toEqual([{ id: "1" }]);
    expect(index.meta.fileCount).toBe(1);
    expect(index.meta.folderCount).toBe(3);
    expect(new Date(index.meta.generatedAt).toISOString()).toBe(index.meta.generatedAt);
  });
});

describe("writeIndexAtomic", () => {
  it("writes to a temp file and renames into place", async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "indice-opso-"));
    const filePath = path.join(tempDir, "index.json");
    const payload = { meta: { fileCount: 1 }, items: [{ id: "1" }] };

    await writeIndexAtomic(filePath, payload);

    expect(JSON.parse(fs.readFileSync(filePath, "utf8"))).toEqual(payload);
    expect(fs.existsSync(`${filePath}.tmp`)).toBe(false);
  });
});
