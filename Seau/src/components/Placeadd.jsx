import React, { useState } from 'react';
import axios from 'axios'; // axios 임포트

// 메인 React 컴포넌트
const Placeadd = () => {
    // 폼 입력 필드를 위한 상태 변수
    const [placeName, setPlaceName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [placeType, setPlaceType] = useState('');
    const [operationHours, setOperationHours] = useState('');
    const [message, setMessage] = useState(''); // 사용자에게 메시지를 보여주기 위한 상태

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼의 기본 제출 동작 방지

        setMessage('장소 정보를 서버로 전송 중...'); // 로딩 메시지

        try {
            // axios를 사용하여 Node.js 서버의 /place/add 엔드포인트로 데이터 전송
            // axios는 기본적으로 JSON 데이터를 자동으로 처리하므로, JSON.stringify가 필요 없습니다.
            const response = await axios.post('http://localhost:3001/place/add', {
                placeName,
                description,
                address,
                mainImageUrl,
                placeType,
                operationHours,
            });

            const data = response.data; // axios는 응답 데이터를 response.data에 넣어줍니다.

            // 서버 응답에 따라 메시지 설정
            if (data.success) {
                setMessage(`성공: ${data.message}`);
                // 성공 시 폼 필드 초기화
                setPlaceName('');
                setDescription('');
                setAddress('');
                setMainImageUrl('');
                setPlaceType('');
                setOperationHours('');
            } else {
                setMessage(`실패: ${data.message || '알 수 없는 오류 발생'}`);
            }
        } catch (error) {
            console.error('서버와 통신 중 오류 발생:', error);
            // axios 오류 객체는 error.response (서버 응답), error.request (요청 자체), error.message 등을 포함합니다.
            if (error.response) {
                // 서버가 응답했으나 상태 코드가 2xx 범위 밖인 경우
                // 특히 404 (Not Found) 오류인 경우, 서버 엔드포인트 문제를 사용자에게 더 명확히 안내
                if (error.response.status === 404) {
                    setMessage(`오류: 요청한 주소 (${error.config.url})를 서버에서 찾을 수 없습니다. Node.js 서버가 실행 중이며 /place/add 엔드포인트가 올바르게 설정되었는지 확인하세요.`);
                } else {
                    setMessage(`오류: 서버 응답 오류 발생 (${error.response.status}): ${error.response.data.message || error.message}`);
                }
            } else if (error.request) {
                // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 오류 등)
                setMessage('오류: 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
            } else {
                // 요청 설정 중 오류가 발생한 경우
                setMessage(`오류: ${error.message}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center font-sans">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">새로운 장소 추가</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 장소 이름 입력 필드 */}
                    <div>
                        <label htmlFor="placeName" className="block text-sm font-medium text-gray-700 mb-1">
                            장소 이름:
                        </label>
                        <input
                            type="text"
                            id="placeName"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={placeName}
                            onChange={(e) => setPlaceName(e.target.value)}
                            required
                        />
                    </div>

                    {/* 설명 입력 필드 */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            설명:
                        </label>
                        <textarea
                            id="description"
                            rows="3"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    {/* 주소 입력 필드 */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                            주소:
                        </label>
                        <input
                            type="text"
                            id="address"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>

                    {/* 메인 이미지 URL 입력 필드 */}
                    <div>
                        <label htmlFor="mainImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                            메인 이미지 URL:
                        </label>
                        <input
                            type="url"
                            id="mainImageUrl"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={mainImageUrl}
                            onChange={(e) => setMainImageUrl(e.target.value)}
                        />
                    </div>

                    {/* 장소 타입 입력 필드 */}
                    <div>
                        <label htmlFor="placeType" className="block text-sm font-medium text-gray-700 mb-1">
                            장소 타입:
                        </label>
                        <input
                            type="text"
                            id="placeType"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={placeType}
                            onChange={(e) => setPlaceType(e.target.value)}
                        />
                    </div>

                    {/* 운영 시간 입력 필드 */}
                    <div>
                        <label htmlFor="operationHours" className="block text-sm font-medium text-gray-700 mb-1">
                            운영 시간:
                        </label>
                        <input
                            type="text"
                            id="operationHours"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={operationHours}
                            onChange={(e) => setOperationHours(e.target.value)}
                        />
                    </div>

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    >
                        장소 추가하기
                    </button>
                </form>

                {/* 메시지 표시 영역 */}
                {message && (
                    <p className={`mt-4 text-center text-sm ${message.startsWith('오류') || message.startsWith('실패') ? 'text-red-600' : 'text-green-600'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Placeadd;
