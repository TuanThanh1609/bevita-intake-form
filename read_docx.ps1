Add-Type -AssemblyName 'System.IO.Compression.FileSystem'
$zip = [System.IO.Compression.ZipFile]::OpenRead('d:\vibe-coding\bevita-antigravity\Kich_Ban_Chatbot_Intake.docx')
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()
$cleaned = $content -replace '<[^>]+>', "`n"
$cleaned = $cleaned -replace '(\s*\n\s*)+', "`n"
$cleaned | Out-File -FilePath 'd:\vibe-coding\bevita-antigravity\temp_docx_content.txt' -Encoding utf8
