import React, { useState, useRef, useContext, useEffect } from 'react';
import styled from '@emotion/styled';
import { Edit, Save, X, Camera } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'


// 스타일 컴포넌트들은 이전과 동일하므로 생략합니다.
// 여기서는 핵심 로직만 보여드리니, 위쪽에 정의된 styled 컴포넌트들은 그대로 사용해주세요.

// --- styled 컴포넌트 시작 (이전 코드에서 복사해서 붙여넣으세요) ---
const Card = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
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

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  ${(props) =>
    props.variant === 'primary' &&
    `
    background-color: #7c3aed;
    color: white;
    &:hover {
      background-color: #6d28d9;
    }
  `}

  ${(props) =>
    props.variant === 'success' &&
    `
    background-color: #059669;
    color: white;
    &:hover {
      background-color: #047857;
    }
  `}

  ${(props) =>
    props.variant === 'outline' &&
    `
    background-color: transparent;
    color: #374151;
    border: 1px solid #d1d5db;
    &:hover {
      background-color: #f9fafb;
    }
  `}
`;

const CardContent = styled.div`
  padding: 24px;
`;

const AvatarContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const AvatarWrapper = styled.div`
  position: relative;
`;

const Avatar = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarFallback = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #6b7280;
`;

const CameraButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #6d28d9;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const HelpText = styled.p`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const GridMd2 = styled(Grid)`
  grid-template-columns: repeat(2, 1fr);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  resize: none;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    cursor: not-allowed;
  }
`;
const ReadOnlyField = styled.div`
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  color: #374151;
`;

const FullWidth = styled.div`
  grid-column: 1 / -1;
