@echo off
chcp 65001 >nul
cd /d "c:\Users\seung\OneDrive\바탕 화면\AIRP"

echo ========================================
echo Git 변경사항 확인 및 업로드
echo ========================================
echo.

echo [1단계] 현재 상태 확인...
git status
echo.

echo [2단계] 변경사항이 있으면 계속 진행합니다...
pause

echo.
echo [3단계] 모든 변경사항 추가...
git add .

echo.
echo [4단계] 커밋 메시지를 입력하세요:
set /p commit_msg="커밋 메시지: "

if "%commit_msg%"=="" (
    set commit_msg=자동 커밋 %date% %time%
)

echo.
echo [5단계] 커밋 중...
git commit -m "%commit_msg%"

echo.
echo [6단계] GitHub에 푸시 중...
git push origin master:main

echo.
echo ========================================
echo 완료!
echo ========================================
echo.
echo GitHub에서 확인: https://github.com/seung031220/CONG
pause
