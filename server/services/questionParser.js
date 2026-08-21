/**
 * Advanced Question Parser Engine for PDF Extracted Text
 * Parses multi-pattern theory and practical questions, options, and correct answers.
 */

const parseQuestionsFromText = (extractedText, fileName = 'Uploaded PDF') => {
  if (!extractedText || typeof extractedText !== 'string') {
    return {
      isScanned: true,
      message: 'This PDF appears to be scanned/image-based. Text extraction could not reliably detect questions.',
      questions: [],
    };
  }

  const cleanText = extractedText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .trim();

  // If total text length is tiny, likely scanned PDF
  if (cleanText.length < 40) {
    return {
      isScanned: true,
      message: 'This PDF appears to be scanned/image-based or contains no readable text. OCR support is required for this file.',
      questions: [],
    };
  }

  // Split into raw blocks using common question start patterns:
  // e.g., "1.", "Q1.", "Question 1:", "1)", "Q1:"
  const questionBlockRegex = /(?=(?:^|\n)(?:\d+[\.\)]|Q\d+[\.\:]?|Question\s*\d+[\.\:]?)\s+)/gi;
  const rawBlocks = cleanText.split(questionBlockRegex).filter(block => block && block.trim().length > 10);

  // Fallback: If no numerical blocks matched, attempt splitting by double newlines
  const blocks = rawBlocks.length > 0 ? rawBlocks : cleanText.split(/\n\s*\n/).filter(b => b.trim().length > 15);

  const parsedQuestions = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;

    const parsed = parseSingleBlock(block, i + 1, fileName);
    if (parsed) {
      parsedQuestions.push(parsed);
    }
  }

  const totalDetected = parsedQuestions.length;
  const successfullyParsed = parsedQuestions.filter(q => !q.needsReview).length;
  const needsReview = parsedQuestions.filter(q => q.needsReview).length;

  return {
    isScanned: false,
    fileName,
    totalDetected,
    successfullyParsed,
    needsReview,
    questions: parsedQuestions,
  };
};

/**
 * Parses an individual question block
 */
const parseSingleBlock = (block, index, fileName) => {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  let rawQuestionHeader = lines[0];

  // Strip leading question numbers e.g. "1. ", "Q1: ", "Question 1 - "
  const questionText = block
    .split(/\n/)[0]
    .replace(/^(?:\d+[\.\)]|Q\d+[\.\:]?|Question\s*\d+[\.\:]?)\s*/i, '')
    .trim();

  // Extract correct answer if present in block: e.g., "Answer: A", "Correct Answer: C", "Ans: B"
  let correctAnswer = '';
  const answerRegex = /(?:Answer|Correct Answer|Ans|Correct)\s*[\:\=]?\s*([A-D|a-d])/i;
  const answerMatch = block.match(answerRegex);
  if (answerMatch) {
    correctAnswer = answerMatch[1].toUpperCase();
  }

  // Extract options: matches "A. text", "A) text", "(A) text", "a. text", "a) text"
  const options = [];
  const optionRegex = /(?:^|\n)\s*(?:\(?([A-D|a-d])[\.\)]|\b([A-D])\.)\s+([^\n]+)/gi;
  
  let match;
  while ((match = optionRegex.exec(block)) !== null) {
    const label = (match[1] || match[2]).toUpperCase();
    const text = match[3].replace(/(?:Answer|Correct Answer|Ans|Correct)\s*[\:\=].*$/i, '').trim();
    
    // Avoid duplicate option labels
    if (!options.some(opt => opt.label === label)) {
      options.push({ label, text });
    }
  }

  // Determine review flags
  const reviewReasons = [];
  if (!questionText || questionText.length < 5) {
    reviewReasons.push('Question text could not be reliably extracted.');
  }
  if (options.length < 2) {
    reviewReasons.push('Less than 2 options were detected.');
  }
  if (!correctAnswer) {
    reviewReasons.push('No correct answer marker detected (e.g., Answer: A).');
  }

  const needsReview = reviewReasons.length > 0;

  return {
    tempId: `parsed_${Date.now()}_${index}`,
    questionText: questionText || lines[0] || `Question #${index}`,
    options: options.length > 0 ? options : [
      { label: 'A', text: 'Option A' },
      { label: 'B', text: 'Option B' },
      { label: 'C', text: 'Option C' },
      { label: 'D', text: 'Option D' }
    ],
    correctAnswer: correctAnswer || (options[0]?.label || 'A'),
    category: 'Imported PDF',
    difficulty: 'medium',
    marks: 1,
    explanation: `Imported from ${fileName}`,
    type: 'theory',
    source: 'pdf',
    sourceFileName: fileName,
    status: 'draft',
    needsReview,
    reviewNotes: reviewReasons.join(' '),
  };
};

module.exports = { parseQuestionsFromText };
