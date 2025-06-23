import React, { useEffect, useState } from 'react'
import { Map } from 'react-kakao-maps-sdk'
import useKakaoLoader from "./useKaKaoLoader"

const Home1 = () => {
  const [isLoaded, setIsLoaded] = useState(false)

  // Kakao SDK 로드
  useKakaoLoader()

  return (
    <Map
      center={{ lat: 33.36167, lng: 126.52917 }}
      style={{ width: '1000px', height: '600px' }}
      level={9}
    />
  )
}

export default Home1
