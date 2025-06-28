const express = require('express');
const app = express();
const mysql = require('mysql2'); // Promise 대신 콜백 기반 mysql2 유지
const path = require('path')
const fetch = require('node-fetch'); // API 호출을 위해 사용
const https = require('https')
const iconv = require('iconv-lite'); // ✅ 추가
const KAKAO_REST_API_KEY = '30382bad8e7221eb3b4c8f89fcd78114';


// node에서 react로 응답 보내기 위해 cors설정
const cors = require('cors')
app.use(cors())
app.use(express.json())

// --- MySQL 데이터베이스 연결 설정 (기존 코드 유지) ---
let conn = mysql.createConnection({
    host: 'project-db-campus.smhrd.com',
    port: 3307,
    user : 'campus_25SW_BigData_p2_2',
    password: 'smhrd2',
    database : 'campus_25SW_BigData_p2_2'
});

// http://localhost:3001
// 회원가입
app.post('/', (req, res)=>{
    const {id, pw, nick, gender, name, birthDay, introduce, phoneNumber,mbti} = req.body
    console.log('접근 확인!')
    let sql = 'insert into users(user_id, user_pw,user_name, phone_number, nickname, birth_date, gender, introduce,mbti) values(?,?,?,?,?,?,?,?,?)';

    conn.connect(); // db 연결통로 열기
    conn.query(sql, [id, pw,name, phoneNumber,nick,birthDay,gender,introduce,mbti],(err,rows)=>{
        if(!err) {
            console.log('입력성공')
            res.send("가입성공")
        }
        else {
            console.log('입력실패')
            console.log(err)
            res.send('가입실패')
        }
        conn.end(); // 연결 닫기 (요청마다 열고 닫는 방식)
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
        conn.end(); // 연결 닫기
    })

})

app.post('/mypage', (req,res) => {
    const {userId} = req.body;

    let sql = `select user_id, user_name, phone_number, nickname, DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date, gender, profile_image_url, introduce, mbti, manner_score from users where user_id = ?;`;

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
        conn.end(); // 연결 닫기
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
        conn.end(); // 연결 닫기
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
                    conn.end(); // 연결 닫기
                });
            }
            else {
                res.send("인증실패")
                conn.end(); // 연결 닫기
            }
        }
        else {
            console.log(err);
            conn.end(); // 연결 닫기
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
        conn.end(); // 연결 닫기
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
        conn.end(); // 연결 닫기
    })
})

