const express = require('express');
const app = express();
const mysql = require('mysql2');
const path = require('path')
const fetch = require('node-fetch'); // API 호출을 위해 사용
const https = require('https')
const iconv = require('iconv-lite'); // ✅ 추가
const KAKAO_REST_API_KEY = '30382bad8e7221eb3b4c8f89fcd78114'; 


// node에서 react로 응답 보내기 위해 cors설정
const cors = require('cors')
app.use(cors())
app.use(express.json())

let conn = mysql.createConnection({
    host: 'project-db-campus.smhrd.com',
    port: 3307,
    user : 'campus_25SW_BigData_p2_2',
    password: 'smhrd2',
    database : 'campus_25SW_BigData_p2_2'
})

// http://localhost:3001
// 회원가입
app.post('/', (req, res)=>{
    const {id, pw, nick, gender, name, birthDay, introduce, phoneNumber,mbti, usertype} = req.body
    console.log('접근 확인!')
    let sql = 'insert into users(user_id, user_pw,user_name, phone_number, nickname, birth_date, gender, introduce,mbti, user_type) values(?,?,?,?,?,?,?,?,?,?)';
    
    conn.connect(); // db 연결통로 열기
    conn.query(sql, [id, pw,name, phoneNumber,nick,birthDay,gender,introduce,mbti, usertype],(err,rows)=>{
        if(!err) {
            console.log('입력성공')
            res.send("가입성공")
        }
        else {
            console.log('입력실패')
            console.log(err)
            res.send('가입실패')
        }
    })
    
})

// 로그인
app.post('/login', (req,res) => {
    const {id, pw} = req.body;
    let sql = 'select * from users where user_id = ? and user_pw = ?';
    
    console.log('로그인 요청')
    console.log(req.body);
    
    conn.connect(); // db 연결통로 열기
    conn.query(sql, [id,pw],(err,rows) => {
        if(!err) {
            if(rows.length>0) {
                res.send("인증성공")
            }
            else {
                
                res.send("인증실패")
            }
        }
        else {
            console.log(err);
        }
    })
    
})

app.post('/mypage', (req,res) => {
    const {userId} = req.body;

    let sql = `select user_id, user_name, phone_number, nickname, DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date, gender, profile_image_url, introduce, mbti, manner_score, user_type from users where user_id = ?;`;
    
    console.log('마이페이지 정보 요청')
    console.log(req.body);
    
    conn.connect(); // db 연결통로 열기
    conn.query(sql, [userId],(err,rows) => {
        if(!err) {
            const userData = rows[0];
            console.log(userData,'유저데이터');
            res.status(200).json({
                success:true,
                message:'마이페이지 정보 조회 성공',
                data : userData
            })
        }
        else {
            console.log(err);
        }
    })
})

app.post('/profileupdate', (req,res) => {
    console.log('마이페이지 수정 요청')
    console.log(req.body);
    const {userId, nickname, profileImage, birth_date, gender, phone_number, mbti, introduce} = req.body
    console.log(userId);
    let sql = 'update users set nickname = ?, profile_image_url = ? , birth_date = ?, gender = ?, phone_number = ?,mbti = ?,introduce=? where user_id = ?';
    conn.connect();
    conn.query(sql,[nickname, profileImage, birth_date, gender, phone_number, mbti, introduce, userId] ,(err, rows)=>{
        if(!err){
            console.log(rows)
            res.send('변경성공')
                
        } else {
            console.log(err);
        }
    })
})

app.post('/pwchange',(req,res) => {
    console.log('비밀번호 변경 요청');
    console.log(req.body);
    const {userId, currentPassword, newPassword} = req.body;
    let sql = 'select * from users where user_id = ? and user_pw = ?';
    
    console.log(req.body);
    
    conn.connect(); // db 연결통로 열기
    conn.query(sql, [userId,currentPassword],(err,rows) => {
        if(!err) {
            if(rows.length>0) {
                let sql2 = 'update users set user_pw = ? where user_id = ?'
                conn.query(sql2, [newPassword, userId],(err,rows) => {
                    if(!err) {
                        console.log(rows);
                        res.send('변경성공')
                    }
                    else {
                        console.log(err)
                    }
                });
            }
            else {
                res.send("인증실패")
            }
        }
        else {
            console.log(err);
        }
    })
})

app.get('/place/beach', (req,res)=>{
    let sql = `select place_name, address, main_image_url from place where place_type = '해수욕장'`
    conn.connect();
    conn.query(sql, (err, rows)=>{
        if(!err){
            // console.log(rows)
            res.status(200).json({
                beach : rows
            })
        } else {
            console.log(err);
        }
    })
})

app.get('/place/tour', (req,res)=>{
    let sql = `select place_name, latitude, longitude, description, main_image_url, operating_time, phone_number, place_type from place where place_type in('관광지', '맛집', '레저')`
    conn.connect();
    conn.query(sql, (err, rows)=>{
        if(!err){
            // console.log(rows)
            res.status(200).json({
                tour : rows
            })
        } else {
            console.log(err)
        }
    })
})

app.post('/place/add', async (req, res) => {
    const { userId, placeName, description, address, mainImageUrl, placeType, operationHours, phone_number } = req.body;
    console.log('새로운 장소 추가 요청:', req.body);

    let latitude = null;
    let longitude = null;

    try {
        // Kakao Local API (주소 검색)를 사용하여 위도, 경도 가져오기
        const kakaoApiUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
        const response = await fetch(kakaoApiUrl, {
            headers: {
                'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
            }
        });
        const data = await response.json();

        if (data.documents && data.documents.length > 0) {
            latitude = data.documents[0].y; // 위도 (latitude)
            longitude = data.documents[0].x; // 경도 (longitude)
            console.log(`주소 "${address}"에 대한 위도: ${latitude}, 경도: ${longitude} 검색 성공 (카카오맵 API)`);
        } else {
            console.warn(`주소 "${address}"에 대한 위도, 경도를 찾을 수 없습니다. (카카오맵 API 응답:`, data);
        }
    } catch (error) {
        console.error('카카오맵 API 호출 중 오류 발생:', error);
    }

    // 데이터베이스에 장소 정보 저장
    const sql = `
        INSERT INTO place (user_id, place_name, description, address, latitude, longitude, main_image_url, place_type, operating_time, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [userId, placeName, description, address, latitude, longitude, mainImageUrl, placeType, operationHours, phone_number];

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

app.post('/place/get', async (req, res)=>{
    const {userId} = req.body
    if (!userId){
        return res.status(400).json({sucess:false, message:'userId가 필요합니다'})
    }
    try {
    const [rows] = await db.query(
      `SELECT 
         place_name, 
         description, 
         address, 
         main_image_url, 
         place_type, 
         operation_time, 
         phone_number 
       FROM place 
       WHERE user_id = ? 
       LIMIT 1`, 
      [userId]
    );

    if (rows.length === 0) {
      return res.status(200).json({ success: true, place: null }); // 등록된 사업체 없음
    }

    return res.status(200).json({ success: true, place: rows[0] });

  } catch (err) {
    console.error('사업체 정보 조회 오류:', err);
    res.status(500).json({ success: false, message: '서버 오류 발생' });
  }
})

app.listen(3001)
