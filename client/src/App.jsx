import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/landingPage'
import BurnPage from './pages/burnPage'
import ProtectedRoute from './components/custom/ProtectedRoute'
import Header from './components/General/header'
import NottyTerminalFooter from './components/General/footer'
import Results from './components/burnPage/Results'
import { Divide } from 'lucide-react'
import AdminLayout from './components/Admin/AdminLayout'
import AdminDashboard from './components/Admin/AdminDashBoard'
import AdminSettings from './components/Admin/AdminSettings'



function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminLayout />} >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="/burn" element={
          <ProtectedRoute>
            <BurnPage />
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        } />
      </Routes>
      <NottyTerminalFooter />
    </>
  )
}

export default App
