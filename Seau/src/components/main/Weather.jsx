import React, { useEffect, useState } from 'react'
import axios from 'axios'

const weatherDescriptionMap = {
    Clear: '맑음',
    Clouds: '구름 많음',
    Rain: '비',
    Drizzle: '이슬비',
    Thunderstorm: '천둥번개',
    Snow: '눈',
    Mist: '옅은 안개',
    Smoke: '연기',
    Haze: '실안개',
    Dust: '먼지',
    Fog: '짙은 안개',
    Sand: '모래바람',
    Ash: '화산재',
    Squall: '돌풍',
    Tornado: '토네이도',
};

const weatherClassMap = {
    Clear: 'clearWeather',
    Clouds: 'cloudyWeather',
    Rain: 'rainyWeather',
    Drizzle: 'rainyWeather',
    Thunderstorm: 'stormyWeather',
    Snow: 'snowyWeather',
    Mist: 'foggyWeather',
    Smoke: 'foggyWeather',
    Haze: 'foggyWeather',
    Dust: 'foggyWeather',
    Fog: 'foggyWeather',
    Sand: 'foggyWeather',
    Ash: 'foggyWeather',
    Squall: 'stormyWeather',
    Tornado: 'stormyWeather',
};

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

    const mainWeather = weather.weather[0]?.main;
    const description = weatherDescriptionMap[mainWeather] || weather.weather[0].description;
    const weatherClass = weatherClassMap[mainWeather] || 'defaultWeather';

    return (
        <div className={`weatherCard ${weatherClass}`}>
            <div className='temperature'>
                <div>{weather.main.temp}°C</div>
                <div className='condition'>{description}</div>
            </div>
            <div className='weatherDetails'>
                <div>습도: {weather.main.humidity}%</div>
                <div>풍속: {weather.wind.speed} m/s</div>
            </div>
            <div className='location'>
                {/* 📍 {weather.name} */}
            </div>
        </div>
    )
}

export default Weather