import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import Success from './pages/Success'
import Error from './pages/Error'

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'success' | 'error'>('landing')

  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname
      if (path === '/success') {
        setCurrentPage('success')
      } else if (path === '/error' || path === '/cancel') {
        setCurrentPage('error')
      } else {
        setCurrentPage('landing')
      }
    }

    handleRouteChange()
    window.addEventListener('popstate', handleRouteChange)

    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'success':
        return <Success />
      case 'error':
        return <Error />
      default:
        return <LandingPage />
    }
  }

  return renderPage()
}

export default App