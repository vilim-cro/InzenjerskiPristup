import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainApp from './apps/MainApp'
import LoginApp from './apps/LoginApp'

const App = () => {
  return (
    <Routes>
      <Route path='/' exact element={<MainApp />} />
      <Route path='/login' element={<LoginApp />} />
      <Route path='*' element={<h1>React 404. You got lost. Perhaps you meant to visit http://digitalizacija.surge.sh/ ...</h1>} />
    </Routes>
  )
}

export default App