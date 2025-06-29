import React, { useState, useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import { UserContext } from '../../context/UserContext'; // UserContext 경로 확인

// 재사용할 스타일 컴포넌트들 (ProfileManagement.jsx와 유사하게)
const Card = styled.div`
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    margin-bottom: 24px; /* 리스트와 폼 사이에 간격 추가 */
`;

const CardHeader = styled.div`
    padding: 24px 24px 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CardTitle = styled.h2`
    font-size: 24px;
    font-weight: bold;
    color: #111827;
`;

const CardContent = styled.div`
    padding: 24px;
`;

// ✅ 변경: grid-template-columns를 2개의 고정된 열로 설정하여 너비 제어
const FormGrid = styled.form`
    display: grid;
    grid-template-columns: 1fr 1fr; /* 두 개의 열을 동일한 너비로 설정 */
    gap: 20px;

    @media (max-width: 768px) { /* 태블릿 및 모바일에서는 한 줄로 */
        grid-template-columns: 1fr;
    }
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    /* ✅ 변경: 특정 항목 너비를 조절하기 위한 스타일 유지 */
    &.full-width {
        grid-column: 1 / -1; /* 그리드 전체 너비 차지 */
    }
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
`;

const Input = styled.input`
    width: 94%; /* 부모 요소에 맞게 조정 */
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    transition: all 0.2s;
    background-color: #f9fafb;

    &:focus {
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }
`;

const TextArea = styled.textarea`
    width: 90%; /* 부모 요소에 맞게 조정 */
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    resize: vertical; /* 세로 크기 조절 가능 */
    font-family: inherit;
    transition: all 0.2s;
    background-color: #f9fafb;

    &:focus {
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }
`;

const SubmitButton = styled.button`
    padding: 12px 20px;
    background-color: #7c3aed;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    grid-column: 1 / -1; /* 버튼이 항상 전체 너비를 차지하도록 */

    &:hover {
        background-color: #6d28d9;
    }
`;

// 메시지 표시를 위한 스타일 컴포넌트
const MessageBar = styled.div`
    padding: 12px 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    font-weight: 500;
    text-align: center;
    ${props => props.type === 'success' && `
        background-color: #d1fae5;
        color: #065f46;
    `}
    ${props => props.type === 'error' && `
        background-color: #fee2e2;
        color: #991b1b;
    `}
`;

// 스케쥴 리스트 스타일
const ScheduleListContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ScheduleItem = styled(Card)`
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer; /* 클릭 가능하도록 커서 변경 */
    transition: background-color 0.2s;

    &:hover {
        background-color: #f9fafb;
    }
`;

const ScheduleItemHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
`;

const ScheduleItemTitle = styled.h3`
    font-size: 20px;
    font-weight: bold;
    color: #111827;
    flex-grow: 1; /* 제목이 공간을 최대한 차지하도록 */
`;

const ScheduleItemParticipants = styled.span`
    font-size: 16px;
    font-weight: 500;
    color: #4b5563;
    white-space: nowrap; /* 텍스트 줄바꿈 방지 */
`;

const ScheduleItemDetail = styled.p`
    font-size: 14px;
    color: #4b5563;
    margin-bottom: 4px; /* 상세 항목 간 간격 */
`;

const NoScheduleMessage = styled.p`
    text-align: center;
    color: #6b7280;
    padding: 40px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
`;

export default function ScheduleManagement() {
    const { userId, userData, placeData } = useContext(UserContext);
    console.log(userData?.user_type);

    const [scheduleData, setScheduleData] = useState({
        title: '',
        description: '',
        location_name: '', // 장소명
        address: '',
        scheduleDate: '',
        maxParticipants: '',
        costPerPerson: '',
    });

    // 각 스케줄의 열림/닫힘 상태를 관리하기 위한 상태 (Map 객체 사용)
    const [openSchedules, setOpenSchedules] = useState({});

    const [mySchedules, setMySchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // 메시지를 설정하고 일정 시간 후 사라지게 하는 함수
    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000); // 5초 후 메시지 사라짐
    };

    // 사용자 스케쥴 데이터를 불러오는 함수
    const fetchMySchedules = async () => {
        // DB에서 조회할 때 users 테이블의 user_id_name을 리액트에서 가져온 userId와 비교합니다.
        if (!userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:3001/schedules', { userId });
            if (response.data.success) {
                setMySchedules(response.data.data);
            } else {
                setError(response.data.message || '스케쥴을 불러오는 데 실패했습니다.');
                showMessage(response.data.message || '스케쥴을 불러오는 데 실패했습니다.', 'error');
            }
        } catch (err) {
            console.error('스케쥴 로드 오류:', err);
            setError('스케쥴 정보를 불러오는 중 오류가 발생했습니다.');
            showMessage('스케쥴 정보를 불러오는 중 오류가 발생했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 또는 userId 변경 시 스케쥴 목록 불러오기
    useEffect(() => {
        fetchMySchedules();
    }, [userId]);

    // userData 또는 placeData가 변경될 때 scheduleData를 업데이트
    useEffect(() => {
        if (userData?.user_type === 1 && placeData) {
            setScheduleData(prev => ({
                ...prev,
                location_name: placeData.place_name || '',
                address: placeData.address || '',
            }));
        }
    }, [userData, placeData]); // userData와 placeData가 변경될 때마다 실행

    // 입력 필드 값 변경 핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setScheduleData((prev) => ({ ...prev, [name]: value }));
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            showMessage('로그인 후 스케쥴을 생성할 수 있습니다.', 'error');
            return;
        }

        try {
            // 백엔드로 전송할 데이터 구성
            const dataToSend = {
                userId: userId,
                title: scheduleData.title,
                description: scheduleData.description,
                location_name: scheduleData.location_name,
                address: scheduleData.address,
                scheduled_date: scheduleData.scheduleDate,
                max_participants: parseInt(scheduleData.maxParticipants, 10),
                cost_per_person: parseInt(scheduleData.costPerPerson, 10),
                user_type : userData?.user_type,
            };
            console.log('스케쥴 생성 데이터:', dataToSend);

            const response = await axios.post('http://localhost:3001/createschedule', dataToSend);

            if (response.data.success) {
                showMessage('스케쥴이 성공적으로 생성되었습니다!', 'success');
                // 폼 초기화 (장소명, 주소는 사업자 회원일 경우 유지될 수 있으므로 분리)
                setScheduleData(prev => ({
                    ...prev,
                    title: '',
                    description: '',
                    scheduleDate: '',
                    maxParticipants: '',
                    costPerPerson: '',
                    // user_type이 1이 아니면 location_name과 address도 초기화
                    ...((userData?.user_type !== 1) && { location_name: '', address: '' })
                }));
                fetchMySchedules(); // 스케쥴 목록 새로고침
            } else {
                showMessage(`스케쥴 생성 실패: ${response.data.message || '알 수 없는 오류'}`, 'error');
            }
        } catch (err) {
            console.error('스케쥴 생성 중 오류 발생:', err);
            showMessage('스케쥴 생성 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        }
    };

    // 스케줄 항목 클릭 시 상세 정보 토글
    const handleScheduleClick = (scheduleId) => {
        setOpenSchedules(prevState => ({
            ...prevState,
            [scheduleId]: !prevState[scheduleId] // 해당 ID의 상태를 토글
        }));
    };
    console.log(placeData);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>새로운 일정 생성</CardTitle>
                </CardHeader>
                {message && (
                    <MessageBar type={messageType}>
                        {message}
                    </MessageBar>
                )}
                <CardContent>
                    {/* ✅ 변경: FormGrid의 열 개수를 2개로 고정 */}
                    <FormGrid onSubmit={handleSubmit}>
                        {/* 제목과 스케쥴 날짜 - 각자 한 열씩 차지 (총 2열) */}
                        <FormGroup>
                            <Label htmlFor="title">제목</Label>
                            <Input
                                type="text"
                                id="title"
                                name="title"
                                value={scheduleData.title}
                                onChange={handleInputChange}
                                placeholder="일정 제목을 입력하세요"
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="scheduleDate">스케쥴 날짜</Label>
                            <Input
                                type="date"
                                id="scheduleDate"
                                name="scheduleDate"
                                value={scheduleData.scheduleDate}
                                onChange={handleInputChange}
                                required
                            />
                        </FormGroup>

                        {/* 장소명, 최대 참여 인원, 1인당 비용 - 각자 한 열씩 차지 (총 2열) */}
                        <FormGroup>
                            <Label htmlFor="location_name">장소명 (선택 사항)</Label>
                            <Input
                                type="text"
                                id="location_name"
                                name="location_name"
                                value={scheduleData.location_name}
                                onChange={handleInputChange}
                                placeholder="예: 우리 동네 카페, 광주공원"
                                // user_type이 1이면 readOnly 속성 추가하여 수정 불가능하게 함
                                readOnly={userData?.user_type === 1}
                                style={userData?.user_type === 1 ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="maxParticipants">최대 참여 인원</Label>
                            <Input
                                type="number"
                                id="maxParticipants"
                                name="maxParticipants"
                                value={scheduleData.maxParticipants}
                                onChange={handleInputChange}
                                placeholder="최대 참여 인원을 입력하세요"
                                min="1"
                                required
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="costPerPerson">1인당 비용</Label>
                            <Input
                                type="number"
                                id="costPerPerson"
                                name="costPerPerson"
                                value={scheduleData.costPerPerson}
                                onChange={handleInputChange}
                                placeholder="1인당 비용을 입력하세요 (숫자만)"
                                min="0"
                                required
                            />
                        </FormGroup>

                        {/* 주소 (전체 너비) */}
                        <FormGroup className="full-width">
                            <Label htmlFor="address">주소</Label>
                            <Input
                                type="text"
                                id="address"
                                name="address"
                                value={scheduleData.address}
                                onChange={handleInputChange}
                                placeholder="일정 장소 주소를 입력하세요 (예: 서울특별시 강남구 테헤란로 123)"
                                required
                                // user_type이 1이면 readOnly 속성 추가하여 수정 불가능하게 함
                                readOnly={userData?.user_type === 1}
                                style={userData?.user_type === 1 ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
                            />
                        </FormGroup>

                        {/* 설명 (전체 너비) */}
                        <FormGroup className="full-width">
                            <Label htmlFor="description">설명</Label>
                            <TextArea
                                id="description"
                                name="description"
                                value={scheduleData.description}
                                onChange={handleInputChange}
                                placeholder="일정에 대한 자세한 설명을 입력하세요"
                                rows="4"
                            />
                        </FormGroup>

                        <SubmitButton type="submit">일정 생성하기</SubmitButton>
                    </FormGrid>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>내 스케쥴 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <NoScheduleMessage>스케쥴을 불러오는 중입니다...</NoScheduleMessage>
                    ) : error ? (
                        <NoScheduleMessage>{error}</NoScheduleMessage>
                    ) : mySchedules.length > 0 ? (
                        <ScheduleListContainer>
                            {mySchedules.map((schedule) => (
                                <ScheduleItem key={schedule.schedule_id} onClick={() => handleScheduleClick(schedule.schedule_id)}>
                                    <ScheduleItemHeader>
                                        <ScheduleItemTitle>{schedule.title}</ScheduleItemTitle>
                                        <ScheduleItemParticipants>
                                            최대 인원: {schedule.max_participants}명
                                        </ScheduleItemParticipants>
                                    </ScheduleItemHeader>
                                    {openSchedules[schedule.schedule_id] && ( // 토글 상태에 따라 상세 정보 렌더링
                                        <>
                                            <ScheduleItemDetail><strong>설명:</strong> {schedule.description}</ScheduleItemDetail>
                                            {schedule.location_name && <ScheduleItemDetail><strong>장소명:</strong> {schedule.location_name}</ScheduleItemDetail>}
                                            <ScheduleItemDetail><strong>주소:</strong> {schedule.address}</ScheduleItemDetail>
                                            {schedule.latitude && schedule.longitude && (
                                                <ScheduleItemDetail>
                                                    <strong>위도:</strong> {schedule.latitude}, <strong>경도:</strong> {schedule.longitude}
                                                </ScheduleItemDetail>
                                            )}
                                            <ScheduleItemDetail>
                                                <strong>날짜:</strong> {schedule.scheduled_date ? new Date(schedule.scheduled_date).toLocaleDateString('ko-KR') : '날짜 미정'}
                                            </ScheduleItemDetail>
                                            <ScheduleItemDetail><strong>비용:</strong> {schedule.cost_per_person.toLocaleString()}원</ScheduleItemDetail>
                                        </>
                                    )}
                                </ScheduleItem>
                            ))}
                        </ScheduleListContainer>
                    ) : (
                        <NoScheduleMessage>등록된 스케쥴이 없습니다.</NoScheduleMessage>
                    )}
                </CardContent>
            </Card>
        </>
    );
}