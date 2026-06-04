$base = 'http://localhost:4000'
$results = @()

$endpoints = @(
  'categories', 'videos', 'packages', 'reviews',
  'success-stories', 'faqs', 'coaches', 'programs'
)

foreach ($ep in $endpoints) {
  try {
    $r = Invoke-WebRequest -Uri "$base/api/squash/$ep" -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    $count = if ($data -is [array]) { $data.Count } else { 1 }
    $results += [pscustomobject]@{ Endpoint = "GET /api/squash/$ep"; Status = $r.StatusCode; Rows = $count; Result = 'PASS' }
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    $results += [pscustomobject]@{ Endpoint = "GET /api/squash/$ep"; Status = $code; Rows = 0; Result = 'FAIL' }
  }
}

$loginBody = @{ email = 'admin@gmail.com'; password = '12345678' } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "$base/api/auth/login" -Method POST -Body $loginBody -ContentType 'application/json'
$token = $auth.accessToken
$headers = @{ Authorization = "Bearer $token" }

$createBody = @{ nameEn = 'Smoke Squash Cat'; nameAr = 'اختبار'; isPublic = $true } | ConvertTo-Json
try {
  $created = Invoke-RestMethod -Uri "$base/api/squash/categories" -Method POST -Headers $headers -Body $createBody -ContentType 'application/json'
  $id = $created.id
  $patchBody = @{ nameEn = 'Smoke Squash Cat Updated' } | ConvertTo-Json
  Invoke-RestMethod -Uri "$base/api/squash/categories/$id" -Method PATCH -Headers $headers -Body $patchBody -ContentType 'application/json' | Out-Null
  Invoke-RestMethod -Uri "$base/api/squash/categories/$id" -Method DELETE -Headers $headers | Out-Null
  $results += [pscustomobject]@{ Endpoint = 'POST/PATCH/DELETE /api/squash/categories'; Status = 200; Rows = '-'; Result = 'PASS' }
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  $results += [pscustomobject]@{ Endpoint = 'POST/PATCH/DELETE /api/squash/categories'; Status = $code; Rows = '-'; Result = 'FAIL' }
}

$results | Format-Table -AutoSize
$fail = ($results | Where-Object { $_.Result -eq 'FAIL' }).Count
exit $(if ($fail -gt 0) { 1 } else { 0 })
