import React, { useEffect, useState, useContext } from 'react'
import { UserContext } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
import Weather from './Weather'
import KakaoMap from './KakaoMap'
import getDistance from './getDistance'
import '../../style/Seau.css'
// 메인 App 컴포넌트

const Home1 = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [leisureData, setLeisureData] = useState(null);
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const nav = useNavigate()
  const { userId, setUserId, isOauth, setIsOauth } = useContext(UserContext);
  const [nearbyAttractions, setNearbyAttractions] = useState([])
  const [isMarkerClick, setIsMarkerClick] = useState(false)


  // 위치 선택 시 데이터 로드
  const handleLocationSelect = async (location, imageUrl) => {
    setSelectedLocation(location);
    setLoading(true);
    setLeftPanelOpen(true);
    setRightPanelOpen(true);
    // 마커 클릭인지 판단
    setIsMarkerClick(!!imageUrl)

    try {
      // 레저 데이터 가져오기
      await fetchLeisureData(location);
      // 미디어 데이터 가져오기
      if (imageUrl) {
        setMediaData({
          image: [imageUrl],
          videos: []
        })
      } else {
        await fetchMediaData(location);
      }
    } catch (error) {
      console.error('데이터 로드 중 오류:', error);
    } finally {
      setLoading(false);
    }
  }

  // KakaoMap에서 근처 관광지 목록 받기
  const handleNearbyMarkersChange = (nearby) => {
    setNearbyAttractions(nearby);
  };

  // KaKaoMap에서 받은 목록 분류
  const categori = {
    attractions: nearbyAttractions.filter((item) => item.type === '관광지'),
    restaurants: nearbyAttractions.filter((item) => item.type === '맛집'),
    activities: nearbyAttractions.filter((item) => item.type === '레저')
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
      image: [

      ],
      videos: [

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

      {/* 지도 */}
      <div className='mapContainer'>
        <KakaoMap
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onNearbyMarkersChange={handleNearbyMarkersChange}
        />
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
        ) : (
          <div className='panelContent'>

            {leisureData ? (
              <>
                <div className='section'>
                  <h4>🏛️ 주변 관광지</h4>
                  {categori.attractions.length > 0 ? (
                    categori.attractions.map((place, idx) => (
                      <div key={idx} className='item'>
                        <div className='itemName'>{place.name}</div>
                        {/* 거리 계산 (km 단위로 소수점 2자리까지) */}
                        <div className='itemInfo'>
                          거리: {getDistance(selectedLocation.lat, selectedLocation.lng, place.lat, place.lng).toFixed(2)} km
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>근처에 관광지가 없습니다.</div>
                  )}
                </div>

                <div className='section'>
                  <h4>🍽️ 맛집</h4>
                  {categori.restaurants.length > 0 ? (
                    categori.restaurants.map((place, idx) => (
                      <div key={idx} className='item'>
                        <div className='itemName'>{place.name}</div>
                        <div className='itemInfo'>
                          거리: {getDistance(selectedLocation.lat, selectedLocation.lng, place.lat, place.lng).toFixed(2)} km
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>근처에 맛집이 없습니다.</div>
                  )}
                </div>

                <div className='section'>
                  <h4>🎪 액티비티</h4>
                  {categori.activities.length > 0 ? (
                    categori.activities.map((place, idx) => (
                      <div key={idx} className='item'>
                        <div className='itemName'>{place.name}</div>
                        <div className='itemInfo'>
                          거리: {getDistance(selectedLocation.lat, selectedLocation.lng, place.lat, place.lng).toFixed(2)} km
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>근처에 레저 업체가 없습니다.</div>
                  )}
                </div>

              </>
            ) : (
              <div className='placeholder'>
                지도에서 위치를 선택해주세요
              </div>
            )}
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
                {/* <h4>🌡️ 날씨 정보</h4> */}
                <Weather lat={selectedLocation.lat} lon={selectedLocation.lng} />
              </div>
            )}

            {/* 미디어 정보 */}
            {(nearbyAttractions.length > 0 || mediaData) && (
              <div className='mediaSection'>
                <h4>📸 관련 미디어</h4>

                <div className='selectedImageContainer'>
                  {/* 선택된 마커 이미지 (클릭했을 경우만) */}
                  {isMarkerClick && mediaData?.image?.[0] && (
                    <img
                      src={mediaData.image[0]}
                      alt="선택된 마커 이미지"
                      className='largeImage'
                    />
                  )}
                  </div>

                  <div className='imageGrid'>
                  {/* 중복 제거: 마커 이미지와 겹치지 않는 nearby 이미지만 표시 */}
                  {[...new Map(
                    nearbyAttractions
                      .filter(place =>
                        place.image &&
                        (!isMarkerClick || place.image !== mediaData?.image?.[0])
                      )
                      .map(place => [place.image, place])
                  ).values()].map((place, idx) => (
                    <img
                      key={idx}
                      src={place.image}
                      alt={`근처 장소 이미지 ${idx + 1}`}
                      className='mediaImage'
                    />
                  ))}
                </div>

                <h5>🎬 관련 영상</h5>
                <div className='videoList'>
                  {mediaData?.videos?.map((video, index) => (
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
