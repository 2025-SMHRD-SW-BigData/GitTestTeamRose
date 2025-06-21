import React, {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

const Home = () => {
    const nav = useNavigate()
  return (
    <div>
        <h1>HOME</h1>
        <h1>OOO님 환영합니다</h1>
    </div>
  )
}

export default Home