import React, { useEffect, useState, useRef } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import useKakaoLoader from './useKaKaoLoader';
import axios from 'axios';
import getDistance from './getDistance';

const KakaoMap = ({
    selectedLocation,
    onLocationSelect,
    onNearbyMarkersChange,
    mapCenter,
    mapLevel,
    onMapLevelChange,
    onScheduleChange,
    onScheduleMemberChange,
    showSchedule,
    onNearestBeachChange,
    activeScheduleId,
    setActiveScheduleId
}) => {
    const isKakaoLoaded = useKakaoLoader();
    const [placeMarkerList, setPlaceMarkerList] = useState([]);
    const [nearbyMarkers, setNearbyMarkers] = useState([]);
    const [markerList, setMarkerList] = useState([]);
    const [scheduleList, setScheduleList] = useState([]);
    const [scheduleMemberList, setScheduleMemberList] = useState([])
    const mapRef = useRef(null);

    useEffect(() => {
        if (!isKakaoLoaded) return;

        const fetchData = async () => {
            try {
                const [beachRes, tourRes, scheduleRes] = await Promise.all([
                    axios.get('http://localhost:3001/place/beach'),
                    axios.get('http://localhost:3001/place/tour'),
                    axios.get('http://localhost:3001/schedules/get'),
                ]);

                const beaches = await Promise.all(beachRes.data.beach.map(async (b) => {
                    try {
                        const coords = await geocodeAddress(b.address);
                        return {
                            ...coords,
                            name: b.place_name,
                            image: b.main_image_url,
                            type: 'beach'
                        };
                    } catch {
                        return null;
                    }
                }));

                const tours = tourRes.data.tour
                    .filter(t => t.latitude && t.longitude)
                    .map(t => ({
                        lat: parseFloat(t.latitude),
                        lng: parseFloat(t.longitude),
                        name: t.place_name,
                        image: t.main_image_url,
                        description: t.description,
                        operatingTime: t.operating_time,
                        phone: t.phone_number,
                        type: t.place_type,
                        busy: t.busy
                    }));

                const schedules = scheduleRes.data.schedules
                    .filter(s => s.latitude && s.longitude)
                    .map(s => ({
                        lat: parseFloat(s.latitude),
                        lng: parseFloat(s.longitude),
                        title: s.title,
                        description: s.description,
                        Date: new Date(s.scheduled_date).toLocaleDateString('ko-KR'),
                        location: s.location_name,
                        maxPeople: s.max_participants,
                        perCost: s.cost_per_person,
                        status: s.status,
                        address: s.address,
                        userId: s.user_id,
                        scheduleImage: s.schedule_image_url,
                        scheduleId: s.schedule_id,
                    }));

                const scheduleMembers = scheduleRes.data.members
                console.log(scheduleMembers)

                setMarkerList(beaches.filter(Boolean));
                setPlaceMarkerList(tours);
                setScheduleList(schedules);
                setScheduleMemberList(scheduleMembers)
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [isKakaoLoaded]);

    useEffect(() => {
        if (!selectedLocation || placeMarkerList.length === 0 || markerList.length === 0) return;

        const nearbyTour = placeMarkerList.filter(p => getDistance(selectedLocation.lat, selectedLocation.lng, p.lat, p.lng) < 5);
        const nearbyBeach = markerList.filter(p => getDistance(selectedLocation.lat, selectedLocation.lng, p.lat, p.lng) < 5);
        const nearby = [...nearbyTour, ...nearbyBeach];

        setNearbyMarkers(nearby);
        onNearbyMarkersChange?.(nearby);
        onScheduleChange?.(scheduleList);
        onScheduleMemberChange?.(scheduleMemberList)

        // 가장 가까운 해변
        let minDist = Infinity;
        let closest = null;
        for (const beach of markerList) {
            const dist = getDistance(selectedLocation.lat, selectedLocation.lng, beach.lat, beach.lng);
            if (dist < minDist) {
                minDist = dist;
                closest = beach;
            }
        }
        onNearestBeachChange?.(minDist <= 10 ? closest : null);
    }, [selectedLocation, placeMarkerList, markerList]);

    const geocodeAddress = (address) => {
        return new Promise((resolve, reject) => {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.addressSearch(address, (result, status) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const lat = parseFloat(result[0].y);
                    const lng = parseFloat(result[0].x);
                    resolve({ lat, lng });
                } else {
                    reject(new Error('지오코딩 실패'));
                }
            });
        });
    };

    useEffect(() => {
        if (!mapRef.current) return;

        const timer = setTimeout(() => {
            const currentCenter = mapRef.current.getCenter();
            if (
                currentCenter.getLat() !== mapCenter.lat ||
                currentCenter.getLng() !== mapCenter.lng
            ) {
                mapRef.current.setCenter(new window.kakao.maps.LatLng(mapCenter.lat, mapCenter.lng));
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [mapCenter]);

    useEffect(() => {
        if (!mapRef.current) return;

        const currentLevel = mapRef.current.getLevel();
        if (currentLevel !== mapLevel) {
            mapRef.current.setLevel(mapLevel);
        }
    }, [mapLevel]);

    const handleMapClick = (_map, mouseEvent) => {
        const lat = mouseEvent.latLng.getLat();
        const lng = mouseEvent.latLng.getLng();
        onLocationSelect({ lat, lng });
    };

    const handleZoomChanged = () => {
        if (mapRef.current) {
            const currentLevel = mapRef.current.getLevel();
            onMapLevelChange?.(currentLevel);
        }
    };

    return (
        <Map
            // key={`${mapCenter.lat}-${mapCenter.lng}-${mapLevel}`} // 위치 바뀔 때 명확히 리턴
            center={mapCenter}
            className='map'
            level={mapLevel}
            onClick={handleMapClick}
            onCreate={(map) => (mapRef.current = map)}
            onZoomChanged={handleZoomChanged}
        >
            {markerList.map((m, i) => (
                <MapMarker key={i} position={{ lat: m.lat, lng: m.lng }} onClick={() => onLocationSelect({ lat: m.lat, lng: m.lng }, m.image)}
                    image={{
                        src: '/blackMarker.png',
                        size: {
                            width: 35,
                            height: 35
                        },
                        options: {
                            offset: {
                                x: 15,
                                y: 35
                            }
                        }
                    }}
                >
                    <div>{m.name}</div>
                </MapMarker>
            ))}

            {nearbyMarkers.map((m, i) => (
                <MapMarker key={i} position={{ lat: m.lat, lng: m.lng }} onClick={() => onLocationSelect({ lat: m.lat, lng: m.lng }, m.image, m)}
                    image={{
                        src: '/blueMarker.png',
                        size: {
                            width: 35,
                            height: 35
                        },
                        options: {
                            offset: {
                                x: 15,
                                y: 35
                            }
                        }
                    }}
                >
                    <div style={{ color: m.type === 'beach' ? 'black' : 'orange' }}>{m.name}</div>
                </MapMarker>
            ))}

            {showSchedule && activeScheduleId && scheduleList.filter(s => s.scheduleId === activeScheduleId).map((s, i) => (
                <MapMarker key={i} position={{ lat: s.lat, lng: s.lng }} onClick={() => onLocationSelect({ lat: s.lat, lng: s.lng }, null, s)}
                    image={{
                        src: '/redMarker.png',
                        size: {
                            width: 35,
                            height: 35
                        },
                        options: {
                            offset: {
                                x: 15,
                                y: 35
                            }
                        }
                    }}
                >
                    <div style={{ color: 'red' }}>{s.title}</div>
                </MapMarker>
            ))}

            {selectedLocation && <MapMarker position={selectedLocation}
                image={{
                    src: '/blueMarker.png',
                    size: {
                        width: 35,
                        height: 35
                    },
                    options: {
                        offset: {
                            x: 15,
                            y: 35
                        }
                    }
                }} />}
        </Map>
    );
};

export default KakaoMap;
