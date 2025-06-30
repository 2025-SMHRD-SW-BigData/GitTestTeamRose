// KakaoMap.js
import React, { useEffect, useState, useRef } from 'react'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import useKakaoLoader from './useKaKaoLoader'
import axios from 'axios'
import getDistance from './getDistance'

const KakaoMap = ({ selectedLocation, onLocationSelect, onNearbyMarkersChange, mapCenter, mapLevel, onScheduleChange, showSchedule, onMapLevelChange }) => {
    // Kakao SDK 로드 완료 여부 받기
    const isKakaoLoaded = useKakaoLoader()
    const [placeMarkerList, setPlaceMarkerList] = useState([])
    const [nearbyMarkers, setNearbyMarkers] = useState([])
    const [markerList, setMarkerList] = useState([])
    const [scheduleList, setScheduleList] = useState([])
    const mapRef = useRef(null)

    // 주소 → 위경도 변환 함수
    const geocodeAddress = (address) => {
        return new Promise((resolve, reject) => {
            // kakao SDK가 로드되지 않았을 때
            if (!window.kakao || !window.kakao.maps) {
                return reject(new Error('Kakao 지도 API가 아직 로드되지 않았습니다.'))
            }

            const geocoder = new window.kakao.maps.services.Geocoder()
            geocoder.addressSearch(address, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const lat = parseFloat(result[0].y)
                    const lng = parseFloat(result[0].x)
                    resolve({ lat, lng })
                } else {
                    reject(new Error('주소 검색 실패: ' + address))
                }
            })
        })
    }
    console.log(scheduleList)

    // 서버에서 주소 목록 가져오고 마커 리스트 생성
    useEffect(() => {
        if (!isKakaoLoaded) return

        const fetchAndGeocode = async () => {
            // beach 데이터 가져오기
            try {
                const res = await axios.get('http://localhost:3001/place/beach') // 서버 주소에 맞게 수정
                // console.log(res.data)
                const beachList = res.data.beach // [{ name: '곽지해수욕장', address: '제주 제주시 곽지리...' }]

                const geocoded = await Promise.all(
                    beachList.map(async (beach) => {
                        try {
                            const coords = await geocodeAddress(beach.address)
                            return {
                                ...coords,
                                name: beach.place_name,
                                image: beach.main_image_url,
                                type: 'beach'
                            }
                        } catch (e) {
                            console.error('지오코딩 실패:', e.message)
                            return null
                        }
                    })
                )

                setMarkerList(geocoded.filter(Boolean)) // 실패한 건 제거
            } catch (err) {
                console.error('해변 데이터 불러오기 실패:', err)
            }

            // 주변 관광 데이터 가져오기
            try {
                const tourRes = await axios.get('http://localhost:3001/place/tour')
                const tourList = tourRes.data.tour;

                const provideTours = tourList.map((tour) => {
                    if (tour.latitude == null || tour.longitude == null) {
                        console.warn(`위치 정보 누락된 장소 : ${tour.place_name}`)
                        return null;
                    }

                    return {
                        lat: parseFloat(tour.latitude),
                        lng: parseFloat(tour.longitude),
                        name: tour.place_name,
                        image: tour.main_image_url,
                        description: tour.description,
                        operatingTime: tour.operating_time,
                        phone: tour.phone_number,
                        type: tour.place_type,
                        busy: tour.busy
                    }
                })
                setPlaceMarkerList(provideTours.filter(Boolean))
                // console.log(placeMarkerList)
            } catch (err) {
                console.error('주변 관광 정보 데이터 불러오기 실패:', err)
            }

            // 스케줄 데이터 가져오기
            try {
                const scheduleRes = await axios.get('http://localhost:3001/schedules/get')
                // console.log(scheduleRes.data.schedules)
                const schedulesList = scheduleRes.data.schedules

                const provideSchedules = schedulesList.map((schedule) => {
                    if (schedule.latitude == null || schedule.longitude == null) {
                        console.warn(`위치 정보 누락된 장소 : ${schedule.title}`)
                        return null;
                    }
                    return {
                        lat: parseFloat(schedule.latitude),
                        lng: parseFloat(schedule.longitude),
                        title: schedule.title,
                        description: schedule.description,
                        Date: schedule.scheduled_date,
                        location: schedule.location_name,
                        maxPeople: schedule.max_participants,
                        perCost: schedule.cost_per_person,
                        status: schedule.status,
                        address: schedule.address,
                        userId: schedule.user_id
                    }
                })
                setScheduleList(provideSchedules.filter(Boolean))
                // console.log(scheduleList)
            } catch (err) {
                console.error('스케줄 데이터 불러오기 실패:', err)
            }
        }


        fetchAndGeocode()
    }, [isKakaoLoaded])

    // 선택한 위치에따라 5km이내의 주변 관광지 마커를 띄우기
    useEffect(() => {
        if (!selectedLocation || placeMarkerList.length === 0 || markerList.length === 0) return

        const nearbyTour = placeMarkerList.filter((place) => {
            const dist = getDistance(
                selectedLocation.lat,
                selectedLocation.lng,
                place.lat,
                place.lng
            )
            return dist < 5 // 5km 이내만 표시
        })

        const nearbyBeaches = markerList.filter((place) => {
            const dist = getDistance(
                selectedLocation.lat,
                selectedLocation.lng,
                place.lat,
                place.lng
            )
            return dist < 5 // 5km 이내만 표시
        })
        // console.log('선택된 위치:', selectedLocation)
        // console.log('필터된 nearbyMarkers:', nearby)

        const nearby = [...nearbyTour, ...nearbyBeaches]

        setNearbyMarkers(nearby)
        if (onNearbyMarkersChange) {
            onNearbyMarkersChange(nearby)
        }
        if (onScheduleChange) {
            onScheduleChange(scheduleList)
        }
    }, [selectedLocation, placeMarkerList, markerList, scheduleList])

    const handleMapClick = (_map, mouseEvent) => {
        const lat = mouseEvent.latLng.getLat()
        const lng = mouseEvent.latLng.getLng()
        onLocationSelect({ lat, lng })
    }
    console.log(mapLevel)

    const handleZoomChanged = () => {
        if (!mapRef.current) return;
        const currentLevel = mapRef.current.getLevel()
        if (onMapLevelChange) {
            onMapLevelChange(currentLevel)
        }
    }

    useEffect(() => {
        if (mapRef.current && mapCenter) {
            const center = new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng);
            mapRef.current.setCenter(center);
        }

        if (mapRef.current && mapLevel !== undefined) {
            mapRef.current.setLevel(mapLevel);
        }
    }, [mapCenter, mapLevel]);

    return (
        <Map
            key={`${mapCenter.lat}-${mapCenter.lng}-${mapLevel}`} // 위치 바뀔 때 명확히 리턴
            center={mapCenter}
            className='map'
            level={mapLevel}
            onClick={handleMapClick}
            onCreate={(map) => {
                mapRef.current = map;
            }}
            onZoomChanged={handleZoomChanged}
        >
            {/* beach 마커 */}
            {markerList.map((marker, idx) => (
                <MapMarker
                    key={idx}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    onClick={() => onLocationSelect({ lat: marker.lat, lng: marker.lng }, marker.image)}>
                    {/* {console.log(marker.image)} */}
                    <div>{marker.name}</div>
                </MapMarker>
            ))}

            {/* 주변 관광장소 마커 */}
            {nearbyMarkers.map((marker, idx) => (
                <MapMarker
                    key={idx}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    onClick={() => onLocationSelect({ lat: marker.lat, lng: marker.lng }, marker.image, marker)}
                >
                    <div style={{ color: marker.type === 'beach' ? 'black' : 'orange' }}>{marker.name}</div>
                </MapMarker>
            ))}

            {/* 스케줄 마커 */}
            {showSchedule && scheduleList.map((marker, idx) => (
                <MapMarker
                    key={idx}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    onClick={() => onLocationSelect({ lat: marker.lat, lng: marker.lng }, null, marker)}
                >
                    {/* {console.log(marker.lat, marker.lng)} */}
                    <div style={{ color: 'red' }}>{marker.title}</div>
                </MapMarker>
            ))}

            {selectedLocation && (
                <MapMarker position={selectedLocation} />
            )}
        </Map>
    )
}

export default KakaoMap