app.post('/place/add', async (req, res) => {
    const { placeName, description, address, mainImageUrl, placeType, operationHours, phone_number } = req.body;
    console.log('새로운 장소 추가 요청:', req.body);

    let latitude = null;
    let longitude = null;

    // conn.connect()는 이 비동기 함수 안에서 처리될 때 문제가 생길 수 있으므로,
    // 이 방식에서는 conn.query의 콜백에서 conn.end()를 호출하지 않고,
    // 전체 요청 처리 후 마지막에 conn.end()를 호출하거나,
    // Promise 기반으로 전환하여 pool을 사용하는 것이 더 안전합니다.
    // 여기서는 기존 conn.query 콜백 패턴을 유지하기 위해 별도 처리합니다.
    conn.connect(); // DB 연결통로 열기

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
        INSERT INTO place (place_name, description, address, latitude, longitude, main_image_url, place_type, operating_time, phone_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
    `;
    const values = [placeName, description, address, latitude, longitude, mainImageUrl, placeType, operationHours, phone_number];

    conn.query(sql, values, (err, result) => {
        if (!err) {
            console.log('장소 정보 데이터베이스에 성공적으로 추가됨:', result);
            res.status(201).json({ success: true, message: '장소 정보가 성공적으로 추가되었습니다.', placeId: result.insertId });
        } else {
            console.error('데이터베이스에 장소 정보 추가 실패:', err);
            res.status(500).json({ success: false, message: '서버 오류로 인해 장소 정보 추가에 실패했습니다.' });
        }
        conn.end(); // 연결 닫기
    });
});



//### API 엔드포인트: 스케쥴 생성 (`/createschedule`)

//**가장 중요한 변경사항입니다.** `createschedule` 엔드포인트는 `userId`를 이용해 `place` 테이블에서 `place_id`를 조회하고, 이를 스케쥴 정보와 함께 `schedules` 테이블에 저장합니다.
app.post('/createschedule', async (req, res) => {
    const {
        userId,
        title,
        description,
        location_name,
        address,
        scheduled_date,
        max_participants,
        cost_per_person,
    } = req.body;

    // 필수 값 검증
    if (!userId || !title || !address || !scheduled_date || !max_participants || !cost_per_person) {
        return res.status(400).json({ success: false, message: '모든 필수 필드를 입력해주세요.' });
    }

    let latitude = null;
    let longitude = null;
    let placeIdFromDB = null; // place_id를 데이터베이스에서 조회하여 저장할 변수

    conn.connect(); // DB 연결통로 열기

    try {
        // 1. userId를 이용해 `place` 테이블에서 place_id 조회
        // 이 쿼리는 콜백 방식으로 실행됩니다. await를 사용하기 위해 Promise로 래핑합니다.
        const getPlaceIdPromise = new Promise((resolve, reject) => {
            const findPlaceQuery = `SELECT place_id FROM place WHERE user_id = ?`;
            conn.query(findPlaceQuery, [userId], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                if (rows.length > 0) {
                    resolve(rows[0].place_id);
                } else {
                    resolve(null); // 연결된 place_id가 없으면 null 반환
                }
            });
        });
        placeIdFromDB = await getPlaceIdPromise;
        console.log(`userId "${userId}"에 연결된 place_id: ${placeIdFromDB || '없음'}를 찾았습니다.`);

        // 2. 카카오맵 Geocoding API를 사용하여 주소를 위도/경도로 변환
        const kakaoApiUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
        const kakaoResponse = await fetch(kakaoApiUrl, {
            headers: {
                'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
            }
        });
        const kakaoData = await kakaoResponse.json();

        if (kakaoData.documents && kakaoData.documents.length > 0) {
            const firstResult = kakaoData.documents[0];
            longitude = parseFloat(firstResult.x); // 경도 (x)
            latitude = parseFloat(firstResult.y);  // 위도 (y)
            console.log(`주소 "${address}" -> 위도: ${latitude}, 경도: ${longitude}`);
        } else {
            console.warn(`카카오맵에서 주소 "${address}"에 대한 좌표를 찾을 수 없습니다.`);
        }
        // 3. MySQL 데이터베이스에 데이터 삽입
        const insertSchedulePromise = new Promise((resolve, reject) => {
            const query = `
                INSERT INTO schedules
                (user_id, title, description, location_name, latitude, longitude, address, scheduled_date, max_participants, cost_per_person, place_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            conn.query(query, [
                userId,
                title,
                description,
                location_name,
                latitude,
                longitude,
                address,
                scheduled_date,
                max_participants,
                cost_per_person,
                placeIdFromDB // DB에서 조회한 place_id 사용
            ], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
        const rows = await insertSchedulePromise;

        console.log('스케쥴 데이터 삽입 성공:', rows);
        res.status(201).json({ success: true, message: '스케쥴이 성공적으로 생성되었습니다!', scheduleId: rows.insertId });

    } catch (error) {
        console.error('스케쥴 생성 중 오류 발생:', error);
        if (error.response && error.response.status === 401) {
            return res.status(401).json({ success: false, message: '카카오맵 API 인증 오류입니다. API 키를 확인해주세요.' });
        }
        res.status(500).json({ success: false, message: '서버 오류: 스케쥴 생성에 실패했습니다.' });
    } finally {
        // finally 블록에서 연결 닫기 (항상 호출되도록)
        conn.end();
    }
});

//### API 엔드포인트: 사용자 스케쥴 조회 (`/schedules`)사용자 스케쥴을 조회하는 엔드포인트입니다. 이 역시 기존 `conn.query` 패턴을 따릅니다.
app.post('/schedules', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'userId가 필요합니다.' });
    }

    conn.connect(); // DB 연결통로 열기
    let sql = 'SELECT * FROM schedules WHERE user_id = ? ORDER BY scheduled_date DESC';
    conn.query(sql, [userId], (err, rows) => {
        if (!err) {
            res.json({ success: true, data: rows });
        } else {
            console.error('스케쥴 조회 중 오류 발생:', err);
            res.status(500).json({ success: false, message: '서버 오류: 스케쥴 조회에 실패했습니다.' });
        }
        conn.end(); // 연결 닫기
    });
});

app.listen(3001)