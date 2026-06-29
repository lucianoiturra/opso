import { describe, expect, it } from "vitest";
import {
  buildItemFullPath,
  buildLibrary,
  getFolderContents,
  resolveShortcuts,
} from "../src/index-data.js";

const index = {
  folders: [
    {
      id: "ROOT",
      name: "OPSO",
      path: "OPSO",
      parentPath: null,
      viewUrl: "https://drive.google.com/drive/folders/ROOT",
    },
    {
      id: "LOGOS",
      name: "Logos",
      path: "OPSO / Recursos / Logos",
      parentPath: "OPSO / Recursos",
      viewUrl: "https://drive.google.com/drive/folders/LOGOS",
    },
    {
      id: "RECURSOS",
      name: "Recursos",
      path: "OPSO / Recursos",
      parentPath: "OPSO",
      viewUrl: "https://drive.google.com/drive/folders/RECURSOS",
    },
  ],
  items: [
    {
      id: "1",
      name: "Logo nuevo.jpg",
      path: "OPSO / Recursos / Logos",
      type: "imagen",
      downloadUrl: "https://drive.google.com/uc?export=download&id=1",
      viewUrl: "https://drive.google.com/file/d/1/view",
    },
    {
      id: "2",
      name: "Cancionero.pdf",
      path: "OPSO / Recursos",
      type: "pdf",
      downloadUrl: "https://drive.google.com/uc?export=download&id=2",
      viewUrl: "https://drive.google.com/file/d/2/view",
    },
  ],
};

describe("buildItemFullPath", () => {
  it("joins folder path and file name", () => {
    expect(buildItemFullPath(index.items[0])).toBe("OPSO / Recursos / Logos / Logo nuevo.jpg");
  });
});

describe("buildLibrary", () => {
  it("indexes folders and items for navigation", () => {
    const library = buildLibrary(index);
    expect(library.rootFolder?.path).toBe("OPSO");
    expect(library.folderByPath.get("OPSO / Recursos")?.id).toBe("RECURSOS");
    expect(library.itemByFullPath.get("OPSO / Recursos / Logos / Logo nuevo.jpg")?.id).toBe("1");
  });
});

describe("getFolderContents", () => {
  it("returns subfolders and files for a folder path", () => {
    const library = buildLibrary(index);
    const rootContents = getFolderContents(library, "OPSO");
    const logosContents = getFolderContents(library, "OPSO / Recursos / Logos");

    expect(rootContents.folders.map((folder) => folder.name)).toEqual(["Recursos"]);
    expect(logosContents.items.map((item) => item.name)).toEqual(["Logo nuevo.jpg"]);
  });
});

describe("resolveShortcuts", () => {
  it("resolves file and folder shortcuts against the index", () => {
    const shortcuts = resolveShortcuts(
      [
        { etiqueta: "Logo destacado", tipo: "archivo", rutaCompleta: "OPSO / Recursos / Logos / Logo nuevo.jpg" },
        { etiqueta: "Banco de logos", tipo: "carpeta", ruta: "OPSO / Recursos / Logos" },
        { etiqueta: "PDF 2024", tipo: "busqueda", valor: "pdf 2024" },
      ],
      index,
    );

    expect(shortcuts[0]).toMatchObject({
      etiqueta: "Logo destacado",
      tipo: "archivo",
      recurso: { id: "1", name: "Logo nuevo.jpg" },
    });
    expect(shortcuts[1]).toMatchObject({
      etiqueta: "Banco de logos",
      tipo: "carpeta",
      recurso: { id: "LOGOS", path: "OPSO / Recursos / Logos" },
    });
    expect(shortcuts[2]).toEqual({ etiqueta: "PDF 2024", tipo: "busqueda", valor: "pdf 2024" });
  });

  it("drops unresolved shortcuts", () => {
    const shortcuts = resolveShortcuts([{ etiqueta: "No existe", tipo: "archivo", id: "X" }], index);
    expect(shortcuts).toEqual([]);
  });
});
