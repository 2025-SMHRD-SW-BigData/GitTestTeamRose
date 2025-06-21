import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
    let inputId = '';
    let inputPw = '';
        
    const nav = useNavigate()
    return (
        <div>
            <form action="http://localhost:30001" method='POST'>
                <h1>Login 페이지</h1>
                ID : <input type="text" placeholder='ID를 입력하세요' value={input_Id} />
                <br />
                PW : <input type="password" placeholder='PW를 입력하세요' />
                <br />
                <button onChange={() => {nav('/home')}}>로그인</button>
                <button onClick={() => { nav('/join') }}>회원가입</button>
            </form>
        </div>
    )
}

export default Login