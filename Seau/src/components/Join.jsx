import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Join = () => {
    const [id, setId] = useState('')
    const [pw, setPw] = useState('')
    const [nick, setNick] = useState('')
    const nav = useNavigate()
    
    // http://localhost:3001 서버로 요청

    const tryJoin = (e)=>{
        e.preventDefault()
        console.log(id)

        axios
            .post('http://localhost:3001', {
                id : id,
                pw: pw,
                nick: nick
            })
            .then((res)=>{
                if(res.data=='회원가입 성공'){
                    console.log('회원가입 성공: ', res.data)
                    nav('/')
                } else if(res.data=='회원가입 실패'){
                    console.log('회원가입 실패', res.data)
                }
            })
            .catch((err)=>{
                console.log('회원가입 실패: ', err)
            })
    }

    return (
        <div>
            <form onSubmit={tryJoin}>
                <h1>회원가입 페이지 입니다</h1>
                ID : <input type='text' value={id} onChange={(e)=>setId(e.target.value)} placeholder='ID를 입력하세요' />
                <br />
                PW : <input type='password' value={pw} onChange={(e)=>setPw(e.target.value)} placeholder='PW를 입력하세요' />
                <br />
                NICK : <input type='text' value={nick} onChange={(e)=>setNick(e.target.value)} placeholder='닉네임을 입력하세요' />
                <br />
                <button type='submit'>회원가입</button>
                <button type='button' onClick={() => { nav('/') }}>로그인</button>
            </form>
        </div>
    )
}

export default Join