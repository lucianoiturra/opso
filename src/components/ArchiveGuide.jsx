import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const STAGES = [
  ["00", "Administrativo", "Planificación, reuniones, estadísticas, manuales"],
  ["01", "Encuentro de líderes", "Reunión previa del equipo"],
  ["02", "Gira", "Gira de promoción"],
  ["03", "Censo", "Censo / relevamiento previo"],
  ["04", "Lanzamiento", "Lanzamiento de la campaña"],
  ["05", "OPSOTON", "Evento OPSOTON"],
  ["06", "Operativo", "El OPSO en terreno (actividad principal)"],
  ["07", "Recuento", "Recuento, encuentro de voluntarios"],
  ["08", "Documental", "Documental, revista, recuento audiovisual"],
  ["09", "Campaña Donaciones", "Material de donaciones"],
  ["10", "Diseño y Merchandising", "Poleras, pendón, afiches, gráficas, reels"],
  ["11", "Recursos / Material histórico", "Logos, recursos, material de años anteriores"],
  ["99", "Sin clasificar", "Material por revisar"],
];

const YEARS = [
  {
    title: "OPSO 2020",
    stages: [["05 OPSOTON", "Fotos/ (Originales + Editadas), Videos/"]],
  },
  {
    title: "OPSO 2022",
    stages: [
      ["04 Lanzamiento", "Fotos/Editadas"],
      ["05 OPSOTON", "Fotos/"],
    ],
  },
  {
    title: "OPSO 2023 - Apiao",
    stages: [
      ["06 Operativo", "Fotos OPSO 2023, material capturado (cámaras), registro voluntarios, videos"],
      ["07 Recuento", "Fotos Recuento, videos entrevistas (material y finales)"],
      ["08 Revista", "Revista"],
    ],
  },
  {
    title: "OPSO 2024 - Huapi Abtao",
    stages: [
      ["03 Censo", "Fotos Censo, Originales"],
      ["04 Lanzamiento", "Fotos"],
      ["05 OPSOTON", "Fotos"],
      ["06 Operativo", "Material registrado"],
      ["07 Recuento", "Encuentro de voluntarios, Fotos Recuento, Imprimir, Video"],
      ["09 Campaña Donaciones", "Donaciones, Testimonio 1"],
      ["10 Diseño y Merchandising", "Manual informativo, Polera, Pendón"],
    ],
  },
  {
    title: "OPSO 2025 - 30 años",
    stages: [
      ["00 Administrativo", ""],
      ["01 Encuentro de líderes", "Fotos, Videos"],
      ["02 Gira", "Gira Ñuñoa, Gira Porvenir"],
      ["03 Censo", "Grabaciones, preview videos"],
      ["04 Lanzamiento", "Afiches, Imprimir, Programa Lanzamiento, proyectos Premiere"],
      ["05 OPSOTON", "Material para OPSOTON 04.01.2025"],
      ["06 Operativo", "Grabaciones OPERATIVO, grabación Alen reunión"],
      [
        "07 Recuento",
        "Afiches, Fotos Recuento, Galvano, Promoción, Recuerdo, Reel Música, Sorteo Polera, Videos",
      ],
      ["08 Documental", "Documental Música, OMF Más allá del horizonte, Timelapse, proyectos Premiere"],
      ["09 Campaña Donaciones", "Videos"],
      ["10 Diseño y Merchandising", "Diseños sueltos 2025, OPSO Promo, Polera OPSO 2025"],
    ],
  },
  {
    title: "OPSO 2026 - SJDLC (en curso)",
    stages: [
      ["09 Campaña Donaciones", "Carruseles (Alimentos, Lentes, Harina, Baño), Acopio"],
      ["10 Diseño y Merchandising", "Diseños 2026, Gráficas Canciones, Impresión, Promo Poleras, Reel"],
      ["11 Recursos", "Material SJDLC años anteriores, recursos (logos, plantillas, históricos)"],
    ],
  },
];

const TRANSVERSAL = [
  "00 Transversal/ - Material institucional no atado a un año: video promocional, video 30 años, estadísticas generales, QR web, web HTML, día del voluntariado, audio donaciones, acta directiva.",
  "Fotos Stock OPSO/ - Banco de imágenes fuera del esquema por año.",
  "RRSS/ - Material de redes sociales fuera del esquema por año.",
  "Download 2026-02-16...zip (9,2 GB) - Sin clasificar; pendiente de revisar.",
];

function ArchiveModal({ onClose }) {
  return createPortal(
    <div className="archive-modal-backdrop" onMouseDown={onClose}>
      <div
        className="archive-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-guide-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="archive-modal-head">
          <div>
            <p className="archive-guide-kicker">Índice del archivo</p>
            <h2 id="archive-guide-heading">Cómo está ordenado el material</h2>
          </div>
          <button type="button" className="archive-modal-close" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="archive-guide-body">
          <p className="archive-guide-intro">
            El archivo audiovisual e institucional de OPSO está organizado por año. Cada año usa
            la misma plantilla canónica de etapas, aunque solo aparecen las etapas que tuvo.
            Dentro de cada etapa, los archivos sueltos se agrupan por tipo: Fotos, Videos, Audio,
            Diseños y Documentos. Las subcarpetas de trabajo se conservan.
          </p>

          <div className="archive-guide-block">
            <h3>Plantilla canónica de etapas</h3>
            <div className="stage-table" role="table" aria-label="Plantilla canónica de etapas">
              {STAGES.map(([number, name, description]) => (
                <div className="stage-row" role="row" key={number}>
                  <span className="stage-number" role="cell">
                    {number}
                  </span>
                  <span className="stage-name" role="cell">
                    {name}
                  </span>
                  <span className="stage-description" role="cell">
                    {description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="archive-guide-block">
            <h3>Contenido por año</h3>
            <div className="year-grid">
              {YEARS.map((year) => (
                <article className="year-card" key={year.title}>
                  <h4>{year.title}</h4>
                  <ul>
                    {year.stages.map(([stage, content]) => (
                      <li key={`${year.title}-${stage}`}>
                        <strong>{stage}</strong>
                        {content ? ` - ${content}` : ""}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <div className="archive-guide-block">
            <h3>Material transversal</h3>
            <ul className="transversal-list">
              {TRANSVERSAL.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ArchiveGuide() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("modal-open");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  return (
    <>
      <section className="panel archive-guide-panel">
        <div className="archive-guide-summary">
          <span>
            <span className="archive-guide-kicker">Índice del archivo</span>
            <span className="archive-guide-title">Cómo está ordenado el material</span>
          </span>
          <button type="button" className="archive-guide-toggle" onClick={() => setIsOpen(true)}>
            Ver detalle
          </button>
        </div>
      </section>
      {isOpen ? <ArchiveModal onClose={() => setIsOpen(false)} /> : null}
    </>
  );
}
