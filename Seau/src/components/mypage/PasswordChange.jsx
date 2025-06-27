import React, { useState, useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'

// --- Styled Components ---
const Card = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const CardHeader = styled.div`
  padding: 24px 24px 0 24px;
`;

const CardTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
`;

const Description = styled.p`
  color: #6b7280;
  font-size: 16px;
`;

const CardContent = styled.div`
  padding: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
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

const InputWrapper = styled.div`
  position: relative;
`;

const StyledLockIcon = styled(Lock)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding-left: 44px;
  padding-right: 44px;
  padding-top: 12px;
  padding-bottom: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
  ${(props) =>
    props.hasError
      ? `
    border-color: #ef4444;
  `
      : ''}

  &:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s;

  &:hover {
    color: #6b7280;
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 14px;
  margin-top: 4px;
`;

const HelpText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(to right, #7c3aed, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;

  &:hover {
    background: linear-gradient(to right, #6d28d9, #2563eb);
  }
`;
// --- Styled Components 끝 ---

export function PasswordChange() {
  // UserContext에서 userId를 가져와 비밀번호 변경 요청에 사용
  const { userId } = useContext(UserContext);
  const navigate = useNavigate(); // 성공/실패 후 리다이렉트가 필요할 경우 사용

  // 입력한 비밀번호 데이터 관리
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 비밀번호 보이기/숨기기 관리
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // 입력 에러 메세지 관리
  const [errors, setErrors] = useState({});

  // 사용자 입력값 변경 시 필드 업데이트
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 사용자가 입력할 때 해당 필드의 에러 메시지를 지웁니다.
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // 비밀번호 보이기/숨기기 함수
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // 비밀번호 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호와 일치하지 않습니다.';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = '현재 비밀번호와 다른 비밀번호를 입력해주세요.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => { // handleSubmit을 async 함수로 변경
    e.preventDefault();
    if (validateForm()) {
      // 백엔드로 보낼 데이터
      const dataToSend = {
        userId: userId, // UserContext에서 가져온 사용자 ID
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      try {
        // 백엔드에 비밀번호 변경 요청
        const response = await axios.post('http://localhost:3001/pwchange', dataToSend);
        console.log(response);
        if (response.data == '변경성공') { // 백엔드에서 { success: true }를 보낼 경우
          alert('비밀번호가 성공적으로 변경되었습니다!');
          setFormData({ // 성공 후 폼 초기화
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
          // 선택적으로 사용자 리다이렉트 또는 성공 메시지 표시
          // navigate('/mypage'); // 예시: 마이페이지로 리다이렉트
        } else {
          // 백엔드에서 success: false와 메시지를 보낼 경우
          alert(`비밀번호 변경 실패 현재 비밀번호를 확인하세요!': ${response.data || '알 수 없는 오류가 발생했습니다.'}`);
          // 백엔드 응답에 따라 특정 에러를 설정할 수도 있습니다.
          // 예: response.data.message가 현재 비밀번호 오류를 나타낼 경우
          // setErrors({ currentPassword: response.data.message });
        }
      } catch (error) {
        console.error('비밀번호 변경 요청 중 오류 발생:', error);
        if (error.response) {
          // 요청이 전송되었고, 서버가 2xx 범위 밖의 상태 코드로 응답한 경우
          alert(`서버 오류: ${error.response.data.message || '요청 처리 중 문제가 발생했습니다.'}`);
        } else if (error.request) {
          // 요청이 전송되었지만 응답을 받지 못한 경우 (네트워크 오류 등)
          alert('서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요.');
        } else {
          // 요청 설정 중 오류가 발생한 경우
          alert('비밀번호 변경 중 예상치 못한 오류가 발생했습니다.');
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>비밀번호 변경</CardTitle>
        <Description>보안을 위해 정기적으로 비밀번호를 변경해주세요.</Description>
      </CardHeader>

      <CardContent>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>현재 비밀번호</Label>
            <InputWrapper>
              <StyledLockIcon size={20} />
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                hasError={!!errors.currentPassword}
              />
              <ToggleButton type="button" onClick={() => togglePasswordVisibility('current')}>
                {showPasswords.current ?  <Eye size={20} /> : <EyeOff size={20} /> }
              </ToggleButton>
            </InputWrapper>
            {errors.currentPassword && <ErrorText>{errors.currentPassword}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>새 비밀번호</Label>
            <InputWrapper>
              <StyledLockIcon size={20} />
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
                hasError={!!errors.newPassword}
              />
              <ToggleButton type="button" onClick={() => togglePasswordVisibility('new')}>
                {showPasswords.new ?  <Eye size={20} /> : <EyeOff size={20} /> }
              </ToggleButton>
            </InputWrapper>
            {errors.newPassword && <ErrorText>{errors.newPassword}</ErrorText>}
            {/* 8자 이상 도움말 제거 */}
            <HelpText>새로운 비밀번호를 입력해주세요.</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>새 비밀번호 확인</Label>
            <InputWrapper>
              <StyledLockIcon size={20} />
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
                hasError={!!errors.confirmPassword}
              />
              <ToggleButton type="button" onClick={() => togglePasswordVisibility('confirm')}>
                {showPasswords.confirm ?  <Eye size={20} /> : <EyeOff size={20} /> }
              </ToggleButton>
            </InputWrapper>
            {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
          </FormGroup>

          <SubmitButton type="submit">비밀번호 변경</SubmitButton>
        </Form>
      </CardContent>
    </Card>
  );
}