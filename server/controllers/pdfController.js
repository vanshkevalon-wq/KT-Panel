const fs = require('fs');
const { processPdfFile } = require('../services/pdfParser');
const TheoryQuestion = require('../models/TheoryQuestion');
const PracticalQuestion = require('../models/PracticalQuestion');
const { logActivity } = require('../services/auditLogService');

// @desc    Upload PDF and parse questions for review preview
// @route   POST /api/questions/import-pdf
// @access  Private (Admin, Theory, Practical)
const importPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded. Please select a valid .pdf file.' });
    }

    const filePath = req.file.path;
    const originalFileName = req.file.originalname;

    // Run text extraction and question parser engine
    const parseResult = await processPdfFile(filePath, originalFileName);

    await logActivity({
      user: req.user,
      action: 'PDF_UPLOAD',
      module: 'PDF_IMPORT',
      description: `Uploaded and parsed PDF "${originalFileName}" (${parseResult.totalDetected || 0} questions detected).`,
      req,
    });

    res.json(parseResult);
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm and save reviewed questions into MongoDB
// @route   POST /api/questions/import-confirm
// @access  Private (Admin, Theory, Practical)
const confirmImport = async (req, res, next) => {
  try {
    const { questions, importType = 'theory', category } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'No reviewed questions provided for import.' });
    }

    const savedItems = [];

    if (importType === 'theory') {
      for (const q of questions) {
        if (!q.questionText || !q.options || q.options.length < 2) continue;

        const newQ = await TheoryQuestion.create({
          questionText: q.questionText,
          options: q.options.map(opt => ({
            label: opt.label || 'A',
            text: opt.text || '',
          })),
          correctAnswer: q.correctAnswer || (q.options[0]?.label || 'A'),
          category: q.category && q.category !== 'Imported PDF' ? q.category : category || 'General',
          difficulty: q.difficulty || 'medium',
          marks: q.marks || 1,
          explanation: q.explanation || `Imported from ${q.sourceFileName || 'PDF'}`,
          source: 'pdf',
          sourceFileName: q.sourceFileName || 'PDF Import',
          status: q.status || 'published',
          needsReview: Boolean(q.needsReview),
          reviewNotes: q.reviewNotes || '',
          createdBy: req.user._id,
        });
        savedItems.push(newQ);
      }
    } else {
      // Practical tasks import
      for (const q of questions) {
        if (!q.questionText && !q.title) continue;

        const newP = await PracticalQuestion.create({
          title: q.title || q.questionText || 'Imported Practical Task',
          description: q.description || q.questionText || 'Task details imported from PDF',
          instructions: q.instructions || 'Review instructions provided in description',
          expectedOutput: q.expectedOutput || '',
          technologies: Array.isArray(q.technologies) ? q.technologies : [category || 'JavaScript'],
          category: q.category && q.category !== 'Imported PDF' ? q.category : category || 'General',
          difficulty: q.difficulty || 'medium',
          marks: q.marks || 10,
          timeLimit: q.timeLimit || 60,
          source: 'pdf',
          sourceFileName: q.sourceFileName || 'PDF Import',
          status: q.status || 'published',
          createdBy: req.user._id,
        });
        savedItems.push(newP);
      }
    }

    await logActivity({
      user: req.user,
      action: 'IMPORT_CONFIRM',
      module: 'PDF_IMPORT',
      description: `${req.user.role.toUpperCase()} confirmed import of ${savedItems.length} ${importType} questions into database.`,
      req,
    });

    res.status(201).json({
      message: `Successfully imported ${savedItems.length} questions into MongoDB.`,
      importedCount: savedItems.length,
      questions: savedItems,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  importPdf,
  confirmImport,
};
