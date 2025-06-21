import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Join from './components/Join'
import Login from './components/Login'


function App() {
  

  return (
    <>
      <Routes>
        <Route path='/' element={<Home></Home>}></Route>
        <Route path='/join' element={<Join></Join>}></Route>
        <Route path='/login' element={<Login></Login>}></Route>
      </Routes>
    </>
  )
}

export default App
