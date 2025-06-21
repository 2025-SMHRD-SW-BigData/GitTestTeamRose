import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Join = () => {
    const [id, setId] = useState('')
    const [pw, setPw] = useState('')
    const [nick, setNick] = useState('')
    
    // http://localhost:3001 서버로 요청

    const tryJoin = ()=>{
        

        axios
            .get('http://localhost:3001')
            .then((res)=>{
                console.log(res)
            })
            .catch(()=>{
                console.log('요청 실패')
            })
    }

    const nav = useNavigate()
    return (
        <div>
            <form action="" method='post'>
                <h1>회원가입 페이지 입니다</h1>
                ID : <input value={id} onChange={(e)=>setId(e.target.value)} type="text" placeholder='ID를 입력하세요' />
                <br />
                PW : <input value={pw} onChange={(e)=>setPw(e.target.value)} type="password" placeholder='PW를 입력하세요' />
                <br />
                NICK : <input value={nick} onChange={(e)=>setNick(e.target.value)} type="text" placeholder='닉네임을 입력하세요' />
                <br />
                <button onClick={tryJoin()}>회원가입 시도</button>
                <button onClick={() => { nav('/') }}>로그인</button>
                <button type='reset'>초기화</button>
            </form>
        </div>
    )
}

export default Join