import React, { useState } from 'react';
import styled from '@emotion/styled';
import { ChevronDown, ChevronUp, Phone, Mail, MessageCircle, Clock } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

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

const CardTitleMedium = styled.h2`
  font-size: 20px;
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

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
`;

const ContactMethod = styled.div`
  text-align: center;
  padding: 24px;
  background-color: #f9fafb;
  border-radius: 8px;
`;

const ContactIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  color: #7c3aed;
`;

const ContactTitle = styled.h3`
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
`;

const ContactInfo = styled.p`
  font-size: 18px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
`;

const ContactDesc = styled.p`
  font-size: 14px;
  color: #6b7280;
`;

const FAQContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FAQItem = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const FAQButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9fafb;
  }
`;

const FAQQuestion = styled.span`
  font-weight: 500;
  color: #111827;
`;

const FAQAnswer = styled.div`
  padding: 16px;
  padding-top: 0;
  color: #6b7280;
  border-top: 1px solid #f3f4f6;
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

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;

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
  box-sizing: border-box;

  &:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
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

  &:hover {
    background: linear-gradient(to right, #6d28d9, #2563eb);
  }
`;

export function CustomerSupport() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({
    category: "",
    title: "",
    content: "",
  });

  const faqs = [
    {
      id: 1,
      question: "비밀번호를 잊어버렸어요. 어떻게 재설정하나요?",
      answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하시고, 가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.",
    },
    {
      id: 2,
      question: "프로필 사진은 어떻게 변경하나요?",
      answer: "마이페이지 > 프로필 관리에서 '수정' 버튼을 클릭한 후, 프로필 사진 옆의 카메라 아이콘을 클릭하여 새로운 사진을 업로드할 수 있습니다.",
    },
    {
      id: 3,
      question: "계정을 삭제하고 싶어요.",
      answer: "계정 삭제는 고객센터로 직접 문의해주시기 바랍니다. 삭제된 계정은 복구가 불가능하므로 신중히 결정해주세요.",
    },
    {
      id: 4,
      question: "서비스 이용 중 오류가 발생했어요.",
      answer: "오류 발생 시 스크린샷과 함께 상세한 상황을 고객센터로 문의해주시면 빠르게 해결해드리겠습니다.",
    },
  ];

  const contactMethods = [
    {
      icon: <Phone size={24} />,
      title: "전화 문의",
      info: "1588-1234",
      description: "평일 09:00 - 18:00",
    },
    {
      icon: <Mail size={24} />,
      title: "이메일 문의",
      info: "support@company.com",
      description: "24시간 접수 가능",
    },
    {
      icon: <MessageCircle size={24} />,
      title: "실시간 채팅",
      info: "채팅 상담",
      description: "평일 09:00 - 18:00",
    },
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryForm.category || !inquiryForm.title || !inquiryForm.content) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    alert("문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.");
    setInquiryForm({ category: "", title: "", content: "" });
  };

  return (
    <Container>
      {/* 연락처 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>고객센터</CardTitle>
          <Description>궁금한 점이 있으시면 언제든지 문의해주세요.</Description>
        </CardHeader>
        <CardContent>
          <ContactGrid>
            {contactMethods.map((method, index) => (
              <ContactMethod key={index}>
                <ContactIcon>{method.icon}</ContactIcon>
                <ContactTitle>{method.title}</ContactTitle>
                <ContactInfo>{method.info}</ContactInfo>
                <ContactDesc>{method.description}</ContactDesc>
              </ContactMethod>
            ))}
          </ContactGrid>
        </CardContent>
      </Card>

      {/* 자주 묻는 질문 */}
      <Card>
        <CardHeader>
          <CardTitleMedium>자주 묻는 질문</CardTitleMedium>
        </CardHeader>
        <CardContent>
          <FAQContainer>
            {faqs.map((faq) => (
              <FAQItem key={faq.id}>
                <FAQButton onClick={() => toggleFAQ(faq.id)}>
                  <FAQQuestion>{faq.question}</FAQQuestion>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp size={20} color="#6b7280" />
                  ) : (
                    <ChevronDown size={20} color="#6b7280" />
                  )}
                </FAQButton>
                {expandedFAQ === faq.id && (
                  <FAQAnswer>
                    <p style={{ paddingTop: '16px' }}>{faq.answer}</p>
                  </FAQAnswer>
                )}
              </FAQItem>
            ))}
          </FAQContainer>
        </CardContent>
      </Card>

      {/* 1:1 문의 */}
      <Card>
        <CardHeader>
          <CardTitleMedium>1:1 문의</CardTitleMedium>
          <Description>FAQ에서 해결되지 않은 문제가 있으시면 직접 문의해주세요.</Description>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleInquirySubmit}>
            <FormGroup>
              <Label>문의 유형</Label>
              <Select
                value={inquiryForm.category}
                onChange={(e) => setInquiryForm((prev) => ({ ...prev, category: e.target.value }))}
                required
              >
                <option value="">문의 유형을 선택해주세요</option>
                <option value="account">계정 관련</option>
                <option value="technical">기술적 문제</option>
                <option value="service">서비스 이용</option>
                <option value="billing">결제/환불</option>
                <option value="other">기타</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>제목</Label>
              <Input
                type="text"
                value={inquiryForm.title}
                onChange={(e) => setInquiryForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="문의 제목을 입력해주세요"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>내용</Label>
              <Textarea
                value={inquiryForm.content}
                onChange={(e) => setInquiryForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={6}
                placeholder="문의 내용을 자세히 입력해주세요"
                required
              />
            </FormGroup>

            <TimeInfo>
              <Clock size={16} />
              <span>평균 답변 시간: 24시간 이내</span>
            </TimeInfo>

            <SubmitButton type="submit">문의하기</SubmitButton>
          </Form>
        </CardContent>
      </Card>
    </Container>
  );
}
