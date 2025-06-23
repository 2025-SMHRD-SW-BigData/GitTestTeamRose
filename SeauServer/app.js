const express = require('express');
const app = express();

const https = require('https')
const iconv = require('iconv-lite'); // ✅ 추가

// node에서 react로 응답 보내기 위해 cors설정
const cors = require('cors')
app.use(cors())
app.use(express.json())

// http://localhost:3001
// 회원가입
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

// 로그인
app.get('/weather', (req, res) => {
  const apiUrl = 'https://apihub.kma.go.kr/api/typ01/url/kma_lhaws.php?stn=0&help=1&authKey=1pcsdTFmR52XLHUxZmedeA';
  const urlObj = new URL(apiUrl);

  const options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    port: 443,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const request = https.request(options, (apiRes) => {
    let chunks = [];

    apiRes.on('data', (chunk) => {
      chunks.push(chunk); // Buffer 조각 수집
    });

    apiRes.on('end', () => {
      const buffer = Buffer.concat(chunks); // 전체 응답을 하나로 결합
      const decoded = iconv.decode(buffer, 'euc-kr'); // ✅ EUC-KR → UTF-8 디코딩
      res.send(decoded);
    });
  });

  request.on('error', (error) => {
    console.error('API 요청 실패:', error.message);
    res.status(500).json({ error: 'API 요청 실패', message: error.message });
  });

  request.end();
});

app.listen(3001)
