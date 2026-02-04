# Vercel 배포 가이드 & "Deployment Unavailable" 해결

## 1. 에러가 났을 때 체크할 것

### ① Root Directory (가장 흔한 원인)

**증상**: 배포는 "Ready"인데 사이트가 안 뜨거나, 404 / Deployment Unavailable.

**원인**: GitHub에 올릴 때 **프로젝트가 repo 루트가 아니라 하위 폴더에** 있는 경우.

- 예: repo 이름이 `my-project`이고, 그 **안에** `AIRP` 폴더를 만들고 그 안에 `index.html`, `api/` 등을 넣었다면  
  → Vercel 입장에서는 **repo 루트**에 `index.html`이 없음.
- Vercel은 기본값으로 **repo 루트**를 프로젝트 루트로 쓰기 때문에, 그 루트에 `index.html`이 없으면 "사이트가 없다"고 인식함.

**해결**:

1. Vercel 대시보드 → 해당 프로젝트 → **Settings**
2. **General** → **Root Directory**
3. `AIRP` 처럼 **실제로 index.html과 api/가 들어 있는 폴더 이름**만 입력 (앞뒤 `/` 없이)
4. **Save** 후 **Redeploy**

---

### ② Git에 "파일째로" 넣은 것

**질문**: "깃에 파일째로 넣어서 그런가?"

**답**: **아니요.** Vercel은 GitHub repo를 clone해서 배포하는 방식이라, **파일을 Git에 올리는 건 맞는 방법**입니다.

- repo **루트**에 `index.html`, `api/`, `package.json`이 있으면 → Root Directory는 비워 두면 됨.
- repo **안의 특정 폴더**(예: `AIRP`)에만 그게 있으면 → 위처럼 **Root Directory**에 그 폴더 이름을 넣어야 함.

즉, "파일째로 넣은 것"이 문제가 아니라, **그 파일들이 repo에서 어느 경로에 있는지**가 중요합니다.

---

### ③ 배포 로그로 원인 보기

1. Vercel 대시보드 → 프로젝트 → **Deployments**
2. 최근 배포 클릭 → **Building** / **Logs** 탭
3. 여기서 확인할 것:
   - **Build 실패**: `npm install` 에러, Node 버전 문제 등
   - **"No output directory" / "No index"**: Root Directory 잘못됨 (위 ① 참고)
   - **Function 에러**: `api/` 안 코드 또는 환경 변수 문제

---

### ④ 배포 URL

- 기본 URL: `https://<프로젝트이름>-<팀이름>.vercel.app`
- 주소 오타, 예전에 삭제한 배포 주소 쓰는지 확인.

---

## 2. Root cause 정리 (에러가 나는 이유)

- **코드가 하려는 일**:  
  - 루트에 있는 `index.html`을 메인 페이지로, `api/*.js`를 서버리스 API로 배포하는 것.

- **Vercel이 실제로 하는 일**:  
  - "Root Directory"로 지정된 경로를 **프로젝트 루트**로 보고,  
    그 안에서 `index.html`을 찾고, `api/`를 함수로 인식함.  
  - Root를 안 바꿨는데 실제 파일은 **하위 폴더**에만 있으면 → 루트에 `index.html`이 없다고 판단 → 404 / Deployment Unavailable 같은 상태가 됨.

- **조건**:  
  - GitHub repo 구조가 "프로젝트 전체가 **한 폴더 안**에만 있는 경우" (예: `repo/AIRP/index.html`).

- **착각/ oversight**:  
  - "Git에 올리기만 하면 Vercel이 알아서 찾는다"라고 생각하는 경우.  
  - 실제로는 **어느 폴더를 루트로 볼지**를 Root Directory로 명시해 줘야 함.

---

## 3. 개념: Vercel이 "프로젝트"를 어떻게 보는지

- Vercel은 **한 repo = 한 프로젝트**가 아니라,  
  **"Root Directory로 지정한 폴더 = 하나의 앱/사이트"** 단위로 봅니다.
- Root Directory **미지정** = **repo 루트**가 프로젝트 루트.
- 그래서 repo 구조가 아래처럼면 반드시 설정이 필요합니다.

  ```
  my-repo/
  ├── README.md
  └── AIRP/          ← 실제 앱은 여기
      ├── index.html
      ├── api/
      └── package.json
  ```

  이때 Root Directory = `AIRP` 로 두어야, Vercel이 `AIRP`를 기준으로 `index.html`과 `api/`를 찾습니다.

---

## 4. 나중에 다시 안 걸리게 할 수 있는 것

- **경고 신호**  
  - repo에 `index.html`이 **한 단계 아래 폴더**에만 있음.  
  - 배포는 성공했는데 접속하면 404 / Deployment Unavailable.

- **비슷한 실수**  
  - Netlify 등 다른 플랫폼에서도 "Base directory" / "Publish directory"를 비슷하게 잘못 두는 경우.

- **추천**  
  - 가능하면 **repo 루트 = 앱 루트**로 두고 push (즉, `index.html`, `api/`, `package.json`이 repo 최상단에 오게).  
  - 그러면 Root Directory를 건드릴 필요가 없어서, "Deployment Unavailable" 가능성이 줄어듦.

---

## 5. 이 프로젝트에서의 권장 구조

**옵션 A (지금 구조 유지)**  
- repo 안에 `AIRP` 같은 폴더 하나만 있고, 그 안에 전부 넣은 경우  
  → Vercel **Root Directory**에 `AIRP` 설정 (폴더 이름에 맞게).

**옵션 B (가장 단순)**  
- 새 repo를 만들고, **그 repo 루트에** 지금 `AIRP` 안에 있는 파일들(`index.html`, `app.js`, `styles.css`, `api/`, `package.json`, `vercel.json` 등)을 **그대로** 올림.  
  → Root Directory 비워 두고 배포.  
  → "어디가 루트인지" 헷갈릴 일이 없음.

---

## 6. 환경 변수 (다시 한번)

배포가 뜨더라도 **기능**이 동작하려면 환경 변수가 필요합니다.

| 변수 이름 | 용도 |
|-----------|------|
| `RESEND_API_KEY` | 이메일 전송 (부품 등록) |
| `UPSTASH_REDIS_REST_URL` | 게임 점수 저장 |
| `UPSTASH_REDIS_REST_TOKEN` | 게임 점수 저장 |

Vercel: **Settings → Environment Variables**에 넣고, **Redeploy** 한 번 해주세요.

---

정리하면, **"깃에 파일째로 넣어서"가 원인이 아니라**,  
**repo 안에서 프로젝트가 있는 폴더를 Vercel에 Root Directory로 알려주지 않았을 가능성**이 큽니다.  
위 ①번부터 순서대로 확인해 보시면 됩니다.
