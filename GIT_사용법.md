# Git 사용법 - Cursor에서 GitHub에 업로드하기

## 📝 방법 1: Cursor Git 패널 사용 (가장 쉬움)

### 1단계: 파일 수정 및 저장
- Cursor에서 파일을 수정합니다
- `Ctrl + S`로 저장합니다

### 2단계: Git 패널 열기
- Cursor 왼쪽 사이드바에서 **소스 제어 아이콘** (분기 모양) 클릭
- 또는 `Ctrl + Shift + G` 단축키 사용

### 3단계: 변경사항 확인
- "Changes" 섹션에서 수정된 파일들이 보입니다
- 각 파일 옆의 `+` 버튼을 클릭하거나 "Stage All Changes" 버튼 클릭

### 4단계: 커밋 메시지 입력
- 상단 "Message" 입력창에 커밋 메시지 입력
  - 예: "게임 결과 표시 개선", "디자인 수정" 등

### 5단계: 커밋하기
- "Commit" 버튼 클릭 (또는 `Ctrl + Enter`)

### 6단계: 푸시하기
- 커밋 후 상단에 "Sync Changes" 또는 "Push" 버튼이 보입니다
- 클릭하면 GitHub에 업로드됩니다
- 또는 터미널에서: `git push origin master:main`

---

## 🖥️ 방법 2: 터미널 사용 (명령어로)

### 1단계: 터미널 열기
- Cursor 하단의 **터미널** 탭 클릭
- 또는 `` Ctrl + ` `` (백틱) 단축키

### 2단계: 변경사항 확인
```powershell
git status
```
- 수정된 파일 목록이 보입니다

### 3단계: 모든 변경사항 추가
```powershell
git add .
```

### 4단계: 커밋하기
```powershell
git commit -m "수정 내용 설명"
```
- 예: `git commit -m "게임 결과 표시 개선"`

### 5단계: GitHub에 푸시
```powershell
git push origin master:main
```

---

## 🚀 방법 3: 자동 스크립트 사용 (가장 빠름)

### 파일 저장 후:
1. **파일 탐색기**에서 `커밋.bat` 파일을 **더블클릭**
2. 자동으로 커밋하고 푸시됩니다!

### 또는 Cursor 터미널에서:
```powershell
npm run push
```

---

## 💡 팁

### 변경사항 확인만 하기
```powershell
git status
```

### 커밋 히스토리 보기
```powershell
git log
```

### 최신 상태로 업데이트 (다른 곳에서 수정한 경우)
```powershell
git pull origin main
```

---

## ⚠️ 주의사항

1. **커밋 전에 항상 저장**: `Ctrl + S`로 파일 저장 확인
2. **의미 있는 커밋 메시지**: 무엇을 수정했는지 명확하게 작성
3. **작은 단위로 커밋**: 한 번에 너무 많은 변경사항을 커밋하지 않기

---

## 🔄 전체 과정 요약

```
파일 수정 → 저장 (Ctrl+S) → Git 패널 열기 (Ctrl+Shift+G) 
→ Stage All → 커밋 메시지 입력 → Commit → Push
```

또는

```
파일 수정 → 저장 → 커밋.bat 더블클릭 (끝!)
```
