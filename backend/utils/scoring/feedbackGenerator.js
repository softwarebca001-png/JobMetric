// Generate feedback based on match score and matched/missing skills
const generateFeedback = (matchPercentage, matchedSkills = [], missingSkills = [], keywordMatchScore = 0) => {
  try {
    const feedback = [];

    // Overall match statement
    const matchInterpretation = getMatchInterpretation(matchPercentage);
    feedback.push(matchInterpretation);

    // Matched skills highlight
    if (matchedSkills.length > 0) {
      const skillsList = matchedSkills.slice(0, 5).join(', ');
      feedback.push(`Your resume matches these required skills: ${skillsList}.`);
    }

    // Missing skills notification
    if (missingSkills.length > 0) {
      const missingList = missingSkills.slice(0, 5).join(', ');
      feedback.push(`Consider adding or highlighting these skills: ${missingList}.`);
    }

    // Improvement suggestions based on score
    if (keywordMatchScore < 50) {
      feedback.push('Try to include more keywords from the job description.');
    }

    if (matchedSkills.length < 3 && missingSkills.length > 0) {
      feedback.push('Emphasize technical skills that match the job requirements.');
    }

    if (matchPercentage < 60) {
      feedback.push('Consider tailoring your resume to better match this specific role.');
    }

    return feedback.join(' ');
  } catch (error) {
    console.error('Feedback generation error:', error);
    return 'Unable to generate detailed feedback at this time.';
  }
};

// Get match interpretation based on percentage
const getMatchInterpretation = (percentage) => {
  if (percentage >= 80) {
    return 'Excellent match! Your resume strongly aligns with this position.';
  } else if (percentage >= 60) {
    return 'Good match. Your resume shows relevant experience for this role.';
  } else if (percentage >= 40) {
    return 'Moderate match. Some of your skills align with this position.';
  } else {
    return 'Limited match. Consider highlighting more relevant experience.';
  }
};

module.exports = {
  generateFeedback,
  getMatchInterpretation
};
