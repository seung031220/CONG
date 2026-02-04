@echo off
chcp 65001 >nul
cd /d "c:\Users\seung\OneDrive\바탕 화면\AIRP"
powershell -ExecutionPolicy Bypass -File "git-auto-push.ps1"
pause
