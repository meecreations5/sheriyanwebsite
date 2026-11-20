@echo off
setlocal
cd /d "%~dp0"
echo.
echo SHANERYN - One-time Staff Password Reset Setup
echo Firebase Project: shanerynwesbite
echo.
echo IMPORTANT: Firebase Cloud Functions requires Blaze billing. Review your Firebase billing plan before continuing.
echo.
where firebase >nul 2>&1
if errorlevel 1 (
  echo Firebase CLI was not found. Install it with: npm install -g firebase-tools
  goto :end
)
where npm >nul 2>&1
if errorlevel 1 (
  echo Node.js / npm was not found. Install Node.js first.
  goto :end
)
echo Installing Cloud Function dependencies...
call npm install --prefix functions
if errorlevel 1 (
  echo Installation failed. No function was deployed.
  goto :end
)
echo.
echo Deploying the protected password-reset function...
call firebase deploy --only functions:resetStaffPassword --project shanerynwesbite
if errorlevel 1 (
  echo Deployment failed. If prompted, run firebase login and try again.
  goto :end
)
echo.
echo Deployment complete. Open SHANERYN Admin - Admin Users - Reset Password.
:end
echo.
pause
endlocal
