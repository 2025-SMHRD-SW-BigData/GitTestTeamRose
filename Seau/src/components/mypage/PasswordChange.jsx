import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Eye, EyeOff, Lock } from 'lucide-react';

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

export function PasswordChange() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 8자 이상이어야 합니다.';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      alert('비밀번호가 성공적으로 변경되었습니다!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
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
                {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
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
                {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
              </ToggleButton>
            </InputWrapper>
            {errors.newPassword && <ErrorText>{errors.newPassword}</ErrorText>}
            <HelpText>8자 이상의 비밀번호를 입력해주세요.</HelpText>
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
                {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
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