`;
// --- styled 컴포넌트 끝 ---

export function ProfileManagement() {
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);

  const [profileData, setProfileData] = useState({
    nickname: '',
    profileImage: '',
    birthDate: '',
    gender: '', // '남자', '여자' 문자열 그대로 사용
    phone: '',
    mbti: '',
    introduction: '',
  });

  const [editData, setEditData] = useState({ ...profileData });
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  // --- 1. userData를 서버에서 가져와 profileData와 editData를 초기화하는 useEffect ---
  useEffect(() => {
    console.log('프로필 데이터 통신 요청');
    if (userId) {
      axios
        .post('http://localhost:3001/mypage', { userId: userId })
        .then((res) => {
          const result = res.data.data;
          console.log('서버에서 받은 userData:', result);

          // 서버에서 받은 데이터를 기반으로 프로필 데이터 초기화
          const initialProfile = {
            nickname: result.nickname || '',
            profileImage: result.profile_image_url || '',
            birthDate: result.birth_date ? result.birth_date.substring(0, 10) : '',
            // 성별을 서버에서 'male'/'female'로 받는다면 여기서 '남자'/'여자'로 변환 (UI 표시용)
            // 하지만 백엔드와 프론트엔드 모두 '남자'/'여자'로 통일한다면 이 변환도 필요 없음
            gender: result.gender, // 서버에서 받은 문자열 그대로 사용 (예: '남자', '여자')
            phone: result.phone_number || '',
            mbti: result.mbti || '',
            introduction: result.introduce || '',
          };

          setUserData(result);
          setProfileData(initialProfile);
          setEditData(initialProfile);

        })
        .catch((error) => {
          console.error('프로필 데이터 로드 오류:', error);
          // navigate('/login');
        });
    }
  }, [userId]);

  // --- handleInputChange: 성별 필드 변환 로직 제거 ---
  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // --- 프로필 이미지 업로드 관련 함수 ---
  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        setEditData((prev) => ({ ...prev, profileImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // --- 수정 모드 활성화 (수정 버튼 클릭 시) ---
  const handleEdit = () => {
    setEditData({ ...profileData });
    setIsEditing(true);
  };

  // --- 저장 버튼 클릭 시 ---
  const handleSave = async () => {
    console.log('프로필수정시도');

    // 백엔드로 전송할 데이터를 editData를 기반으로 구성
    const dataToSend = {
      userId: userId,
      nickname: editData.nickname,
      profileImage: editData.profileImage,
      birth_date: editData.birthDate,
      gender: editData.gender, // 성별 문자열 그대로 전송 (예: '남자', '여자')
      phone_number: editData.phone ? editData.phone.replace(/-/g, '') : '',
      mbti: editData.mbti,
      introduce: editData.introduction,
    };
    
    console.log('전송할 데이터:', dataToSend);

    try {
      const res = await axios.post('http://localhost:3001/profileupdate', dataToSend);
      console.log(res)
      if (res.data == '변경성공') {
        // 백엔드 업데이트 성공 시, profileData를 최신 editData로 업데이트
        // 성별은 이미 문자열 형태이므로 별도의 변환 필요 없음
        setProfileData({
          ...editData,
        });
        setIsEditing(false);
        alert('프로필이 성공적으로 업데이트되었습니다!');
      } else {
        alert(`프로필 업데이트 실패: ${res.data.message || '알 수 없는 오류'}`);
        console.error('프로필 업데이트 실패:', res.data.message);
      }
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // --- 취소 버튼 클릭 시 ---
  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  // --- UI에 표시될 성별 및 MBTI 옵션 (문자열 그대로) ---
  const genderOptions = ['남자', '여자'];
  const mbtiOptions = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ];

  // --- 로딩 스피너/메시지 추가 (userData가 없을 때) ---
  if (!userData) {
    return <div>프로필 정보를 불러오는 중입니다...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 관리</CardTitle>
        {!isEditing ? (
          <Button variant="primary" onClick={handleEdit}>
            <Edit size={16} />
            <span>수정</span>
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="success" onClick={handleSave}>
              <Save size={16} />
              <span>저장</span>
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X size={16} />
              <span>취소</span>
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <AvatarContainer>
          <AvatarWrapper>
            <Avatar>
              {(isEditing ? editData.profileImage : profileData.profileImage) ? (
                <AvatarImage
                  src={isEditing ? editData.profileImage : profileData.profileImage}
                  alt="Profile"
                />
              ) : (
                <AvatarFallback>
                  {(isEditing ? editData.nickname : profileData.nickname)?.charAt(0) || ''}
                </AvatarFallback>
              )}
            </Avatar>
            {isEditing && (
              <>
                <CameraButton type="button" onClick={handleCameraClick}>
                  <Camera size={16} />
                </CameraButton>
                <HiddenInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </>
            )}
          </AvatarWrapper>
          {isEditing && <HelpText>프로필 사진을 변경하려면 카메라 아이콘을 클릭하세요</HelpText>}
        </AvatarContainer>

        <GridMd2>
          <FormGroup>
            <Label>닉네임</Label>
            <Input
              type="text"
              value={isEditing ? editData.nickname : profileData.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              disabled={!isEditing}
            />
          </FormGroup>

          <FormGroup>
            <Label>생년월일</Label>
            <Input
              type="date"
              value={isEditing ? editData.birthDate : profileData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              disabled={!isEditing}
            />
          </FormGroup>

          <FormGroup>
            <Label>성별</Label>
            <Select
              value={isEditing ? editData.gender : profileData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              disabled={!isEditing}
            >
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>전화번호</Label>
            <Input
              type="tel"
              value={isEditing ? editData.phone : profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
            />
          </FormGroup>

          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label>MBTI</Label>
            <Select
              value={isEditing ? editData.mbti : profileData.mbti}
              onChange={(e) => handleInputChange('mbti', e.target.value)}
              disabled={!isEditing}
            >
              {mbtiOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label>자기소개</Label>
            <Textarea
              rows={4}
              placeholder="자신을 소개하는 글을 작성해보세요"
              value={isEditing ? editData.introduction : profileData.introduction}
              onChange={(e) => handleInputChange('introduction', e.target.value)}
              disabled={!isEditing}
            />
          </FormGroup>
        </GridMd2>
      </CardContent>
    </Card>
  );
}