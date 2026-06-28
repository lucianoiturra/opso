# Indice publico de material OPSO

Web publica estatica que indexa la carpeta publica de OPSO en Google Drive y permite
buscar material con tolerancia a typos, sin acentos y con filtro por tipo. No tiene
backend: la busqueda ocurre en el navegador sobre un `public/index.json` precalculado.

## Requisitos

- Node.js 18 o superior.
- Una carpeta de Google Drive compartida como "cualquier persona con el enlace".
- Una API key de Google Cloud con la Drive API habilitada.

## Configuracion inicial

1. En Google Cloud Console crea un proyecto y habilita **Google Drive API**.
2. Genera una **API key** de solo lectura.
3. Copia `.env.example` a `.env` y completa:
   - `DRIVE_API_KEY`: API key de Google.
   - `ROOT_FOLDER_ID`: ID de la carpeta raiz publica en Drive.
   - `ROOT_FOLDER_NAME`: nombre legible que se usara como prefijo de la ruta, por ejemplo `OPSO`.
4. Instala dependencias:

```bash
npm install
```

## Desarrollo

```bash
npm run dev
npm test
```

La app quedara disponible en `http://localhost:5173`.

## Actualizar el indice

```bash
npm run sync
git add public/index.json
git commit -m "chore: actualizar indice"
git push
```

El script recorre la carpeta publica, reconstruye el indice y escribe `public/index.json`
de forma atomica. Un deploy en Vercel tomara el nuevo archivo en el siguiente push.

## Atajos

Edita `atajos.json` a mano. Cada entrada puede ser:

- `{ "etiqueta", "icono", "tipo": "busqueda", "valor": "<consulta>" }`
- `{ "etiqueta", "icono", "tipo": "link", "valor": "<url>" }`

Iconos validos: `presentacion`, `imagen`, `audio`, `video`, `pdf`, `documento`, `otro`.

## Estructura principal

- `sync/classify.js`: clasificacion por mimeType, extension y palabras clave.
- `sync/drive.js`: cliente de Drive API con paginacion y reintentos.
- `sync/sync.js`: recorrido recursivo, inferencia de anio y generacion del indice.
- `src/search.js`: normalizacion, parseo de consulta y ranking de resultados.
- `src/App.jsx`: carga de `index.json`, filtros, atajos y resultados.

## Despliegue en Vercel

1. Sube este proyecto a GitHub.
2. En Vercel crea un proyecto nuevo e importa el repositorio.
3. Usa estos valores:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Cada push a la rama principal redespliega automaticamente.
