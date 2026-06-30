import assert from 'assert';
import {
  calculateDigitalPresenceScore,
  calculateGrowthOpportunityScore,
  generateRuleBasedRecommendations
} from '../backend/models/db.js';

console.log("==========================================");
console.log(" RUNNING SYSTEM TEST SUITE: SCORING ENGINE ");
console.log("==========================================");

try {
  // Test 1: Digital Presence Score calculations
  console.log("\n🧪 Running Test 1: Digital Presence Score...");
  
  const perfectCafe = {
    website: 'Y',
    rating: 5.0,
    reviews: 1200,
    phone: '+91 172 555 1111',
    hours: '9:00 AM - 11:00 PM'
  };
  
  const scorePerfect = calculateDigitalPresenceScore(perfectCafe);
  console.log(`- Perfect Cafe score calculated: ${scorePerfect} / 100`);
  assert.strictEqual(scorePerfect, 100, "Perfect parameters should result in maximum presence score of 100");

  const minimalCafe = {
    website: 'N',
    rating: 1.0,
    reviews: 0,
    phone: '',
    hours: ''
  };
  
  const scoreMinimal = calculateDigitalPresenceScore(minimalCafe);
  console.log(`- Minimal Cafe score calculated: ${scoreMinimal} / 100`);
  assert.ok(scoreMinimal < 30, "Minimal parameters should result in low score");
  assert.strictEqual(scoreMinimal, 10, "Score for rating=1.0 and review=0 should be exactly 10 (10 from rating, 0 from review count, 0 from others)");

  console.log("✅ Test 1 Passed Successfully!");

  // Test 2: Growth Opportunity Score calculations
  console.log("\n🧪 Running Test 2: Growth Opportunity Score...");

  // High rating + high reviews + no website = critical opportunity
  const targetCafe = {
    website: 'N',
    rating: 4.6,
    reviews: 1500,
    phone: '+91 172 555 2222',
    hours: '9:00 AM - 11:00 PM'
  };

  const scoreTarget = calculateGrowthOpportunityScore(targetCafe);
  console.log(`- Target Cafe growth opportunity: ${scoreTarget} / 100`);
  assert.ok(scoreTarget >= 80, "High rating/reviews but missing website should trigger critical opportunity score");

  // Already optimized website + high rating = low opportunity
  const optimizedCafe = {
    website: 'Y',
    rating: 4.8,
    reviews: 2000,
    phone: '+91 172 555 3333',
    hours: '9:00 AM - 11:00 PM'
  };

  const scoreOptimized = calculateGrowthOpportunityScore(optimizedCafe);
  console.log(`- Optimized Cafe growth opportunity: ${scoreOptimized} / 100`);
  assert.ok(scoreOptimized < 30, "Well-optimized presence should represent low opportunity");

  console.log("✅ Test 2 Passed Successfully!");

  // Test 3: Recommendation triggers
  console.log("\n🧪 Running Test 3: Rule-Based Suggestions Triggering...");

  const missingWebsiteSpecs = {
    website: 'N',
    rating: 4.5,
    reviews: 400,
    phone: '',
    hours: '',
    growthOpportunityScore: 85
  };

  const recommendations = generateRuleBasedRecommendations(missingWebsiteSpecs);
  console.log("- Triggered recommendation outputs:");
  recommendations.forEach(r => console.log(`  * ${r}`));

  assert.ok(
    recommendations.some(r => r.includes("website")),
    "Should recommend establishing a website if missing"
  );
  assert.ok(
    recommendations.some(r => r.includes("WhatsApp")),
    "Should recommend WhatsApp if phone number is missing"
  );
  assert.ok(
    recommendations.some(r => r.includes("Operating Hours")),
    "Should recommend operating hours if missing"
  );

  console.log("✅ Test 3 Passed Successfully!");

  console.log("\n🎉 ALL TESTS IN SUITE PASSED SUCCESSFULLY!");
  console.log("==========================================");
  process.exit(0);

} catch (e: any) {
  console.error("\n❌ TEST SUITE FAILURE!");
  console.error(e);
  process.exit(1);
}
