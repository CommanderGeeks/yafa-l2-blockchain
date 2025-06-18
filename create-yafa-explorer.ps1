# -------------------------------
#  create-yafa-explorer.ps1
# -------------------------------
# 1) COPY this block to a new file (e.g. create-yafa-explorer.ps1)
# 2) Run:  pwsh ./create-yafa-explorer.ps1
# -------------------------------

$ErrorActionPreference = 'Stop'   # fail fast

function New-Folder {
    param([string]$Path)
    if (-not (Test-Path $Path)) { New-Item -ItemType Directory -Path $Path -Force | Out-Null }
}

function New-File {
    param([string]$Path)
    if (-not (Test-Path $Path)) { New-Item -ItemType File -Path $Path -Force | Out-Null }
}

# -------------------------------
# FOLDERS
# -------------------------------
$folders = @(
    # API tree
    'api',
    'api\app',
    'api\app\api',
    'api\app\api\blocks',
    'api\app\api\blocks\[number]',
    'api\app\api\txs',
    'api\app\api\txs\[hash]',
    'api\app\api\address',
    'api\app\api\address\[addr]',
    'api\app\api\token',
    'api\app\api\token\[addr]',
    'api\app\api\stats',
    'api\app',
    'api\lib',

    # WEB tree
    'web',
    'web\app',
    'web\app\block',
    'web\app\block\[number]',
    'web\app\tx',
    'web\app\tx\[hash]',
    'web\app\address',
    'web\app\address\[addr]',
    'web\app\token',
    'web\app\token\[addr]',
    'web\components',
    'web\components\Charts',
    'web\lib',
    'web\public\icons'
)

$folders | ForEach-Object { New-Folder $_ }

# -------------------------------
# FILES (empty placeholders)
# -------------------------------
$files = @(
  # API root
  'api\package.json',
  'api\tsconfig.json',
  'api\next.config.js',

  # API pages & routes
  'api\app\layout.tsx',
  'api\app\page.tsx',
  'api\app\api\blocks\route.ts',
  'api\app\api\blocks\[number]\route.ts',
  'api\app\api\txs\route.ts',
  'api\app\api\txs\[hash]\route.ts',
  'api\app\api\address\[addr]\route.ts',
  'api\app\api\token\[addr]\route.ts',
  'api\app\api\stats\route.ts',

  # API lib
  'api\lib\database.ts',
  'api\lib\types.ts',
  'api\lib\utils.ts',

  # WEB root
  'web\package.json',
  'web\tsconfig.json',
  'web\tailwind.config.js',
  'web\next.config.js',

  # WEB pages
  'web\app\layout.tsx',
  'web\app\page.tsx',
  'web\app\globals.css',
  'web\app\block\[number]\page.tsx',
  'web\app\tx\[hash]\page.tsx',
  'web\app\address\[addr]\page.tsx',
  'web\app\token\[addr]\page.tsx',

  # WEB components
  'web\components\Layout.tsx',
  'web\components\SearchBar.tsx',
  'web\components\BlockCard.tsx',
  'web\components\TransactionCard.tsx',
  'web\components\StatsCard.tsx',
  'web\components\LiveUpdates.tsx',
  'web\components\SkeletonLoader.tsx',
  'web\components\Charts\BlockTimeChart.tsx',
  'web\components\Charts\TxThroughputChart.tsx',

  # WEB lib
  'web\lib\api.ts',
  'web\lib\websocket.ts',
  'web\lib\utils.ts',

  # public asset
  'web\public\icons\yafa-logo.svg'
)

$files | ForEach-Object { New-File $_ }

Write-Host "`n✅  YAFA explorer skeleton created." -ForegroundColor Green
