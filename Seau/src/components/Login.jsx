import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const nav = useNavigate()
    return (
        <div>
            <form action="">
                <h1>Login 페이지</h1>
                ID : <input type="text" placeholder='ID를 입력하세요' />
                <br />
                PW : <input type="password" placeholder='PW를 입력하세요' />
                <br />
                <button onClick={() => {nav('/home')}}>로그인</button>
                <button onClick={() => { nav('/join') }}>회원가입</button>
            </form>
        </div>
    )
}

export default Login