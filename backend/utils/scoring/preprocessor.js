const natural = require('natural');
const { removeStopwords } = require('stopword');

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Preprocess text for NLP algorithms
const preprocessText = (text) => {
  try {
    if (!text) return '';

    // Convert to lowercase
    let processed = text.toLowerCase();

    // Remove special characters, keep alphanumeric and spaces
    processed = processed.replace(/[^a-z0-9\s]/g, ' ');

    // Tokenize
    let tokens = tokenizer.tokenize(processed) || [];

    // Remove stop words
    tokens = removeStopwords(tokens);

    // Stem tokens
    tokens = tokens.map(token => stemmer.stem(token));

    // Remove empty tokens and normalize
    tokens = tokens.filter(token => token && token.length > 1);

    return tokens;
  } catch (error) {
    console.error('Text preprocessing error:', error);
    return [];
  }
};

// Clean text without stemming (for display purposes)
const cleanText = (text) => {
  try {
    if (!text) return '';

    // Convert to lowercase
    let cleaned = text.toLowerCase();

    // Remove special characters
    cleaned = cleaned.replace(/[^a-z0-9\s]/g, ' ');

    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  } catch (error) {
    console.error('Text cleaning error:', error);
    return '';
  }
};

// Extract skills from text (simple approach)
const extractSkills = (text) => {
  try {
    if (!text) return [];

    // Common tech skills to look for
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'nodejs', 'angular',
      'vue', 'typescript', 'sql', 'mongodb', 'postgresql', 'mysql', 'docker',
      'kubernetes', 'aws', 'azure', 'gcp', 'git', 'html', 'css', 'redux',
      'express', 'django', 'flask', 'spring', 'rest', 'api', 'graphql',
      'agile', 'scrum', 'ci/cd', 'devops', 'machine learning', 'ml', 'ai',
      'data science', 'tensorflow', 'pytorch', 'pandas', 'numpy'
    ];

    const lowerText = text.toLowerCase();
    const foundSkills = [];

    commonSkills.forEach(skill => {
      // Use word boundaries to match whole words
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(lowerText)) {
        foundSkills.push(skill);
      }
    });

    return [...new Set(foundSkills)]; // Remove duplicates
  } catch (error) {
    console.error('Skill extraction error:', error);
    return [];
  }
};

module.exports = {
  preprocessText,
  cleanText,
  extractSkills
};
