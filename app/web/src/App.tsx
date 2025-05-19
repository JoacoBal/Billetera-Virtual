import { Route, Routes } from 'react-router'
import './App.css'

import { LoginPage } from './pages/authentication/login/page'
import { AuthLayout } from './pages/authentication/layout'
import { ProtectedLayout } from './pages/protected/layout'
import { HomePage } from './pages/protected/page'
import { RegisterPage } from './pages/authentication/register/page'

function App() {
  return (
    <Routes>
      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  )
}

export default App
