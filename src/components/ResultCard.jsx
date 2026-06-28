const TYPE_BADGE = {
  presentacion: "PPT",
  imagen: "IMG",
  audio: "AUD",
  video: "VID",
  pdf: "PDF",
  documento: "DOC",
  otro: "OTR",
};

function formatSize(bytes) {
  if (!bytes) {
    return "Tamano no informado";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function ResultCard({ item }) {
  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(item.downloadUrl);
    } catch {
      // Si el navegador bloquea el portapapeles, simplemente omitimos el feedback.
    }
  }

  return (
    <article className="result-card">
      <div className="result-badge">{TYPE_BADGE[item.type] ?? TYPE_BADGE.otro}</div>

      <div className="result-main">
        <p className="result-name">{item.name}</p>
        <p className="result-meta">
          {item.path}
          {item.year ? ` · ${item.year}` : ""}
          {` · ${formatSize(item.size)}`}
        </p>
      </div>

      <div className="result-actions">
        <a className="btn btn-primary" href={item.downloadUrl} target="_blank" rel="noreferrer">
          Descargar
        </a>
        <a className="btn btn-secondary" href={item.viewUrl} target="_blank" rel="noreferrer">
          Vista previa
        </a>
        <button type="button" className="btn btn-secondary" onClick={copyLink}>
          Copiar link
        </button>
      </div>
    </article>
  );
}
