export default function SearchBar({ value, onChange }) {
  return (
    <label className="search-shell">
      <span className="search-label">Buscador</span>
      <input
        className="searchbar"
        type="search"
        autoFocus
        placeholder="Busca material... ej: ppt canto la fuerza que nos mueve"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
