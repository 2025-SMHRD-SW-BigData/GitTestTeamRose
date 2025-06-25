/** @jsxImportSource @emotion/react */
import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { Edit, Save, X, Camera } from 'lucide-react';

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

// ProfileManagement 컴포넌트 코드에서 스타일 적용하기만 하면 됩니다.

export function ProfileManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nickname: '김철수',
    profileImage: '/placeholder.svg?height=100&width=100',
    birthDate: '1995-03-15',
    gender: '남성',
    phone: '010-1234-5678',
    mbti: 'ENFP',
    introduction: '안녕하세요! 새로운 기술을 배우는 것을 좋아하는 개발자입니다.',
  });
  const [editData, setEditData] = useState(profileData);

  const fileInputRef = useRef(null);

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

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    alert('프로필이 성공적으로 업데이트되었습니다!');
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const genderOptions = ['남성', '여성', '기타'];
  const mbtiOptions = [
    'INTJ',
    'INTP',
    'ENTJ',
    'ENTP',
    'INFJ',
    'INFP',
    'ENFJ',
    'ENFP',
    'ISTJ',
    'ISFJ',
    'ESTJ',
    'ESFJ',
    'ISTP',
    'ISFP',
    'ESTP',
    'ESFP',
  ];

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
                  {(isEditing ? editData.nickname : profileData.nickname).charAt(0)}
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
            {isEditing ? (
              <Input
                type="text"
                value={editData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
              />
            ) : (
              <ReadOnlyField>{profileData.nickname}</ReadOnlyField>
            )}
          </FormGroup>

          <FormGroup>
            <Label>생년월일</Label>
            {isEditing ? (
              <Input
                type="date"
                value={editData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
            ) : (
              <ReadOnlyField>{new Date(profileData.birthDate).toLocaleDateString('ko-KR')}</ReadOnlyField>
            )}
          </FormGroup>

          <FormGroup>
            <Label>성별</Label>
            {isEditing ? (
              <Select
                value={editData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                {genderOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            ) : (
              <ReadOnlyField>{profileData.gender}</ReadOnlyField>
            )}
          </FormGroup>

          <FormGroup>
            <Label>전화번호</Label>
            {isEditing ? (
              <Input
                type="tel"
                value={editData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            ) : (
              <ReadOnlyField>{profileData.phone}</ReadOnlyField>
            )}
          </FormGroup>

          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label>MBTI</Label>
            {isEditing ? (
              <Select
                value={editData.mbti}
                onChange={(e) => handleInputChange('mbti', e.target.value)}
              >
                {mbtiOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            ) : (
              <ReadOnlyField>{profileData.mbti}</ReadOnlyField>
            )}
          </FormGroup>

          <FormGroup style={{ gridColumn: '1 / -1' }}>
            <Label>자기소개</Label>
            {isEditing ? (
              <Textarea
                rows={4}
                placeholder="자신을 소개하는 글을 작성해보세요"
                value={editData.introduction}
                onChange={(e) => handleInputChange('introduction', e.target.value)}
              />
            ) : (
              <ReadOnlyField
                style={{ minHeight: '100px', whiteSpace: 'pre-wrap' }}
              >
                {profileData.introduction}
              </ReadOnlyField>
            )}
          </FormGroup>
        </GridMd2>
      </CardContent>
    </Card>
  );
}
