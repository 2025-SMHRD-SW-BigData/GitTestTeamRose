import React, {useState, useContext, useEffect} from 'react'
import { UserContext } from '../context/UserContext';
import {useNavigate} from 'react-router-dom'
import axios from 'axios';

const Mypage = () => {
  const [userData, setUserData] = useState(null);

  const nav = useNavigate();
  const { userId } = useContext(UserContext);
  const { setUserId } = useContext(UserContext);
  const { isOauth } = useContext(UserContext);
  const [profileUrl, setProfileUrl] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [nick, setNick] = useState('');
  const [phoneNumberm, setPhonNumber] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [preferType, setPreferType] = useState('');
  const [mannerScore, setMannerScore] = useState(0);
  console.log(userId, isOauth)

  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [mbti, setMbti] = useState('');
  const [phone, setPhone] = useState('');
  const [intro, setIntro] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    alert('저장 완료!');
  };
  
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

  const { setIsOauth } = useContext(UserContext);
  const handleLogOut = () => {
    setIsOauth(false)
    setUserId("");
    console.log(isOauth)
    nav('/')
  }


  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.logo}>Sea-U 🌊</h1>
        <span style={styles.userText}>{isOauth ? `${nickname || userId}님의 My Page` : '로그인 해주세요'}</span>
        <button style={styles.headerButton} onClick={handleLogOut}>{isOauth ? '로그아웃' : '로그인'}</button>
      </header>

      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <button style={styles.menuButton}>🌊 활동 기록</button>
          <button style={styles.menuButton} onClick={() => setShowPasswordForm(!showPasswordForm)}>
            🔐 비밀번호 변경
          </button>
          <button style={styles.menuButton}>🪸 고객센터</button>
        </aside>

        <main style={styles.mainCenter}>
          <section style={styles.cardCenterLarge}>
            <img
              src={profileImage || 'https://via.placeholder.com/220'}
              alt="프로필"
              style={styles.profileImageXLarge}
            />
            <div style={styles.cardInfoTextBox}>
              <p style={styles.infoText}><strong>닉네임:</strong> {userData?.nickname || '미입력'}</p>
              <p style={styles.infoText}><strong>MBTI:</strong> {userData?.mbti || '미입력'}</p>
              <p style={styles.infoText}><strong>나이:</strong> {age || '미입력'}</p>
              <p style={styles.infoText}><strong>성별:</strong> {userData?.gender=="male"?'남자':'여자' || '미입력'}</p>
              <p style={styles.infoText}><strong>소개:</strong> {userData?.introduce || '미입력'}</p>
            </div>
          </section>

          <section style={styles.formLarge}>
            <h2 style={styles.title}>회원정보 수정</h2>

            <div style={styles.gridRow}>
              <label style={styles.label}>프로필 사진<br />
                {profileImage && <img src={profileImage} alt="미리보기" style={styles.preview} />}
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <div style={styles.gridRow}>
              <label style={styles.label}>닉네임<br />
                <input style={styles.inputRaised} type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />
              </label>
              <label style={styles.label}>전화번호<br />
                <input style={styles.inputRaised} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
            </div>

            <div style={styles.gridRow}>
              <label style={styles.label}>나이<br />
                <input style={styles.inputRaised} type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              </label>
              <label style={styles.label}>성별<br />
                <select style={styles.inputRaised} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">선택</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </select>
              </label>
            </div>

            <div style={styles.gridRow}>
              <label style={styles.label}>MBTI<br />
                <select style={styles.inputRaised} value={mbti} onChange={(e) => setMbti(e.target.value)}>
                  <option value="">선택</option>
                  {["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
                    "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label style={styles.label}>소개<br />
                <input style={styles.inputRaised} type="text" value={intro} onChange={(e) => setIntro(e.target.value)} />
              </label>
            </div>

            <button style={styles.saveButton} onClick={handleSubmit}>저장</button>
          </section>

          {showPasswordForm && (
            <section style={styles.formLarge}>
              <h2 style={styles.title}>비밀번호 변경</h2>
              <div style={styles.gridRow}>
                <label style={styles.label}>현재 비밀번호<br />
                  <input style={styles.inputRaised} type="password" />
                </label>
                <label style={styles.label}>새 비밀번호<br />
                  <input style={styles.inputRaised} type="password" />
                </label>
              </div>
              <label style={styles.label}>새 비밀번호 확인<br />
                <input style={styles.inputRaised} type="password" />
              </label>
              <button style={styles.saveButton}>비밀번호 변경</button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: 'linear-gradient(135deg, #e2f0f8, #f6fbfd)',
    minHeight: '100vh',
    fontFamily: '"Gowun Dodum", "Gmarket Sans", "sans-serif"',
    color: '#3a3a3a'
  },
  header: {
    backgroundColor: '#a5d8f3',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    boxShadow: '0 6px 16px rgba(0, 160, 220, 0.2)',
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px'
  },
  logo: {
    fontSize: '2.6rem',
    fontWeight: '900',
    color: '#007ab8',
    textShadow: '2px 2px 0 #ffffff'
  },
  userText: {
    fontSize: '1.3rem',
    color: '#005f88',
    fontWeight: '600'
  },
  headerButton: {
    backgroundColor: 'white',
    color: '#007acc',
    padding: '0.7rem 1.4rem',
    border: 'none',
    borderRadius: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem',
    boxShadow: '2px 2px 6px rgba(0,0,0,0.05)'
  },
  container: {
    display: 'flex',
    padding: '2rem 4rem',
    gap: '2rem'
  },
  sidebar: {
    width: '240px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.6rem'
  },
  menuButton: {
    backgroundColor: '#d0eefc',
    border: 'none',
    padding: '1.2rem 1.6rem',
    borderRadius: '20px',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: 'inset 2px 2px 6px #b2e3f9, inset -2px -2px 6px #ffffff'
  },
  mainCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem'
  },
  cardCenterLarge: {
    backgroundColor: '#ffffffee',
    padding: '2.5rem 3.5rem',
    borderRadius: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.4rem',
    boxShadow: '6px 6px 16px rgba(0, 160, 220, 0.15)',
    width: '100%',
    maxWidth: '750px'
  },
  profileImageXLarge: {
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '6px solid #bce7ff',
    boxShadow: 'inset 4px 4px 8px #d6f3ff, inset -4px -4px 8px #ffffff'
  },
  cardInfoTextBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem'
  },
  infoText: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#2c2c2c'
  },
  formLarge: {
    backgroundColor: '#ffffffee',
    padding: '2.5rem 3.5rem',
    borderRadius: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.6rem',
    boxShadow: '6px 6px 16px rgba(0, 160, 220, 0.1)',
    width: '100%',
    maxWidth: '750px'
  },
  title: {
    fontSize: '2rem',
    color: '#007ab8',
    fontWeight: '900',
    fontFamily: '"Gowun Dodum", "sans-serif"',
    textShadow: '1px 1px 0 #ffffff'
  },
  gridRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem'
  },
  label: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#333',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    flex: 1,
    minWidth: '240px'
  },
  inputRaised: {
    padding: '1rem 1.4rem',
    borderRadius: '20px',
    border: 'none',
    background: 'linear-gradient(145deg, #dcefff, #f2faff)',
    boxShadow: '6px 6px 12px #a6d0ff, -6px -6px 12px #ffffff',
    fontSize: '1.1rem',
    fontFamily: '"Gowun Dodum", "sans-serif"',
    color: '#005f99',
    fontWeight: '600',
    outline: 'none'
  },
  preview: {
    width: '90px',
    height: '90px',
    borderRadius: '14px',
    objectFit: 'cover',
    marginTop: '0.5rem'
  },
  saveButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#6fc5f7',
    color: 'white',
    border: 'none',
    padding: '1rem 2rem',
    borderRadius: '22px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '1rem',
    fontSize: '1.1rem',
    boxShadow: '2px 2px 10px rgba(0, 150, 255, 0.25)',
    fontFamily: '"Gowun Dodum", "sans-serif"'
  }
};

export default Mypage;



