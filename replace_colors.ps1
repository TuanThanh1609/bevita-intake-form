$content = Get-Content "d:\vibe-coding\bevita-antigravity\styles.css" -Raw
$content = $content -replace '--pink-', '--teal-'
$content = $content -replace '--green-', '--gold-'

$content = $content -replace '#FFF0F5', '#E0F7FA'
$content = $content -replace '#FFE0EB', '#B2EBF2'
$content = $content -replace '#F8BBD0', '#80DEEA'
$content = $content -replace '#F48FB1', '#4DD0E1'
$content = $content -replace '#EC407A', '#26C6DA'
$content = $content -replace '#E91E63', '#00B0BD'

$content = $content -replace '#F1F8E9', '#FFF8E1'
$content = $content -replace '#DCEDC8', '#FFECB3'
$content = $content -replace '#A5D6A7', '#FFE082'
$content = $content -replace '#81C784', '#FFD54F'
$content = $content -replace '#66BB6A', '#FFCA28'
$content = $content -replace '#4CAF50', '#FFB300'

# Update RGB values in rgba()
$content = $content -replace 'rgba\(233, 30, 99', 'rgba(0, 176, 189'
$content = $content -replace 'rgba\(165, 214, 167', 'rgba(255, 224, 130'

Set-Content "d:\vibe-coding\bevita-antigravity\styles.css" $content
