const express = require('express');
const app = express();
const mysql = require('mysql2');
const path = require('path');
const fetch = require('node-fetch');
const https = require('https');
const iconv = require('iconv-lite');
const KAKAO_REST_API_KEY = '30382bad8e7221eb3b4c8f89fcd78114';


// node에서 react로 응답 보내기 위해 cors설정
const cors = require('cors');
app.use(cors());
app.use(express.json());

// MySQL 연결 설정 (conn.connect()를 쿼리마다 호출하는 기존 스타일 유지)
let conn = mysql.createConnection({
    host: 'project-db-campus.smhrd.com',
    port: 3307,
    user: 'campus_25SW_BigData_p2_2',
    password: 'smhrd2',
    database: 'campus_25SW_BigData_p2_2'
});

// 중요: conn.connect()는 쿼리마다 호출하는 대신, 앱 시작 시 한 번만 호출하고 연결을 재사용하거나
// mysql2의 connection pool을 사용하는 것이 일반적이며 훨씬 효율적입니다.
// 현재 코드에서는 각 라우트 핸들러 내에서 conn.connect()를 호출하는 방식을 유지하지만,
// 실제 운영 환경에서는 성능 저하 및 연결 누수 문제가 발생할 수 있으니 개선을 강력히 권장합니다.

// --- 라우트 핸들러들 ---

// http://localhost:3001
// 회원가입
app.post('/', (req, res) => {
    const { id, pw, nick, gender, name, birthDay, introduce, phoneNumber, mbti, usertype } = req.body;
    console.log('접근 확인!');
    let sql = 'insert into users(user_id, user_pw,user_name, phone_number, nickname, birth_date, gender, introduce,mbti, user_type) values(?,?,?,?,?,?,?,?,?,?)';

    conn.connect(); // db 연결통로 열기
    conn.query(sql, [id, pw, name, phoneNumber, nick, birthDay, gender, introduce, mbti, usertype], (err, rows) => {
        if (!err) {
            console.log('입력성공');
            res.send("가입성공");
        }
        else {
            console.log('입력실패');
            console.log(err);
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(409).send('이미 존재하는 ID 또는 닉네임입니다.');
            } else {
                res.status(500).send('가입실패');
            }
        }
    });
});

// 로그인
app.post('/login', (req, res) => {
    const { id, pw } = req.body;
    let sql = 'select * from users where user_id = ? and user_pw = ?';

    console.log('로그인 요청');
    console.log(req.body);

    conn.connect(); // db 연결통로 열기
    conn.query(sql, [id, pw], (err, rows) => {
        if (!err) {
            if (rows.length > 0) {
                res.send("인증성공");
            }
            else {
                res.send("인증실패");
            }
        }
        else {
            console.error(err);
            res.status(500).send('서버 오류 발생');
        }
    });
});

// 마이페이지 조회
app.post('/mypage', (req, res) => {
    const { userId } = req.body;

    // 리액트에서 보낸 userId는 users 테이블의 user_id 컬럼과 비교할거야.
    let userSql = `SELECT user_id, user_pw, user_name, phone_number, nickname, DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date, gender, profile_image_url, introduce, mbti, manner_score, user_type FROM users WHERE user_id = ?;`;

    console.log('마이페이지 정보 요청:', userId);

    conn.connect(); // db 연결통로 열기
    conn.query(userSql, [userId], (err, userRows) => {
        if (err) {
            console.error('사용자 정보 조회 오류:', err);
            return res.status(500).json({ success: false, message: '서버 오류: 사용자 정보 조회 실패' });
        }

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        const userData = userRows[0];
        console.log('유저 데이터:', userData);

        let placeData = null; // placeData를 null로 초기화

        // user_type이 1이면 연결된 장소 데이터 가져오기
        if (userData.user_type === 1) {
            // place 테이블에 user_id 컬럼이 사용자 소유자를 나타낸다고 가정합니다.
            let placeSql = `SELECT * FROM place WHERE user_id = ?`;
            conn.query(placeSql, [userId], (placeErr, placeRows) => {
                if (placeErr) {
                    console.error('장소 정보 조회 오류:', placeErr);
                    return res.status(500).json({ success: false, message: '서버 오류: 장소 정보 조회 실패' });
                }

                if (placeRows.length > 0) {
                    placeData = placeRows; // 이 사용자와 연결된 모든 장소 전송
                    console.log('장소 데이터:', placeData);
                } else {
                    console.log(`userId ${userId}에 연결된 장소 정보가 없습니다.`);
                }

                // 모든 데이터가 준비되면 응답 전송
                res.status(200).json({
                    success: true,
                    message: '마이페이지 정보 조회 성공',
                    data: {
                        user: userData,
                        place: placeData // placeData 포함 (장소 배열 또는 null)
                    }
                });
            });
        } else {
            // user_type이 1이 아니면 바로 사용자 데이터만 응답
            res.status(200).json({
                success: true,
                message: '마이페이지 정보 조회 성공',
                data: {
                    user: userData,
                    place: null // user_type이 1이 아니므로 place는 null
                }
            });
        }
    });
});

