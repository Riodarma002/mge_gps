import { useEffect, useState, useCallback } from 'react'
import { fetchUnits, wialonLogin } from '../api/wialonApi'
import useGisStore from '../store/useGisStore'

/**
 * Custom hook: fetch Wialon GPS units on mount
 * Units update automatically via Wialon token — no polling needed
 */
export function useWialonData() {
  const { setUnits, setLoading, setError, setLastUpdate } = useGisStore()
  const [initialized, setInitialized] = useState(false)

  const loadUnits = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    setError(null)
    try {
      const units = await fetchUnits()
      setUnits(units)
      setLastUpdate(new Date())
      setInitialized(true)
    } catch (err) {
      console.error('[Wialon] Error fetching units:', err)
      setError(err.message)
      // Try re-login on session error
      if (err.message.includes('1') || err.message.includes('session')) {
        try {
          await wialonLogin()
          const units = await fetchUnits()
          setUnits(units)
          setLastUpdate(new Date())
          setInitialized(true)
          setError(null)
        } catch (retryErr) {
          setError(retryErr.message)
        }
      }
    } finally {
      if (!isBackground) setLoading(false)
    }
  }, [setUnits, setLoading, setError, setLastUpdate])

  useEffect(() => {
    loadUnits()

    // Auto-refresh data setiap 10 detik agar marker bergerak
    const intervalId = setInterval(() => {
      loadUnits(true) // update di background supaya tidak muncul overlay loading
    }, 10000)

    return () => clearInterval(intervalId)
  }, [loadUnits])

  return { initialized, reload: () => loadUnits(false) }
}
