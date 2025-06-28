const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const path = require('path')
const fetch = require('node-fetch');
const https = require('https')
const iconv = require('iconv-lite');
const KAKAO_REST_API_KEY = '30382bad8e7221eb3b4c8f89fcd78114';


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

const pool = mysql.createPool({
    host: 'project-db-campus.smhrd.com',
    port: 3307,
    user : 'campus_25SW_BigData_p2_2',
    password: 'smhrd2',
    database : 'campus_25SW_BigData_p2_2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log('MySQL Connection Pool이 설정되었습니다.');


// --- 라우트 핸들러들 ---

// 회원가입
app.post('/', async (req, res)=>{
    let connection;
    try {
        connection = await pool.getConnection();
        const {id, pw, nick, gender, name, birthDay, introduce, phoneNumber,mbti, usertype} = req.body
        console.log('접근 확인!');
        let sql = 'insert into users(user_id, user_pw,user_name, phone_number, nickname, birth_date, gender, introduce,mbti, user_type) values(?,?,?,?,?,?,?,?,?,?)';

        const [rows] = await connection.query(sql, [id, pw,name, phoneNumber,nick,birthDay,gender,introduce,mbti,usertype]);

        console.log('입력성공', rows);
        res.send("가입성공");
    }
    catch (err) {
        console.error('입력실패', err);
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(409).send('이미 존재하는 ID 또는 닉네임입니다.');
        } else {
            res.status(500).send('가입실패');
        }
    } finally {
        if (connection) connection.release();
    }
});

// 로그인
app.post('/login', async (req,res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const {id, pw} = req.body;
        let sql = 'select * from users where user_id = ? and user_pw = ?';

        console.log('로그인 요청');
        console.log(req.body);

        const [rows] = await connection.query(sql, [id,pw]);

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
        if (connection) connection.release();
    }
});

// 마이페이지 조회
app.post('/mypage', async (req,res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { userId } = req.body;

        // 1. 사용자 데이터 가져오기
        // 리액트에서 보낸 userId는 users 테이블의 user_id 컬럼과 비교할거야.
        let userSql = `SELECT user_id, user_name, phone_number, nickname, DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date, gender, profile_image_url, introduce, mbti, manner_score, user_type FROM users WHERE user_id = ?;`;

        console.log('마이페이지 정보 요청:', userId);

        const [userRows] = await connection.query(userSql, [userId]);

        if(userRows.length > 0) {
            const userData = userRows[0];
            console.log('유저 데이터:', userData);

            let placeData = null; // placeData를 null로 초기화

            // 2. user_type이 1이면 연결된 장소 데이터 가져오기
            if (userData.user_type === 1) {
                // place 테이블에 user_id 컬럼이 사용자 소유자를 나타낸다고 가정합니다.
                let placeSql = `SELECT * FROM place WHERE user_id = ?`;
                const [placeRows] = await connection.query(placeSql, [userId]);

                if (placeRows.length > 0) {
                    placeData = placeRows; // 이 사용자와 연결된 모든 장소 전송
                    console.log('장소 데이터:', placeData);
                } else {
                    console.log(`userId ${userId}에 연결된 장소 정보가 없습니다.`);
                }
            }

            // 3. 결합된 응답 전송
            res.status(200).json({
                success: true,
                message: '마이페이지 정보 조회 성공',
                data: {
                    user: userData,
                    place: placeData // placeData 포함 (장소 배열 또는 null)
                }
            });
        } else {
            res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error('마이페이지 정보 조회 중 오류 발생:', err);
        res.status(500).json({ success: false, message: '서버 오류: 마이페이지 정보 조회 실패' });
    } finally {
        if (connection) connection.release();
    }
});

// 프로필 업데이트
app.post('/profileupdate', async (req,res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('마이페이지 수정 요청');
        console.log(req.body);
        const {userId, nickname, profileImage, birth_date, gender, phone_number, mbti, introduce} = req.body;
        console.log(userId);
        let sql = 'update users set nickname = ?, profile_image_url = ? , birth_date = ?, gender = ?, phone_number = ?,mbti = ?,introduce=? where user_id = ?';
        
        const [rows] = await connection.query(sql,[nickname, profileImage, birth_date, gender, phone_number, mbti, introduce, userId]);

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
        if (connection) connection.release();
    }
});

