import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
    const [id, setId] = useState('')
    const [pw, setPw] = useState('')
    const nav = useNavigate()
    
    // http://localhost:3001 서버로 요청

    const tryLogin = (e)=>{
        e.preventDefault()
        console.log(id)

        axios
            .post('http://localhost:3001/login', {
                id: id,
                pw: pw,
            })
            .then((res) => {
                if (res.data == '로그인 성공') {
                    console.log('로그인 성공: ', res.data)
                    nav('/home')
                } else if (res.data == '로그인 실패') {
                    console.log('로그인 실패', res.data)
                }
            })
            .catch((err) => {
                console.log('로그인 실패: ', err)
            })
    }

    return (
        <div>
            <form onSubmit={tryLogin}>

                <h1>로그인 페이지 입니다</h1>
                ID : <input type='text' value={id} onChange={(e)=>setId(e.target.value)} placeholder='ID를 입력하세요' />
                <br />
                PW : <input type='password' value={pw} onChange={(e)=>setPw(e.target.value)} placeholder='PW를 입력하세요' />
                <br />
                <button type='submit'>로그인</button>
                <button onClick={()=>{nav('/join')}}>회원가입</button>
                
            </form>
        </div>
    )
}

export default Login