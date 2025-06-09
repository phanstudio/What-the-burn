import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landingPage'
import BurnPage from './pages/burnPage'
import Burnlayout from './components/burnPage/layout'



function App() {


  return (
    <div className=" h-screen grid w-full bg-indigo-950">
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/burn" element={<Burnlayout />}>
          <Route path="" element={<BurnPage />} />
        </Route>

      </Routes>
    </div>
  )
}

export default App
