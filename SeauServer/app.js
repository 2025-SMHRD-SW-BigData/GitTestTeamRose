const express = require('express');
const app = express();
const mysql = require('mysql2');

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
app.post('/', (req, res)=>{
    const {id, pw, nick, gender, name, birthDay, preferType,introduce, phoneNumber} = req.body
    console.log('접근 확인!')
    let sql = 'insert into users(user_id_name, user_pw,user_name, phone_number, nickname, birth_date, gender, introduce, prefer_type) values(?,?,?,?,?,?,?,?,?)';
    
    conn.connect(); // db 연결통로 열기
    conn.query(sql, [id, pw,name, phoneNumber,nick,birthDay,gender,introduce,preferType],(err,rows)=>{
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

app.post('/login', (req,res) => {
    const {id, pw} = req.body;
    let sql = 'select * from users where user_id_name = ? and user_pw = ?';
    
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

    let sql = 'select user_id, user_name, nickname, birth_date, gender, profile_image_url, introduce, prefer_type, manner_score from users where user_id_name = ?';
    
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

app.listen(3001)
