const CHIPS = [
  { key: null, label: "Todos" },
  { key: "presentacion", label: "PPT" },
  { key: "imagen", label: "Imagenes" },
  { key: "audio", label: "Audio" },
  { key: "video", label: "Video" },
  { key: "pdf", label: "PDF" },
  { key: "documento", label: "Documentos" },
];

export default function TypeChips({ active, onPick }) {
  return (
    <div className="chips" role="group" aria-label="Filtrar por tipo de archivo">
      {CHIPS.map((chip) => (
        <button
          key={chip.label}
          type="button"
          className={`chip${active === chip.key ? " active" : ""}`}
          onClick={() => onPick(chip.key)}
          aria-pressed={active === chip.key}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
