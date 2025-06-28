import React, { useState, useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import { ProfileManagement } from './ProfileManagement';
import { PasswordChange } from './PasswordChange';
import { CustomerSupport } from './CustomerSupport';
import { User, Lock, HelpCircle, Calendar } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import axios from 'axios';
import {useNavigate} from 'react-router-dom'
import ScheduleMangement from './ScheduleMangement';
import BusinessProfileForm from './BusinessProfileForm';

// Container 전체 페이지 배경과 패딩
const Container = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
  padding-top: 64px;
`;

// 내부 최대 너비 및 좌우 패딩
const MaxWidth = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
`;

// 헤더 영역
const Header = styled.div`
  margin-bottom: 32px;
  padding-top: 32px;
`;

// 제목
const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
`;

// 부제목
const Subtitle = styled.p`
  color: #6b7280;
  font-size: 18px;
`;

// 그리드 (반응형 처리)
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 32px;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`;

// 사이드바
const Sidebar = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: fit-content;
`;

// 네비게이션 메뉴
const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 0;
`;

// 네비 버튼
const NavButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  margin: 2px 4px;
  cursor: pointer;
  color: ${({ active }) => (active ? '#7c3aed' : '#6b7280')};
  border-right: ${({ active }) => (active ? '2px solid #7c3aed' : 'none')};
  background-color: ${({ active }) => (active ? '#f3f4f6' : 'transparent')};
  transition: all 0.2s;

  &:hover {
    background-color: ${({ active }) => (active ? '#f3f4f6' : '#f9fafb')};
    color: #111827;
  }
`;

// 아이콘 마진
const NavIcon = styled.span`
  margin-right: 12px;
  display: flex;
  align-items: center;
`;

// 메인 컨텐츠 영역
const Content = styled.div`
  min-height: 500px;
`;

// 상단 네비게이션 바
// const NavigationBar = styled.nav`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   height: 64px;
//   background-color: white;
//   border-bottom: 1px solid #e5e7eb;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   padding: 0 24px;
//   z-index: 1000;
// `;

// 로고 스타일
const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #7c3aed;
`;

// 인증 버튼 그룹
const AuthButtons = styled.div`
  display: flex;
  gap: 12px;
`;

// 인증 버튼 기본 스타일
const AuthButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: white;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background-color: #f9fafb;
  }
`;

// 인증 버튼 주 스타일 (회원가입 버튼)
const AuthButtonPrimary = styled(AuthButton)`
  background-color: #7c3aed;
  color: white;
  border: 1px solid #7c3aed;

  &:hover {
    background-color: #6d28d9;
  }
`;

// AuthSidebar 백드롭
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// AuthSidebar 박스
const SidebarBox = styled.div`
  background-color: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
`;

// 닫기 버튼
const CloseButton = styled.button`
  margin-top: 16px;
  padding: 8px 16px;
  background-color: #7c3aed;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

// function Navigation({ onLoginClick, onSignupClick }) {
//   return (
//     <NavigationBar>
//       <Logo>MyApp</Logo>
//       <AuthButtons>
//         <AuthButton onClick={onLoginClick}>로그인</AuthButton>
//         <AuthButtonPrimary onClick={onSignupClick}>회원가입</AuthButtonPrimary>
//       </AuthButtons>
//     </NavigationBar>
//   );
// }

function AuthSidebar({ isOpen, onClose, initialMode }) {
  if (!isOpen) return null;

  return (
    <Backdrop>
      <SidebarBox>
        <h2>{initialMode === 'login' ? '로그인' : '회원가입'}</h2>
        <p>여기에 {initialMode === 'login' ? '로그인' : '회원가입'} 폼이 들어갑니다.</p>
        <CloseButton onClick={onClose}>닫기</CloseButton>
      </SidebarBox>
    </Backdrop>
  );
}

export default function MyPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [userData, setUserData] = useState(null);
  const nav = useNavigate();
  const { userId, setUserId } = useContext(UserContext);
  const { isOauth } = useContext(UserContext);
  console.log(userId, isOauth)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log('통신요청')
    axios
      .post('http://localhost:3001/mypage', {
        userId: userId
        
      })
      .then((res) => {
        console.log(res.data.data);
        const result = res.data.data;
        setUserData(result);
        console.log(userData);
      })

  }, [userData?.gender])

  const handleLoginClick = () => {
    setAuthMode('login');
    setIsSidebarOpen(true);
  };

  const handleSignupClick = () => {
    setAuthMode('signup');
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => setIsSidebarOpen(false);

  const menuItems = [
    { id: 'profile', label: '프로필 관리', icon: <User size={20} /> },
    { id: 'password', label: '비밀번호 변경', icon: <Lock size={20} /> },
    { id: 'support', label: '고객센터', icon: <HelpCircle size={20} /> },
    { id: 'schedule', label: '스케줄 생성', icon: <Calendar size={20} /> },
  ];

  const renderContent = () => {
    if(!userData) return null;

    switch (activeSection) {
      case 'profile':
        if(userData.user_type === 1){
          return <BusinessProfileForm userId={userData.user_id} />
        } else {
          return <ProfileManagement />;
        }
      case 'password':
        return <PasswordChange />;
      case 'support':
        return <CustomerSupport />;
      case 'schedule':
        return <ScheduleMangement />;
      default:
        return <ProfileManagement />;
    }
  };

  return (
    <>
      {/* <Navigation onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} /> */}
      {/* <AuthSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} initialMode={authMode} /> */}

      <Container>
        <MaxWidth>
          <Header>
            <Title>마이페이지</Title>
            <Subtitle>계정 정보를 관리하고 설정을 변경하세요.</Subtitle>
          </Header>

          <Grid>
            <Sidebar>
              <Nav>
                {menuItems.map((item) => (
                  <NavButton
                    key={item.id}
                    active={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    type="button"
                  >
                    <NavIcon>{item.icon}</NavIcon>
                    {item.label}
                  </NavButton>
                ))}
              </Nav>
            </Sidebar>

            <Content>{renderContent()}</Content>
          </Grid>
        </MaxWidth>
      </Container>
    </>
  );
}
