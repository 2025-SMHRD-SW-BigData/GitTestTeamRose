import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios 임포트
import { Edit, Save, X } from 'lucide-react';
import '../../style/mypage.css'

// 메인 React 컴포넌트
const BusinessProfileForm = ({ userId }) => {
    // 폼 입력 필드를 위한 상태 변수
    const [formData, setFormData] = useState({
        placeName: '',
        description: '',
        address: '',
        mainImageUrl: '',
        placeType: '',
        operationHours: '',
        phoneNumber: '',
    })



    const [hasBusiness, setHasBusiness] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [message, setMessage] = useState(''); // 사용자에게 메시지를 보여주기 위한 상태
    const [messageType, setMessageType] = useState('');


    // 🔄 사업체 정보 불러오기
    useEffect(() => {
        const fetchBusinessInfo = async () => {
            try {
                const response = await axios.post('http://localhost:3001/place/get', { userId });

                if (response.data && response.data.place) {
                    const place = response.data.place;
                    setFormData({
                        placeName: place.place_name || '',
                        description: place.description || '',
                        address: place.address || '',
                        mainImageUrl: place.main_image_url || '',
                        placeType: place.place_type || '',
                        operationHours: place.operation_hours || '',
                        phoneNumber: place.phone_number || '',
                    });
                    setHasBusiness(true);
                } else {
                    setHasBusiness(false);
                }
            } catch (err) {
                console.error('사업체 정보 불러오기 실패:', err);
                setHasBusiness(false);
            }
        };

        if (userId) fetchBusinessInfo();
    }, [userId]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage('서버로 전송 중...');
        setMessageType('info');

        try {
            const response = await axios.post('http://localhost:3001/place/add', {
                userId,
                placeName: formData.placeName,
                description: formData.description,
                address: formData.address,
                mainImageUrl: formData.mainImageUrl,
                placeType: formData.placeType,
                operationHours: formData.operationHours,
                phone_number: formData.phoneNumber,
            });

            if (response.data.success) {
                setMessage(`성공: ${response.data.message}`);
                setMessageType('success');
                setHasBusiness(true);
                setIsEditing(false);
            } else {
                setMessage(`실패: ${response.data.message || '알 수 없는 오류'}`);
                setMessageType('error');
            }
        } catch (error) {
            console.error('전송 오류:', error);
            setMessage('서버 오류가 발생했습니다.');
            setMessageType('error');
        }
    };

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => {
        setIsEditing(false);
        setMessage('');
    };
 console.log(userId)
    // 🔽 사업체가 없을 때 등록 버튼만 보임
    if (!hasBusiness && !isEditing) {
        return (
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">사업체 등록</h2>
                </div>
                <div className="card-content">
                    <button className="button primary" onClick={() => setIsEditing(true)}>
                        사업체 등록하기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title">사업체 정보</h2>
                {!isEditing ? (
                    <button className="button primary" onClick={handleEdit}>
                        <Edit size={16} />
                        <span>수정</span>
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="button success" onClick={handleSubmit}>
                            <Save size={16} />
                            <span>저장</span>
                        </button>
                        <button className="button outline" onClick={handleCancel}>
                            <X size={16} />
                            <span>취소</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="card-content">
                <form onSubmit={handleSubmit}>
                    {[
                        { label: '장소 이름', field: 'placeName', type: 'text' },
                        { label: '설명', field: 'description', type: 'textarea' },
                        { label: '주소', field: 'address', type: 'text' },
                        { label: '메인 이미지 URL', field: 'mainImageUrl', type: 'url' },
                        { label: '장소 타입', field: 'placeType', type: 'text' },
                        { label: '운영 시간', field: 'operationHours', type: 'text' },
                        { label: '연락처', field: 'phoneNumber', type: 'tel' },
                    ].map(({ label, field, type }) => (
                        <div className="form-group" key={field}>
                            <label className="label">{label}</label>
                            {type === 'textarea' ? (
                                <textarea
                                    className="textarea"
                                    value={formData[field]}
                                    onChange={(e) => handleChange(field, e.target.value)}
                                    disabled={!isEditing}
                                    rows="3"
                                />
                            ) : (
                                <input
                                    className="input"
                                    type={type}
                                    value={formData[field]}
                                    onChange={(e) => handleChange(field, e.target.value)}
                                    disabled={!isEditing}
                                    required={field === 'placeName' || field === 'address'}
                                />
                            )}
                        </div>
                    ))}
                </form>

                {message && <div className={`message ${messageType}`}>{message}</div>}
            </div>
        </div>

    );
};

export default BusinessProfileForm;