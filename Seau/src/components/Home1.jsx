import React, { useEffect, useState, useContext } from 'react'
import { UserContext } from '../context/UserContext'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import useKakaoLoader from "./useKaKaoLoader"
import { useNavigate } from 'react-router-dom'

const Home1 = () => {
  // 메인 App 컴포넌트
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
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
      // 날씨 데이터 가져오기
      await fetchWeatherData(location);
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

  // 기상청 API 호출
  const fetchWeatherData = async (location) => {
    try {
      // 기상청 API 호출 (실제 구현 시 지점번호 매핑 필요)
      const mockWeatherData = {
        temperature: Math.round(Math.random() * 30 + 5),
        humidity: Math.round(Math.random() * 50 + 30),
        windSpeed: Math.round(Math.random() * 10 + 1),
        condition: ['맑음', '흐림', '비', '눈'][Math.floor(Math.random() * 4)],
        location: `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
      };
      setWeatherData(mockWeatherData);
    } catch (error) {
      console.error('날씨 데이터 로드 실패:', error);
    }
  };

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
    <div style={styles.container}>
      {/* 상단바 */}
      < header style={styles.header} >
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>Sea-U</h1>
          <span>{userId}님 환영합니다! </span>
          <div style={styles.headerButtons}>
            <button style={styles.headerButton} onClick={() => { handleLogButton() }}>{isOauth ? "로그아웃" : "로그인"}</button>
            <button style={styles.headerButton} onClick={() => { nav('/mypage') }}>마이페이지</button>
          </div>
        </div>
      </header >

      {/* 지도 */}
      <div style={styles.mapContainer}>
        <Map
          center={{ lat: 33.36167, lng: 126.52917 }}
          style={styles.map}
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
      <div style={{ ...styles.leftPanel, transform: leftPanelOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div style={styles.panelHeader}>
          <h3>🎯 레저 정보</h3>
          <button
            style={styles.closeButton}
            onClick={() => setLeftPanelOpen(false)}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>로딩 중...</div>
        ) : leisureData ? (
          <div style={styles.panelContent}>
            <div style={styles.section}>
              <h4>🏛️ 관광지</h4>
              {leisureData.attractions.map((item, index) => (
                <div key={index} style={styles.item}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemInfo}>
                    거리: {item.distance} | ⭐ {item.rating}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <h4>🍽️ 맛집</h4>
              {leisureData.restaurants.map((item, index) => (
                <div key={index} style={styles.item}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemInfo}>
                    {item.cuisine} | ⭐ {item.rating}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <h4>🎪 액티비티</h4>
              {leisureData.activities.map((item, index) => (
                <div key={index} style={styles.item}>
                  <div style={styles.itemName}>{item.name}</div>
                  <div style={styles.itemInfo}>
                    {item.type} | {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.placeholder}>
            지도에서 위치를 선택해주세요
          </div>
        )}
      </div>

      {/* 우측 사이드바 - 날씨 + 미디어 */}
      <div style={{ ...styles.rightPanel, transform: rightPanelOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <div style={styles.panelHeader}>
          <h3>🌤️ 종합 정보</h3>
          <button
            style={styles.closeButton}
            onClick={() => setRightPanelOpen(false)}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div style={styles.loading}>로딩 중...</div>
        ) : (
          <div style={styles.panelContent}>
            {/* 날씨 정보 */}
            {weatherData && (
              <div style={styles.weatherSection}>
                <h4>🌡️ 날씨 정보</h4>
                <div style={styles.weatherCard}>
                  <div style={styles.temperature}>{weatherData.temperature}°C</div>
                  <div style={styles.condition}>{weatherData.condition}</div>
                  <div style={styles.weatherDetails}>
                    <div>습도: {weatherData.humidity}%</div>
                    <div>풍속: {weatherData.windSpeed}m/s</div>
                  </div>
                  <div style={styles.location}>
                    📍 {weatherData.location}
                  </div>
                </div>
              </div>
            )}

            {/* 미디어 정보 */}
            {mediaData && (
              <div style={styles.mediaSection}>
                <h4>📸 관련 미디어</h4>
                <div style={styles.imageGrid}>
                  {mediaData.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`지역 이미지 ${index + 1}`}
                      style={styles.mediaImage}
                    />
                  ))}
                </div>

                <h5>🎬 관련 영상</h5>
                <div style={styles.videoList}>
                  {mediaData.videos.map((video, index) => (
                    <div key={index} style={styles.videoItem}>
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        style={styles.videoThumbnail}
                      />
                      <div style={styles.videoTitle}>{video.title}</div>
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

export default Home1
