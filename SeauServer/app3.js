const express = require('express');
const app = express();
const mysql = require('mysql2/promise'); // ✅ Promise API를 사용하는 mysql2 모듈로 변경
const path = require('path')
const fetch = require('node-fetch'); // API 호출을 위해 사용
const https = require('https')
const iconv = require('iconv-lite'); // ✅ 추가
const KAKAO_REST_API_KEY = '30382bad8e7221eb3b4c8f89fcd78114';


// node에서 react로 응답 보내기 위해 cors설정
const cors = require('cors')
app.use(cors())
app.use(express.json())

// --- MySQL 데이터베이스 Connection Pool 설정 (가장 중요한 변경점) ---
const pool = mysql.createPool({
    host: 'project-db-campus.smhrd.com',
    port: 3307,
    user : 'campus_25SW_BigData_p2_2',
    password: 'smhrd2',
    database : 'campus_25SW_BigData_p2_2',
    waitForConnections: true, // 풀에 사용 가능한 연결이 없을 때 대기
    connectionLimit: 10,     // 최대 동시 연결 수
    queueLimit: 0            // 대기 큐의 최대 크기 (0 = 무제한)
});

console.log('MySQL Connection Pool이 설정되었습니다.');


// --- 라우트 핸들러들 ---

// http://localhost:3001
// 회원가입
app.post('/', async (req, res)=>{ // ✅ async 추가
    let connection; // ✅ connection 변수 선언
    try {
        connection = await pool.getConnection(); // ✅ 풀에서 연결 가져오기
        const {id, pw, nick, gender, name, birthDay, introduce, phoneNumber,mbti} = req.body
        console.log('접근 확인!');
        let sql = 'insert into users(user_id, user_pw,user_name, phone_number, nickname, birth_date, gender, introduce,mbti) values(?,?,?,?,?,?,?,?,?)';

        const [rows] = await connection.query(sql, [id, pw,name, phoneNumber,nick,birthDay,gender,introduce,mbti]); // ✅ await 사용

        console.log('입력성공', rows);
        res.send("가입성공");
    }
    catch (err) {
        console.error('입력실패', err); // ✅ console.error로 변경
        // MySQL 에러 코드 (예: ER_DUP_ENTRY)에 따른 구체적인 응답 가능
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).send('이미 존재하는 ID 또는 닉네임입니다.'); // Conflict
        } else {
            res.status(500).send('가입실패'); // Server Error
        }
    } finally {
        if (connection) connection.release(); // ✅ 연결 반납
    }
});

