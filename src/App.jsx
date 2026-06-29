import { useDeferredValue, useEffect, useMemo, useState } from "react";
import atajos from "../atajos.json";
import FolderCard from "./components/FolderCard.jsx";
import ResultCard from "./components/ResultCard.jsx";
import SearchBar from "./components/SearchBar.jsx";
import ShortcutCard from "./components/ShortcutCard.jsx";
import TypeChips from "./components/TypeChips.jsx";
import { buildLibrary, getFolderContents, resolveShortcuts } from "./index-data.js";
import { search } from "./search.js";

const EMPTY_INDEX = { meta: {}, folders: [], items: [] };

function formatDate(value) {
  return new Date(value).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function App() {
  const [index, setIndex] = useState(EMPTY_INDEX);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [activeFolderPath, setActiveFolderPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let cancelled = false;

    fetch("/index.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("No se pudo cargar el indice.");
        }

        return response.json();
      })
      .then((data) => {
        if (cancelled) {
          return;
        }

        setIndex(data);
        setActiveFolderPath((data.folders ?? []).find((folder) => folder.parentPath === null)?.path ?? null);
        setLoadError(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setIndex(EMPTY_INDEX);
        setActiveFolderPath(null);
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const library = useMemo(() => buildLibrary(index), [index]);
  const resolvedShortcuts = useMemo(() => resolveShortcuts(atajos, index), [index]);
  const results = useMemo(() => search(index.items, deferredQuery, { typeFilter }), [index.items, deferredQuery, typeFilter]);
  const searching = query.trim() !== "" || typeFilter !== null;
  const currentFolderPath = activeFolderPath ?? library.rootFolder?.path ?? null;
  const currentFolder = currentFolderPath ? library.folderByPath.get(currentFolderPath) ?? null : null;
  const folderContents = currentFolderPath
    ? getFolderContents(library, currentFolderPath)
    : { folders: [], items: [] };
  const breadcrumbs = currentFolder
    ? currentFolder.path.split(" / ").map((segment, indexValue, parts) => ({
        label: segment,
        path: parts.slice(0, indexValue + 1).join(" / "),
      }))
    : [];

  function handleShortcutSearch(nextQuery) {
    setActiveFolderPath(library.rootFolder?.path ?? null);
    setTypeFilter(null);
    setQuery(nextQuery);
  }

  function handleOpenFolder(nextFolderPath) {
    setQuery("");
    setTypeFilter(null);
    setActiveFolderPath(nextFolderPath);
  }

  function handleReturnToRoot() {
    setActiveFolderPath(library.rootFolder?.path ?? null);
  }

  return (
    <div className="page-shell">
      <div className="page-glow page-glow-left" />
      <div className="page-glow page-glow-right" />

      <div className="app">
        <header className="hero">
          <p className="eyebrow">Indice publico</p>
          <h1>Material OPSO</h1>
          <p className="hero-copy">
            Busca presentaciones, imagenes, audios, documentos y archivos historicos del Drive
            publico de OPSO desde una sola pagina.
          </p>

          <SearchBar value={query} onChange={setQuery} />
          <TypeChips active={typeFilter} onPick={setTypeFilter} />

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">{index.meta.fileCount ?? 0}</span>
              <span className="stat-label">archivos indexados</span>
            </div>
            <div className="stat">
              <span className="stat-value">{index.meta.folderCount ?? 0}</span>
              <span className="stat-label">carpetas recorridas</span>
            </div>
          </div>
        </header>

        <main className="content">
          {!searching ? (
            <section className="panel">
              <div className="section-head">
                <h2>Atajos frecuentes</h2>
                <p>Tarjetas curadas para lo que mas se pide.</p>
              </div>

              <div className="shortcuts-grid">
                {resolvedShortcuts.map((atajo) => (
                  <ShortcutCard
                    key={atajo.etiqueta}
                    atajo={atajo}
                    onOpenFolder={handleOpenFolder}
                    onSearch={handleShortcutSearch}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {!searching ? (
            <section className="panel">
              <div className="section-head">
                <h2>Explorar carpetas</h2>
                <p>Navega el indice como si recorrieras el Drive por secciones.</p>
              </div>

              {currentFolder ? (
                <>
                  <div className="browser-toolbar">
                    <div className="breadcrumbs">
                      {breadcrumbs.map((crumb) => (
                        <button
                          key={crumb.path}
                          type="button"
                          className={`breadcrumb${crumb.path === currentFolder.path ? " active" : ""}`}
                          onClick={() => handleOpenFolder(crumb.path)}
                        >
                          {crumb.label}
                        </button>
                      ))}
                    </div>

                    {currentFolder.path !== library.rootFolder?.path ? (
                      <button type="button" className="btn btn-secondary" onClick={handleReturnToRoot}>
                        Volver a la raiz
                      </button>
                    ) : null}
                  </div>

                  <div className="browser-summary">
                    <p className="browser-summary-name">{currentFolder.name}</p>
                    <p className="browser-summary-meta">
                      {folderContents.folders.length} subcarpeta
                      {folderContents.folders.length === 1 ? "" : "s"} · {folderContents.items.length} archivo
                      {folderContents.items.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  {folderContents.folders.length > 0 ? (
                    <div className="folder-grid">
                      {folderContents.folders.map((folder) => (
                        <FolderCard key={folder.id} folder={folder} onOpen={handleOpenFolder} />
                      ))}
                    </div>
                  ) : null}

                  {folderContents.items.length > 0 ? (
                    <div className="results-list">
                      {folderContents.items.map((item) => (
                        <ResultCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : null}

                  {folderContents.folders.length === 0 && folderContents.items.length === 0 ? (
                    <div className="empty-state">
                      <p>Esta carpeta no tiene contenido indexado todavia.</p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="empty-state">
                  <p>Este indice no trae carpetas navegables todavia. Vuelve a ejecutar el sync.</p>
                </div>
              )}
            </section>
          ) : (
            <section className="panel">
              <div className="section-head">
                <h2>Resultados</h2>
                <p>
                  {results.length === 0
                    ? "No encontramos coincidencias con esa combinacion."
                    : `${results.length} resultado${results.length === 1 ? "" : "s"} encontrado${
                        results.length === 1 ? "" : "s"
                      }.`}
                </p>
              </div>

              {results.length === 0 ? (
                <div className="empty-state">
                  <p>Prueba con menos palabras, otro anio o un tipo distinto.</p>
                </div>
              ) : (
                <div className="results-list">
                  {results.map((item) => (
                    <ResultCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>
          )}

          {loadError ? (
            <section className="notice">
              No pudimos cargar <code>index.json</code>. Revisa que el archivo exista en
              <code>public/</code> y vuelve a generar el indice si hace falta.
            </section>
          ) : null}

          {loading ? <section className="notice">Cargando indice...</section> : null}
        </main>

        <footer className="footer">
          {index.meta.generatedAt && index.meta.generatedAt !== "1970-01-01T00:00:00Z"
            ? `Indice actualizado el ${formatDate(index.meta.generatedAt)}`
            : "Indice aun no generado"}
        </footer>
      </div>
    </div>
  );
}
