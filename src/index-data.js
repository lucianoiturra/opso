function sortByName(entries) {
  return entries.slice().sort((left, right) => left.name.localeCompare(right.name, "es"));
}

export function buildItemFullPath(item) {
  return `${item.path} / ${item.name}`;
}

export function buildLibrary(index) {
  const folders = sortByName(index.folders ?? []);
  const items = sortByName(index.items ?? []);

  const folderByPath = new Map(folders.map((folder) => [folder.path, folder]));
  const folderById = new Map(folders.map((folder) => [folder.id, folder]));
  const itemById = new Map(items.map((item) => [item.id, item]));
  const itemByFullPath = new Map(items.map((item) => [buildItemFullPath(item), item]));

  const foldersByParentPath = new Map();
  for (const folder of folders) {
    const key = folder.parentPath ?? "__root__";
    if (!foldersByParentPath.has(key)) {
      foldersByParentPath.set(key, []);
    }

    foldersByParentPath.get(key).push(folder);
  }

  const itemsByFolderPath = new Map();
  for (const item of items) {
    if (!itemsByFolderPath.has(item.path)) {
      itemsByFolderPath.set(item.path, []);
    }

    itemsByFolderPath.get(item.path).push(item);
  }

  return {
    rootFolder: folders.find((folder) => folder.parentPath === null) ?? null,
    folderById,
    folderByPath,
    foldersByParentPath,
    itemById,
    itemByFullPath,
    itemsByFolderPath,
  };
}

export function getFolderContents(library, folderPath) {
  return {
    folders: library.foldersByParentPath.get(folderPath ?? "__root__") ?? [],
    items: library.itemsByFolderPath.get(folderPath) ?? [],
  };
}

function resolveFileShortcut(shortcut, library) {
  const item =
    (shortcut.id ? library.itemById.get(shortcut.id) : null) ??
    (shortcut.rutaCompleta ? library.itemByFullPath.get(shortcut.rutaCompleta) : null);

  if (!item) {
    return null;
  }

  return {
    ...shortcut,
    icono: shortcut.icono ?? item.type,
    tipo: "archivo",
    recurso: item,
  };
}

function resolveFolderShortcut(shortcut, library) {
  const folder =
    (shortcut.id ? library.folderById.get(shortcut.id) : null) ??
    (shortcut.ruta ? library.folderByPath.get(shortcut.ruta) : null);

  if (!folder) {
    return null;
  }

  return {
    ...shortcut,
    icono: shortcut.icono ?? "otro",
    tipo: "carpeta",
    recurso: folder,
  };
}

export function resolveShortcuts(shortcuts, index) {
  const library = buildLibrary(index);

  return shortcuts
    .map((shortcut) => {
      if (shortcut.tipo === "busqueda" || shortcut.tipo === "link") {
        return shortcut;
      }

      if (shortcut.tipo === "archivo") {
        return resolveFileShortcut(shortcut, library);
      }

      if (shortcut.tipo === "carpeta") {
        return resolveFolderShortcut(shortcut, library);
      }

      return null;
    })
    .filter(Boolean);
}
