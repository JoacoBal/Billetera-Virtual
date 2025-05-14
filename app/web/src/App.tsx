import { Route, Routes } from 'react-router'
import './App.css'

import { HomePage } from './pages/users/page'

function App() {
  return (
    <Routes>
    
      <Route path="/" element={<HomePage />} />
    </Routes>
  )
}

export default App
