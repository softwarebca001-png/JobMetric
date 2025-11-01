const { calculateTfIdfScore } = require('../utils/scoring/tfidf');
const { calculateBM25Score } = require('../utils/scoring/bm25');
const { calculateCosineSimilarity } = require('../utils/scoring/cosine');
const { calculateKeywordMatch, matchSkills } = require('../utils/scoring/keywordMatcher');
const { generateFeedback } = require('../utils/scoring/feedbackGenerator');

// Main scoring function that combines all algorithms
const calculateMatchScore = async (jobDescription, jobRequirements, requiredSkills, resumeText) => {
  try {
    // Combine job text for comprehensive analysis
    const fullJobText = `${jobDescription} ${jobRequirements}`;

    // Initialize scores
    let tfidfScore = 0;
    let bm25RawScore = 0;
    let bm25NormalizedScore = 0;
    let cosineScore = 0;
    let keywordMatchScore = 0;
    let matchedKeywords = [];

    // Run all algorithms
    try {
      // 1. TF-IDF Score
      tfidfScore = calculateTfIdfScore(fullJobText, resumeText);
    } catch (error) {
      console.error('TF-IDF scoring error:', error);
    }

    try {
      // 2. BM25 Score
      const bm25Result = calculateBM25Score(fullJobText, resumeText);
      bm25RawScore = bm25Result.rawScore;
      bm25NormalizedScore = bm25Result.normalizedScore;
    } catch (error) {
      console.error('BM25 scoring error:', error);
    }

    try {
      // 3. Cosine Similarity
      cosineScore = calculateCosineSimilarity(fullJobText, resumeText);
    } catch (error) {
      console.error('Cosine similarity scoring error:', error);
    }

    try {
      // 4. Keyword Matching
      const keywordResult = calculateKeywordMatch(fullJobText, resumeText, requiredSkills);
      keywordMatchScore = keywordResult.score;
      matchedKeywords = keywordResult.matchedKeywords;
    } catch (error) {
      console.error('Keyword matching error:', error);
    }

    // Calculate final score (weighted average of all algorithms)
    // Each algorithm contributes 25%
    const finalScore = (
      (tfidfScore * 100 * 0.25) +
      (bm25NormalizedScore * 0.25) +
      (cosineScore * 100 * 0.25) +
      (keywordMatchScore * 0.25)
    );

    // Match skills specifically
    const { matchedSkills, missingSkills } = matchSkills(requiredSkills, resumeText);

    // Generate feedback
    const feedback = generateFeedback(
      finalScore,
      matchedSkills,
      missingSkills,
      keywordMatchScore
    );

    return {
      scores: {
        tfidfScore,
        bm25Score: bm25RawScore,
        cosineScore,
        keywordMatchScore,
        finalScore: Math.round(finalScore * 100) / 100 // Round to 2 decimal places
      },
      matchPercentage: Math.round(finalScore),
      matchedSkills,
      missingSkills,
      keywordsMatched: matchedKeywords,
      feedback
    };
  } catch (error) {
    console.error('Scoring service error:', error);

    // Return default scores on complete failure
    return {
      scores: {
        tfidfScore: 0,
        bm25Score: 0,
        cosineScore: 0,
        keywordMatchScore: 0,
        finalScore: 0
      },
      matchPercentage: 0,
      matchedSkills: [],
      missingSkills: requiredSkills || [],
      keywordsMatched: [],
      feedback: 'Unable to calculate match score. Please try again later.'
    };
  }
};

module.exports = {
  calculateMatchScore
};
