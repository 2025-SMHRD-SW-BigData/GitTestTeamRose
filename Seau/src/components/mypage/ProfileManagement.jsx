import React, { useState, useRef, useContext, useEffect } from 'react';
import styled from '@emotion/styled';
import { Edit, Save, X, Camera } from 'lucide-react';
// UserContext 경로는 사용자 프로젝트 구조에 따라 다를 수 있습니다.
// 이 파일을 사용하는 프로젝트에서 실제 UserContext 파일의 경로로 수정해주세요.
import { UserContext } from '../../context/UserContext';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// AWS SDK import 추가. 이 모듈이 설치되어 있지 않으면 'Could not resolve' 오류가 발생합니다.
// npm install @aws-sdk/client-s3 또는 yarn add @aws-sdk/client-s3 를 통해 설치해야 합니다.
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// --- AWS S3 설정 (!!!여기를 본인의 AWS S3 설정으로 채워주세요!!!) ---
// 경고: 클라이언트 측 코드에 AWS 접근 키를 직접 포함하는 것은 보안상 매우 위험합니다.
// 실제 서비스에서는 반드시 백엔드 서버를 통해 임시 자격 증명을 발급받거나,
// Presigned URL을 생성하여 사용하는 방식을 강력히 권장합니다.
const awsConfig = {
  region: "ap-southeast-2", // 예: 서울 리전 (본인의 S3 버킷 리전으로 변경)
  bucketName: "seaucloud", // 실제 S3 버킷 이름으로 변경
  accessKeyId: "AKIASKD5PB3ZPAOAVFRY", // 본인의 AWS Access Key ID
  secretAccessKey: "lopehabaEv0sFTCPDcGyiI/s9fazZWRhN0euyl9x", // 본인의 AWS Secret Access Key
};

// AWS S3 클라이언트 초기화
const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  },
});
// --- AWS S3 설정 끝 ---


// 스타일 컴포넌트들은 이전과 동일합니다.
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
// --- styled 컴포넌트 끝 ---

export function ProfileManagement() {
  const { userId } = useContext(UserContext); // UserContext는 상위 컴포넌트에서 제공되어야 합니다.
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

  const [message, setMessage] = useState(''); // 사용자에게 표시할 메시지
  const [messageType, setMessageType] = useState(''); // 메시지 타입 ('success' 또는 'error')

  // 메시지를 설정하고 일정 시간 후 사라지게 하는 함수
  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    // setTimeout(() => { // 자동 숨김 기능을 사용하지 않으려면 이 부분을 주석 처리
    //   setMessage('');
    //   setMessageType('');
    // }, 5000); // 5초 후 메시지 사라짐
  };

  // --- 1. userData를 서버에서 가져와 profileData와 editData를 초기화하는 useEffect ---
  useEffect(() => {
    console.log('프로필 데이터 통신 요청');
    if (userId) {
      axios
        .post('http://localhost:3001/mypage', { userId: userId })
        .then((res) => {
          const result = res.data.data.user;
          console.log('서버에서 받은 userData:', result);

          // 서버에서 받은 데이터를 기반으로 프로필 데이터 초기화
          const initialProfile = {
            nickname: result.nickname || '',
            profileImage: result.profile_image_url || '',
            // 백엔드에서 DATE_FORMAT을 사용해YYYY-MM-DD 형식으로 받았다면 그대로 사용
            // 그렇지 않다면, 이곳에서 직접 포매팅 로직을 추가해야 합니다.
            birthDate: result.birth_date ? result.birth_date.substring(0, 10) : '',
            gender: result.gender === null ? '' : result.gender,  // 서버에서 받은 문자열 그대로 사용 (예: '남자', '여자')
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
          showMessage('프로필 정보를 불러오는 데 실패했습니다.', 'error');
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
    setMessage(''); // 메시지 초기화
  };

  // --- 저장 버튼 클릭 시 ---
  const handleSave = async () => {
    console.log('프로필 수정 시도');
    let finalProfileImageUrl = editData.profileImage; // 기본은 기존 이미지 URL 또는 미리보기 URL

    try {
      // 1. 새 파일이 선택되었다면 AWS S3에 직접 업로드
      if (selectedFile) {
        console.log('새 프로필 이미지 업로드 중 (AWS S3 직접 업로드)...');
        const fileExtension = selectedFile.name.split('.').pop();
        const s3Key = `profile_images/${userId}/${Date.now()}.${fileExtension}`;

        // 파일을 ArrayBuffer로 읽은 후 Uint8Array로 변환
        const arrayBuffer = await selectedFile.arrayBuffer();
        const bodyData = new Uint8Array(arrayBuffer);

        const command = new PutObjectCommand({
          Bucket: awsConfig.bucketName,
          Key: s3Key,
          Body: bodyData, // <-- 여기가 변경된 부분입니다.
          ContentType: selectedFile.type,
          ACL: 'public-read'
        });

        await s3Client.send(command);
        finalProfileImageUrl = `https://${awsConfig.bucketName}.s3.${awsConfig.region}.amazonaws.com/${s3Key}`;
        console.log('AWS S3 직접 업로드 완료. URL:', finalProfileImageUrl);
      }


      // 2. 백엔드로 전송할 데이터 구성
      const dataToSend = {
        userId: userId,
        nickname: editData.nickname,
        profileImage: finalProfileImageUrl, // S3에서 받은 URL 또는 기존 URL
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
        showMessage('프로필이 성공적으로 업데이트되었습니다!', 'success');
      } else {
        showMessage(`프로필 업데이트 실패: ${res.data.message || '알 수 없는 오류'}`, 'error');
        console.error('프로필 업데이트 실패 (백엔드 응답):', res.data.message);
      }
    } catch (error) {
      console.error('프로필 업데이트 중 오류 발생:', error);
      showMessage('프로필 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
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
    setMessage(''); // 메시지 초기화
  };

  // --- UI에 표시될 성별 및 MBTI 옵션 (문자열 그대로) ---
  const genderOptions = ['선택','남자', '여자'];
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

      {/* 메시지 표시 영역 */}
      {message && (
        <MessageBar type={messageType}>
          {message}
        </MessageBar>
      )}

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
                  onChange={handleImageSelect}
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
              value={isEditing ? editData.gender : (profileData.gender===null?'선택':profileData.gender)}
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
