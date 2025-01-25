import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
import MapView from './components/MapView'

function App() {
  const [sharks, setSharks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch list of sharks when component mounts
    const fetchSharks = async () => {
      try {
        const response = await axios.get('http://localhost:8000/sharks')
        setSharks(response.data.sharks)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch shark data')
        setLoading(false)
      }
    }

    fetchSharks()
  }, [])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="container">
      <h1>Shark Tracker</h1>
      <p>Welcome to Yali's Great White Shark Tracker Display. Shark Data provided by the SEANOE White Shark database. Sharks captured off the coast of Guadalupe Island.</p>
      <MapView />
    </div>
  )
}

export default App
