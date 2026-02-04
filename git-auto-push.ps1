# Git 자동 커밋 및 푸시 스크립트 (간단 버전)
# 이 스크립트를 실행하면 변경사항을 자동으로 커밋하고 푸시합니다.

$projectPath = "c:\Users\seung\OneDrive\바탕 화면\AIRP"
Set-Location $projectPath

Write-Host "🔄 Git 자동 커밋 시작..." -ForegroundColor Cyan

# 변경사항 확인
$status = git status --porcelain

if ($status) {
    Write-Host "📝 변경된 파일 발견:" -ForegroundColor Yellow
    git status --short
    
    # 모든 변경사항 추가
    git add .
    
    # 커밋 메시지 생성
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $changedFiles = git diff --cached --name-only | Select-Object -First 5
    $fileList = ($changedFiles -join ", ")
    if ((git diff --cached --name-only).Count -gt 5) {
        $fileList += " 외 " + ((git diff --cached --name-only).Count - 5) + "개"
    }
    $commitMessage = "자동 커밋 [$timestamp]: $fileList"
    
    Write-Host "💾 커밋 중..." -ForegroundColor Cyan
    git commit -m $commitMessage
    
    Write-Host "🚀 푸시 중..." -ForegroundColor Cyan
    git push origin master:main
    
    Write-Host "✅ 완료! 변경사항이 GitHub에 업로드되었습니다." -ForegroundColor Green
} else {
    Write-Host "✨ 변경사항이 없습니다." -ForegroundColor Green
}
