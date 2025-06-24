import React, { useEffect, useState, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import useKakaoLoader from "./useKaKaoLoader"
import { useNavigate } from 'react-router-dom'
import Weather from './Weather'
import '../style/Seau.css'

const Home1 = () => {
  // 메인 App 컴포넌트
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [leisureData, setLeisureData] = useState(null);
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const nav = useNavigate()
  const { userId, setUserId, isOauth, setIsOauth } = useContext(UserContext);

  // Kakao SDK 로드
  useKakaoLoader()




  // 위치 선택 시 데이터 로드
  const handleLocationSelect = async (location) => {
    setSelectedLocation(location);
    setLoading(true);
    setLeftPanelOpen(true);
    setRightPanelOpen(true);

    try {
      // 레저 데이터 가져오기
      await fetchLeisureData(location);
      // 미디어 데이터 가져오기
      await fetchMediaData(location);
    } catch (error) {
      console.error('데이터 로드 중 오류:', error);
    } finally {
      setLoading(false);
    }
  }

  // 레저 정보 데이터 (Mock)
  const fetchLeisureData = async (location) => {
    const mockLeisureData = {
      attractions: [
        { name: '근처 관광지 A', distance: '1.2km', rating: 4.5 },
        { name: '근처 관광지 B', distance: '2.3km', rating: 4.2 },
        { name: '근처 관광지 C', distance: '3.1km', rating: 4.7 }
      ],
      restaurants: [
        { name: '맛집 A', cuisine: '한식', rating: 4.6 },
        { name: '맛집 B', cuisine: '일식', rating: 4.3 },
        { name: '맛집 C', cuisine: '중식', rating: 4.4 }
      ],
      activities: [
        { name: '액티비티 A', type: '체험', price: '20,000원' },
        { name: '액티비티 B', type: '스포츠', price: '15,000원' }
      ]
    };
    setLeisureData(mockLeisureData);
  };

  // 미디어 데이터 (Mock)
  const fetchMediaData = async (location) => {
    const mockMediaData = {
      images: [
        'https://via.placeholder.com/200x150/4CAF50/white?text=Image+1',
        'https://via.placeholder.com/200x150/2196F3/white?text=Image+2',
        'https://via.placeholder.com/200x150/FF9800/white?text=Image+3'
      ],
      videos: [
        { title: '지역 소개 영상', thumbnail: 'https://via.placeholder.com/200x120/f44336/white?text=Video+1' },
        { title: '관광 명소 영상', thumbnail: 'https://via.placeholder.com/200x120/9C27B0/white?text=Video+2' }
      ]
    };
    setMediaData(mockMediaData);
  };

  console.log(userId, isOauth)
  const handleLogButton = () => {
    if (isOauth) {
      setIsOauth(false);
      setUserId("");
      nav('/');
    }
    else {
      nav('/');
    }

  }

  return (
    <div className='container'>
      {/* 상단바 */}
      <header className='header'>
        <div className='headerContent'>
          <h1 className='logo'>Sea-U</h1>
          <span>님 환영합니다! </span>
          <div className='headerButtons'>
            <button className='headerButton' onClick={() => { handleLogButton() }}>{isOauth ? "로그아웃" : "로그인"}</button>
            <button className='headerButton' onClick={() => { nav('/mypage') }}>마이페이지</button>
          </div>
        </div>
      </header>

      {/* 지도 */}
      <div className='mapContainer'>
        <Map
          center={{ lat: 33.36167, lng: 126.52917 }}
          className='map'
          level={9}
          onClick={(map, MouseEvent) => {
            const lat = MouseEvent.latLng.getLat()
            const lng = MouseEvent.latLng.getLng()
            handleLocationSelect({ lat, lng })
          }}
        >
          {selectedLocation && (
            <MapMarker position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}>
              {/* <div style={{ padding: '5px', fontSize: '12px' }}>
              선택된 위치<br />
              위도 : {selectedLocation.lat.toFixed(4)}<br />
              경도 : {selectedLocation.lng.toFixed(4)}
            </div> */}
            </MapMarker>
          )}
        </Map>
      </div>

      {/* 좌측 사이드바 - 레저 정보 */}
      <div className='leftPanel' style={{ transform: leftPanelOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div className='panelHeader'>
          <h3>🎯 레저 정보</h3>
          <button
            className='closeButton'
            onClick={() => setLeftPanelOpen(false)}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className='loading'>로딩 중...</div>
        ) : leisureData ? (
          <div className='panelContent'>
            <div className='section'>
              <h4>🏛️ 관광지</h4>
              {leisureData.attractions.map((item, index) => (
                <div key={index} className='item'>
                  <div className='itemName'>{item.name}</div>
                  <div className='itemInfo'>
                    거리: {item.distance} | ⭐ {item.rating}
                  </div>
                </div>
              ))}
            </div>

            <div className='section'>
              <h4>🍽️ 맛집</h4>
              {leisureData.restaurants.map((item, index) => (
                <div key={index} className='item'>
                  <div className='itemName'>{item.name}</div>
                  <div className='itemInfo'>
                    {item.cuisine} | ⭐ {item.rating}
                  </div>
                </div>
              ))}
            </div>

            <div className='section'>
              <h4>🎪 액티비티</h4>
              {leisureData.activities.map((item, index) => (
                <div key={index} className='item'>
                  <div className='itemName'>{item.name}</div>
                  <div className='itemInfo'>
                    {item.type} | {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='placeholder'>
            지도에서 위치를 선택해주세요
          </div>
        )}
      </div>

      {/* 우측 사이드바 - 날씨 + 미디어 */}
      <div className='rightPanel' style={{ transform: rightPanelOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <div className='panelHeader'>
          <h3>🌤️ 종합 정보</h3>
          <button
            className='closeButton'
            onClick={() => setRightPanelOpen(false)}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className='loading'>로딩 중...</div>
        ) : (
          <div className='panelContent'>
            {/* 날씨 정보 */}
            {selectedLocation && (
              <div className='weatherSection'>
                <h4>🌡️ 날씨 정보</h4>
                <Weather lat={selectedLocation.lat} lon={selectedLocation.lng} />
              </div>
            )}

            {/* 미디어 정보 */}
            {mediaData && (
              <div className='mediaSection'>
                <h4>📸 관련 미디어</h4>
                <div className='imageGrid'>
                  {mediaData.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`지역 이미지 ${index + 1}`}
                      className='mediaImage'
                    />
                  ))}
                </div>

                <h5>🎬 관련 영상</h5>
                <div className='videoList'>
                  {mediaData.videos.map((video, index) => (
                    <div key={index} className='videoItem'>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className='videoThumbnail'
                      />
                      <div className='videoTitle'>{video.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>


  )
}

export default Home1
