import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landingPage'
import BurnPage from './pages/burnPage'




function App() {


  return (

    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/burn" element={<BurnPage />} />
    </Routes>

  )
}

export default App
