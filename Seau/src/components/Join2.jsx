import React, { useState, useEffect, useContext } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UserContext } from '../context/UserContext';

const Join2 = () => {
    const [id, setId] = useState('')
    const [pw, setPw] = useState('')
    const [nick, setNick] = useState('')
    const nav = useNavigate()

    // http://localhost:3001 서버로 요청

    const tryJoin = (e) => {
        e.preventDefault()
        console.log(id)

        axios
            .post('http://localhost:3001', {
                id: id,
                pw: pw,
                nick: nick
            })
            .then((res) => {
                if (res.data == '회원가입 성공') {
                    console.log('회원가입 성공: ', res.data)
                    nav('/')
                } else if (res.data == '회원가입 실패') {
                    console.log('회원가입 실패', res.data)
                }
            })
            .catch((err) => {
                console.log('회원가입 실패: ', err)
            })
    }

    return (
        <div style={styles.container}>
            {/* 상단바 */}
            <header style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.logo}>Sea-U</h1>
                </div>
            </header>
            <form onSubmit={tryJoin}>
                <h1>회원가입 페이지 입니다</h1>
                ID : <input type='text' value={id} onChange={(e) => setId(e.target.value)} placeholder='ID를 입력하세요' />
                <br />
                PW : <input type='password' value={pw} onChange={(e) => setPw(e.target.value)} placeholder='PW를 입력하세요' />
                <br />
                NICK : <input type='text' value={nick} onChange={(e) => setNick(e.target.value)} placeholder='닉네임을 입력하세요' />
                <br />
                <button type='submit'>회원가입</button>
                <button type='button' onClick={() => { nav('/') }}>로그인</button>
            </form>
        </div>
    )
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    padding: '0 20px',
  },
  logo: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
  },
  headerButton: {
    padding: '8px 16px',
    border: '1px solid #3498db',
    background: 'transparent',
    color: '#3498db',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease',
  },
  mapContainer: {
    position: 'absolute',
    top: '60px',
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  leftPanel: {
    position: 'fixed',
    top: '60px',
    left: 0,
    width: '350px',
    height: 'calc(100vh - 60px)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
    zIndex: 999,
    transition: 'transform 0.3s ease',
    overflowY: 'auto',
  },
  rightPanel: {
    position: 'fixed',
    top: '60px',
    right: 0,
    width: '350px',
    height: 'calc(100vh - 60px)',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
    zIndex: 999,
    transition: 'transform 0.3s ease',
    overflowY: 'auto',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
  },
  panelContent: {
    padding: '20px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  placeholder: {
    textAlign: 'center',
    padding: '40px',
    color: '#999',
  },
  section: {
    marginBottom: '25px',
  },
  item: {
    padding: '10px',
    marginBottom: '8px',
    background: 'rgba(52, 152, 219, 0.1)',
    borderRadius: '8px',
    borderLeft: '3px solid #3498db',
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  itemInfo: {
    fontSize: '12px',
    color: '#666',
  },
  weatherSection: {
    marginBottom: '30px',
  },
  weatherCard: {
    background: 'linear-gradient(135deg, #74b9ff, #0984e3)',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
  },
  temperature: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  condition: {
    fontSize: '18px',
    marginBottom: '12px',
  },
  weatherDetails: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '12px',
    fontSize: '14px',
  },
  location: {
    fontSize: '12px',
    opacity: 0.8,
  },
  mediaSection: {
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '8px',
    marginBottom: '20px',
  },
  mediaImage: {
    width: '100%',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  videoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  videoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  videoThumbnail: {
    width: '80px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  videoTitle: {
    fontSize: '14px',
    flex: 1,
  },
};


export default Join2