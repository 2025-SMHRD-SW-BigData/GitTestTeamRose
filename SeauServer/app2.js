const express = require('express');
const app = express();
const mysql = require('mysql2');
const path = require('path')
const fetch = require('node-fetch');
const https = require('https')
const iconv = require('iconv-lite'; 
const cors = require('cors')

// JWT 모듈 추가
const jwt = require('jsonwebtoken');
require('dotenv').config(); // .env 파일 로드 (JWT_SECRET 등을 .env에 저장)

const KAKAO_REST_API_KEY = '30382bad8e7221eb3b4c8f89fcd78114'; 

// node에서 react로 응답 보내기 위해 cors설정
app.use(cors())
app.use(express.json())

let conn = mysql.createConnection({
     host: 'project-db-campus.smhrd.com',
    port: 3307,
    user : 'campus_25SW_BigData_p2_2',
    password: 'smhrd2',
    database : 'campus_25SW_BigData_p2_2'
});

// 데이터베이스 연결 확인
conn.connect(err => {
    if (err) {
        console.error('MySQL 연결 실패:', err);
        return;
    }
    console.log('MySQL 데이터베이스에 성공적으로 연결되었습니다.');
});

// JWT 비밀 키 설정 (실제 환경에서는 .env 파일에 저장하고 process.env.JWT_SECRET으로 불러오세요)
// .env 파일에 JWT_SECRET=your_simple_secret_jwt_key 와 같이 추가
const JWT_SECRET = process.env.JWT_SECRET || 'your_simple_secret_jwt_key'; 

// --- JWT 인증 미들웨어 (간략 버전) ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 'Bearer TOKEN' 형식에서 TOKEN만 추출

    if (token == null) {
        return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT 검증 실패:', err);
            return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
        }
        req.user = user; // 토큰에서 추출한 사용자 정보를 req.user에 저장
        next(); 
    });
};

// --- 라우트 시작 ---

// 회원가입 (기존과 동일, 비밀번호 평문 저장)
app.post('/', (req, res)=>{
    const {id, pw, nick, gender, name, birthDay, introduce, phoneNumber,mbti} = req.body
    console.log('접근 확인!')
    let sql = 'insert into users(user_id_name, user_pw,user_name, phone_number, nickname, birth_date, gender, introduce,mbti) values(?,?,?,?,?,?,?,?,?)';

    conn.query(sql, [id, pw,name, phoneNumber,nick,birthDay,gender,introduce,mbti],(err,rows)=>{
        if(!err) {
            console.log('입력성공')
            res.status(201).send("가입성공") // 201 Created
        }
        else {
            console.error('입력실패:', err)
            res.status(500).send('가입실패') // 500 Internal Server Error
        }
    })
});

// 로그인 (JWT 발급 추가)
app.post('/login', (req,res) => {
    const {id, pw} = req.body;
    // user_id는 데이터베이스의 실제 PRIMARY KEY (자동증가하는 숫자 ID)라고 가정합니다.
    // user_id_name은 사용자가 로그인할 때 입력하는 ID 문자열이라고 가정합니다.
    let sql = 'select user_id, user_id_name, user_pw from users where user_id_name = ? and user_pw = ?'; 

    console.log('로그인 요청:', req.body);

    conn.query(sql, [id,pw],(err,rows) => {
        if(!err) {
            if(rows.length > 0) {
                const user = rows[0];
                // JWT 토큰 발급
                const token = jwt.sign(
                    { userId: user.user_id_name, dbId: user.user_id }, // 토큰에 사용자 식별 정보 포함
                    JWT_SECRET, // 비밀 키
                    { expiresIn: '1h' } // 토큰 유효 시간 1시간 설정
                );
                    res.status(200).json({ 
                    message: "인증성공", 
                    token: token, 
                    userId: user.user_id_name, // 클라이언트에 로그인 아이디도 함께 보냄
                    dbId: user.user_id // 클라이언트에 데이터베이스 ID도 함께 보냄
                });
            }
            else {
                    res.status(401).json({ message: "인증실패" }); // 401 Unauthorized
            }
        }
        else {
            console.error('로그인 쿼리 오류:', err);
            res.status(500).send('서버 오류');
        }
    })
});

// 마이페이지 정보 (JWT 인증 미들웨어 적용)
app.post('/mypage', authenticateToken, (req,res) => { // authenticateToken 미들웨어 추가
  // req.user는 authenticateToken 미들웨어에서 토큰 검증 후 주입됩니다.
  const userIdFromToken = req.user.userId; // 토큰에서 추출된 user_id_name

  let sql = `select user_id, user_name, phone_number, nickname, DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date, gender, profile_image_url, introduce, mbti, manner_score from users where user_id_name = ?;`;
  
  console.log('마이페이지 정보 요청 (토큰 기반):', userIdFromToken);
  
  conn.query(sql, [userIdFromToken],(err,rows) => {
    if(!err) {
      if(rows.length > 0) {
        const userData = rows[0];
        console.log('유저 데이터:', userData);
        res.status(200).json({
          success:true,
          message:'마이페이지 정보 조회 성공',
          data : userData
        })
      } else {
                res.status(404).json({ success: false, message: '사용자 정보를 찾을 수 없습니다.' });
            }
    }
    else {
      console.error('마이페이지 정보 조회 오류:', err);
      res.status(500).json({ success: false, message: '서버 오류로 인해 정보를 불러올 수 없습니다.' });
    }
  })
});

