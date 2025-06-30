// Home.jsx
import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import Weather from './Weather'
import KakaoMap from './KakaoMap'
import getDistance from './getDistance'
import '../../style/Seau.css'

const busyColor = {
  원활: 'item',
  혼잡: 'itemBusy',
  이용불가: 'itemDont',
}

const INITIAL_CENTER = { lat: 33.36167, lng: 126.52917 }

const Home = () => {
  const nav = useNavigate()
  const { userId, setUserId, isOauth, setIsOauth } = useContext(UserContext)

  const [selectedLocation, setSelectedLocation] = useState(null)
  const [mediaData, setMediaData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER)
  const [mapLevel, setMapLevel] = useState(9)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [rightTab, setRightTab] = useState('info')
  const [scheduleList, setScheduleList] = useState([])
  const [expandedScheduleIdx, setExpandedScheduleIdx] = useState(null)
  const [nearbyAttractions, setNearbyAttractions] = useState([])
  const [nearestBeachName, setNearestBeachName] = useState(null)
  const [showSchedule, setShowSchedule] = useState(false)

  const handleLocationSelect = async (location, imageUrl, placeInfo = null) => {
    if (selectedLocation?.lat === location.lat && selectedLocation?.lng === location.lng) return

    setSelectedLocation(location)
    setSelectedPlace(placeInfo)
    setMediaData(imageUrl ? { image: [imageUrl], videos: [] } : { image: [], videos: [] })
    setLoading(true)
    setLeftPanelOpen(true)
    setRightPanelOpen(true)
    setRightTab('info')
    setMapCenter(location)
    setMapLevel(imageUrl ? 3 : 9)

    setLoading(false)
  }

  const handleImageClick = (location, imageUrl, placeInfo) => {
    handleLocationSelect(location, imageUrl, placeInfo)
    setRightTab('info')
  }

  const handleNearbyMarkersChange = (nearby) => {
    setNearbyAttractions(nearby)
  }

  const handleScheduleChange = (schedules) => {
    setScheduleList(schedules)
  }

  const handleLogButton = () => {
    if (isOauth) {
      setIsOauth(false)
      setUserId("")
    }
    nav('/')
  }

  const filteredCategories = {
    attractions: nearbyAttractions.filter(item => item.type === '관광지'),
    restaurants: nearbyAttractions.filter(item => item.type === '맛집'),
    activities: nearbyAttractions.filter(item => item.type === '레저')
  }

  const renderPlaceItems = (places, excludeName) =>
    places.filter(p => p.name !== excludeName).map((place, idx) => (
      <div key={idx} className={place.busy ? busyColor[place.busy] : 'item'} onClick={() => handleImageClick({ lat: place.lat, lng: place.lng }, place.image, place)}>
        <div className="itemName">{place.name}</div>
        <div className="itemInfo">거리: {getDistance(selectedLocation.lat, selectedLocation.lng, place.lat, place.lng).toFixed(2)} km</div>
      </div>
    ))

  return (
    <div className="container">
      {/* 지도 */}
      <div className="mapContainer">
        <KakaoMap
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onNearbyMarkersChange={handleNearbyMarkersChange}
          mapCenter={mapCenter}
          mapLevel={mapLevel}
          onMapLevelChange={setMapLevel}
          scheduleList={scheduleList}
          onScheduleChange={handleScheduleChange}
          showSchedule={showSchedule}
          onNearestBeachChange={(beach) => setNearestBeachName(beach?.name || null)}
        />
      </div>

      {/* 좌측 패널 */}
      <div className="leftPanel" style={{ transform: leftPanelOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div className="panelHeader">
          <h3>🎯 주변 관광지</h3>
          <button className="closeButton" onClick={() => setLeftPanelOpen(false)}>×</button>
        </div>

        {nearestBeachName && <h3 style={{ marginBottom: 0 }}>{nearestBeachName}</h3>}

        {loading ? <div className="loading">로딩 중...</div> :
          selectedLocation && nearbyAttractions.length > 0 ? (
            <div className="panelContent">
              <div className="section">
                <h3>🏛️ 관광지</h3>
                {filteredCategories.attractions.length ? renderPlaceItems(filteredCategories.attractions, selectedPlace?.name) : <div>근처에 관광지가 없습니다.</div>}
              </div>

              <div className="section">
                <h4>🍽️ 맛집</h4>
                {filteredCategories.restaurants.length ? renderPlaceItems(filteredCategories.restaurants, selectedPlace?.name) : <div>근처에 맛집이 없습니다.</div>}
              </div>

              <div className="section">
                <h4>🎪 레저</h4>
                {filteredCategories.activities.length ? renderPlaceItems(filteredCategories.activities, selectedPlace?.name) : <div>근처에 레저 업체가 없습니다.</div>}
              </div>
            </div>
          ) : (
            <div className="placeholder">지도를 클릭해 장소를 선택해주세요.</div>
          )}
      </div>

      {/* 우측 패널 */}
      <div className="rightPanel" style={{ transform: rightPanelOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <div className="panelHeader">
          <h3>🌤️ 종합 정보</h3>
          <button className="closeButton" onClick={() => setRightPanelOpen(false)}>×</button>
        </div>

        <div className="panelContent" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
          {selectedLocation && <Weather lat={selectedLocation.lat} lon={selectedLocation.lng} />}

          <div className="tabButtons">
            <button onClick={() => setRightTab('info')} className={rightTab === 'info' ? 'activeTab' : ''}>상세 정보</button>
            <button onClick={() => setRightTab('media')} className={rightTab === 'media' ? 'activeTab' : ''}>주변 지역</button>
          </div>

          {rightTab === 'info' && (
            <>
              {mediaData?.image?.[0] && (
                <div className="selectedImageContainer">
                  <img src={mediaData.image[0]} alt="선택된 이미지" className="largeImage" />
                </div>
              )}

              {selectedPlace && !selectedPlace.title && (
                <div className="panelContent">
                  <div className={selectedPlace.busy ? busyColor[selectedPlace.busy] : 'item'}>
                    <div className="itemName">{selectedPlace.name}</div>
                    <div className="itemInfo2">
                      <p>{selectedPlace.description}</p>
                      <p>{selectedPlace.operatingTime}</p>
                      {selectedPlace.phone && <p>연락처: {selectedPlace.phone}</p>}
                      {selectedPlace.busy && <p>현재 상태: <strong>{selectedPlace.busy}</strong></p>}
                    </div>
                  </div>
                </div>
              )}

              {showSchedule && (
                <>
                  <h3 style={{ margin: '10px' }}>📅 일정 리스트</h3>
                  {scheduleList.map((schedule, idx) => (
                    <div key={idx} className="item" onClick={() => {
                      setExpandedScheduleIdx(prev => prev === idx ? null : idx)
                      if (expandedScheduleIdx !== idx) {
                        handleImageClick({ lat: schedule.lat, lng: schedule.lng }, null, schedule)
                        setMapLevel(3)
                      }
                    }}>
                      <div className="itemName">{schedule.title}</div>
                      {expandedScheduleIdx === idx && (
                        <div className="itemInfo2">
                          <p>{schedule.description}</p>
                          <p>날짜: {schedule.Date}</p>
                          <p>장소: {schedule.location}</p>
                          <p>인원: {schedule.maxPeople}명</p>
                          <p>비용: {schedule.perCost}원</p>
                          <p>상태: {schedule.status}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {rightTab === 'media' && (
            <div className="mediaSection imageGrid">
              {[...new Map(
                nearbyAttractions.filter(place =>
                  place.image && (!mediaData?.image?.includes(place.image))
                ).map(place => [place.image, place])
              ).values()].map((place, idx) => (
                <img
                  key={idx}
                  src={place.image}
                  alt={`미디어 ${idx + 1}`}
                  className="mediaImage"
                  onClick={() => handleImageClick({ lat: place.lat, lng: place.lng }, place.image, place)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 스케줄 버튼 */}
      <div className="scheduleButton">
        <button
          onClick={() => {
            const next = !showSchedule
            setShowSchedule(next)
            if (next) {
              setMapCenter(INITIAL_CENTER)
              setMapLevel(10)
            }
          }}
        >
          {showSchedule ? '스케줄 마커 숨기기' : '스케줄 마커 보기'}
        </button>
      </div>
    </div>
  )
}

export default Home
