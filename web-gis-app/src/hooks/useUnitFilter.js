import { useMemo } from 'react'
import useGisStore from '../store/useGisStore'

/**
 * Hook: filter & search units based on active filter + search query
 */
export function useUnitFilter() {
  const units = useGisStore((s) => s.units)
  const activeFilter = useGisStore((s) => s.activeFilter)
  const searchQuery = useGisStore((s) => s.searchQuery)

  const filteredUnits = useMemo(() => {
    let result = units

    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter((u) => u.status === activeFilter)
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          u.description.toLowerCase().includes(q)
      )
    }

    return result
  }, [units, activeFilter, searchQuery])

  // Count per status
  const counts = useMemo(() => {
    return {
      all: units.length,
      online: units.filter((u) => u.status === 'online').length,
      idle: units.filter((u) => u.status === 'idle').length,
      offline: units.filter((u) => u.status === 'offline').length,
      no_signal: units.filter((u) => u.status === 'no_signal').length,
    }
  }, [units])

  return { filteredUnits, counts }
}
