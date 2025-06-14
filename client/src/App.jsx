import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landingPage'
import BurnPage from './pages/burnPage'
import ProtectedRoute from './components/custom/ProtectedRoute'
import Header from './components/General/header'
import NottyTerminalFooter from './components/General/footer'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/burn" element={
          <ProtectedRoute>
            <BurnPage />
          </ProtectedRoute>
        } />
      </Routes>
      <NottyTerminalFooter />
    </>
  )
}

export default App
