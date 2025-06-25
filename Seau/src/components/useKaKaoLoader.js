import { useEffect, useState } from "react"
import { useKakaoLoader as useKakaoLoaderOrigin } from "react-kakao-maps-sdk"

export default function useKakaoLoader() {
  const [loaded, setLoaded] = useState(false)
  useKakaoLoaderOrigin({
    /** 
     * ※주의※ appkey의 경우 본인의 appkey를 사용하셔야 합니다.
     * 해당 키는 docs를 위해 발급된 키 이므로, 임의로 사용하셔서는 안됩니다.
     * 
     * @참고 https://apis.map.kakao.com/web/guide/
     */
    appkey: "12c2585173dee8db3904bb36e9fb3eed",
    libraries: ["clusterer", "drawing", "services"],
  })
  useEffect(() => {
    // window.kakao.maps가 로드되면 loaded를 true로 변경
    const checkLoaded = () => {
      if (window.kakao && window.kakao.maps) {
        setLoaded(true)
      } else {
        setLoaded(false)
      }
    }

    checkLoaded()

    // 혹시 로딩이 늦는 경우를 대비해 interval로 재확인 (1초마다 최대 5초)
    const intervalId = setInterval(() => {
      checkLoaded()
    }, 1000)

    setTimeout(() => clearInterval(intervalId), 5000)

    // cleanup
    return () => clearInterval(intervalId)
  }, [])

  return loaded
}