const keyword_extractor = require('keyword-extractor');
const { preprocessText, cleanText } = require('./preprocessor');

// Extract keywords from text
const extractKeywords = (text, maxKeywords = 20) => {
  try {
    if (!text) return [];

    const keywords = keyword_extractor.extract(text, {
      language: 'english',
      remove_digits: false,
      return_changed_case: true,
      remove_duplicates: true
    });

    return keywords.slice(0, maxKeywords);
  } catch (error) {
    console.error('Keyword extraction error:', error);
    return [];
  }
};

// Calculate keyword match score
const calculateKeywordMatch = (jobText, resumeText, requiredSkills = []) => {
  try {
    // Extract keywords from job description
    const jobKeywords = extractKeywords(jobText, 20);

    // Add required skills to keywords
    const allKeywords = [...new Set([...jobKeywords, ...requiredSkills.map(s => s.toLowerCase())])];

    if (allKeywords.length === 0) {
      return {
        score: 0,
        matchedKeywords: [],
        totalKeywords: 0
      };
    }

    // Preprocess resume text for matching
    const resumeLower = resumeText.toLowerCase();
    const resumeTokens = preprocessText(resumeText);

    // Count matched keywords
    const matchedKeywords = [];

    allKeywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      // Check both exact match and stemmed match
      if (resumeLower.includes(keywordLower) || resumeTokens.includes(keywordLower)) {
        matchedKeywords.push(keyword);
      }
    });

    // Calculate percentage
    const score = (matchedKeywords.length / allKeywords.length) * 100;

    return {
      score: Math.min(score, 100),
      matchedKeywords: matchedKeywords,
      totalKeywords: allKeywords.length
    };
  } catch (error) {
    console.error('Keyword matching error:', error);
    return {
      score: 0,
      matchedKeywords: [],
      totalKeywords: 0
    };
  }
};

// Match specific skills
const matchSkills = (requiredSkills = [], resumeText) => {
  try {
    if (!requiredSkills || requiredSkills.length === 0) {
      return {
        matchedSkills: [],
        missingSkills: []
      };
    }

    const resumeLower = resumeText.toLowerCase();
    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      // Use word boundaries for more accurate matching
      const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

      if (regex.test(resumeLower)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    return {
      matchedSkills,
      missingSkills
    };
  } catch (error) {
    console.error('Skill matching error:', error);
    return {
      matchedSkills: [],
      missingSkills: requiredSkills
    };
  }
};

module.exports = {
  extractKeywords,
  calculateKeywordMatch,
  matchSkills
};