// 프로필 업데이트
app.post('/profileupdate', (req, res) => {
    console.log('마이페이지 수정 요청');
    console.log(req.body);
    const { userId, nickname, profileImage, birth_date, gender, phone_number, mbti, introduce } = req.body;
    console.log(userId);
    let sql = 'update users set nickname = ?, profile_image_url = ? , birth_date = ?, gender = ?, phone_number = ?,mbti = ?,introduce=? where user_id = ?';
    conn.connect();
    conn.query(sql, [nickname, profileImage, birth_date, gender, phone_number, mbti, introduce, userId], (err, rows) => {
        if (!err) {
            console.log(rows);
            if (rows.affectedRows > 0) {
                res.send('변경성공');
            } else {
                res.status(404).send('사용자를 찾을 수 없거나 변경된 내용이 없습니다.');
            }
        } else {
            console.error(err);
            res.status(500).send('서버 오류: 프로필 변경 실패');
        }
    });
});

// 비밀번호 변경
app.post('/pwchange', (req, res) => {
    console.log('비밀번호 변경 요청');
    console.log(req.body);
    const { userId, currentPassword, newPassword } = req.body;
    let sql = 'select * from users where user_id = ? and user_pw = ?';

    conn.connect(); // db 연결통로 열기
    conn.query(sql, [userId, currentPassword], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('서버 오류 발생');
        }

        if (rows.length > 0) {
            let sql2 = 'update users set user_pw = ? where user_id = ?';
            conn.query(sql2, [newPassword, userId], (err2, result2) => {
                if (!err2) {
                    console.log(result2);
                    if (result2.affectedRows > 0) {
                        res.send('변경성공');
                    } else {
                        res.status(500).send('비밀번호 업데이트 실패: 변경된 내용 없음');
                    }
                }
                else {
                    console.error(err2);
                    res.status(500).send('서버 오류: 비밀번호 업데이트 실패');
                }
            });
        }
        else {
            res.send("인증실패");
        }
    });
});

// 해수욕장 정보 조회
app.get('/place/beach', (req, res) => {
    let sql = `select place_name, address, main_image_url from place where place_type = '해수욕장'`;
    conn.connect();
    conn.query(sql, (err, rows) => {
        if (!err) {
            res.status(200).json({
                beach: rows
            });
        } else {
            console.error(err);
            res.status(500).json({ success: false, message: '서버 오류: 해수욕장 정보 조회 실패' });
        }
    });
});

// 관광지/맛집/레저 정보 조회
app.get('/place/tour', (req, res) => {
    let sql = `select place_name, latitude, longitude, description, main_image_url, operating_time, phone_number, place_type, busy from place where place_type in('관광지', '맛집', '레저')`;
    conn.connect();
    conn.query(sql, (err, rows) => {
        if (!err) {
            res.status(200).json({
                tour: rows
            });
        } else {
            console.error(err);
            res.status(500).json({ success: false, message: '서버 오류: 관광지/맛집/레저 정보 조회 실패' });
        }
    });
});

