const fs = require('fs');
const pdfParse = require('pdf-parse');
const { parseQuestionsFromText } = require('./questionParser');

/**
 * Reads a PDF file, extracts text via pdf-parse, and passes it to the question parser
 */
const processPdfFile = async (filePath, originalFileName) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const extractedText = pdfData.text || '';

    // Pass extracted text to question parser engine
    return parseQuestionsFromText(extractedText, originalFileName);
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      isScanned: true,
      message: `Failed to extract text from PDF: ${error.message}. The file may be password protected or corrupted.`,
      questions: [],
    };
  }
};

module.exports = { processPdfFile };
