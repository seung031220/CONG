# Vercel 404 에러 해결 방법

## 🔍 문제 확인

커밋은 되었지만 Vercel에서 404 에러가 발생하는 경우, 다음을 확인하세요.

## ✅ 해결 방법

### 1단계: Vercel 대시보드에서 Root Directory 확인

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택 (CONG)
3. **Settings** → **General** 탭으로 이동
4. **Root Directory** 섹션 확인:
   - ✅ **비어있어야 합니다** (아무것도 입력하지 않음)
   - ❌ `AIRP` 같은 폴더 이름이 있으면 **삭제**하세요
   - ❌ "없음" 같은 텍스트가 있으면 **삭제**하세요

### 2단계: Build & Development Settings 확인

**Settings** → **General** → **Build & Development Settings**:

- **Build Command**: 비워두기 (아무것도 입력하지 않음)
- **Output Directory**: 비워두기 (아무것도 입력하지 않음)  
- **Install Command**: `npm install` 또는 비워두기

### 3단계: 재배포

1. **Deployments** 탭으로 이동
2. 최신 배포를 클릭
3. **Redeploy** 버튼 클릭
4. 또는 새로운 빈 커밋으로 재배포 트리거:
   ```powershell
   git commit --allow-empty -m "Trigger Vercel redeploy"
   git push origin master:main
   ```

### 4단계: 배포 로그 확인

1. **Deployments** → 최신 배포 클릭
2. **Building** 탭에서 빌드 로그 확인
3. 에러가 있으면 로그를 확인하세요

## 🔧 vercel.json 확인

현재 `vercel.json` 파일:
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

이 설정이 올바르게 되어 있습니다.

## ⚠️ 주의사항

1. **Root Directory는 반드시 비워야 합니다**
   - GitHub 저장소 루트에 `index.html`이 있으므로 Root Directory를 설정할 필요가 없습니다

2. **파일 구조 확인**
   - GitHub 저장소 루트에 다음 파일들이 있어야 합니다:
     - `index.html`
     - `app.js`
     - `styles.css`
     - `api/` 폴더
     - `package.json`
     - `vercel.json`

3. **환경 변수 확인**
   - **Settings** → **Environment Variables**에서 다음 변수들이 설정되어 있는지 확인:
     - `RESEND_API_KEY`
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`

## 🚀 빠른 해결

가장 빠른 해결 방법:

1. Vercel 대시보드 → **Settings** → **General**
2. **Root Directory** 필드를 **완전히 비우기** (삭제)
3. **Save** 클릭
4. **Deployments** → 최신 배포 → **Redeploy**

## 📝 확인 체크리스트

- [ ] Root Directory가 비어있음
- [ ] Build Command가 비어있음
- [ ] Output Directory가 비어있음
- [ ] `vercel.json` 파일이 저장소 루트에 있음
- [ ] `index.html` 파일이 저장소 루트에 있음
- [ ] 재배포를 실행함

## 🔗 확인 링크

- GitHub 저장소: https://github.com/seung031220/CONG
- Vercel 대시보드: https://vercel.com/dashboard
