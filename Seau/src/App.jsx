import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/main/Home'
import Join from './components/Start/Join'
import Join2 from './components//Start/Join2'
import Login from './components//Start/Login'
import Mypage from './components/mypage/Mypage'
import Mypage2 from './components/mypage/Mypage2'
import Home1 from './components/main/Home1'
import { UserContext } from './context/UserContext'
import Weather from './components/main/Weather'
import { Navigation } from "./components/Navigation"
import {useNavigate} from 'react-router-dom'
import { ProfileManagement } from './components/mypage/ProfileManagement'
import Start from './components/Start/Start'
import './App.css'
import {ScheduleManagement} from './components/mypage/ScheduleMangement'


function App() {
  const [isOauth, setIsOauth] = useState(false);
  const [userId, setUserId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarMode, setSidebarMode] = useState("login")
  const [userData, setUserData] = useState(null);
  const [placeData, setPlaceData] = useState(null);
  

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
    <UserContext.Provider value={{ isOauth, setIsOauth, userId, setUserId, userData, setUserData, placeData, setPlaceData }}>
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
            nav('/mypage2');
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
        <Route path='/mypage2' element={<Mypage2 ></Mypage2>}></Route>
        <Route path='/' element={<Start isOpen={sidebarOpen} onClose={closeSidebar} onOpen={openSidebar} initialMode={sidebarMode} />}></Route>
        <Route path='/profilemanagement' element = {<ProfileManagement></ProfileManagement>}></Route>
        <Route path='/schedule' element= {<ScheduleManagement></ScheduleManagement>}></Route>
      </Routes>

    </UserContext.Provider>
  )
}

export default App