// 새로운 장소 추가
app.post('/place/add', async (req, res) => { // fetch 사용으로 인해 async 유지
    const { userId, placeName, description, address, mainImageUrl, placeType, operationHours, phone_number, busy } = req.body;
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
        INSERT INTO place (user_id, place_name, description, address, latitude, longitude, main_image_url, place_type, operating_time, phone_number, busy)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [userId, placeName, description, address, latitude, longitude, mainImageUrl, placeType, operationHours, phone_number, busy];

    conn.connect(); // db 연결통로 열기
    conn.query(sql, values, (err, result) => {
        if (!err) {
            console.log('장소 정보 데이터베이스에 성공적으로 추가됨:', result);
            res.status(201).json({ success: true, message: '장소 정보가 성공적으로 추가되었습니다.', placeId: result.insertId });
        } else {
            console.error('데이터베이스에 장소 정보 추가 실패:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(409).json({ success: false, message: '이미 해당 사용자의 장소가 존재합니다.' });
            } else {
                res.status(500).json({ success: false, message: '서버 오류로 인해 장소 정보 추가에 실패했습니다.' });
            }
        }
    });
});

// 장소 정보 조회
app.post('/place/get', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ success: false, message: 'userId가 필요합니다' });
    }
    let sql = `SELECT place_name, description, address, main_image_url, place_type, operating_time, phone_number, busy FROM place WHERE user_id = ? LIMIT 1`;
    conn.connect(); // db 연결통로 열기
    conn.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error('사업체 정보 조회 오류:', err);
            return res.status(500).json({ success: false, message: '서버 오류 발생' });
        }

        if (rows.length === 0) {
            return res.status(200).json({ success: true, place: null, message: '등록된 장소가 없습니다.' });
        }

        return res.status(200).json({ success: true, place: rows[0], message: '장소 정보 조회 성공' });

    });
});

// 장소 정보 업데이트 (또는 없으면 추가)
app.post('/place/update', (req, res) => {
    const { userId, placeName, description, address, mainImageUrl, placeType, operationHours, phone_number, busy } = req.body;

    let updateSql = `
    UPDATE place
    SET place_name = ?, description = ?, address = ?, main_image_url = ?, place_type = ?, operating_time = ?, phone_number = ?, busy = ?
    WHERE user_id = ?
    `;

    const updateValues = [placeName, description, address, mainImageUrl, placeType, operationHours, phone_number, busy, userId];

    conn.connect(); // db 연결통로 열기
    conn.query(updateSql, updateValues, (err, result) => {
        if (err) {
            console.error('장소 정보 수정 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '장소 정보 수정 실패', error: err });
        }

        if (result.affectedRows === 0) {
            // 만약 user_id에 해당하는 데이터가 없으면 새로 INSERT
            const insertSql = `
            INSERT INTO place (user_id, place_name, description, address, main_image_url, place_type, operating_time, phone_number, busy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const insertValues = [userId, placeName, description, address, mainImageUrl, placeType, operationHours, phone_number, busy];

            conn.query(insertSql, insertValues, (insertErr, insertResult) => {
                if (!insertErr) {
                    res.json({ success: true, message: '새 장소 등록 완료', placeId: insertResult.insertId });
                } else {
                    console.error('새 장소 등록 중 오류 발생:', insertErr);
                    if (insertErr.code === 'ER_DUP_ENTRY') {
                        res.status(409).json({ success: false, message: '이미 해당 사용자 ID의 장소가 등록되어 있습니다.' });
                    } else {
                        res.status(500).json({ success: false, message: '장소 등록 실패', error: insertErr });
                    }
                }
            });
        } else {
            res.json({ success: true, message: '장소 정보 수정 완료' });
        }
    });
});

// 스케쥴 생성
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
        schedule_image_url,
        user_type,
    } = req.body;

    if (!userId || !title || !address || !scheduled_date || !max_participants || !cost_per_person) {
        return res.status(400).json({ success: false, message: '모든 필수 필드를 입력해주세요.' });
    }

    let latitude = null;
    let longitude = null;
    let placeIdFromDB = null;

    conn.connect(); // db 연결통로 열기

    // `place` 테이블에서 `user_id`로 `place_id`를 조회 (콜백으로 변경)
    const findPlaceQuery = `SELECT place_id FROM place WHERE user_id = ?`;
    conn.query(findPlaceQuery, [userId], async (findPlaceErr, placeRows) => {
        if (findPlaceErr) {
            console.error('placeId 조회 중 오류 발생:', findPlaceErr);
            return res.status(500).json({ success: false, message: '서버 오류: placeId 조회 실패' });
        }

        if (placeRows.length > 0) {
            placeIdFromDB = placeRows[0].place_id;
            console.log(`userId "${userId}"에 연결된 place_id: ${placeIdFromDB}를 찾았습니다.`);
        } else {
            console.warn(`userId "${userId}"에 연결된 place_id를 찾을 수 없습니다. (place 테이블에 해당 user_id이 없거나, 컬럼 이름이 다를 수 있습니다)`);
        }

        // 카카오맵 API 호출
        try {
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
        } catch (error) {
            console.error('카카오맵 API 호출 중 오류 발생:', error);
            if (error.response && error.response.status === 401) {
                return res.status(401).json({ success: false, message: '카카오맵 API 인증 오류입니다. API 키를 확인해주세요.' });
            }
            return res.status(500).json({ success: false, message: '서버 오류: 카카오맵 API 호출 실패' });
        }

        // 스케쥴 데이터 삽입 (콜백으로 변경)
        const insertScheduleQuery = `
            INSERT INTO schedules
            (user_id, title, description, location_name, latitude, longitude, address, scheduled_date, max_participants, cost_per_person, place_id, schedule_image_url, user_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        conn.query(insertScheduleQuery, [
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
            placeIdFromDB,
            schedule_image_url,
            user_type
        ], (insertErr, result) => {
            if (insertErr) {
                console.error('스케쥴 데이터 삽입 중 오류 발생:', insertErr);
                return res.status(500).json({ success: false, message: '서버 오류: 스케쥴 생성에 실패했습니다.' });
            }
            console.log('스케쥴 데이터 삽입 성공:', result);
            res.status(201).json({ success: true, message: '스케쥴이 성공적으로 생성되었습니다!', scheduleId: result.insertId });
        });
    });
});

// 내가 만든 스케줄 데이터 불러오기 (기존 /schedules 엔드포인트)
app.post('/schedules', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'userId가 필요합니다.' });
    }

    // 각 스케줄의 'checked_people' (req_status가 1인 멤버 수)을 포함하여 조회하는 SQL
    let sql = `
        SELECT
            s.*,
            COUNT(CASE WHEN sm.req_status = 1 THEN sm.req_user_id END) AS checked_people,
            COUNT(CASE WHEN sm.req_status = 0 THEN sm.req_user_id END) AS pending_people,
            COUNT(CASE WHEN sm.req_status = 2 THEN sm.req_user_id END) AS rejected_people
        FROM
            schedules s
        LEFT JOIN
            schedule_member sm ON s.schedule_id = sm.schedule_id
        WHERE
            s.user_id = ?
        GROUP BY
            s.schedule_id
        ORDER BY
            s.scheduled_date DESC;
    `;

    conn.connect(); // db 연결통로 열기
    conn.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error('스케쥴 조회 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '서버 오류: 스케쥴 조회에 실패했습니다.' });
        }
        res.json({ success: true, data: rows });
    });
});

