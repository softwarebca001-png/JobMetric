const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Extract text from PDF
const extractPDFText = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to read PDF. File may be corrupted.');
  }
};

// Extract text from DOCX
const extractDOCXText = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to read DOCX. File may be corrupted.');
  }
};

// Main function to extract text from resume
const extractResumeText = async (buffer, mimeType) => {
  try {
    let text = '';

    if (mimeType === 'application/pdf') {
      text = await extractPDFText(buffer);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractDOCXText(buffer);
    } else {
      throw new Error('Unsupported file type');
    }

    // Clean extracted text
    text = text
      .replace(/\r\n/g, '\n')  // Normalize line endings
      .replace(/\n+/g, '\n')   // Remove multiple newlines
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();

    // Validate extracted text
    if (!text || text.length < 50) {
      throw new Error('Could not extract text from resume. Please ensure file is readable.');
    }

    return text;
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw error;
  }
};

module.exports = {
  extractResumeText,
  extractPDFText,
  extractDOCXText
};
