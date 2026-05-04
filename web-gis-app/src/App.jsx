import { useWialonData } from './hooks/useWialonData'
import MapView from './components/Map/MapView'
import Sidebar from './components/Sidebar/Sidebar'
import StatsBar from './components/UI/StatsBar'
import useGisStore from './store/useGisStore'

function App() {
  const { reload } = useWialonData()
  const loading = useGisStore((s) => s.loading)

  return (
    <div className="app-root">
      {/* Top stats bar */}
      <StatsBar onReload={reload} />

      {/* Main content area */}
      <div className="app-body">
        {/* Left sidebar */}
        <Sidebar />

        {/* Full-screen map */}
        <main className="map-main">
          <MapView />

          {/* Loading overlay */}
          {loading && (
            <div className="map-loading-overlay">
              <div className="loading-spinner" />
              <span>Memuat data unit...</span>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
