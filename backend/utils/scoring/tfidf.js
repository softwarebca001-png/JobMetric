const natural = require('natural');
const { preprocessText } = require('./preprocessor');

// Calculate TF-IDF score
const calculateTfIdfScore = (jobText, resumeText) => {
  try {
    // Preprocess texts
    const jobTokens = preprocessText(jobText);
    const resumeTokens = preprocessText(resumeText);

    if (!jobTokens.length || !resumeTokens.length) {
      return 0;
    }

    // Create TF-IDF instance
    const tfidf = new natural.TfIdf();

    // Add documents
    tfidf.addDocument(jobTokens);
    tfidf.addDocument(resumeTokens);

    // Calculate score by measuring how many job terms appear in resume
    let totalScore = 0;
    let maxPossibleScore = 0;

    // For each term in job description, check its weight in resume
    jobTokens.forEach(term => {
      const jobWeight = tfidf.tfidf(term, 0);
      const resumeWeight = tfidf.tfidf(term, 1);

      if (jobWeight > 0) {
        maxPossibleScore += jobWeight;
        if (resumeWeight > 0) {
          totalScore += jobWeight;
        }
      }
    });

    // Normalize to 0-1 range
    const score = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;

    return Math.min(Math.max(score, 0), 1); // Clamp between 0 and 1
  } catch (error) {
    console.error('TF-IDF calculation error:', error);
    return 0;
  }
};

module.exports = {
  calculateTfIdfScore
};
