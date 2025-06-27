import React, { useState, useRef, useContext, useEffect } from 'react';
import styled from '@emotion/styled';
import { Edit, Save, X, Camera } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Firebase 관련 import 추가
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Firebase 설정 (!!!여기를 본인의 Firebase 설정으로 채워주세요!!!) ---
const firebaseConfig = {
  apiKey: "AIzaSyBeQAtKudsAWAV027UDqmxG9n7_a_jKVfw",
  authDomain: "seau-a0594.firebaseapp.com",
  projectId: "seau-a0594",
  storageBucket: "seau-a0594.firebasestorage.app",
  messagingSenderId: "862022194486",
  appId: "1:862022194486:web:2219a1fbd6f3e547da0f97",
  measurementId: "G-NBPKM5SY7Z"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
// Firebase Storage 서비스 가져오기
const storage = getStorage(app);
// --- Firebase 설정 끝 ---


// 스타일 컴포넌트들은 이전과 동일하므로 생략합니다.
// 위쪽에 정의된 styled 컴포넌트들은 그대로 사용해주세요.
// (이전 코드에서 복사해서 붙여넣으세요)
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
  width: 94%;
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

const Select = styled.select`
  width: 101%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f9fafb;

  &:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &:disabled {
    cursor: default;
  }
`;

const Textarea = styled.textarea`
  width: 97%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  resize: none;
  font-family: inherit;
  transition: all 0.2s;
  background-color: #f9fafb;

  &:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
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
    profileImage: '', // 여기에 이미지 URL이 저장됩니다.
    birthDate: '',
    gender: '', // '남자', '여자' 문자열 그대로 사용
    phone: '',
    mbti: '',
    introduction: '',
  });

  const [editData, setEditData] = useState({ ...profileData });
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null); // 사용자가 선택한 파일 객체를 저장

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
            // 백엔드에서 DATE_FORMAT을 사용해 YYYY-MM-DD 형식으로 받았다면 그대로 사용
            // 그렇지 않다면, 이곳에서 직접 포매팅 로직을 추가해야 합니다.
            birthDate: result.birth_date ? result.birth_date.substring(0, 10) : '',
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
          // navigate('/login'); // 에러 시 로그인 페이지로 리다이렉트
        });
    }
  }, [userId]);

  // --- handleInputChange: 성별 필드 변환 로직 제거 ---
  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // --- 프로필 이미지 파일 선택 시 처리 함수 ---
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file); // 선택된 파일 객체 저장
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        setEditData((prev) => ({ ...prev, profileImage: result })); // 미리보기용 URL 설정
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
    setSelectedFile(null); // 수정 모드 진입 시 이전에 선택된 파일 초기화
    setIsEditing(true);
  };

  // --- 저장 버튼 클릭 시 ---
  const handleSave = async () => {
    console.log('프로필 수정 시도');

    let finalProfileImageUrl = editData.profileImage; // 기본은 기존 이미지 URL 또는 미리보기 URL

    try {
      // 1. 새 파일이 선택되었다면 Firebase Storage에 업로드
      if (selectedFile) {
        console.log('새 프로필 이미지 업로드 중...');
        const storageRef = ref(storage, `profile_images/${userId}/${selectedFile.name}`);
        const uploadTask = await uploadBytes(storageRef, selectedFile);
        finalProfileImageUrl = await getDownloadURL(uploadTask.ref);
        console.log('Firebase 업로드 완료. URL:', finalProfileImageUrl);
      }

      // 2. 백엔드로 전송할 데이터 구성
      const dataToSend = {
        userId: userId,
        nickname: editData.nickname,
        profileImage: finalProfileImageUrl, // Firebase에서 받은 URL 또는 기존 URL
        birth_date: editData.birthDate,
        gender: editData.gender,
        phone_number: editData.phone ? editData.phone.replace(/-/g, '') : '',
        mbti: editData.mbti,
        introduce: editData.introduction,
      };

      console.log('백엔드로 전송할 데이터:', dataToSend);

      // 3. 백엔드와 통신
      const res = await axios.post('http://localhost:3001/profileupdate', dataToSend);
      console.log('백엔드 응답:', res);

      if (res.data === '변경성공') { // 백엔드 응답 형태에 따라 조건 수정
        setProfileData({
          ...editData,
          profileImage: finalProfileImageUrl, // 실제 DB에 저장된 최종 URL로 업데이트
        });
        setIsEditing(false);
        setSelectedFile(null); // 업로드 완료 후 선택된 파일 초기화
        alert('프로필이 성공적으로 업데이트되었습니다!');
      } else {
        alert(`프로필 업데이트 실패: ${res.data.message || '알 수 없는 오류'}`);
        console.error('프로필 업데이트 실패 (백엔드 응답):', res.data.message);
      }
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      alert('프로필 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
      // 오류 발생 시, 원본 프로필 이미지로 되돌리거나 사용자에게 알려주는 추가 처리
      setEditData((prev) => ({ ...prev, profileImage: profileData.profileImage }));
      setSelectedFile(null);
    }
  };

  // --- 취소 버튼 클릭 시 ---
  const handleCancel = () => {
    setEditData({ ...profileData }); // 원본 데이터로 되돌림
    setSelectedFile(null); // 선택된 파일 초기화
    setIsEditing(false);
  };

  // --- UI에 표시될 성별 및 MBTI 옵션 (문자열 그대로) ---
  const genderOptions = ['남자', '여자', '기타']; // '기타' 옵션 다시 추가
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
                  onChange={handleImageSelect} // handleImageUpload 대신 handleImageSelect 사용
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