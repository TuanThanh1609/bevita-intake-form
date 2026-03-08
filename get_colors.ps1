Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("d:\vibe-coding\bevita-antigravity\104143894_725343728224198_3614738744742336894_n.jpg")
$bmp = new-object System.Drawing.Bitmap($img)
$colors = @{}
$w = 50
$h = 50
for($x=0; $x -lt $w; $x++) {
  for($y=0; $y -lt $h; $y++) {
    $pixelX = [int]($x * ($bmp.Width / $w))
    $pixelY = [int]($y * ($bmp.Height / $h))
    $c = $bmp.GetPixel($pixelX, $pixelY)
    $hex = "#{0:X2}{1:X2}{2:X2}" -f $c.R, $c.G, $c.B
    if($colors.ContainsKey($hex)) { $colors[$hex]++ } else { $colors[$hex] = 1 }
  }
}
$colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 10 | ForEach-Object { "$($_.Name): $($_.Value)" }
