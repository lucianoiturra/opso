const TYPE_BADGE = {
  presentacion: "PPT",
  imagen: "IMG",
  audio: "AUD",
  video: "VID",
  pdf: "PDF",
  documento: "DOC",
  otro: "OTR",
};

export default function ShortcutCard({ atajo, onSearch }) {
  const badge = TYPE_BADGE[atajo.icono] ?? TYPE_BADGE.otro;

  if (atajo.tipo === "link") {
    return (
      <a className="shortcut-card" href={atajo.valor} target="_blank" rel="noreferrer">
        <span className="shortcut-badge">{badge}</span>
        <span className="shortcut-text">{atajo.etiqueta}</span>
      </a>
    );
  }

  return (
    <button type="button" className="shortcut-card" onClick={() => onSearch(atajo.valor)}>
      <span className="shortcut-badge">{badge}</span>
      <span className="shortcut-text">{atajo.etiqueta}</span>
    </button>
  );
}
