// KakaoMap.js
import React, { useEffect, useState } from 'react'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import useKakaoLoader from './useKaKaoLoader'
import axios from 'axios'

const KakaoMap = ({ selectedLocation, onLocationSelect }) => {
    // Kakao SDK 로드 완료 여부 받기
    const isKakaoLoaded = useKakaoLoader()
    const [selectedMarker, setSelectedMarker] = useState(null)
    const [markerList, setMarkerList] = useState([])

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

    // 서버에서 주소 목록 가져오고 마커 리스트 생성
    useEffect(() => {
        if (!isKakaoLoaded) return

        const fetchAndGeocode = async () => {
            try {
                const res = await axios.get('http://localhost:3001/place/beach') // 서버 주소에 맞게 수정
                console.log(res.data)
                const beachList = res.data.beach // [{ name: '곽지해수욕장', address: '제주 제주시 곽지리...' }]

                const geocoded = await Promise.all(
                    beachList.map(async (beach) => {
                        try {
                            const coords = await geocodeAddress(beach.address)
                            return {
                                ...coords,
                                name: beach.place_name,
                                image: beach.main_image_url
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
        }

        fetchAndGeocode()
    }, [isKakaoLoaded])



    const handleMapClick = (_map, mouseEvent) => {
        const lat = mouseEvent.latLng.getLat()
        const lng = mouseEvent.latLng.getLng()
        onLocationSelect({ lat, lng })
    }

    return (
        <Map
            center={{ lat: 33.36167, lng: 126.52917 }}
            className='map'
            level={9}
            onClick={handleMapClick}
        >
            {/*  */}
            {markerList.map((marker, idx) => (
                <MapMarker
                    key={idx}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    onClick={()=>onLocationSelect({lat:marker.lat, lng:marker.lng}, marker.image)}>
                    <div>{marker.name}</div>
                </MapMarker>
            ))}

            {selectedLocation && (
                <MapMarker position={selectedLocation} />
            )}
        </Map>
    )
}

export default KakaoMap