// 비밀번호 변경
app.post('/pwchange', async (req,res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('비밀번호 변경 요청');
        console.log(req.body);
        const {userId, currentPassword, newPassword} = req.body;
        let sql = 'select * from users where user_id = ? and user_pw = ?';

        const [rows] = await connection.query(sql, [userId,currentPassword]);

        if(rows.length > 0) {
            let sql2 = 'update users set user_pw = ? where user_id = ?';
            const [result2] = await connection.query(sql2, [newPassword, userId]);
            
            console.log(result2);
            if (result2.affectedRows > 0) {
                res.send('변경성공');
            } else {
                res.status(500).send('비밀번호 업데이트 실패');
            }
        }
        else {
            res.send("인증실패");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('서버 오류: 비밀번호 변경 실패');
    } finally {
        if (connection) connection.release();
    }
});

// 해수욕장 정보 조회
app.get('/place/beach', async (req,res)=>{
    let connection;
    try {
        connection = await pool.getConnection();
        let sql = `select place_name, address, main_image_url from place where place_type = '해수욕장'`;
        const [rows] = await connection.query(sql);
        
        res.status(200).json({
            beach : rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류: 해수욕장 정보 조회 실패' });
    } finally {
        if (connection) connection.release();
    }
});

// 관광지/맛집/레저 정보 조회
app.get('/place/tour', async (req,res)=>{
    let connection;
    try {
        connection = await pool.getConnection();
        let sql = `select place_name, latitude, longitude, description, main_image_url, operating_time, phone_number, place_type from place where place_type in('관광지', '맛집', '레저')`;
        const [rows] = await connection.query(sql);
        
        res.status(200).json({
            tour : rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류: 관광지/맛집/레저 정보 조회 실패' });
    } finally {
        if (connection) connection.release();
    }
});

app.post('/place/add', async (req, res) => {
    let connection; // 데이터베이스 연결을 위한 변수 선언
    try {
        connection = await pool.getConnection(); // 연결 풀에서 연결 가져오기

        const { userId, placeName, description, address, mainImageUrl, placeType, operationHours, phone_number } = req.body;
        console.log('새로운 장소 추가 요청:', req.body);

        let latitude = null;
        let longitude = null;

        try {
            // 카카오 로컬 API(주소 검색)를 사용하여 위도, 경도 가져오기
            const kakaoApiUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
            const response = await fetch(kakaoApiUrl, {
                headers: {
                    'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
                }
            });
            const data = await response.json();

            if (data.documents && data.documents.length > 0) {
                latitude = data.documents[0].y; // 위도
                longitude = data.documents[0].x; // 경도
                console.log(`주소 "${address}"에 대한 위도: ${latitude}, 경도: ${longitude} 검색 성공 (카카오맵 API)`);
            } else {
                console.warn(`주소 "${address}"에 대한 위도, 경도를 찾을 수 없습니다. (카카오맵 API 응답:`, data);
            }
        } catch (error) {
            console.error('카카오맵 API 호출 중 오류 발생:', error);
            // 카카오 API 호출에 실패하더라도, DB 저장은 시도하도록 흐름을 유지합니다.
        }

        // 데이터베이스에 장소 정보 저장
        const sql = `
            INSERT INTO place (user_id, place_name, description, address, latitude, longitude, main_image_url, place_type, operating_time, phone_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [userId, placeName, description, address, latitude, longitude, mainImageUrl, placeType, operationHours, phone_number];

        const [result] = await connection.query(sql, values); // 연결 풀에서 가져온 connection으로 쿼리 실행

        console.log('장소 정보 데이터베이스에 성공적으로 추가됨:', result);
        res.status(201).json({ success: true, message: '장소 정보가 성공적으로 추가되었습니다.', placeId: result.insertId });
    } catch (err) {
        console.error('데이터베이스에 장소 정보 추가 실패:', err);
        res.status(500).json({ success: false, message: '서버 오류로 인해 장소 정보 추가에 실패했습니다.' });
    } finally {
        if (connection) connection.release(); // 사용한 연결을 연결 풀에 반환
    }
});

app.post('/place/get', async (req, res) => {
    let connection; // 데이터베이스 연결을 위한 변수 선언
    try {
        connection = await pool.getConnection(); // 연결 풀에서 연결 가져오기

        const { userId } = req.body;
        // 리액트에서 보낸 userId는 users 테이블의 user_id 컬럼과 비교할거야.
        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId가 필요합니다.' });
        }

        const [rows] = await connection.query( // 연결 풀에서 가져온 connection으로 쿼리 실행
            `SELECT 
                place_name, 
                description, 
                address, 
                main_image_url, 
                place_type, 
                operating_time, 
                phone_number 
             FROM place 
             WHERE user_id = ?`,
            [userId]
        );

        if (rows.length > 0) {
            // 해당 user_id에 연결된 장소가 하나만 있다고 가정하고 첫 번째 행을 반환합니다.
            // 만약 한 사용자가 여러 장소를 가질 수 있다면 `rows` 전체를 반환하도록 변경해야 합니다.
            res.status(200).json({
                success: true,
                message: '장소 정보 조회 성공',
                data: rows[0]
            });
        } else {
            res.status(404).json({ success: false, message: '해당 사용자 ID에 연결된 장소를 찾을 수 없습니다.' });
        }
    } catch (err) {
        console.error('장소 정보 조회 중 오류 발생:', err);
        res.status(500).json({ success: false, message: '서버 오류: 장소 정보 조회 실패' });
    } finally {
        if (connection) connection.release(); // 사용한 연결을 연결 풀에 반환
    }
});

// 스케쥴 생성
app.post('/createschedule', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
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

        if (!userId || !title || !address || !scheduled_date || !max_participants || !cost_per_person) {
            return res.status(400).json({ success: false, message: '모든 필수 필드를 입력해주세요.' });
        }

        let latitude = null;
        let longitude = null;
        let placeIdFromDB = null;

        const findPlaceQuery = `SELECT place_id FROM place WHERE user_id = ?`;
        const [placeRows] = await connection.query(findPlaceQuery, [userId]);
        if (placeRows.length > 0) {
            placeIdFromDB = placeRows[0].place_id;
            console.log(`userId "${userId}"에 연결된 place_id: ${placeIdFromDB}를 찾았습니다.`);
        } else {
            console.warn(`userId "${userId}"에 연결된 place_id를 찾을 수 없습니다. (place 테이블에 해당 user_id이 없거나, 컬럼 이름이 다를 수 있습니다)`);
        }

        const kakaoApiUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
        const kakaoResponse = await fetch(kakaoApiUrl, {
            headers: {
                'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}`
            }
        });
        const kakaoData = await kakaoResponse.json();

        if (kakaoData.documents && kakaoData.documents.length > 0) {
            const firstResult = kakaoData.documents[0];
            longitude = parseFloat(firstResult.x);
            latitude = parseFloat(firstResult.y);
            console.log(`주소 "${address}" -> 위도: ${latitude}, 경도: ${longitude}`);
        } else {
            console.warn(`카카오맵에서 주소 "${address}"에 대한 좌표를 찾을 수 없습니다.`);
        }

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
            placeIdFromDB
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
        if (connection) connection.release();
    }
});

// 사용자 스케쥴 조회
app.post('/schedules', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId가 필요합니다.' });
        }

        let sql = 'SELECT * FROM schedules WHERE user_id = ? ORDER BY scheduled_date DESC';
        const [rows] = await connection.query(sql, [userId]);
        
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error('스케쥴 조회 중 오류 발생:', err);
        res.status(500).json({ success: false, message: '서버 오류: 스케쥴 조회에 실패했습니다.' });
    } finally {
        if (connection) connection.release();
    }
});


// 서버 시작
app.listen(3001, () => {
    console.log(`Node.js 서버가 http://localhost:3001 에서 실행 중입니다.`);
});