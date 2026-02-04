# 자동 Git 커밋 및 푸시 스크립트
# 파일 변경을 감지하고 자동으로 커밋하고 푸시합니다.

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host "🔄 Git 상태 확인 중..." -ForegroundColor Cyan

# Git 상태 확인
$status = git status --porcelain

if ($status) {
    Write-Host "📝 변경된 파일 발견:" -ForegroundColor Yellow
    git status --short
    
    # 모든 변경사항 추가
    git add .
    
    # 커밋 메시지 생성 (변경된 파일 목록 기반)
    $changedFiles = git diff --cached --name-only
    $fileList = $changedFiles -join ", "
    $commitMessage = "자동 커밋: $fileList"
    
    Write-Host "💾 커밋 중..." -ForegroundColor Cyan
    git commit -m $commitMessage
    
    Write-Host "🚀 푸시 중..." -ForegroundColor Cyan
    git push origin master:main
    
    Write-Host "✅ 완료!" -ForegroundColor Green
} else {
    Write-Host "✨ 변경사항이 없습니다." -ForegroundColor Green
}