// 새로 추가: 내가 신청한 스케줄 데이터 불러오기
app.post('/schedules/applied', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ success: false, message: 'userId가 필요합니다.' });
    }

    // schedule_member 테이블과 schedules 테이블을 조인하여 신청한 스케줄 정보 조회
    // 또한, 해당 스케줄의 총 참여자 수, 대기중, 수락됨, 거절됨 상태의 멤버 수도 함께 계산합니다.
    let sql = `
        SELECT
            s.*,
            sm.req_status AS my_req_status, -- 내 신청 상태
            COUNT(CASE WHEN sm_count.req_status = 1 THEN sm_count.req_user_id END) AS checked_people,
            COUNT(CASE WHEN sm_count.req_status = 0 THEN sm_count.req_user_id END) AS pending_people,
            COUNT(CASE WHEN sm_count.req_status = 2 THEN sm_count.req_user_id END) AS rejected_people
        FROM
            schedule_member sm
        JOIN
            schedules s ON sm.schedule_id = s.schedule_id
        LEFT JOIN
            schedule_member sm_count ON s.schedule_id = sm_count.schedule_id
        WHERE
            sm.req_user_id = ?
        GROUP BY
            s.schedule_id, sm.req_status -- sm.req_status를 GROUP BY에 포함하여 내 신청 상태별로 그룹화
        ORDER BY
            s.scheduled_date DESC;
    `;

    conn.connect();
    conn.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error('신청한 스케줄 조회 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '서버 오류: 신청한 스케줄 조회에 실패했습니다.' });
        }
        res.json({ success: true, data: rows });
    });
});