// 로그인
app.post('/login', async (req,res) => { // ✅ async 추가
    let connection;
    try {
        connection = await pool.getConnection(); // ✅ 풀에서 연결 가져오기
        const {id, pw} = req.body;
        let sql = 'select * from users where user_id = ? and user_pw = ?';

        console.log('로그인 요청');
        console.log(req.body);

        const [rows] = await connection.query(sql, [id,pw]); // ✅ await 사용

        if(rows.length > 0) {
            res.send("인증성공");
        }
        else {
            res.send("인증실패");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류 발생');
    } finally {
        if (connection) connection.release(); // ✅ 연결 반납
    }
});

app.post('/mypage', async (req,res) => { // ✅ async 추가
    let connection;
    try {
        connection = await pool.getConnection(); // ✅ 풀에서 연결 가져오기
        const {userId} = req.body;

        let sql = `select user_id, user_name, phone_number, nickname, DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date, gender, profile_image_url, introduce, mbti, manner_score from users where user_id = ?;`;

        console.log('마이페이지 정보 요청');
        console.log(req.body);

        const [rows] = await connection.query(sql, [userId]); // ✅ await 사용

        if(rows.length > 0) {
            const userData = rows[0];
            console.log(userData, '유저데이터');
            res.status(200).json({
                success:true,
                message:'마이페이지 정보 조회 성공',
                data : userData
            });
        } else {
            res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류: 마이페이지 정보 조회 실패' });
    } finally {
        if (connection) connection.release(); // ✅ 연결 반납
    }
});

app.post('/profileupdate', async (req,res) => { // ✅ async 추가
    let connection;
    try {
        connection = await pool.getConnection(); // ✅ 풀에서 연결 가져오기
        console.log('마이페이지 수정 요청');
        console.log(req.body);
        const {userId, nickname, profileImage, birth_date, gender, phone_number, mbti, introduce} = req.body;
        console.log(userId);
        let sql = 'update users set nickname = ?, profile_image_url = ? , birth_date = ?, gender = ?, phone_number = ?,mbti = ?,introduce=? where user_id = ?';
        
        const [rows] = await connection.query(sql,[nickname, profileImage, birth_date, gender, phone_number, mbti, introduce, userId]); // ✅ await 사용

        console.log(rows);
        if (rows.affectedRows > 0) {
            res.send('변경성공');
        } else {
            res.status(404).send('사용자를 찾을 수 없거나 변경된 내용이 없습니다.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류: 프로필 변경 실패');
    } finally {
        if (connection) connection.release(); // ✅ 연결 반납
    }
});

app.post('/pwchange', async (req,res) => { // ✅ async 추가
    let connection;
    try {
        connection = await pool.getConnection(); // ✅ 풀에서 연결 가져오기
        console.log('비밀번호 변경 요청');
        console.log(req.body);
        const {userId, currentPassword, newPassword} = req.body;
        let sql = 'select * from users where user_id = ? and user_pw = ?';

        const [rows] = await connection.query(sql, [userId,currentPassword]); // ✅ await 사용

        if(rows.length > 0) {
            let sql2 = 'update users set user_pw = ? where user_id = ?';
            const [result2] = await connection.query(sql2, [newPassword, userId]); // ✅ await 사용
            
            console.log(result2);
            if (result2.affectedRows > 0) {
                res.send('변경성공');
            } else {
                res.status(500).send('비밀번호 업데이트 실패');
            }
        }
        else {
            res.send("인증실패"); // 현재 비밀번호 불일치
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류: 비밀번호 변경 실패');
    } finally {
        if (connection) connection.release(); // ✅ 연결 반납
    }
});

app.get('/place/beach', async (req,res)=>{ // ✅ async 추가
    let connection;
    try {
        connection = await pool.getConnection(); // ✅ 풀에서 연결 가져오기
        let sql = `select place_name, address, main_image_url from place where place_type = '해수욕장'`;
        const [rows] = await connection.query(sql); // ✅ await 사용
        
        res.status(200).json({
            beach : rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류: 해수욕장 정보 조회 실패' });
    } finally {
        if (connection) connection.release(); // ✅ 연결 반납
    }
});

app.get('/place/tour', async (req,res)=>{ // ✅ async 추가
    let connection;
    try {
        connection = await pool.getConnection(); // ✅ 풀에서 연결 가져오기
        let sql = `select place_name, latitude, longitude, description, main_image_url, operating_time, phone_number, place_type from place where place_type in('관광지', '맛집', '레저')`;
        const [rows] = await connection.query(sql); // ✅ await 사용
        
        res.status(200).json({
            tour : rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류: 관광지/맛집/레저 정보 조회 실패' });
    } finally {
        if (connection) connection.release(); // ✅ 연결 반납
    }
});

app.post('/place/add', async (req, res) => { // ✅ async 추가
    let connection;
    try {
        connection = await pool.getConnection(); // ✅ 풀에서 연결 가져오기
        const { placeName, description, address, mainImageUrl, placeType, operationHours, phone_number } = req.body;
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
            // Kakao API 오류라도 DB 저장은 시도하도록 유지
        }

        // 데이터베이스에 장소 정보 저장
        const sql = `
            INSERT INTO place (place_name, description, address, latitude, longitude, main_image_url, place_type, operating_time, phone_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
        `;
        const values = [placeName, description, address, latitude, longitude, mainImageUrl, placeType, operationHours, phone_number];

        const [result] = await connection.query(sql, values); // ✅ await 사용

        console.log('장소 정보 데이터베이스에 성공적으로 추가됨:', result);
        res.status(201).json({ success: true, message: '장소 정보가 성공적으로 추가되었습니다.', placeId: result.insertId });
    } catch (err) {
        console.error('데이터베이스에 장소 정보 추가 실패:', err);
        res.status(500).json({ success: false, message: '서버 오류로 인해 장소 정보 추가에 실패했습니다.' });
    } finally {
        if (connection) connection.release(); // ✅ 연결 반납
    }
});

app.post('/createschedule', async (req, res) => { // ✅ async 추가
    let connection;
    try {
        connection = await pool.getConnection(); // ✅ 풀에서 연결 가져오기
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
        let placeIdFromDB = null;

        // 1. userId를 이용해 `places` 테이블에서 place_id 조회 (주의: place 테이블에 userId가 없다면 다른 기준으로 찾아야 함)
        // 현재 `places` 테이블에 `userId` 컬럼이 있다는 가정하에 작성되었습니다.
        // 만약 `places` 테이블에 `place_id`만 있고 `userId`가 없다면, 이 로직은 `place_id`를 찾을 수 없습니다.
        // 이 경우 `place_id`를 `places` 테이블에 직접적으로 삽입하는 로직을 고려하거나, `place_id`가 필수가 아니라면 null로 두는 것을 고려해야 합니다.
        const findPlaceQuery = `SELECT place_id FROM place WHERE user_id = ?`; // place 테이블에 user_id 컬럼이 있다면 사용
        // 만약 place 테이블에 user_id 컬럼이 없다면 이 쿼리는 무의미하며, place_id는 직접 받아오거나 생성해야 합니다.
        const [placeRows] = await connection.query(findPlaceQuery, [userId]);
        if (placeRows.length > 0) {
            placeIdFromDB = placeRows[0].place_id;
            console.log(`userId "${userId}"에 연결된 place_id: ${placeIdFromDB}를 찾았습니다.`);
        } else {
            console.warn(`userId "${userId}"에 연결된 place_id를 찾을 수 없습니다. (place 테이블에 해당 user_id이 없거나, 컬럼 이름이 다를 수 있습니다)`);
            // place_id가 필수가 아니라면 null로 진행, 필수라면 여기서 에러 처리
        }

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
        const insertScheduleQuery = `
            INSERT INTO schedules
            (user_id, title, description, location_name, latitude, longitude, address, scheduled_date, max_participants, cost_per_person, place_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(insertScheduleQuery, [
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
        ]);

        console.log('스케쥴 데이터 삽입 성공:', result);
        res.status(201).json({ success: true, message: '스케쥴이 성공적으로 생성되었습니다!', scheduleId: result.insertId });

    } catch (error) {
        console.error('스케쥴 생성 중 오류 발생:', error);
        if (error.response && error.response.status === 401) {
            return res.status(401).json({ success: false, message: '카카오맵 API 인증 오류입니다. API 키를 확인해주세요.' });
        }
        res.status(500).json({ success: false, message: '서버 오류: 스케쥴 생성에 실패했습니다.' });
    } finally {
        if (connection) connection.release(); // ✅ 연결 반납
    }
});

// 사용자 스케쥴 조회
app.post('/schedules', async (req, res) => { // ✅ async 추가
    let connection;
    try {
        connection = await pool.getConnection(); // ✅ 풀에서 연결 가져오기
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId가 필요합니다.' });
        }

        let sql = 'SELECT * FROM schedules WHERE user_id = ? ORDER BY scheduled_date DESC';
        const [rows] = await connection.query(sql, [userId]); // ✅ await 사용
        
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('스케쥴 조회 중 오류 발생:', err);
        res.status(500).json({ success: false, message: '서버 오류: 스케쥴 조회에 실패했습니다.' });
    } finally {
        if (connection) connection.release(); // ✅ 연결 반납
    }
});


// 서버 시작
app.listen(3001, () => {
    console.log(`Node.js 서버가 http://localhost:3001 에서 실행 중입니다.`);
});