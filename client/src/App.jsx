import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landingPage'
import BurnPage from './pages/burnPage'
import ProtectedRoute from './components/custom/ProtectedRoute'

function App() {


  return (

    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/burn" element={
        <ProtectedRoute>
          <BurnPage />
        </ProtectedRoute>
      } />

    </Routes>

  )
}

export default App
