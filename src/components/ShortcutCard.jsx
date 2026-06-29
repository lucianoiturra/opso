const TYPE_BADGE = {
  presentacion: "PPT",
  imagen: "IMG",
  audio: "AUD",
  video: "VID",
  pdf: "PDF",
  documento: "DOC",
  otro: "OTR",
};

export default function ShortcutCard({ atajo, onOpenFolder, onSearch }) {
  const badge = TYPE_BADGE[atajo.icono] ?? TYPE_BADGE.otro;

  if (atajo.tipo === "link") {
    return (
      <a className="shortcut-card" href={atajo.valor} target="_blank" rel="noreferrer">
        <span className="shortcut-badge">{badge}</span>
        <span className="shortcut-text">{atajo.etiqueta}</span>
      </a>
    );
  }

  if (atajo.tipo === "archivo") {
    return (
      <a
        className="shortcut-card"
        href={atajo.recurso.downloadUrl}
        target="_blank"
        rel="noreferrer"
      >
        <span className="shortcut-badge">{badge}</span>
        <span className="shortcut-copy">
          <span className="shortcut-text">{atajo.etiqueta}</span>
          <span className="shortcut-meta">{atajo.recurso.name}</span>
        </span>
      </a>
    );
  }

  if (atajo.tipo === "carpeta") {
    return (
      <button
        type="button"
        className="shortcut-card"
        onClick={() => onOpenFolder?.(atajo.recurso.path)}
      >
        <span className="shortcut-badge">{badge}</span>
        <span className="shortcut-copy">
          <span className="shortcut-text">{atajo.etiqueta}</span>
          <span className="shortcut-meta">{atajo.recurso.path}</span>
        </span>
      </button>
    );
  }

  return (
    <button type="button" className="shortcut-card" onClick={() => onSearch(atajo.valor)}>
      <span className="shortcut-badge">{badge}</span>
      <span className="shortcut-copy">
        <span className="shortcut-text">{atajo.etiqueta}</span>
        <span className="shortcut-meta">Busca: {atajo.valor}</span>
      </span>
    </button>
  );
}
