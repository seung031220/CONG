# 파일 변경 감지 및 자동 커밋 스크립트
# 파일이 변경되면 자동으로 커밋하고 푸시합니다.

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host "👀 파일 변경 감지 시작..." -ForegroundColor Cyan
Write-Host "프로젝트 경로: $projectPath" -ForegroundColor Gray
Write-Host "종료하려면 Ctrl+C를 누르세요." -ForegroundColor Yellow
Write-Host ""

$lastCommit = Get-Date

# FileSystemWatcher 생성
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $projectPath
$watcher.Filter = "*.*"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# .git 폴더와 node_modules 제외
$excludePatterns = @(".git", "node_modules", ".vercel", ".DS_Store")

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    $fileName = Split-Path -Leaf $path
    
    # 제외할 파일/폴더 체크
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($path -like "*\$pattern\*" -or $fileName -eq $pattern) {
            $shouldExclude = $true
            break
        }
    }
    
    if ($shouldExclude) { return }
    
    # 너무 자주 커밋하지 않도록 (최소 5초 간격)
    $now = Get-Date
    $timeSinceLastCommit = ($now - $script:lastCommit).TotalSeconds
    
    if ($timeSinceLastCommit -lt 5) {
        return
    }
    
    Write-Host "[$($now.ToString('HH:mm:ss'))] 파일 변경 감지: $fileName ($changeType)" -ForegroundColor Yellow
    
    Start-Sleep -Seconds 2  # 파일 저장 완료 대기
    
    Set-Location $projectPath
    
    $status = git status --porcelain
    if ($status) {
        Write-Host "  → 커밋 중..." -ForegroundColor Cyan
        git add .
        $changedFiles = git diff --cached --name-only | Select-Object -First 3
        $fileList = ($changedFiles -join ", ")
        if ($changedFiles.Count -gt 3) {
            $fileList += " 외 " + ($changedFiles.Count - 3) + "개"
        }
        git commit -m "자동 커밋: $fileList"
        
        Write-Host "  → 푸시 중..." -ForegroundColor Cyan
        git push origin master:main
        
        Write-Host "  ✅ 완료!" -ForegroundColor Green
        Write-Host ""
        
        $script:lastCommit = Get-Date
    }
}

# 이벤트 등록
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action | Out-Null

try {
    # 무한 대기
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    $watcher.Dispose()
    Write-Host "`n👋 감지 종료" -ForegroundColor Cyan
}
