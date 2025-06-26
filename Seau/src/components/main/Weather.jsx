import React, { useEffect, useState } from 'react'
import axios from 'axios'

const Weather = ({ lat, lon }) => {
    const API_KEY = '191b0c3c6f87f1e34d944534b0a4a379'
    const [weather, setWeather] = useState(null)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!lat || !lon) return;

        const fetchWeather = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather`,
                    {
                        params: {
                            lat,
                            lon,
                            appid: API_KEY,
                            units: 'metric',
                            lang: 'kr'
                        }
                    }
                );
                setWeather(res.data);
            } catch (err) {
                setError('날씨 정보를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [lat, lon]);

    if (loading) return <div>날씨 정보를 불러오는 중...</div>;
    if (error) return <div>{error}</div>;
    if (!weather) return null;


    return (
        <div className='weatherCard'>
      <div className='temperature'>{weather.main.temp}°C</div>
      <div className='condition'>{weather.weather[0].description}</div>
      <div className='weatherDetails'>
        <div>습도: {weather.main.humidity}%</div>
        <div>풍속: {weather.wind.speed} m/s</div>
      </div>
      <div className='location'>
        📍 {weather.name}
      </div>
    </div>
    )
}

export default Weather