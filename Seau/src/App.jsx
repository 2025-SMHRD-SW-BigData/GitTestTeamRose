import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Join from './components/Join'
import Join2 from './components/Join2'
import Login from './components/Login'
import Mypage from './components/Mypage'
import Home1 from './components/Home1'
import { UserContext } from './context/UserContext'
import Weather from './components/Weather'
import { Navigation } from "./components/Navigation"
import { AuthSidebar } from "./components/AuthSiderbar"
import {useNavigate} from 'react-router-dom'
import './App.css'


function App() {
  const [isOauth, setIsOauth] = useState(false);
  const [userId, setUserId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarMode, setSidebarMode] = useState("login")

  const openSidebar = (mode) => {
    setSidebarMode(mode)
    console.log(mode)
    setSidebarOpen(true)
  }
  const nav = useNavigate();

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <UserContext.Provider value={{ isOauth, setIsOauth, userId, setUserId }}>
      {/* 네비게이션 */}
      <Navigation
        onLoginClick={() => {
          if (isOauth) {
            setIsOauth(false)
            nav('/');
          }
          else {
            openSidebar("login")
          }

        }}
        onSignupClick={() => {
          if (isOauth) {
            nav('/mypage');
          }
          else {
            openSidebar("signup")
          }
        }}
      />
      <Routes>
        <Route path='/weather' element={<Weather></Weather>}></Route>
        <Route path='/home' element={<Home></Home>}></Route>
        <Route path='/home1' element={<Home1></Home1>}></Route>
        <Route path='/join' element={<Join></Join>}></Route>
        <Route path='/join2' element={<Join2></Join2>}></Route>
        <Route path='/login' element={<Login onLoginClick={openSidebar}></Login>}></Route>
        <Route path='/mypage' element={<Mypage ></Mypage>}></Route>
        <Route path='/' element={<AuthSidebar isOpen={sidebarOpen} onClose={closeSidebar} initialMode={sidebarMode} />}></Route>
      </Routes>

    </UserContext.Provider>
  )
}

export default App