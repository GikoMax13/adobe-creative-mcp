function Invoke-AdobeCreativeMcpCommand {
    param(
        [Parameter(Mandatory)] [string] $Type,
        [hashtable] $Payload = @{},
        [int] $Port = 47391,
        [string] $Token = ""
    )
    $body = @{ id = "ps-$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"; schemaVersion = "2.0"; type = $Type; payload = $Payload } | ConvertTo-Json -Depth 20
    $headers = @{}
    if ($Token) { $headers.Authorization = "Bearer $Token" }
    Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:$Port/command" -Headers $headers -ContentType "application/json" -Body $body
}

function Get-AdobeCreativeMcpHealth {
    param([int] $Port = 47391)
    Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:$Port/health"
}
