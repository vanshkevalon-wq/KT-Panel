const fs = require('fs');
const pdfParseModule = require('pdf-parse');
const { parseQuestionsFromText } = require('./questionParser');

/**
 * Universal PDF Text Extractor supporting all versions of pdf-parse library
 */
const extractTextFromPdfBuffer = async (dataBuffer) => {
  // Case 1: pdf-parse v1 function format: require('pdf-parse')(buffer)
  if (typeof pdfParseModule === 'function') {
    try {
      const res = await pdfParseModule(dataBuffer);
      if (res && res.text) return res.text;
    } catch (err) {
      console.warn('pdfParse function call failed, trying PDFParse class...', err.message);
    }
  }

  // Case 2: ES Module default: require('pdf-parse').default(buffer)
  if (pdfParseModule && pdfParseModule.default && typeof pdfParseModule.default === 'function') {
    try {
      const res = await pdfParseModule.default(dataBuffer);
      if (res && res.text) return res.text;
    } catch (err) {
      console.warn('pdfParse.default call failed...', err.message);
    }
  }

  // Case 3: pdf-parse v2 Class format: new (pdfParseModule.PDFParse || pdfParseModule)(uint8Data)
  const PDFParseClass = (pdfParseModule && pdfParseModule.PDFParse) || (typeof pdfParseModule === 'function' ? pdfParseModule : null);
  if (PDFParseClass && typeof PDFParseClass === 'function') {
    try {
      const uint8Data = new Uint8Array(dataBuffer);
      const parser = new PDFParseClass(uint8Data);
      if (typeof parser.getText === 'function') {
        const textResult = await parser.getText();
        if (typeof textResult === 'string' && textResult.trim().length > 0) {
          return textResult;
        } else if (textResult && textResult.text) {
          return textResult.text;
        }
      }
    } catch (err) {
      console.warn('PDFParse class instantiation failed...', err.message);
    }
  }

  // Case 4: Fallback buffer string extraction
  const rawStr = dataBuffer.toString('utf-8');
  // Clean raw strings if PDF text commands exist
  const textMatches = rawStr.match(/\(([^)]+)\)\s*Tj/g);
  if (textMatches && textMatches.length > 5) {
    return textMatches.map(m => m.replace(/^\(|\)\s*Tj$/g, '')).join(' ');
  }

  return rawStr;
};

/**
 * Reads a PDF file, extracts text via robust PDF parser, and passes it to the question parser
 */
const processPdfFile = async (filePath, originalFileName) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const extractedText = await extractTextFromPdfBuffer(dataBuffer);

    if (!extractedText || extractedText.trim().length < 20) {
      return {
        isScanned: true,
        message: 'Could not extract readable text from PDF. The file may be image-based/scanned or password protected.',
        questions: [],
      };
    }

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
