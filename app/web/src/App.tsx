import { Route, Routes } from 'react-router'
import './App.css'

import { HomePage } from './pages/users/page'
import { TransactionLayout } from './pages/transactions/layout'

function App() {
  return (
    <Routes>
    
      <Route path="/" element={<HomePage />} />
      <Route path="/transfer" element={<TransactionLayout />} />
    </Routes>
  )
}

export default App
