export default function FolderCard({ folder, onOpen }) {
  return (
    <article className="folder-card">
      <div className="folder-card-main">
        <p className="folder-card-label">Carpeta</p>
        <p className="folder-card-name" title={folder.name}>{folder.name}</p>
        <p className="folder-card-path" title={folder.path}>{folder.path}</p>
      </div>

      <div className="folder-card-actions">
        <button type="button" className="btn btn-primary" onClick={() => onOpen(folder.path)}>
          Abrir
        </button>
        <a className="btn btn-secondary" href={folder.viewUrl} target="_blank" rel="noreferrer">
          Ver en Drive
        </a>
      </div>
    </article>
  );
}
