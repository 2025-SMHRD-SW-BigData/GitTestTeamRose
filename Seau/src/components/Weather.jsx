import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Weather = ({ rawData }) => {
    const [parsedData, setParsedData] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        axios
            .get('http://localhost:3001/weather')
            .then((res) => {
                console.log('기상청 응답:', res.data);
                const rawText = res.data; // 문자열로 가정
                const lines = rawText.trim().split('\n');

                // 숫자로 시작하는 줄만 필터링 (관측 데이터만)
                const dataLines = lines.filter(line => /^\d{12}/.test(line));

                const parsed = dataLines.map((line) => {
                    const tokens = line.trim().split(/\s+/);

                    return {
                        time: tokens[0],        // 관측 시간
                        stationId: tokens[1],   // 지점 ID
                        temperature: tokens[7], // 기온 (TA)
                        waterTemp: tokens[13],  // 수온 (TW)
                    };
                });

                setParsedData(parsed);
                setLoading(false);
            })
            .catch((err) => {
                console.error('에러:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>날씨 정보 불러오는 중...</div>;
    }
    return (
        <div>
            <h2>기상청 등표 관측 요약</h2>
            <table border="1" cellPadding="8">
                <thead>
                    <tr>
                        <th>관측시간</th>
                        <th>지점 ID</th>
                        <th>기온 (°C)</th>
                        <th>수온 (°C)</th>
                    </tr>
                </thead>
                <tbody>
                    {parsedData.map((row, index) => (
                        <tr key={index}>
                            <td>{row.time}</td>
                            <td>{row.stationId}</td>
                            <td>{row.temperature}</td>
                            <td>{row.waterTemp === '-99.0' ? 'N/A' : row.waterTemp}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};

export default Weather