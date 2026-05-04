import { PackageOpen } from 'lucide-react'
import { useUnitFilter } from '../../hooks/useUnitFilter'
import UnitCard from './UnitCard'
import useGisStore from '../../store/useGisStore'

export default function UnitList() {
  const { filteredUnits } = useUnitFilter()
  const loading = useGisStore((s) => s.loading)
  const activeFilter = useGisStore((s) => s.activeFilter)
  const searchQuery = useGisStore((s) => s.searchQuery)

  if (loading) {
    return (
      <div className="unit-list-empty">
        <div className="skeleton-list">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      </div>
    )
  }

  if (filteredUnits.length === 0) {
    return (
      <div className="unit-list-empty">
        <PackageOpen size={36} color="#6e7681" />
        <p className="empty-title">Tidak ada unit</p>
        <p className="empty-sub">
          {searchQuery
            ? `Tidak ditemukan hasil untuk "${searchQuery}"`
            : activeFilter !== 'all'
            ? `Tidak ada unit dengan status ini`
            : 'Belum ada data unit GPS'}
        </p>
      </div>
    )
  }

  return (
    <div className="unit-list">
      <div className="unit-list-info">
        {filteredUnits.length} unit
      </div>
      <div className="unit-list-scroll">
        {filteredUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  )
}