app.get('/schedule_members/:scheduleId', (req, res) => { // 경로명을 '/schedule_members/:scheduleId'로 변경
    const { scheduleId } = req.params;

    console.log(`스케줄 ${scheduleId}의 멤버 조회 요청 (GET)`); // 로그 메시지 변경

    // schedule_member와 users 테이블을 조인하여 req_user_id의 프로필 정보까지 가져옵니다.
    const sql = `
     SELECT
       sm.req_user_id,
       sm.req_status,
       u.nickname,
       u.profile_image_url,
       u.gender,
       u.mbti,
       u.introduce,
       u.manner_score
     FROM
       schedule_member sm
     JOIN
       users u ON sm.req_user_id = u.user_id
     WHERE
      sm.schedule_id = ?; 
    `;

    conn.connect(); // db 연결통로 열기
    conn.query(sql, [scheduleId], (err, rows) => {
        if (err) {
            console.error('스케줄 멤버 조회 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '서버 오류: 스케줄 멤버 조회 실패' });
        }
        res.json({ success: true, data: rows });
        console.log(rows) // 조회된 데이터 로깅
    });
});

//스케쥴 멤버 수락
app.post('/schedule/accept', (req, res) => {
    console.log('수락요청');
    const { scheduleId, reqUserId } = req.body;
    console.log(scheduleId, reqUserId);

    if (!scheduleId || !reqUserId) {
        return res.status(400).json({ success: false, message: 'scheduleId와 reqUserId가 필요합니다.' });
    }

    const sql = `UPDATE schedule_member SET req_status = 1 WHERE schedule_id = ? AND req_user_id = ?`;

    conn.connect(); // db 연결통로 열기
    conn.query(sql, [scheduleId, reqUserId], (err, result) => {
        if (err) {
            console.error('스케줄 멤버 수락 처리 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '서버 오류: 스케줄 멤버 수락 실패' });
        }

        if (result.affectedRows > 0) {
            res.json({ success: true, message: '스케줄 참여 신청이 수락되었습니다.' });
        } else {
            res.status(404).json({ success: false, message: '해당하는 스케줄 멤버 신청을 찾을 수 없습니다.' });
        }
    });
});

//스케쥴 멤버 거절
app.post('/schedule/reject', (req, res) => {
    const { scheduleId, reqUserId } = req.body;

    if (!scheduleId || !reqUserId) {
        return res.status(400).json({ success: false, message: 'scheduleId와 reqUserId가 필요합니다.' });
    }

    const sql = `UPDATE schedule_member SET req_status = 2 WHERE schedule_id = ? AND req_user_id = ?`;

    conn.connect(); // db 연결통로 열기
    conn.query(sql, [scheduleId, reqUserId], (err, result) => {
        if (err) {
            console.error('스케줄 멤버 거절 처리 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '서버 오류: 스케줄 멤버 거절 실패' });
        }

        if (result.affectedRows > 0) {
            res.json({ success: true, message: '스케줄 참여 신청이 거절되었습니다.' });
        } else {
            res.status(404).json({ success: false, message: '해당하는 스케줄 멤버 신청을 찾을 수 없습니다.' });
        }
    });
});

// 새로 추가: 스케줄 신청 취소 (schedule_member 삭제)
app.post('/schedule/cancel_apply', (req, res) => {
    console.log('스케줄 신청 취소 요청');
    const { scheduleId, userId } = req.body; // userId는 신청을 취소하는 사용자 ID

    if (!scheduleId || !userId) {
        return res.status(400).json({ success: false, message: 'scheduleId와 userId가 필요합니다.' });
    }

    const sql = `DELETE FROM schedule_member WHERE schedule_id = ? AND req_user_id = ?`;

    conn.connect(); // db 연결통로 열기
    conn.query(sql, [scheduleId, userId], (err, result) => {
        if (err) {
            console.error('스케줄 신청 취소 처리 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '서버 오류: 스케줄 신청 취소 실패' });
        }

        if (result.affectedRows > 0) {
            res.json({ success: true, message: '스케줄 신청이 성공적으로 취소되었습니다.' });
        } else {
            res.status(404).json({ success: false, message: '해당하는 스케줄 신청을 찾을 수 없거나 이미 취소되었습니다.' });
        }
    });
});

// 특정 사용자 프로필 조회 (GET 요청)
app.get('/users/:userId', (req, res) => { // <-- 이 라우트가 있는지 확인
    const userId = req.params.userId; // URL 파라미터에서 userId를 가져옵니다.
    console.log(`사용자 프로필 조회 요청: userId = ${userId}`); // 디버깅을 위한 로그

    // users 테이블에서 user_id 컬럼을 기준으로 조회합니다.
    // user_id는 users 테이블의 기본 키(PK)이며, 백엔드에서 사용자 구분을 위한 고유한 값입니다.
    const sql = `
        SELECT
            user_id,    
            nickname,       
            gender,
            birth_date,
            phone_number,
            introduce,
            profile_image_url,
            manner_score,
            mbti,
            user_type   
        FROM
            users
        WHERE
            user_id = ?;    
    `;

    conn.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error('사용자 프로필 조회 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '서버 오류: 프로필 조회 실패' });
        }
        if (rows.length > 0) {
            // 조회된 첫 번째 행의 데이터를 반환합니다.
            res.json({ success: true, data: rows[0] });
        } else {
            // 해당 userId를 가진 사용자가 없는 경우
            res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }
    });
});


// 스케줄 업데이트
app.post('/updateSchedule', async (req, res) => { // <-- async 키워드 추가
    const { userId, scheduleId, title, description, location_name, address, scheduled_date, max_participants, cost_per_person, schedule_image_url } = req.body;

    let longitude = null;
    let latitude = null;

    // 카카오맵 API 호출
    try {
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
    } catch (error) {
        console.error('카카오맵 API 호출 중 오류 발생:', error);
        // 카카오맵 API 호출 실패 시에도 스케줄 업데이트는 진행되도록 (혹은 에러로 처리)
        // 여기서는 에러 메시지를 클라이언트에 보내고 함수 종료
        if (error.response && error.response.status === 401) {
            return res.status(401).json({ success: false, message: '카카오맵 API 인증 오류입니다. API 키를 확인해주세요.' });
        }
        return res.status(500).json({ success: false, message: '서버 오류: 카카오맵 API 호출 실패' });
    }

    // 권한 검사: 현재 로그인한 사용자가 스케줄의 생성자인지 확인 (보안상 매우 중요!)


    try {
        // 권한 확인 후 업데이트 진행
        const updateSql = `
            UPDATE schedules
            SET
                title = ?,
                description = ?,
                location_name = ?,
                address = ?,
                scheduled_date = ?,
                max_participants = ?,
                cost_per_person = ?,
                latitude = ?,  
                longitude = ?,
                schedule_image_url=?
            WHERE
                schedule_id = ?;
        `;

        const updateResult = await new Promise((resolve, reject) => {
            conn.query(updateSql, [title, description, location_name, address, scheduled_date, max_participants, cost_per_person, latitude, longitude, schedule_image_url, scheduleId], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (updateResult.affectedRows > 0) {
            res.json({ success: true, message: '스케줄이 성공적으로 업데이트되었습니다!' });
        } else {
            res.status(400).json({ success: false, message: '스케줄 업데이트에 실패했습니다. 변경사항이 없거나 스케줄 ID가 유효하지 않습니다.' });
        }
    } catch (error) {
        console.error('스케줄 업데이트 중 오류 발생:', error);
        res.status(500).json({ success: false, message: '서버 오류: 스케줄 업데이트 실패' });
    }
});

app.post('/deleteSchedule', (req, res) => {
    // 리액트에서 보낸 userId는 users 테이블의 user_id 컬럼과 비교할거야.
    const { userId, scheduleId } = req.body;

    let sql = 'delete from schedules where schedule_id = ?'

    conn.connect(); // db 연결통로 열기
    conn.query(sql, scheduleId, (err, result) => {
        if (err) {
            console.error('스케줄 삭제 처리 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '서버 오류: 스케줄 삭제 실패' });
        }

        if (result.affectedRows > 0) {
            res.json({ success: true, message: '스케줄 삭제가 완료되었습니다' });
        } else {
            res.status(404).json({ success: false, message: '해당하는 스케줄을 찾을 수 없습니다.' });
        }
    });

});

// 전체 스케줄 데이터 불러오기
app.get('/schedules/get', (req, res) => {
    let scheduleSql = `select title, description, location_name, latitude, longitude, scheduled_date, max_participants, cost_per_person, status, address, user_id, schedule_image_url, schedule_id, user_type from schedules`
    let memberSql = 'select schedule_id, req_user_id, req_status from schedule_member'
    conn.connect();
    conn.query(scheduleSql, (err1, schedules) => {
        if (err1) {
            console.error(err1);
            return res.status(500).json({ success: false, message: '서버 오류: 스케줄 정보 조회 실패' });
        }
        conn.query(memberSql, (err2, members) => {
            if (err2) {
                console.log(err2)
                return res.status(500).json({ success: false, message: '서버 오류: 멤버 정보 조회 실패' });
            }

            res.status(200).json({
                schedules,
                members
            });
        })
    })
})

app.post('/schedule/apply', (req, res) => {
    console.log('스케줄 신청 요청');
    const { schedule_id, user_id } = req.body;

    if (!schedule_id || !user_id) {
        return res.status(400).json({ success: false, message: '필수 정보 누락: schedule_id 또는 user_id' });
    }

    // 데이터베이스 연결은 앱 시작 시 한 번만 하는 것이 일반적입니다.
    // conn.connect(); // 여기서는 제거하거나 주석 처리해야 합니다.

    // 0. 리액트에서 보낸 userId는 users 테이블의 user_id 컬럼과 비교할거야.
    let getUserInfoSql = `SELECT DATE_FORMAT(birth_date, '%Y-%m-%d') AS birth_date, gender, phone_number FROM users WHERE user_id = ?`;
    conn.query(getUserInfoSql, [user_id], (err, userRows) => {
        if (err) {
            console.error('사용자 정보 조회 오류:', err);
            return res.status(500).json({ success: false, message: '서버 오류: 사용자 정보를 가져오지 못했습니다.' });
        }

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
        }

        const userInfo = userRows[0];
        console.log(userInfo);
        // !!! 이 부분의 조건과 반환 값이 정확해야 합니다. !!!
        // gender가 숫자 0일 수도 있으므로, null인지 명시적으로 확인하는 것이 좋습니다.
        if (userInfo.birth_date===null || userInfo.gender === null ||userInfo.gender==="선택" || userInfo.phone_number===null||userInfo.phone_number==='') {
            console.log('!!! 사용자 프로필 정보 불완전 !!!', userInfo); // 디버깅을 위해 추가
            return res.status(403).json({ success: false, message: 'UserProfileIncomplete', detail: '생년월일, 성별, 전화번호를 모두 설정해야 스케줄 신청이 가능합니다.' });
        }
        // !!! 이 부분이 제대로 실행되는지 확인이 중요합니다. !!!

        // 이하 기존 로직 (스케줄 생성자 조회 및 멤버 삽입)
        let getCreatorSql = `SELECT user_id FROM schedules WHERE schedule_id = ?`;
        conn.query(getCreatorSql, [schedule_id], (err, rows) => {
            if (err) {
                console.error('스케줄 생성자 조회 오류:', err);
                return res.status(500).json({ success: false, message: '서버 오류: 스케줄 생성자 정보를 가져오지 못했습니다.' });
            }

            if (rows.length === 0) {
                return res.status(404).json({ success: false, message: '스케줄을 찾을 수 없거나 생성자 정보가 없습니다.' });
            }

            const creater_id = rows[0].user_id;

            let insertMemberSql = `INSERT INTO schedule_member (schedule_id, req_user_id, creater_id, req_status) VALUES (?, ?, ?, ?)`;
            const values = [schedule_id, user_id, creater_id, 0];

            conn.query(insertMemberSql, values, (err, result) => {
                if (err) {
                    console.error('스케줄 신청 삽입 오류:', err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(409).json({ success: false, message: '이미 신청된 스케줄입니다.' });
                    }
                    return res.status(500).json({ success: false, message: '서버 오류: 스케줄 신청 실패' });
                }
                return res.status(200).json({ success: true, message: '스케줄 신청 성공', insertedId: result.insertId });
            });
        });
    });
});

// 서버 시작
app.listen(3001, () => {
    console.log(`Node.js 서버가 http://localhost:3001 에서 실행 중입니다.`);
});