// 프로필 업데이트 (JWT 인증 미들웨어 적용)
app.post('/profileupdate', authenticateToken, (req,res) => { // authenticateToken 미들웨어 추가
  console.log('마이페이지 수정 요청');
  const userIdFromToken = req.user.userId; // 토큰에서 추출된 user_id_name
  const { nickname, profileImage, birth_date, gender, phone_number, mbti, introduce } = req.body
  
  let sql = 'update users set nickname = ?, profile_image_url = ? , birth_date = ?, gender = ?, phone_number = ?,mbti = ?,introduce=? where user_id_name = ?';
  
  conn.query(sql,[nickname, profileImage, birth_date, gender, phone_number, mbti, introduce, userIdFromToken] ,(err, rows)=>{
    if(!err){
      console.log('프로필 변경 성공:', rows);
      res.status(200).send('변경성공');
    } else {
      console.error('프로필 변경 실패:', err);
      res.status(500).send('서버 오류로 인해 변경에 실패했습니다.');
    }
  })
});

// 비밀번호 변경 (JWT 인증 미들웨어 적용)
app.post('/pwchange', authenticateToken, (req,res) => { // authenticateToken 미들웨어 추가
  console.log('비밀번호 변경 요청');
  const userIdFromToken = req.user.userId; // 토큰에서 추출된 user_id_name
  const { currentPassword, newPassword } = req.body; // 이 부분도 실제로는 currentPassword를 검증해야 하지만, 간략화를 위해 새 비밀번호로 바로 업데이트

  // 현재 비밀번호 확인은 생략하고 바로 업데이트하는 예시입니다 (보안상 좋지 않음).
  // 실제로는 `select user_pw from users where user_id_name = ?` 쿼리 후 currentPassword와 비교해야 합니다.
  let sql = 'update users set user_pw = ? where user_id_name = ?';
  
  conn.query(sql, [newPassword, userIdFromToken],(err,rows) => {
    if(!err) {
      console.log('비밀번호 변경 성공:', rows);
      res.status(200).send('변경성공');
    } else {
      console.error('비밀번호 변경 실패:', err);
      res.status(500).send('서버 오류로 인해 변경에 실패했습니다.');
    }
  });
});


// 나머지 API 라우트들은 그대로 유지됩니다.
app.get('/place/beach', (req,res)=>{
  let sql = `select place_name, address, main_image_url from place where place_type = '해수욕장'`
  conn.query(sql, (err, rows)=>{
    if(!err){
      res.status(200).json({ beach : rows })
    } else {
      console.error('해수욕장 정보 조회 오류:', err);
      res.status(500).json({ message: '서버 오류' });
    }
  })
})

app.get('/place/tour', (req,res)=>{
  let sql = `select place_name, latitude, longitude, description, main_image_url, operating_time, phone_number, place_type from place where place_type in('관광지', '맛집', '레저')`
  conn.query(sql, (err, rows)=>{
    if(!err){
      res.status(200).json({ tour : rows })
    } else {
      console.error('관광지/맛집/레저 정보 조회 오류:', err);
      res.status(500).json({ message: '서버 오류' });
    }
  })
})

app.post('/place/add', async (req, res) => {
  const { placeName, description, address, mainImageUrl, placeType, operationHours, phone_number } = req.body;
  console.log('새로운 장소 추가 요청:', req.body);

  let latitude = null;
  let longitude = null;

  try {
    const kakaoApiUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
    const response = await fetch(kakaoApiUrl, {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
      }
    });
    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      latitude = data.documents[0].y;
      longitude = data.documents[0].x;
      console.log(`주소 "${address}"에 대한 위도: ${latitude}, 경도: ${longitude} 검색 성공 (카카오맵 API)`);
    } else {
        console.warn(`주소 "${address}"에 대한 위도, 경도를 찾을 수 없습니다. (카카오맵 API 응답:`, data);
        }
    } catch (error) {
        console.error('카카오맵 API 호출 중 오류 발생:', error);
    }

    const sql = `INSERT INTO place (place_name, description, address, latitude, longitude, main_image_url, place_type, operating_time, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)`;

    const values = [placeName, description, address, latitude, longitude, mainImageUrl, placeType, operationHours, phone_number];

    conn.query(sql, values, (err, result) => {
        if (!err) {
            console.log('장소 정보 데이터베이스에 성공적으로 추가됨:', result);
            res.status(201).json({ success: true, message: '장소 정보가 성공적으로 추가되었습니다.', placeId: result.insertId });
        } else {
            console.error('데이터베이스에 장소 정보 추가 실패:', err);
            res.status(500).json({ success: false, message: '서버 오류로 인해 장소 정보 추가에 실패했습니다.' });
        }
    });
});


app.listen(3001, () => {
    console.log('Node.js 서버가 3001번 포트에서 실행 중입니다.');
});