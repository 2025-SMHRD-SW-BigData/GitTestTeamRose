import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Join from './components/Join'
import Login from './components/Login'
import Join2 from './components/Join2'
import Mypage from './components/Mypage'


function App() {
  

  return (
    <>
      <Routes>
        <Route path='/home' element={<Home></Home>}></Route>
        <Route path='/join' element={<Join></Join>}></Route>
        <Route path='/join2' element={<Join2></Join2>}></Route>
        <Route path='/' element={<Login></Login>}></Route>
        <Route path='/mypage' element={<Mypage></Mypage>}></Route>
      </Routes>
    </>
  )
}

export default App
