# Test Genesis Unified API with Database Storage
# This will test the complete pipeline: Agent 1 -> Agent 2 V3 -> Database

$supabaseUrl = "https://kyeusjkivowioqxzwgpn.supabase.co"
$apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5ZXVzamtpdm93aW9xeHp3Z3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MTgyNDQsImV4cCI6MjA2OTI5NDI0NH0.M0_RjY2oEepFVBhg-Y4l_G9JrYCXm-UlXkEziDJAExc"

$endpoint = "$supabaseUrl/functions/v1/genesis-unified-api"

$headers = @{
    "Content-Type" = "application/json"
    "apikey" = $apiKey
    "Authorization" = "Bearer $apiKey"
}

$body = @{
    business = "AI-powered project management platform"
    niche = "productivity software, team collaboration tools"
    target_audience = "small business owners, remote teams, project managers"
    goals = @("increase organic traffic", "improve conversion rates")
    competitors = @("asana.com", "monday.com")
} | ConvertTo-Json

Write-Host "🚀 Testing Genesis Unified API with Database Storage..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $body -TimeoutSec 120
    
    Write-Host "✅ API Request Successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Pipeline Results:" -ForegroundColor Yellow
    Write-Host "  Pipeline ID: $($response.pipeline_id)" -ForegroundColor White
    Write-Host "  Runtime: $($response.runtime_ms)ms" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🔍 Agent 1 Results:" -ForegroundColor Magenta
    Write-Host "  Keywords Found: $($response.agent1_results.keywords_found)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🎯 Agent 2 Results:" -ForegroundColor Magenta
    Write-Host "  Keywords Validated: $($response.agent2_results.validated_keywords)" -ForegroundColor White
    Write-Host "  Total Volume: $($response.agent2_results.total_estimated_volume)" -ForegroundColor White
    Write-Host "  Urgent Priority: $($response.agent2_results.priority_distribution.urgent)" -ForegroundColor White
    Write-Host "  High Priority: $($response.agent2_results.priority_distribution.high)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🤖 Gemini Filter Results (NEW!):" -ForegroundColor Cyan
    Write-Host "  Total Analyzed: $($response.gemini_filter_results.total_analyzed)" -ForegroundColor White
    Write-Host "  Total Selected: $($response.gemini_filter_results.total_selected)" -ForegroundColor White
    Write-Host "  Duplicates Removed: $($response.gemini_filter_results.duplicates_removed)" -ForegroundColor White
    Write-Host "  Selection Rate: $([math]::Round($response.gemini_filter_results.selection_rate * 100, 1))%" -ForegroundColor White
    Write-Host "  Avg Score: $([math]::Round($response.gemini_filter_results.avg_score, 1))" -ForegroundColor White
    Write-Host "  Processing Time: $($response.gemini_filter_results.processing_time_ms)ms" -ForegroundColor White
    Write-Host ""
    
    Write-Host "💾 Database Storage:" -ForegroundColor Green
    Write-Host "  Keywords Saved: $($response.database_storage.keywords_saved)" -ForegroundColor White
    Write-Host "  Table: $($response.database_storage.table)" -ForegroundColor White
    Write-Host "  Status: $($response.database_storage.status)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "💰 Cost Breakdown:" -ForegroundColor Yellow
    Write-Host "  Agent 1 Cost: `$$($response.cost_breakdown.agent1_cost)" -ForegroundColor White
    Write-Host "  Agent 2 Cost: `$$($response.cost_breakdown.agent2_cost)" -ForegroundColor White
    Write-Host "  Total Cost: `$$($response.cost_breakdown.total_cost)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🎉 Full Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Green
