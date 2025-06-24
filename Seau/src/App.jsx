import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Join from './components/Join'
import Login from './components/Login'
import Mypage from './components/Mypage'
import Home1 from './components/Home1'
import { UserContext } from './context/UserContext'
import Weather from './components/Weather'


function App() {
  const [isOauth, setIsOauth] = useState(false);
  const [userId, setUserId] = useState('');

  return (
    <UserContext.Provider value = {{isOauth, setIsOauth, userId, setUserId}}>
      <Routes>
        <Route path='/weather' element={<Weather></Weather>}></Route>
        <Route path='/home' element={<Home></Home>}></Route>
        <Route path='/home1' element={<Home1></Home1>}></Route>
        <Route path='/join' element={<Join></Join>}></Route>
        <Route path='/' element={<Login></Login>}></Route>
        <Route path='/mypage' element={<Mypage ></Mypage>}></Route>
      </Routes>
    </UserContext.Provider>
  )
}

export default App
