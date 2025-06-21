import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Join = () => {
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
            <form action="">
                <h1>회원가입 페이지 입니다</h1>
                ID : <input type="text" placeholder='ID를 입력하세요' />
                <br />
                PW : <input type="password" placeholder='PW를 입력하세요' />
                <br />
                NICK : <input type="text" placeholder='닉네임을 입력하세요' />
                <br />
                <button onClick={tryJoin()}>회원가입 시도</button>
                <button onClick={() => { nav('/login') }}>로그인</button>
                <button type='reset'>초기화</button>
            </form>
        </div>
    )
}

export default Join