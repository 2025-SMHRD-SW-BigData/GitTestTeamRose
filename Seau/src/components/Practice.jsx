import React from 'react'
import '../style/Seau.css'

const Practice = () => {
    const isOauth=true
  return (
    <div>
    {/* 상단바 */}
      <header className='header'>
        <div className='headerContent'>
          <h1 className='logo'>Sea-U</h1>
          <span>님 환영합니다! </span>
          <div className='headerButtons'>
            <button className='headerButton' onClick={()=>{handleLogButton()}}>{isOauth?"로그아웃":"로그인"}</button>
            <button className='headerButton' onClick={()=>{nav('/mypage')}}>마이페이지</button>
          </div>
        </div>
      </header>
    </div>
  )
}

export default Practice