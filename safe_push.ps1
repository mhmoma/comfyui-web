param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

Write-Host "Step 1: Staging all tracked changes..."
git add .

Write-Host "Step 2: Committing with message: '$CommitMessage'..."
git commit -m $CommitMessage

Write-Host "Step 3: Pushing to origin main using proxy on port 18888..."
git -c http.proxy="http://127.0.0.1:18888" -c https.proxy="http://127.0.0.1:18888" push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host -ForegroundColor Green "Push successful!"
} else {
    Write-Host -ForegroundColor Red "Push failed. Please check the output above."
}
