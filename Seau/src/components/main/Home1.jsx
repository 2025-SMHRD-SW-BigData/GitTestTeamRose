// Home.jsx
import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import Weather from './Weather'
import KakaoMap from './KakaoMap'
import getDistance from './getDistance'
import '../../style/Seau.css'
import '../../style/ScheduleManagement.css'

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
  const [scheduleMemberList, setScheduleMemberList] = useState([])
  const [expandedScheduleIdx, setExpandedScheduleIdx] = useState(null)
  const [nearbyAttractions, setNearbyAttractions] = useState([])
  const [nearestBeachName, setNearestBeachName] = useState(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [activeScheduleId, setActiveScheduleId] = useState(null);
  const [nearbySchedule, setNearbySchedule] = useState([])

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

  const handleScheduleMemberChange = (scheduleMembers) => {
    setScheduleMemberList(scheduleMembers)
  }

  const handleApply = async (scheduleId) => {
    try {
      // 여기서 user_id는 로그인한 사용자 id를 의미합니다.
      // 만약 상태관리(예: Context, Redux)나 props에서 받아온다면 그 값을 사용하세요.

      const response = await fetch('http://localhost:3001/schedule/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schedule_id: scheduleId,
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('신청 성공!');
        // 신청 후 상태 갱신
        setScheduleMemberList(prev => [
          ...prev,
          {
            schedule_id: scheduleId,
            req_user_id: userId,
            req_status: 0  // 대기 상태로 추가 (클라이언트에서는 중요 X)
          }
        ]);
      } else {
        alert('신청 실패: ' + data.message);
      }
    } catch (err) {
      console.error('신청 중 오류:', err);
      alert('신청 중 오류가 발생했습니다.');
    }
  };

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

  console.log(scheduleMemberList)
  console.log(nearbySchedule)

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
          onScheduleMemberChange={handleScheduleMemberChange}
          showSchedule={showSchedule}
          onNearestBeachChange={(beach) => setNearestBeachName(beach?.name || null)}
          activeScheduleId={activeScheduleId}
          setActiveScheduleId={setActiveScheduleId}
          onNearbyScheduleChange={setNearbySchedule}
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

          {rightTab === 'info' && (
            <>

              {selectedPlace && !selectedPlace.title && (
                <div className='schedule-card' style={{ width: '295px' }}>
                  <div className={selectedPlace.busy ? busyColor[selectedPlace.busy] : 'item'}>
                    <div className="itemName">{selectedPlace.name}</div>
                    {mediaData?.image?.[0] && (
                      <div className="selectedImageContainer">
                        <img src={mediaData.image[0]} alt="선택된 이미지" className="largeImage" />
                      </div>
                    )}
                    <div className="itemInfo2">
                      <p className="card-description">
                        {selectedPlace.description || '설명 없음'}
                      </p>

                      {/* 운영 시간 */}
                      {selectedPlace.operatingTime && (
                        <div className="card-detail">
                          <strong>운영시간:</strong> {selectedPlace.operatingTime}
                        </div>
                      )}

                      {/* 연락처 */}
                      {selectedPlace.phone && (
                        <div className="card-detail">
                          <strong>연락처:</strong> {selectedPlace.phone}
                        </div>
                      )}

                      {/* 혼잡도 상태 */}
                      {selectedPlace.busy && (
                        <div className="card-detail">
                          <strong>현재 상태:</strong> {selectedPlace.busy}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {showSchedule && (
                <>
                  <h3 style={{ margin: '10px' }}>📅 일정 리스트</h3>
                  <div className="schedule-grid">
                    {nearbySchedule.map((schedule, idx) => {
                      const approvCount = scheduleMemberList.filter(
                        (m) => m.schedule_id === schedule.scheduleId && m.req_status === 1
                      ).length;

                      const isApplied = scheduleMemberList.some(
                        (m) => m.schedule_id === schedule.scheduleId && m.req_user_id === userId
                      );

                      const isExpanded = expandedScheduleIdx === idx;

                      return (
                        <div
                          key={idx}
                          className="schedule-card"
                          onClick={() => {
                            setExpandedScheduleIdx(prev => prev === idx ? null : idx);
                            if (expandedScheduleIdx !== idx) {
                              handleImageClick({ lat: schedule.lat, lng: schedule.lng }, null, schedule);
                              setMapLevel(3);
                              setActiveScheduleId(schedule.scheduleId);
                            }
                          }}
                          style={{ cursor: 'pointer', width: '295px' }}
                        >

                          <div className="card-content">
                            <h4 className="card-title">{schedule.title}</h4>
                            {schedule.scheduleImage && (
                              <img
                                src={schedule.scheduleImage}
                                alt="Schedule"
                                className="card-image"
                              />
                            )}
                            <div className="card-detail">
                              <strong>참여자:</strong> {approvCount}/{schedule.maxPeople}명
                            </div>

                            {isExpanded && (
                              <>
                                <p className="card-description">{schedule.description || '설명 없음'}</p>
                                <div className="card-detail">
                                  <strong>날짜:</strong> {new Date(schedule.Date).toLocaleString('ko-KR')}
                                </div>
                                <div className="card-detail">
                                  <strong>장소:</strong> {schedule.location}
                                </div>
                                <div className="card-detail">
                                  <strong>비용:</strong> {schedule.perCost.toLocaleString()}원
                                </div>
                                <div className="card-detail">
                                  <strong>상태:</strong> {schedule.status}
                                </div>
                                <div className="card-actions">
                                  <button
                                    className={`action-button ${isApplied ? 'close' : 'accept'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!isApplied) handleApply(schedule.scheduleId);
                                    }}
                                    disabled={isApplied}
                                  >
                                    {isApplied ? '신청완료' : '신청'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
      <div>
        <button
          className={`navButton ${showSchedule ? 'active' : ''}`}
          onClick={() => {
            const next = !showSchedule
            setShowSchedule(next)
            if (next) {
              // setSelectedLocation(INITIAL_CENTER)
              setRightPanelOpen(true)
              // setMapCenter(INITIAL_CENTER)
              // setMapLevel(10)
              const defaultSchedule = nearbySchedule[0]; // 주변 스케줄이 있을 경우 첫 번째 선택
              if (expandedScheduleIdx !== null && nearbySchedule[expandedScheduleIdx]) {
                setActiveScheduleId(nearbySchedule[expandedScheduleIdx].scheduleId);
              } else {
                setActiveScheduleId(null);  // 펼친게 없으면 null
              }
            } else {
              setRightPanelOpen(false)
              setActiveScheduleId(null)
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
