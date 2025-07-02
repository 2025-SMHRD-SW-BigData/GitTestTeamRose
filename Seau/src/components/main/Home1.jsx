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
  const [scheduleSubTab, setScheduleSubTab] = useState('user');
  const [matchedSchedulePlaces, setMatchedSchedulePlaces] = useState([]);

  const handleLocationSelect = async (location, imageUrl, placeInfo = null) => {
    const normalizedPrev = selectedPlace ? normalizeName(selectedPlace.name) : '';
    const normalizedNew = placeInfo ? normalizeName(placeInfo.name) : '';
    console.log('handleLocationSelect 호출:', { location, imageUrl, placeInfo, selectedPlace });

    const isSameLocation = selectedLocation &&
      Math.abs(selectedLocation.lat - location.lat) < 0.0001 &&
      Math.abs(selectedLocation.lng - location.lng) < 0.0001;

    const isSamePlace = normalizedPrev === normalizedNew;

    console.log('isSameLocation:', isSameLocation, 'isSamePlace:', isSamePlace);

    if (isSameLocation && isSamePlace) return;

    setLoading(true)
    setSelectedLocation(location)
    setSelectedPlace(placeInfo)
    setMediaData(imageUrl ? { image: [imageUrl], videos: [] } : { image: [], videos: [] })

    setTimeout(() => {
      setLeftPanelOpen(true)
      setRightPanelOpen(true)
      setMapCenter(location)
      setMapLevel(imageUrl ? 3 : 9)
      setLoading(false)
    }, 100)
  }

  const handleImageClick = (location, imageUrl, placeInfo) => {
    handleLocationSelect(location, imageUrl, placeInfo)
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

  // --- 신청 취소 처리 함수 추가 ---
  const handleCancelApplication = async (scheduleId) => {
    if (!userId) {
      alert('로그인 후 신청을 취소할 수 있습니다.');
      return;
    }
    if (!window.confirm('정말로 이 스케줄 신청을 취소하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/schedule/cancel_apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: scheduleId,
          userId: userId, // 현재 로그인한 사용자 ID
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('스케줄 신청이 성공적으로 취소되었습니다!');
        // 신청 취소 후 scheduleMemberList 갱신: 해당 신청을 목록에서 제거
        setScheduleMemberList(prev => prev.filter(
          m => !(m.schedule_id === scheduleId && m.req_user_id === userId)
        ));
        // 필요하다면, 스케줄 리스트(참여자 수)도 갱신하는 로직을 추가해야 합니다.
        // 현재 Home.jsx에서는 scheduleList를 직접 fetch하지 않으므로,
        // KakaoMap 컴포넌트의 scheduleList prop이 업데이트되면 자동으로 반영될 것입니다.
      } else {
        alert(`스케줄 신청 취소 실패: ${data.message}`);
      }
    } catch (err) {
      console.error('스케줄 신청 취소 중 오류 발생:', err);
      alert('스케줄 신청 취소 중 오류가 발생했습니다.');
    }
  };
  // --- 신청 취소 처리 함수 끝 ---


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

  const filteredSchedules = nearbySchedule.filter(schedule =>
    scheduleSubTab === 'user'
      ? schedule.scheduleType === 0
      : schedule.scheduleType === 1
  );

  const normalizeName = (str) =>
    str.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9가-힣]/g, '')

  useEffect(() => {
    if (selectedLocation && selectedPlace && !loading) {
      setLeftPanelOpen(true);
      setRightPanelOpen(true);
      console.log('selectedPlace.source:', selectedPlace?.source);
      console.log('typeof source:', typeof selectedPlace?.source);
      console.log('🔥 현재 selectedPlace:', selectedPlace);
      console.log('🔥 조건 평가:', selectedPlace?.source !== 'schedule');
    }
  }, [selectedLocation, selectedPlace, loading]);

  useEffect(() => {
    const newMatches = nearbySchedule.map(schedule => {
      const matchedPlace = nearbyAttractions.find(place =>
        (Math.abs(place.lat - schedule.lat) < 0.0001 && Math.abs(place.lng - schedule.lng) < 0.0001) ||
        normalizeName(place.name).includes(normalizeName(schedule.location)) ||
        normalizeName(schedule.location).includes(normalizeName(place.name))
      );

      return {
        scheduleId: schedule.scheduleId,
        matchedPlace: matchedPlace || null
      };
    });

    setMatchedSchedulePlaces(newMatches);
  }, [nearbySchedule, nearbyAttractions]);

  // console.log(scheduleMemberList)
  // console.log(nearbySchedule)
  // console.log(nearbyAttractions)
  console.log(selectedPlace)

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
        <div className='panelContent'>
          {selectedPlace && (selectedPlace?.source?.trim() ?? '') !== 'schedule' && (
            <div className='schedule-card' style={{ width: '295px' }}>
              <div className={selectedPlace?.busy ? busyColor[selectedPlace?.busy] : 'item'} style={{ marginBottom: '0px' }}>
                <div className="itemName">{selectedPlace?.name}</div>
                {mediaData?.image?.[0] && (
                  <div className="selectedImageContainer">
                    <img src={mediaData.image[0]} alt="선택된 이미지" className="largeImage" />
                  </div>
                )}
                <div className="itemInfo2">
                  <p className="card-description">
                    {selectedPlace?.description || '설명 없음'}
                  </p>

                  {/* 운영 시간 */}
                  {selectedPlace?.operatingTime && (
                    <div className="card-detail">
                      <strong style={{ width: '67px' }}>운영시간:</strong> {selectedPlace?.operatingTime}
                    </div>
                  )}

                  {/* 연락처 */}
                  {selectedPlace?.phone && (
                    <div className="card-detail">
                      <strong>연락처:</strong> {selectedPlace?.phone}
                    </div>
                  )}

                  {/* 혼잡도 상태 */}
                  {selectedPlace?.busy && (
                    <div className="card-detail">
                      <strong>현재 상태:</strong> {selectedPlace?.busy}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? <div className="loading">로딩 중...</div> :
          selectedLocation && nearbyAttractions.length > 0 ? (
            <div className="panelContent">
              <div className="section">
                <h3 style={{ marginTop: '05px' }}>🏛️ 관광지</h3>
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



              {showSchedule && (
                <>
                  {/* 서브탭 버튼 */}
                  <div className="tabButtons" style={{ display: 'flex', marginBottom: '10px' }}>
                    <button
                      onClick={() => setScheduleSubTab('user')}
                      style={{
                        flex: 1,
                        padding: 6,
                        background: scheduleSubTab === 'user' ? '#ddd' : '#f9f9f9',
                        border: '1px solid #ccc',
                        cursor: 'pointer'
                      }}
                    >
                      일반 사용자 일정
                    </button>
                    <button
                      onClick={() => setScheduleSubTab('business')}
                      style={{
                        flex: 1,
                        padding: 6,
                        background: scheduleSubTab === 'business' ? '#ddd' : '#f9f9f9',
                        border: '1px solid #ccc',
                        cursor: 'pointer'
                      }}
                    >
                      레저 업체 일정
                    </button>
                  </div>

                  <h3 style={{ margin: '10px' }}>📅 일정 리스트</h3>
                  <div className="schedule-grid">
                    {filteredSchedules.map((schedule) => {
                      const approvCount = scheduleMemberList.filter(
                        (m) => m.schedule_id === schedule.scheduleId && m.req_status === 1
                      ).length;

                      const isApplied = scheduleMemberList.some(
                        (m) => m.schedule_id === schedule.scheduleId && m.req_user_id === userId
                      );

                      const isExpanded = expandedScheduleIdx === schedule.scheduleId;
                      return (
                        <div
                          key={schedule.scheduleId}
                          className="schedule-card"
                          onClick={() => {
                            console.log(schedule.scheduleType)
                            console.log(schedule.location)
                            console.log('첫 클릭 - nearbyAttractions:', nearbyAttractions);
                            setExpandedScheduleIdx(prev => prev === schedule.scheduleId ? null : schedule.scheduleId);

                            const matched = matchedSchedulePlaces.find(p => p.scheduleId === schedule.scheduleId);
                            const matchedPlace = matched?.matchedPlace;

                            const location = { lat: schedule.lat, lng: schedule.lng };
                            const placeInfo = matchedPlace || {
                              name: schedule.title,
                              title: schedule.title,
                              description: schedule.description,
                              lat: schedule.lat,
                              lng: schedule.lng,
                              source: 'schedule',
                              location: schedule.location,
                            };

                            const imageUrl = matchedPlace?.image || schedule.scheduleImage || null;

                            handleImageClick(location, imageUrl, placeInfo);
                            setMapLevel(3);
                            setActiveScheduleId(schedule.scheduleId);

                          }}
                          style={{ cursor: 'pointer', width: '295px' }}
                        >

                          <div className="card-content" style={{ paddingTop: '10px', height:'50%' }}>
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
                                  {isApplied && (
                                    <button
                                      className="action-button danger" // danger 타입 버튼 사용
                                      onClick={(e) => {
                                        e.stopPropagation(); // 이벤트 버블링 방지
                                        handleCancelApplication(schedule.scheduleId); // 신청 취소 함수 호출
                                      }}
                                    >
                                      신청취소
                                    </button>
                                  )}
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
              if (expandedScheduleIdx) {
                setActiveScheduleId(expandedScheduleIdx);
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
