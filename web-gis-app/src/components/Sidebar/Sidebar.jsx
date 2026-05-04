import { PanelLeftClose, PanelLeft } from 'lucide-react'
import useGisStore from '../../store/useGisStore'
import FilterBar from './FilterBar'
import SearchBox from './SearchBox'
import UnitList from './UnitList'

export default function Sidebar() {
  const sidebarOpen = useGisStore((s) => s.sidebarOpen)
  const toggleSidebar = useGisStore((s) => s.toggleSidebar)

  return (
    <>
      {/* Toggle button (always visible) */}
      <button
        className={`sidebar-toggle ${sidebarOpen ? 'open' : 'closed'}`}
        onClick={toggleSidebar}
        title={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
      >
        {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
      </button>

      {/* Sidebar panel */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-inner">
          {/* Search */}
          <div className="sidebar-section">
            <SearchBox />
          </div>

          {/* Filter chips */}
          <div className="sidebar-section">
            <FilterBar />
          </div>

          {/* Unit list */}
          <UnitList />
        </div>
      </aside>
    </>
  )
}
