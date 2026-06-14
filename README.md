# 청년의 목소리 (Youth Voice) - 학생 커뮤니티 플랫폼

학생과 청년들이 자신의 목소리를 나누고 소통할 수 있는 안전하고 포용적인 커뮤니티 플랫폼입니다.

## ✨ 주요 기능

### 📁 카테고리 시스템
- 다양한 주제별 카테고리 관리
- 관리자만 카테고리 생성/수정/삭제 가능
- 게시물 자동 분류

### ✍️ 게시물 기능
- 제목, 내용, 이미지, 태그 지원
- 조회수 자동 추적
- 카테고리별 필터링
- 고정 게시물 기능

### 💬 댓글 시스템
- 게시물에 댓글 작성
- 댓글에 답글 기능
- 댓글 수정/삭제
- 소프트 삭제 (내용 보존)

### ❤️ 상호작용
- 게시물 및 댓글에 좋아요
- 좋아요 카운트 및 사용자 목록
- 게시물 공유 횟수 추적

### 🚨 신고 시스템
- 부적절한 콘텐츠/사용자 신고
- 신고 사유: 스팸, 괴롭힘, 혐오, 명시적 콘텐츠 등
- **관리자 전용 신고 관리 대시보드**
- 신고 처리: 경고, 정지, 차단, 삭제
- 일반 사용자는 신고 내역 조회 불가 (보안)

### 🔐 보안 기능
- JWT 기반 토큰 인증
- bcryptjs를 이용한 비밀번호 해싱
- CORS 설정으로 안전한 요청만 처리
- NoSQL Injection 방지 (데이터 살균)
- Rate Limiting으로 DDoS 공격 완화
- 계정 잠금 (5회 실패 후 15분 잠금)
- 감시 로그 (모든 작업 기록, 90일 자동 삭제)

### 👥 개인정보 보호
- 비밀번호는 절대 저장되지 않음 (해싱만 저장)
- API 응답에서 민감 정보 자동 제외
- 사용자 차단 및 복구 기능
- 활동 감시 로그로 보안 추적

## 🛠️ 기술 스택

```
- Backend: Node.js + Express.js
- Database: MongoDB
- Authentication: JWT
- Security: Helmet, CORS, Rate Limiting, HPP, Mongo Sanitize
- Password: bcryptjs
- Validation: express-validator
```

## 📦 설치 방법

### 1. 프로젝트 클론
```bash
git clone https://github.com/hbag2549-cyber/youth-voice.git
cd youth-voice
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 설정
```bash
cp .env.example .env
# .env 파일 수정
```

### 4. MongoDB 시작 (로컬)
```bash
mongod
```

### 5. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션
npm start
```

## 📡 API 문서

### 인증
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `GET /api/v1/auth/verify` - 토큰 검증

### 카테고리
- `GET /api/v1/categories` - 카테고리 목록
- `POST /api/v1/categories` - 카테고리 생성 (관리자)
- `PUT /api/v1/categories/:id` - 카테고리 수정 (관리자)
- `DELETE /api/v1/categories/:id` - 카테고리 삭제 (관리자)

### 게시물
- `GET /api/v1/posts` - 게시물 목록
- `POST /api/v1/posts` - 게시물 작성
- `PUT /api/v1/posts/:id` - 게시물 수정
- `DELETE /api/v1/posts/:id` - 게시물 삭제

### 댓글
- `GET /api/v1/comments/post/:postId` - 댓글 조회
- `POST /api/v1/comments` - 댓글 작성
- `PUT /api/v1/comments/:id` - 댓글 수정
- `DELETE /api/v1/comments/:id` - 댓글 삭제

### 좋아요
- `POST /api/v1/likes` - 좋아요 추가
- `DELETE /api/v1/likes/:id` - 좋아요 취소

### 신고
- `POST /api/v1/reports` - 신고 접수
- `GET /api/v1/reports` - 신고 목록 (관리자만)
- `PUT /api/v1/reports/:id/review` - 신고 검토 (관리자만)

### 사용자
- `GET /api/v1/users/:id` - 사용자 프로필
- `PUT /api/v1/users/profile/update` - 프로필 수정
- `POST /api/v1/users/:id/ban` - 사용자 차단 (관리자)

## 🔐 보안 가이드

### 비밀번호
- 최소 8자
- 영문 + 숫자 + 특수문자 포함 필수
- bcryptjs로 안전하게 해싱됨

### 토큰
- JWT 사용, 7일 만료
- Authorization: Bearer <token> 형식
- 헤더에만 저장 (쿠키 사용 안 함)

### 신고 시스템
- 신고 내역은 관리자만 조회 가능
- 신고 시 IP 주소 기록
- 자동화된 판단 없음 (수동 검토)

## 🚀 배포

### Heroku 배포
```bash
heroku login
heroku create your-app-name
git push heroku main
```

### 환경변수 설정
```bash
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_url
```

## 📝 라이선스

MIT License

## 📞 지원

문제가 있으면 GitHub Issues를 통해 보고해주세요.

---

**만든이**: hbag2549-cyber  
**생성일**: 2026-06-14
