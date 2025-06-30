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
    width: 100%; /* 부모 요소에 맞게 조정 */
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
    width: 100%; /* 부모 요소에 맞게 조정 */
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

// 스케줄 멤버 관련
const ScheduleMembersSection = styled.div`
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
`;

const SectionTitle = styled.h4`
    font-size: 18px;
    color: #111827;
    margin-bottom: 10px;
`;

const MemberList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const MemberItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f3f4f6;
    &:last-child {
        border-bottom: none;
    }
    cursor: pointer; // 클릭 가능하게
    &:hover {
        background-color: #f0f4f8;
    }
`;

const MemberInfo = styled.div`
    display: flex;
    flex-direction: column;
`;

const MemberName = styled.span`
    font-weight: 600;
    color: #374151;
`;

const MemberStatus = styled.span`
    font-size: 13px;
    color: ${props => {
    if (props.status === 0) return '#f59e0b'; // 대기중 (pending)
    if (props.status === 1) return '#10b981'; // 수락됨 (accepted)
    if (props.status === 2) return '#ef4444'; // 거절됨 (rejected)
    return '#6b7280';
  }};
    margin-top: 4px;
`;

const ActionButton = styled.button`
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    ${props => props.type === 'accept' && `
        background-color: #10b981;
        color: white;
        border: 1px solid #059669;
        &:hover {
            background-color: #059669;
        }
    `}
    ${props => props.type === 'reject' && `
        background-color: #ef4444;
        color: white;
        border: 1px solid #dc2626;
        &:hover {
            background-color: #dc2626;
        }
    `}
    ${props => props.type === 'close' && `
        background-color: #6b7280;
        color: white;
        border: 1px solid #4b5563;
        &:hover {
            background-color: #4b5563;
        }
    `}
`;

const ActionButtonSmall = styled.button`
    padding: 8px 15px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    background-color: #6b7280; /* 회색 기본 */
    color: white;
    border: 1px solid #4b5563;
    &:hover {
        background-color: #4b5563;
    }
`;

// 모달 오버레이 (기본 z-index)
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000; /* 참여자 확인 모달, 상세 정보 모달 등 기본 모달 */
`;

// 프로필 모달을 위한 더 높은 z-index를 가진 오버레이
const ModalOverlayProfile = styled(ModalOverlay)`
    z-index: 1001; /* 프로필 모달이 다른 모달 위에 나타나도록 더 높은 z-index */
`;


const ModalContent = styled.div`
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 500px;
    position: relative;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
`;

const ModalTitle = styled.h3`
    font-size: 22px;
    font-weight: bold;
    color: #111827;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    &:hover {
        color: #374151;
    }
`;

const ProfileDetail = styled.p`
    font-size: 16px;
    color: #374151;
    margin-bottom: 10px;
    strong {
        color: #111827;
        margin-right: 5px;
    }
`;

const ProfileActions = styled.div`
    margin-top: 25px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
`;

// 새로 추가된 프로필 이미지 관련 스타일
const ProfileImageContainer = styled.div`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto 20px; /* 중앙 정렬 및 하단 간격 */
    border: 2px solid #7c3aed; /* 테두리 추가 */
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f4f8; /* 이미지가 없을 때 배경색 */
`;

const ProfileImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover; /* 이미지가 컨테이너에 꽉 차도록 */
`;


export default function ScheduleManagement() {
  const { userId, userData, placeData } = useContext(UserContext);

  const [scheduleData, setScheduleData] = useState({
    title: '',
    description: '',
    location_name: '',
    address: '',
    scheduleDate: '',
    maxParticipants: '',
    costPerPerson: '',
  });

  const [openSchedules, setOpenSchedules] = useState({});
  const [scheduleMembers, setScheduleMembers] = useState({});

  const [mySchedules, setMySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [selectedMemberProfile, setSelectedMemberProfile] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentScheduleIdForModal, setCurrentScheduleIdForModal] = useState(null);
  const [currentMemberStatusForModal, setCurrentMemberStatusForModal] = useState(null);
  // 현재 모달이 열린 스케줄의 생성자 ID를 저장합니다.
  const [currentModalScheduleCreatorId, setCurrentModalScheduleCreatorId] = useState(null);

  // 스케줄 상세/멤버 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedScheduleForDetail, setSelectedScheduleForDetail] = useState(null);

  // 참여자 확인 모달 상태
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedScheduleForMembers, setSelectedScheduleForMembers] = useState(null);


  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const fetchMySchedules = async () => {
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
        console.log(response.data.data);
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

  const fetchScheduleMembers = async (scheduleId) => {
    try {
      const response = await axios.get(`http://localhost:3001/schedule_members/${scheduleId}`);
      if (response.data.success) {
        setScheduleMembers(prev => ({
          ...prev,
          [scheduleId]: response.data.data
        }));
      } else {
        console.error(response.data.message || '참여 요청 목록을 불러오는 데 실패했습니다.');
      }
    } catch (err) {
      console.error(`스케줄 ${scheduleId}의 멤버 로드 오류:`, err);
    }
  };

  const fetchMemberProfile = async (memberId) => {
    try {
      const response = await axios.get(`http://localhost:3001/users/${memberId}`);
      if (response.data.success) {
        setSelectedMemberProfile(response.data.data);
      } else {
        console.error(response.data.message || '프로필 정보를 불러오는 데 실패했습니다.');
        setSelectedMemberProfile(null);
      }
    } catch (err) {
      console.error(`사용자 ${memberId} 프로필 로드 오류:`, err);
      setSelectedMemberProfile(null);
    }
  };

  useEffect(() => {
    fetchMySchedules();
  }, [userId]);

  useEffect(() => {
    if (userData?.user_type === 1 && placeData) {
      setScheduleData(prev => ({
        ...prev,
        location_name: placeData.place_name || '',
        address: placeData.address || '',
      }));
    }
  }, [userData, placeData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      showMessage('로그인 후 스케쥴을 생성할 수 있습니다.', 'error');
      return;
    }

    try {
      const dataToSend = {
        userId: userId,
        title: scheduleData.title,
        description: scheduleData.description,
        location_name: scheduleData.location_name,
        address: scheduleData.address,
        scheduled_date: scheduleData.scheduleDate,
        max_participants: parseInt(scheduleData.maxParticipants, 10),
        cost_per_person: parseInt(scheduleData.costPerPerson, 10),
        user_type: userData?.user_type,
      };

      const response = await axios.post('http://localhost:3001/createschedule', dataToSend);

      if (response.data.success) {
        showMessage('스케쥴이 성공적으로 생성되었습니다!', 'success');
        setScheduleData(prev => ({
          ...prev,
          title: '',
          description: '',
          scheduleDate: '',
          maxParticipants: '',
          costPerPerson: '',
          ...((userData?.user_type !== 1) && { location_name: '', address: '' })
        }));
        fetchMySchedules();
      } else {
        showMessage(`스케쥴 생성 실패: ${response.data.message || '알 수 없는 오류'}`, 'error');
      }
    } catch (err) {
      console.error('스케쥴 생성 중 오류 발생:', err);
      showMessage('스케쥴 생성 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    }
  };

  // 스케줄 상세 정보 모달 열기
  const handleOpenDetailModal = (schedule) => {
    setSelectedScheduleForDetail(schedule);
    setIsDetailModalOpen(true);
  };

  // 스케줄 상세 정보 모달 닫기
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedScheduleForDetail(null);
  };


  // 스케줄 멤버 모달 열기
  const handleOpenMembersModal = async (scheduleId, creatorId) => {
    const schedule = mySchedules.find(s => s.schedule_id === scheduleId);
    setSelectedScheduleForMembers(schedule);
    setCurrentModalScheduleCreatorId(creatorId);
    await fetchScheduleMembers(scheduleId); // 멤버 목록을 새로 불러옵니다.
    setIsMembersModalOpen(true);
  };

  // 스케줄 멤버 모달 닫기
  const handleCloseMembersModal = () => {
    setIsMembersModalOpen(false);
    setSelectedScheduleForMembers(null);
  };

  // 멤버 항목 클릭 시 프로필 모달 열기
  const handleMemberClickForProfile = async (e, scheduleId, memberId, memberStatus) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setCurrentScheduleIdForModal(scheduleId);
    setCurrentMemberStatusForModal(memberStatus);

    // 해당 스케줄의 creator_id를 찾아서 저장 (모달 내 버튼 활성화를 위해)
    const selectedSchedule = mySchedules.find(s => s.schedule_id === scheduleId);
    if (selectedSchedule) {
      setCurrentModalScheduleCreatorId(selectedSchedule.creator_id);
    }

    await fetchMemberProfile(memberId);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedMemberProfile(null);
    setCurrentScheduleIdForModal(null);
    setCurrentMemberStatusForModal(null);
    setCurrentModalScheduleCreatorId(null); // 초기화
    fetchMySchedules(); // 스케줄 상태 변경 후 목록 새로고침
  };

  const handleAcceptReject = async (action) => {
    if (!selectedMemberProfile || !currentScheduleIdForModal) return;

    const scheduleId = currentScheduleIdForModal;
    const requestedUserId = selectedMemberProfile.user_id; // users 테이블의 user_id

    try {
      const endpoint = action === 'accept' ? 'accept' : 'reject';
      const response = await axios.post(`http://localhost:3001/schedule/${endpoint}`, {
        scheduleId: scheduleId, // Node.js 백엔드와 필드 이름 일치
        reqUserId: requestedUserId, // Node.js 백엔드와 필드 이름 일치
      });

      if (response.data.success) {
        showMessage(`요청이 성공적으로 ${action === 'accept' ? '수락' : '거절'}되었습니다.`, 'success');
        handleCloseProfileModal(); // 프로필 모달 닫기
        fetchScheduleMembers(scheduleId); // 참여자 목록 새로고침
      } else {
        showMessage(response.data.message || `요청 ${action === 'accept' ? '수락' : '거절'}에 실패했습니다.`, 'error');
      }
    } catch (err) {
      console.error(`요청 ${action === 'accept' ? '수락' : '거절'} 중 오류 발생:`, err);
      showMessage(`요청 ${action === 'accept' ? '수락' : '거절'} 중 오류가 발생했습니다.`, 'error');
    }
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>새로운 일정 생성</CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <MessageBar type={messageType}>
              {message}
            </MessageBar>
          )}
          <FormGrid onSubmit={handleSubmit}>
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

            <FormGroup>
              <Label htmlFor="location_name">장소명 (선택 사항)</Label>
              <Input
                type="text"
                id="location_name"
                name="location_name"
                value={scheduleData.location_name}
                onChange={handleInputChange}
                placeholder="예: 우리 동네 카페, 광주공원"
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
                readOnly={userData?.user_type === 1}
                style={userData?.user_type === 1 ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}}
              />
            </FormGroup>

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
                <ScheduleItem key={schedule.schedule_id}>
                  <ScheduleItemHeader>
                    <ScheduleItemTitle>{schedule.title}</ScheduleItemTitle>
                    <ScheduleItemParticipants>
                      대기인원 : {schedule.pending_people ? schedule.pending_people : 0} 명, 참여인원 : {schedule.checked_people} / {schedule.max_participants}명
                    </ScheduleItemParticipants>
                  </ScheduleItemHeader>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <ActionButtonSmall onClick={(e) => { e.stopPropagation(); handleOpenDetailModal(schedule); }}>
                      상세 정보
                    </ActionButtonSmall>
                    <ActionButtonSmall onClick={(e) => { e.stopPropagation(); handleOpenMembersModal(schedule.schedule_id, schedule.creator_id); }}>
                      참여자 확인
                    </ActionButtonSmall>
                  </div>
                </ScheduleItem>
              ))}
            </ScheduleListContainer>
          ) : (
            <NoScheduleMessage>등록된 스케쥴이 없습니다.</NoScheduleMessage>
          )}
        </CardContent>
      </Card>

      {/* 스케줄 상세 정보 모달 */}
      {isDetailModalOpen && selectedScheduleForDetail && (
        <ModalOverlay onClick={handleCloseDetailModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedScheduleForDetail.title} 상세 정보</ModalTitle>
              <CloseButton onClick={handleCloseDetailModal}>닫기</CloseButton>
            </ModalHeader>
            <div>
              <ProfileDetail><strong>설명:</strong> {selectedScheduleForDetail.description}</ProfileDetail>
              {selectedScheduleForDetail.location_name && <ProfileDetail><strong>장소명:</strong> {selectedScheduleForDetail.location_name}</ProfileDetail>}
              <ProfileDetail><strong>주소:</strong> {selectedScheduleForDetail.address}</ProfileDetail>
              {selectedScheduleForDetail.latitude && selectedScheduleForDetail.longitude && (
                <ProfileDetail>
                  <strong>위도:</strong> {selectedScheduleForDetail.latitude}, <strong>경도:</strong> {selectedScheduleForDetail.longitude}
                </ProfileDetail>
              )}
              {selectedScheduleForDetail.scheduled_date && (
                <ProfileDetail>
                  <strong>날짜:</strong> {new Date(selectedScheduleForDetail.scheduled_date).toLocaleDateString('ko-KR')}
                </ProfileDetail>
              )}
              <ProfileDetail>
                <strong>참여 인원:</strong> {selectedScheduleForDetail.checked_people} / {selectedScheduleForDetail.max_participants}명
              </ProfileDetail>
              <ProfileDetail><strong>1인당 비용:</strong> {selectedScheduleForDetail.cost_per_person.toLocaleString()}원</ProfileDetail>
            </div>
            <ProfileActions>
              <ActionButton type="close" onClick={handleCloseDetailModal}>
                닫기
              </ActionButton>
            </ProfileActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 스케줄 참여자 확인 모달 */}
      {isMembersModalOpen && selectedScheduleForMembers && (
        <ModalOverlay onClick={handleCloseMembersModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedScheduleForMembers.title} 참여자 목록</ModalTitle>
              <CloseButton onClick={handleCloseMembersModal}>닫기</CloseButton>
            </ModalHeader>
            <ScheduleMembersSection style={{ borderTop: 'none', paddingTop: '0' }}>
              <SectionTitle>참여 요청 ({scheduleMembers[selectedScheduleForMembers.schedule_id]?.length || 0}건)</SectionTitle>
              {scheduleMembers[selectedScheduleForMembers.schedule_id]?.length > 0 ? (
                <MemberList>
                  {scheduleMembers[selectedScheduleForMembers.schedule_id].map((member) => (
                    <MemberItem
                      key={member.req_user_id}
                      onClick={(e) => handleMemberClickForProfile(e, selectedScheduleForMembers.schedule_id, member.req_user_id, member.req_status)}
                    >
                      <MemberInfo>
                        <MemberName>{member.user_name} ({member.req_user_id})</MemberName>
                        <MemberStatus status={member.req_status}>
                          {member.req_status === 0 && '대기중❕'}
                          {member.req_status === 1 && '수락됨✅'}
                          {member.req_status === 2 && '거절됨❌'}
                        </MemberStatus>
                      </MemberInfo>
                    </MemberItem>
                  ))}
                </MemberList>
              ) : (
                <p>아직 참여 요청이 없습니다.</p>
              )}
            </ScheduleMembersSection>
            <ProfileActions>
              <ActionButton type="close" onClick={handleCloseMembersModal}>
                닫기
              </ActionButton>
            </ProfileActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* 프로필 모달 (가장 높은 z-index) */}
      {isProfileModalOpen && selectedMemberProfile && (
        <ModalOverlayProfile onClick={handleCloseProfileModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedMemberProfile.user_id}님의 프로필</ModalTitle>
              <CloseButton onClick={handleCloseProfileModal}>닫기</CloseButton>
            </ModalHeader>
            {/* 프로필 이미지 추가 */}
            <ProfileImageContainer>
              {selectedMemberProfile.profile_image_url ? (
                <ProfileImage src={selectedMemberProfile.profile_image_url} alt="프로필 이미지" />
              ) : (
                <ProfileImage src="/default-profile.png" alt="기본 프로필 이미지" /> // 기본 이미지 경로 설정 필요
              )}
            </ProfileImageContainer>
            <div>
              <ProfileDetail><strong>닉네임:</strong> {selectedMemberProfile.nickname}</ProfileDetail>
              <ProfileDetail><strong>성별:</strong> {selectedMemberProfile.gender}</ProfileDetail>
              <ProfileDetail><strong>생년월일:</strong> {new Date(selectedMemberProfile.birth_date).toLocaleDateString('ko-KR')}</ProfileDetail>
              <ProfileDetail><strong>휴대폰:</strong> {selectedMemberProfile.phone_number}</ProfileDetail>
              <ProfileDetail><strong>mbti:</strong> {selectedMemberProfile.mbti}</ProfileDetail>
              <ProfileDetail><strong>자기소개:</strong> {selectedMemberProfile.introduce || '없음'}</ProfileDetail>
            </div>
            <ProfileActions>
              <>
                <ActionButton type="accept" onClick={() => handleAcceptReject('accept')}>
                  수락
                </ActionButton>
                <ActionButton type="reject" onClick={() => handleAcceptReject('reject')}>
                  거절
                </ActionButton>
              </>
              <ActionButton type="close" onClick={handleCloseProfileModal}>
                닫기
              </ActionButton>
            </ProfileActions>
          </ModalContent>
        </ModalOverlayProfile>
      )}
    </>
  );
}