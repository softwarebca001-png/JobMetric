const bm25 = require('wink-bm25-text-search');
const { preprocessText } = require('./preprocessor');

// Calculate BM25 score using wink-bm25-text-search v3.x
const calculateBM25Score = (jobText, resumeText) => {
  try {
    // Preprocess texts
    const jobTokens = preprocessText(jobText);
    const resumeTokens = preprocessText(resumeText);

    if (!jobTokens.length || !resumeTokens.length) {
      return 0;
    }

    // Create BM25 instance
    const engine = bm25();

    // Configure for v3.x API
    engine.defineConfig({ fldWeights: { title: 1 } });
    engine.definePrepTasks([]);

    // Add job description as a document
    engine.addDoc({ title: jobTokens.join(' ') }, 0);

    // Consolidate index
    engine.consolidate();

    // Search using resume tokens as query
    const query = resumeTokens.join(' ');
    const results = engine.search(query);

    // Extract score (raw BM25 score)
    const rawScore = results.length > 0 ? results[0][1] : 0;

    // Normalize BM25 score to 0-100 scale
    // BM25 typically ranges 0-10 for good matches, but can be higher
    const normalizedScore = Math.min((rawScore / 10) * 100, 100);

    return {
      rawScore,
      normalizedScore: Math.max(normalizedScore, 0)
    };
  } catch (error) {
    console.error('BM25 calculation error:', error);
    return { rawScore: 0, normalizedScore: 0 };
  }
};

module.exports = {
  calculateBM25Score
};
