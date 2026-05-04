import { Search, X } from 'lucide-react'
import useGisStore from '../../store/useGisStore'

export default function SearchBox() {
  const searchQuery = useGisStore((s) => s.searchQuery)
  const setSearchQuery = useGisStore((s) => s.setSearchQuery)

  return (
    <div className="search-box">
      <Search size={15} className="search-icon" />
      <input
        type="text"
        placeholder="Cari unit..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
        autoComplete="off"
        spellCheck="false"
      />
      {searchQuery && (
        <button className="search-clear" onClick={() => setSearchQuery('')}>
          <X size={14} />
        </button>
      )}
    </div>
  )
}
