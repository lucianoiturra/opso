const STAGES = [
  ["00", "Administrativo", "Planificacion, reuniones, estadisticas, manuales"],
  ["01", "Encuentro de lideres", "Reunion previa del equipo"],
  ["02", "Gira", "Gira de promocion"],
  ["03", "Censo", "Censo / relevamiento previo"],
  ["04", "Lanzamiento", "Lanzamiento de la campania"],
  ["05", "OPSOTON", "Evento OPSOTON"],
  ["06", "Operativo", "El OPSO en terreno (actividad principal)"],
  ["07", "Recuento", "Recuento, encuentro de voluntarios"],
  ["08", "Documental", "Documental, revista, recuento audiovisual"],
  ["09", "Campania Donaciones", "Material de donaciones"],
  ["10", "Diseno y Merchandising", "Poleras, pendon, afiches, graficas, reels"],
  ["11", "Recursos / Material historico", "Logos, recursos, material de anios anteriores"],
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
      ["06 Operativo", "Fotos OPSO 2023, material capturado (camaras), registro voluntarios, videos"],
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
      ["09 Campania Donaciones", "Donaciones, Testimonio 1"],
      ["10 Diseno y Merchandising", "Manual informativo, Polera, Pendon"],
    ],
  },
  {
    title: "OPSO 2025 - 30 anios",
    stages: [
      ["00 Administrativo", ""],
      ["01 Encuentro de lideres", "Fotos, Videos"],
      ["02 Gira", "Gira Nunoa, Gira Porvenir"],
      ["03 Censo", "Grabaciones, preview videos"],
      ["04 Lanzamiento", "Afiches, Imprimir, Programa Lanzamiento, proyectos Premiere"],
      ["05 OPSOTON", "Material para OPSOTON 04.01.2025"],
      ["06 Operativo", "Grabaciones OPERATIVO, grabacion Alen reunion"],
      [
        "07 Recuento",
        "Afiches, Fotos Recuento, Galvano, Promocion, Recuerdo, Reel Musica, Sorteo Polera, Videos",
      ],
      ["08 Documental", "Documental Musica, OMF Mas alla del horizonte, Timelapse, proyectos Premiere"],
      ["09 Campania Donaciones", "Videos"],
      ["10 Diseno y Merchandising", "Disenos sueltos 2025, OPSO Promo, Polera OPSO 2025"],
    ],
  },
  {
    title: "OPSO 2026 - SJDLC (en curso)",
    stages: [
      ["09 Campania Donaciones", "Carruseles (Alimentos, Lentes, Harina, Banio), Acopio"],
      ["10 Diseno y Merchandising", "Disenos 2026, Graficas Canciones, Impresion, Promo Poleras, Reel"],
      ["11 Recursos", "Material SJDLC anios anteriores, recursos (logos, plantillas, historicos)"],
    ],
  },
];

const TRANSVERSAL = [
  "00 Transversal/ - Material institucional no atado a un anio: video promocional, video 30 anios, estadisticas generales, QR web, web HTML, dia del voluntariado, audio donaciones, acta directiva.",
  "Fotos Stock OPSO/ - Banco de imagenes fuera del esquema por anio.",
  "RRSS/ - Material de redes sociales fuera del esquema por anio.",
  "Download 2026-02-16...zip (9,2 GB) - Sin clasificar; pendiente de revisar.",
];

export default function ArchiveGuide() {
  return (
    <section className="panel archive-guide-panel">
      <details className="archive-guide">
        <summary className="archive-guide-summary">
          <span>
            <span className="archive-guide-kicker">Indice del archivo</span>
            <span className="archive-guide-title">Como esta ordenado el material</span>
          </span>
          <span className="archive-guide-toggle" aria-hidden="true">
            Ver detalle
          </span>
        </summary>

        <div className="archive-guide-body">
          <p className="archive-guide-intro">
            El archivo audiovisual e institucional de OPSO esta organizado por anio. Cada anio
            usa la misma plantilla canonica de etapas, aunque solo aparecen las etapas que tuvo.
            Dentro de cada etapa, los archivos sueltos se agrupan por tipo: Fotos, Videos, Audio,
            Disenos y Documentos. Las subcarpetas de trabajo se conservan.
          </p>

          <div className="archive-guide-block">
            <h3>Plantilla canonica de etapas</h3>
            <div className="stage-table" role="table" aria-label="Plantilla canonica de etapas">
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
            <h3>Contenido por anio</h3>
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
      </details>
    </section>
  );
}
