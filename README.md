# 콩한쪽

잃어버린 에어팟 부품을 등록하고, 지정된 주소로 부품을 보낼 수 있도록 안내하는 서비스입니다.

## 흐름

1. **부품 선택** – 왼쪽 유닛 / 오른쪽 유닛 / 본체 (케이스)
2. **모델 선택** – 에어팟 1~4세대, Pro 1~3세대
3. **배송 정보 입력** – 배송 주소 안내(경기도 수원시 장안구 서부로 2066 (16419) 제 2공학관 26310) + 이름, 전화번호, 주소 입력 후 **seung031220@naver.com**으로 이메일 전송

## 배포 (Vercel + GitHub + Resend)

### 1. GitHub에 올리기

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/사용자명/저장소명.git
git push -u origin main
```

### 2. Vercel에 연결

1. [Vercel](https://vercel.com) 로그인
2. **Add New Project** → **Import Git Repository**에서 위 GitHub 저장소 선택
3. **Deploy** (기본 설정으로 진행)

### 3. Resend 설정

1. [Resend](https://resend.com) 가입 후 **API Keys**에서 API 키 생성
2. Vercel 대시보드 → 해당 프로젝트 → **Settings** → **Environment Variables**
3. 변수 추가:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Resend에서 복사한 API 키 (예: `re_xxxx...`)
4. **Redeploy** 한 번 실행

### 4. Resend 발신/수신 주소

- **수신**: `seung031220@naver.com` (코드에 고정)
- **발신**: Resend 기본 도메인 `onboarding@resend.dev` 사용 (테스트용)  
  - 실제 서비스 시 Resend에서 **도메인 인증** 후 `from` 주소를 본인 도메인으로 변경 가능

### 5. 게임 점수 저장 (Upstash Redis)

게임에서 1111/0000 방 점수를 저장·비교하려면 **Upstash Redis**가 필요합니다.

1. Vercel 대시보드 → 해당 프로젝트 → **Storage** 탭 (또는 **Marketplace**)
2. **Upstash Redis** 선택 후 **Create Database** (또는 Connect)
3. 생성 후 프로젝트에 연결하면 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` 환경 변수가 자동으로 들어갑니다.
4. **Redeploy** 한 번 실행

연결하지 않으면 게임 점수 저장 시 "점수 저장이 아직 설정되지 않았어요" 메시지가 나옵니다.

---

## 로컬에서 테스트

```bash
npm install
npx vercel dev
```

브라우저에서 `http://localhost:3000` 접속 후, 부품·모델 선택 → 배송 정보 입력 → 제출하면 `/api/send-registration`이 호출되고 Resend로 이메일이 전송됩니다.

- 로컬에서도 Resend·게임 점수 동작을 보려면 `vercel env pull`로 환경 변수를 받아오거나, `.env`에 `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`을 넣어 주세요.

## 폴더 구조

- `index.html`, `app.js`, `styles.css` – 프론트
- `api/send-registration.js` – Vercel 서버리스 함수 (Resend로 이메일 전송)
- `api/game-scores.js` – 게임 점수 저장·조회 (Upstash Redis 사용)
- `package.json` – `resend`, `@upstash/redis` 의존성
