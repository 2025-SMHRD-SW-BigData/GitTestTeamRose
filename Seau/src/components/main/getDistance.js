const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371 // km
    const toRad = Math.PI / 180
    const lat1Rad = lat1 * toRad; // 첫번째 지점의 위도를 라디안으로 변환
    const lat2Rad = lat2 * toRad; // 두번째 지점의 위도를 라디안으로 변환
    const dLat = (lat2 - lat1) * toRad; // 두 지점간 위도 차이를 라디안으로 변환
    const dLng = (lng2 - lng1) * toRad; // 두 지점간 경도 차이를 라디안으로 변환
    const sinDLat = Math.sin(dLat / 2); // 위도 차이를 반으로 나눈 값을 사인 함수에 넣어서 계산
    const sinDLng = Math.sin(dLng / 2); // 경도 차이를 반으로 나눈값을 사인 함수에 넣어서 계산

    const a =
        sinDLat * sinDLat +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) * sinDLng * sinDLng;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export default getDistance