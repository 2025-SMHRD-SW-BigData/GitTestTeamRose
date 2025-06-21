const express = require('express');
const app = express();

// node에서 react로 응답 보내기 위해 cors설정
const cors = require('cors')
app.use(cors())
app.use(express.json())

// http://localhost:3001
app.post('/', (req, res)=>{
    const {id, pw, nick} = req.body
    console.log('접근 확인!')
    console.log('회원가입 요청:', id, pw, nick)
    if(id!='rose'){
        res.send('회원가입 성공')
    } else {
        res.send('회원가입 실패')
    }
})

app.post('/login', (req,res) => {
    const {id, pw} = req.body;
    console.log('로그인 요청')
    console.log(req.body);
    if(id=='rose'&&pw=='1234'){
        res.send('로그인 성공')
    } else {
        res.send('로그인 실패')
    }
})

app.listen(3001)
