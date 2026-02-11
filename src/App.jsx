import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import Login from './pages/Login'
import ParentLogin from './pages/ParentLogin'
import Home from './pages/Home'
import Schedule from './pages/Schedule'
import AboutTeam from './pages/AboutTeam'
import Messages from './pages/Messages'
import ManageTeams from './pages/ManageTeams'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login/parent" element={<ParentLogin />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="about" element={<AboutTeam />} />
          <Route path="messages" element={<Messages />} />
          <Route path="teams" element={<ManageTeams />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
