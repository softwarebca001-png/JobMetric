const { preprocessText } = require('./preprocessor');

// Calculate word frequency vector
const createFrequencyVector = (tokens) => {
  const vector = {};
  tokens.forEach(token => {
    vector[token] = (vector[token] || 0) + 1;
  });
  return vector;
};

// Calculate dot product of two vectors
const dotProduct = (vec1, vec2) => {
  let product = 0;
  for (const key in vec1) {
    if (vec2[key]) {
      product += vec1[key] * vec2[key];
    }
  }
  return product;
};

// Calculate magnitude of a vector
const magnitude = (vector) => {
  let sum = 0;
  for (const key in vector) {
    sum += vector[key] * vector[key];
  }
  return Math.sqrt(sum);
};

// Calculate cosine similarity
const calculateCosineSimilarity = (jobText, resumeText) => {
  try {
    // Preprocess texts
    const jobTokens = preprocessText(jobText);
    const resumeTokens = preprocessText(resumeText);

    if (!jobTokens.length || !resumeTokens.length) {
      return 0;
    }

    // Create frequency vectors
    const jobVector = createFrequencyVector(jobTokens);
    const resumeVector = createFrequencyVector(resumeTokens);

    // Calculate cosine similarity
    const dot = dotProduct(jobVector, resumeVector);
    const jobMag = magnitude(jobVector);
    const resumeMag = magnitude(resumeVector);

    if (jobMag === 0 || resumeMag === 0) {
      return 0;
    }

    const similarity = dot / (jobMag * resumeMag);

    return Math.min(Math.max(similarity, 0), 1); // Clamp between 0 and 1
  } catch (error) {
    console.error('Cosine similarity calculation error:', error);
    return 0;
  }
};

module.exports = {
  calculateCosineSimilarity
};
