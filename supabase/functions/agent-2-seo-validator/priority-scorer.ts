// Priority scoring system for Agent 2
// Assigns urgent/high/medium/low tiers

import type { VolumeEstimate } from './volume-estimator.ts';
import type { CompetitionScore } from './competition-scorer.ts';
import type { ContentGap } from './content-gap-analyzer.ts';

export interface PriorityScore {
  score: number; // 0-100
  tier: 'urgent' | 'high' | 'medium' | 'low';
  reasons: string[];
}

export function calculatePriority(
  volumeEstimate: VolumeEstimate,
  competitionScore: CompetitionScore,
  contentGap: ContentGap,
  trendScore?: number
): PriorityScore {
  const reasons: string[] = [];
  let score = 0;
  
  // Factor 1: Volume/Competition Ratio (40 points)
  const volume = volumeEstimate.estimated_volume;
  const competition = competitionScore.score;
  
  // Sweet spot: high volume + low competition
  if (volume >= 2000 && competition <= 40) {
    score += 40;
    reasons.push('High volume with low competition - prime opportunity');
  } else if (volume >= 1000 && competition <= 60) {
    score += 30;
    reasons.push('Good volume with manageable competition');
  } else if (volume >= 500) {
    score += 20;
    reasons.push('Moderate volume opportunity');
  } else {
    score += 10;
  }
  
  // Factor 2: Content Gap Opportunity (30 points)
  const gapScore = contentGap.opportunity_score;
  if (gapScore >= 70) {
    score += 30;
    reasons.push('Significant content gaps identified');
  } else if (gapScore >= 50) {
    score += 20;
    reasons.push('Notable content opportunities available');
  } else if (gapScore >= 30) {
    score += 10;
  }
  
  // Factor 3: Competition Difficulty (20 points - inverse)
  if (competition <= 30) {
    score += 20;
    reasons.push('Very low competition');
  } else if (competition <= 50) {
    score += 15;
  } else if (competition <= 70) {
    score += 10;
  } else {
    score += 5;
    reasons.push('High competition - requires strong content');
  }
  
  // Factor 4: Trend Score (10 points)
  if (trendScore !== undefined) {
    if (trendScore >= 80) {
      score += 10;
      reasons.push('Rapidly trending topic');
    } else if (trendScore >= 60) {
      score += 7;
    } else if (trendScore >= 40) {
      score += 5;
    }
  }
  
  // Bonus: Quick win indicators
  if (volume >= 1000 && competition <= 30 && gapScore >= 50) {
    score += 10;
    reasons.push('QUICK WIN: High ROI opportunity');
  }
  
  // Cap at 100
  score = Math.min(score, 100);
  
  // Determine tier
  let tier: PriorityScore['tier'];
  if (score >= 80) {
    tier = 'urgent';
  } else if (score >= 60) {
    tier = 'high';
  } else if (score >= 40) {
    tier = 'medium';
  } else {
    tier = 'low';
  }
  
  // Ensure at least one reason
  if (reasons.length === 0) {
    reasons.push(`Score: ${score}/100 based on volume and competition analysis`);
  }
  
  return {
    score,
    tier,
    reasons,
  };
}