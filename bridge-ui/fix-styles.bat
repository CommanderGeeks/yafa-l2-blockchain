@echo off
echo 🔧 Fixing YAFA Bridge styling issues...

REM Step 1: Clear all caches
echo 📦 Clearing caches...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist node_modules\.vite rmdir /s /q node_modules\.vite

REM Step 2: Ensure postcss.config.js exists
echo ⚙️  Checking PostCSS config...
if not exist postcss.config.js (
  echo Creating postcss.config.js...
  (
    echo module.exports = {
    echo   plugins: {
    echo     tailwindcss: {},
    echo     autoprefixer: {},
    echo   },
    echo }
  ) > postcss.config.js
)

REM Step 3: Ensure proper directory structure
echo 📁 Setting up directory structure...
if not exist pages mkdir pages
if not exist src\components mkdir src\components
if not exist src\styles mkdir src\styles

REM Step 4: Create index page if it doesn't exist
if not exist pages\index.tsx (
  echo Creating pages\index.tsx...
  (
    echo import Bridge from '../src/components/Bridge';
    echo.
    echo export default function Home^(^) {
    echo   return ^<Bridge /^>;
    echo }
  ) > pages\index.tsx
)

REM Step 5: Ensure Bridge component has correct name
if exist src\components\bridge.tsx (
  echo Renaming bridge.tsx to Bridge.tsx...
  move /y src\components\bridge.tsx src\components\Bridge.tsx >nul 2>&1
)

REM Step 6: Rebuild
echo 🏗️  Rebuilding...
call npm run dev

echo ✅ Done! Your bridge should now have proper styling.
echo 🌐 Open http://localhost:3001 to see your styled bridge!