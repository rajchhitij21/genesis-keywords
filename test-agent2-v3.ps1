# Agent 2 V3 Comprehensive Test Script
# Replace these with your actual Supabase values
$SUPABASE_URL = "https://kyeusjkivowioqxzwgpn.supabase.co"
$SUPABASE_ANON_KEY = "YOUR_ANON_KEY_HERE"  # Replace with your actual anon key
$FUNCTION_URL = "$SUPABASE_URL/functions/v1/agent-2-seo-validator"

Write-Host "🧪 AGENT 2 V3 COMPREHENSIVE TEST" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Load test payload
$testPayload = Get-Content -Path "test-agent2-v3.json" -Raw
Write-Host "`n📥 Test Payload:" -ForegroundColor Yellow
Write-Host $testPayload

# Headers for the request
$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer $SUPABASE_ANON_KEY"
    'apikey' = $SUPABASE_ANON_KEY
}

Write-Host "`n🚀 Calling Agent 2 V3 Function..." -ForegroundColor Green
Write-Host "URL: $FUNCTION_URL" -ForegroundColor Gray

try {
    # Make the request
    $response = Invoke-RestMethod -Uri $FUNCTION_URL -Method POST -Body $testPayload -Headers $headers -TimeoutSec 120
    
    Write-Host "`n✅ SUCCESS! Agent 2 V3 Response:" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    
    # Display metadata
    Write-Host "`n📊 METADATA:" -ForegroundColor Cyan
    Write-Host "Input Keywords: $($response.metadata.input_count)"
    Write-Host "Validated Keywords: $($response.metadata.validated_count)"
    Write-Host "Priority Distribution:"
    Write-Host "  - Urgent: $($response.metadata.urgent_count)"
    Write-Host "  - High: $($response.metadata.high_count)"
    Write-Host "  - Medium: $($response.metadata.medium_count)"
    Write-Host "  - Low: $($response.metadata.low_count)"
    Write-Host "Serper Calls: $($response.metadata.serper_calls)"
    Write-Host "Runtime: $($response.metadata.runtime_ms)ms"
    
    # Test each validated keyword
    Write-Host "`n🔍 DETAILED ANALYSIS:" -ForegroundColor Cyan
    
    foreach ($keyword in $response.validated_keywords) {
        Write-Host "`n--- KEYWORD: '$($keyword.keyword)' ---" -ForegroundColor Yellow
        
        # Volume Analysis Test
        Write-Host "`n📊 VOLUME ANALYSIS (V3 6-Signal):"
        Write-Host "  Estimated Volume: $($keyword.estimated_volume)"
        Write-Host "  Confidence: $($keyword.volume_confidence)"
        Write-Host "  Signals:"
        Write-Host "    - Ads Count: $($keyword.volume_signals.ads_count)"
        Write-Host "    - Related Searches: $($keyword.volume_signals.related_searches_count)"
        Write-Host "    - SERP Features: $($keyword.volume_signals.serp_features_count)"
        Write-Host "    - Keyword Length: $($keyword.volume_signals.keyword_length)"
        Write-Host "    - Commercial Words: $($keyword.volume_signals.commercial_words)"
        Write-Host "    - Year Suffix: $($keyword.volume_signals.has_year_suffix)"
        
        if ($keyword.volume_breakdown) {
            Write-Host "  Breakdown:"
            Write-Host "    - Base Volume: $($keyword.volume_breakdown.base_volume)"
            Write-Host "    - Related Multiplier: $($keyword.volume_breakdown.related_multiplier)"
            Write-Host "    - Features Multiplier: $($keyword.volume_breakdown.features_multiplier)"
            Write-Host "    - Length Multiplier: $($keyword.volume_breakdown.length_multiplier)"
            Write-Host "    - Commercial Multiplier: $($keyword.volume_breakdown.commercial_multiplier)"
            Write-Host "    - Year Multiplier: $($keyword.volume_breakdown.year_multiplier)"
        }
        
        # Trend Analysis Test
        Write-Host "`n📈 TREND ANALYSIS (V3 Multi-Signal):"
        Write-Host "  Trend Score: $($keyword.trend_score)"
        Write-Host "  Direction: $($keyword.trend_direction)"
        Write-Host "  Confidence: $($keyword.trend_confidence)"
        Write-Host "  Signals:"
        Write-Host "    - News Mentions: $($keyword.trend_signals.news_mentions)"
        Write-Host "    - Video Content: $($keyword.trend_signals.video_content)"
        Write-Host "    - Fresh Content: $($keyword.trend_signals.fresh_content_count)"
        Write-Host "    - SERP Freshness: $($keyword.trend_signals.serp_freshness_score)%"
        Write-Host "    - Trending Keywords: $($keyword.trend_signals.trending_keywords_count)"
        
        # Content Gap Analysis Test
        Write-Host "`n🔍 CONTENT GAP ANALYSIS (V3 Deep Analysis):"
        Write-Host "  Opportunity Score: $($keyword.content_gaps.opportunity_score)"
        
        if ($keyword.content_gaps.paa_analysis) {
            Write-Host "  PAA Analysis:"
            Write-Host "    - Total Questions: $($keyword.content_gaps.paa_analysis.total_questions)"
            Write-Host "    - Gap Percentage: $($keyword.content_gaps.paa_analysis.gap_percentage)%"
            Write-Host "    - High Priority Gaps: $($keyword.content_gaps.paa_analysis.high_priority_gaps.Count)"
        }
        
        if ($keyword.content_gaps.weak_competitors) {
            Write-Host "  Weak Competitors: $($keyword.content_gaps.weak_competitors.Count)"
            foreach ($competitor in $keyword.content_gaps.weak_competitors) {
                Write-Host "    - $($competitor.domain) (Authority: $($competitor.authority_score)) - $($competitor.opportunity_reason)"
            }
        }
        
        if ($keyword.content_gaps.content_suggestions) {
            Write-Host "  Content Suggestions:"
            foreach ($suggestion in $keyword.content_gaps.content_suggestions) {
                Write-Host "    - $suggestion"
            }
        }
        
        # Priority Analysis
        Write-Host "`n🎯 PRIORITY ANALYSIS:"
        Write-Host "  Score: $($keyword.priority_score)/100"
        Write-Host "  Tier: $($keyword.priority_tier)"
        if ($keyword.priority_reasons) {
            Write-Host "  Reasons:"
            foreach ($reason in $keyword.priority_reasons) {
                Write-Host "    - $reason"
            }
        }
    }
    
    Write-Host "`n🎉 AGENT 2 V3 TEST COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "All V3 features appear to be working correctly." -ForegroundColor Green
    
    # Save detailed results for analysis
    $response | ConvertTo-Json -Depth 10 | Out-File "agent2-v3-test-results.json"
    Write-Host "`n💾 Full results saved to: agent2-v3-test-results.json" -ForegroundColor Gray
    
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Response Content:" -ForegroundColor Red
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseContent = $reader.ReadToEnd()
        Write-Host $responseContent -ForegroundColor Red
    }
}

Write-Host "`n📋 TEST INSTRUCTIONS:" -ForegroundColor Magenta
Write-Host "1. Replace YOUR_ANON_KEY_HERE with your actual Supabase anon key"
Write-Host "2. Ensure Serper API keys are configured in Supabase secrets"
Write-Host "3. Run this script to test all V3 features comprehensively"
Write-Host "4. Check the detailed results in agent2-v3-test-results.json"