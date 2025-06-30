import React, { useEffect, useState, useContext } from 'react'
import { UserContext } from '../../context/UserContext'
import { useNavigate } from 'react-router-dom'
import Weather from './Weather'
import KakaoMap from './KakaoMap'
import getDistance from './getDistance'
import '../../style/Seau.css'
// 메인 App 컴포넌트

const busyColor = {
  원활: 'item',
  혼잡: 'itemBusy',
  이용불가: 'itemDont',
}



const Home1 = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const nav = useNavigate()
  const { userId, setUserId, isOauth, setIsOauth } = useContext(UserContext);
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [isMarkerClick, setIsMarkerClick] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 33.36167, lng: 126.52917 });
  const [mapLevel, setMapLevel] = useState(9);
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [rightTab, setRightTab] = useState('info');
  const [scheduleList, setScheduleList] = useState([])
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [expandedScheduleIdx, setExpandedScheduleIdx] = useState(null);

  // 불러오는 이미지 type이 string이면 호출
  const selectedImage = mediaData?.image?.[0];
  const isValidImage = typeof selectedImage === 'string' && selectedImage.trim() !== '';

  // 위치 선택 시 데이터 로드
  const handleLocationSelect = async (location, imageUrl, placeInfo = null) => {
    if (selectedLocation?.lat === location.lat && selectedLocation?.lng === location.lng) {
      return
    }
    setSelectedLocation(location);
    setSelectedPlace(placeInfo)
    setLoading(true);
    setLeftPanelOpen(true);
    setRightPanelOpen(true);
    // 마커 클릭인지 판단
    setIsMarkerClick(!!imageUrl)
    if (imageUrl) {
      setRightTab('info')
    }

    setSelectedSchedule(null)

    setMapCenter(location);  // 클릭한 위치로 중심 이동
    setMapLevel(imageUrl ? 3 : 9)
    // console.log(mapLevel)
    console.log(placeInfo)

    try {
      // 미디어 데이터 가져오기
      if (imageUrl) {
        setMediaData({
          image: [imageUrl],
          videos: []
        })
      } else {
        setMediaData({ image: [], videos: [] })
      }
    } catch (error) {
      console.error('데이터 로드 중 오류:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log(mapLevel)
  }, [mapLevel])

  // 이미지 클릭시 위치 저장
  const handleImageClick = (location, imageUrl, placeInfo) => {
    handleLocationSelect(location, imageUrl, placeInfo)
    setRightTab('info')
  }

  const handleCardClick = handleImageClick;

  // KakaoMap에서 근처 관광지 목록 받기
  const handleNearbyMarkersChange = (nearby) => {
    setNearbyAttractions(nearby);
  };

  const handleScheduleChange = (newScheduleList) => {
    setScheduleList(newScheduleList);
  };

  // KaKaoMap에서 받은 목록 분류
  const categori = {
    attractions: nearbyAttractions.filter((item) => item.type === '관광지'),
    restaurants: nearbyAttractions.filter((item) => item.type === '맛집'),
    activities: nearbyAttractions.filter((item) => item.type === '레저')
  }

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

  console.log(scheduleList)
  console.log(selectedSchedule)

  return (
    <div className='container'>

      {/* 지도 */}
      <div className='mapContainer'>
        <KakaoMap
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onNearbyMarkersChange={handleNearbyMarkersChange}
          mapCenter={mapCenter}
          mapLevel={mapLevel}
          onMapLevelChange={(newLevel) => {
            setMapLevel(newLevel);
          }}
          scheduleList={scheduleList}
          onScheduleChange={handleScheduleChange}
          showSchedule={showSchedule}
        />
      </div>

      {/* 좌측 사이드바 - 레저 정보 */}
      <div className='leftPanel' style={{ transform: leftPanelOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div className='panelHeader'>
          <h3>🎯 주변 관광지</h3>
          <button
            className='closeButton'
            onClick={() => setLeftPanelOpen(false)}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className='loading'>로딩 중...</div>
        ) : selectedLocation && nearbyAttractions.length > 0 ? (
          <div className='panelContent'>
            {/* 관광지 */}
            <div className='section'>
              <h3>🏛️ 관광지</h3>
              {categori.attractions.length > 0 ? (
                categori.attractions.filter((place) => place.name !== selectedPlace?.name)
                  .map((place, idx) => (
                    <div key={idx} className={place.busy ? `${busyColor[place.busy]}` : 'item'} onClick={() => handleCardClick({ lat: place.lat, lng: place.lng }, place.image, place)}>
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
                categori.restaurants.filter((place) => place.name !== selectedPlace?.name)
                  .map((place, idx) => (
                    <div key={idx} className={place.busy ? `${busyColor[place.busy]}` : 'item'} onClick={() => { handleCardClick({ lat: place.lat, lng: place.lng }, place.image, place), console.log(place.name, place.lat, place.lng) }}>
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
              <h4>🎪 레저</h4>
              {categori.activities.length > 0 ? (
                categori.activities.filter((place) => place.name !== selectedPlace?.name)
                  .map((place, idx) => (
                    <div key={idx} className={place.busy ? `${busyColor[place.busy]}` : 'item'} onClick={() => handleCardClick({ lat: place.lat, lng: place.lng }, place.image, place)}>
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
          <div className='panelContent' style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
            {/* 날씨 정보 */}
            {selectedLocation && (
              <div className='weatherSection'>
                {/* <h4>🌡️ 날씨 정보</h4> */}
                <Weather lat={selectedLocation.lat} lon={selectedLocation.lng} />
              </div>
            )}

            {/* 탭 버튼 */}
            <div className="tabButtons" style={{ display: 'flex', borderBottom: '1px solid #ccc', margin: '10px 0' }}>
              <button
                onClick={() => setRightTab('info')}
                style={{
                  flex: 1,
                  padding: 8,
                  background: rightTab === 'info' ? '#eee' : 'transparent',
                  border: 'none',
                  borderBottom: rightTab === 'info' ? '2px solid #333' : 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                상세 정보
              </button>
              <button
                onClick={() => setRightTab('media')}
                style={{
                  flex: 1,
                  padding: 8,
                  background: rightTab === 'media' ? '#eee' : 'transparent',
                  border: 'none',
                  borderBottom: rightTab === 'media' ? '2px solid #333' : 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                주변 지역
              </button>
            </div>

            {/* 상세 정보 */}
            {rightTab == 'info' && (
              <>
                {/* 선택한 마커 이미지 */}
                <div className='selectedImageContainer'>
                  {/* 선택된 마커 이미지 (클릭했을 경우만) */}
                  {isValidImage && (
                    <img
                      src={mediaData.image[0]}
                      alt="선택된 마커 이미지"
                      className='largeImage'
                    />

                  )}
                </div>


                {selectedPlace && !selectedPlace.title && (
                  // ✅ 일반 장소(관광지/맛집/레저) 선택 시 표시
                  <div className='panelContent' style={{ padding: '0px' }}>
                    <div className={selectedPlace.busy ? `${busyColor[selectedPlace.busy]}` : 'item'}>
                      <div className="itemName">{selectedPlace.name}</div>
                      <div className='itemInfo2'>
                        <p>{selectedPlace.description}</p>
                        <p>{selectedPlace.operatingTime}</p>
                        <p>{selectedPlace.phone ? `연락처 : ${selectedPlace.phone}` : ''}</p>
                        {selectedPlace.busy && (
                          <div className="busyStatus">
                            현재 상태: <strong>{selectedPlace.busy}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {/* 선택한 스케줄 상세 정보 */}
                {showSchedule && (
                  // ✅ showSchedule이 true이면 전체 스케줄 리스트 출력
                  scheduleList.map((schedule, idx) => (
                    <div key={idx} className='panelContent' style={{ padding: '0px' }}>
                      <div
                        className='item'
                        onClick={() => {
                          // 토글 기능 : 같은 idx면 접고, 아니면 열기
                          setExpandedScheduleIdx(prev => (prev === idx ? null : idx))
                          // 확대 시 이동
                          if (expandedScheduleIdx !== idx) {
                            handleCardClick({ lat: schedule.lat, lng: schedule.lng }, null, schedule), setMapLevel(3)
                          }
                        }} style={{ cursor: 'pointer' }}>
                        <div className="itemName">{schedule.title}</div>
                        {expandedScheduleIdx === idx && (

                          <div className='itemInfo2'>
                            <p>{schedule.description}</p>
                            <p>날짜: {schedule.Date}</p>
                            <p>장소: {schedule.location}</p>
                            <p>인원: {schedule.maxPeople}명</p>
                            <p>1인당 비용: {schedule.perCost}원</p>
                            <p>상태: {schedule.status}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {/* 아무 정보가 없을 때 */}
                {!selectedPlace && !showSchedule &&
                  <div>선택된 정보가 없습니다.</div>
                }

              </>
            )}

            {/* 미디어 정보 */}
            {rightTab === 'media' && (
              <>
                {(nearbyAttractions.length > 0 || isValidImage) && (
                  <div className='mediaSection'>

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
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleImageClick({ lat: place.lat, lng: place.lng }, place.image, place)}
                        />
                      ))}
                    </div>

                  </div>
                )}
              </>
            )}
          </div>

        )}
      </div>

      {/* 스케줄 버튼 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
      }}>
        <button
          onClick={() => setShowSchedule(prev => {
            const newShowSchedule = !prev
            if (newShowSchedule) {
              setMapLevel(10);
              setMapCenter({ lat: 33.36167, lng: 126.52917 })
            }
            return newShowSchedule;
          })}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          {showSchedule ? '스케줄 마커 숨기기' : '스케줄 마커 보기'}
        </button>
      </div>

    </div>



  )
}

export default Home1
