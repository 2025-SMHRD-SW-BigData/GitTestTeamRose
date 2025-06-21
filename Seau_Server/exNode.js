// 서버 생성
// 프로토콜 : 통신 규약(규격)
// http 라는 프로토콜을 가지는 기능을 가져오겠습니다
// http 프로토콜 : 서버의 기능을 할 수 있는 라이브러리(모듈)
// require : 모듈을 가지고오는 기능(=import)
const http = require('http')

// http 라는 모듈로 서버를 생성하겠다
http.createServer(function(request, response){
    // function : call-back 함수
    // 요청에 따른 응답을 처리하겠다

    // request : 요청 정보 객체
    let ip = request.connection.remoteAddress; // 요청을 보낸 사용자의 ip를 확인
    console.log(ip)
    // response : 응답 객체
    console.log('요청이 왔습니다!')
    console.log('요청이 왔다2')

    // 응답 마무리 --> 클라이언트가 응답을 기다리지 않게끔
    response.end();
}).listen(3000)
// listen(3000) : 서버를 3000번째 공간에서 실행시키겠습니다
// http://localhost:3000
// httP://127.0.0.1:3000
// http://0.0.0.0:3000
// http://192.168.219.178:3000 (IPv4 주소)

// 위 4개의 주소가 모두 동일

// 서버종료 : ctrl + c (터미널에서)