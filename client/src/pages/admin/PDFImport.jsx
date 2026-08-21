import React, { useState } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiPlus,
  FiInfo,
  FiLayers,
} from 'react-icons/fi';

const PDFImport = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importType, setImportType] = useState('theory'); // 'theory' | 'practical'

  // Step state: 'upload' | 'review' | 'success'
  const [step, setStep] = useState('upload');
  const [parseResult, setParseResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [confirming, setConfirming] = useState(false);
  const [scannedAlert, setScannedAlert] = useState(null);

  // Course / Category State
  const [skillsMaster, setSkillsMaster] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('MERN Stack');
  const [customCourse, setCustomCourse] = useState('');

  React.useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await API.get('/skills?status=active');
        setSkillsMaster(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedCourse(res.data[0].name);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchSkills();
  }, []);

  const getEffectiveCategory = () => {
    if (selectedCourse === 'CUSTOM') {
      return customCourse.trim() || 'General';
    }
    return selectedCourse || 'MERN Stack';
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showToast('Invalid file format. Please upload a .pdf file only.', 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds 15MB limit.', 'error');
      return;
    }
    setSelectedFile(file);
    setScannedAlert(null);
  };

  const handleProcessPdf = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setScannedAlert(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await API.post('/questions/import-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data;
      if (data.isScanned) {
        setScannedAlert(data.message);
        setIsUploading(false);
        return;
      }

      const categoryToApply = getEffectiveCategory();
      const categorisedQuestions = (data.questions || []).map((q) => ({
        ...q,
        category: categoryToApply,
      }));

      setParseResult(data);
      setQuestions(categorisedQuestions);
      setStep('review');
      showToast(`Parsed ${data.totalDetected || 0} questions under '${categoryToApply}'. Please review.`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to process PDF', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Review card edits
  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = value;
    setQuestions(updated);
  };

  const handleDeleteQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleConfirmImport = async () => {
    if (questions.length === 0) {
      showToast('No questions available to import.', 'error');
      return;
    }

    setConfirming(true);
    const categoryToApply = getEffectiveCategory();
    try {
      const res = await API.post('/questions/import-confirm', {
        questions,
        importType,
        category: categoryToApply,
      });

      showToast(res.data.message || `Questions imported successfully for '${categoryToApply}'!`, 'success');
      setStep('success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to confirm import', 'error');
    } finally {
      setConfirming(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setParseResult(null);
    setQuestions([]);
    setStep('upload');
    setScannedAlert(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">PDF Question Import Wizard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload PDF question papers, automatically parse text, review preview, and save structured questions to MongoDB.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Import Target:</span>
          <select
            value={importType}
            onChange={(e) => setImportType(e.target.value)}
            disabled={step !== 'upload'}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-indigo-400 focus:outline-none"
          >
            <option value="theory">Theory MCQs</option>
            <option value="practical">Practical Tasks</option>
          </select>
        </div>
      </div>

      {/* Progress Steps Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-around text-xs font-bold">
        <div className={`flex items-center space-x-2 ${step === 'upload' ? 'text-indigo-400' : 'text-emerald-400'}`}>
          <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center font-black text-xs">1</span>
          <span>Upload PDF</span>
        </div>
        <span className="text-slate-700">→</span>
        <div className={`flex items-center space-x-2 ${step === 'review' ? 'text-indigo-400' : step === 'success' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center font-black text-xs">2</span>
          <span>Review & Edit Preview</span>
        </div>
        <span className="text-slate-700">→</span>
        <div className={`flex items-center space-x-2 ${step === 'success' ? 'text-emerald-400' : 'text-slate-500'}`}>
          <span className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center font-black text-xs">3</span>
          <span>Import Confirmed</span>
        </div>
      </div>

      {/* STEP 1: Upload Screen */}
      {step === 'upload' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6 max-w-3xl mx-auto">
          {/* Target Course / Category Selection */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <FiLayers className="text-indigo-400 text-sm" />
              <span>Select Target Course / Technology Category <span className="text-rose-400">*</span></span>
            </div>
            <p className="text-[11px] text-slate-400">
              All questions extracted from the PDF will be categorized under this course in the MongoDB Question Bank.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Course / Technology
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-indigo-500"
                >
                  {skillsMaster.map((skill) => (
                    <option key={skill._id} value={skill.name}>
                      {skill.name} ({skill.code || 'Skill'})
                    </option>
                  ))}
                  <option value="MERN Stack">MERN Stack</option>
                  <option value="Python">Python Development</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Java">Java Development</option>
                  <option value="React Native">React Native / Mobile</option>
                  <option value="Node.js">Node.js / Backend</option>
                  <option value="PHP / Laravel">PHP / Laravel</option>
                  <option value="DevOps">DevOps & Cloud</option>
                  <option value="CUSTOM">+ Specify Custom Course Name...</option>
                </select>
              </div>

              {selectedCourse === 'CUSTOM' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Custom Course Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flutter, Cybersecurity, Data Science..."
                    value={customCourse}
                    onChange={(e) => setCustomCourse(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-800 bg-slate-950 hover:border-slate-700'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-3xl mx-auto mb-4">
              <FiUploadCloud />
            </div>

            {selectedFile ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-white flex items-center justify-center space-x-2">
                  <FiFileText className="text-indigo-400" />
                  <span>{selectedFile.name}</span>
                </p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB | Ready for extraction
                </p>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-rose-400 hover:underline font-semibold"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-white mb-1">
                  Drag & Drop your Question PDF file here
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Supports standard text PDFs with single/multi-choice formats (Max size: 15MB)
                </p>
                <label className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer transition">
                  <span>Browse PDF File</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Scanned PDF Warning Alert */}
          {scannedAlert && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start space-x-3">
              <FiAlertTriangle className="text-lg flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Scanned / Image-Based PDF Detected</p>
                <p className="text-amber-300/80 mt-0.5">{scannedAlert}</p>
              </div>
            </div>
          )}

          {/* Submit Extract Button */}
          {selectedFile && (
            <button
              onClick={handleProcessPdf}
              disabled={isUploading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 text-xs transition duration-200 disabled:opacity-50"
            >
              {isUploading ? (
                <span>Parsing PDF text & detecting questions...</span>
              ) : (
                <>
                  <FiFileText className="text-base" />
                  <span>Extract & Generate Question Preview</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* STEP 2: Review Preview & Editable Question Cards */}
      {step === 'review' && parseResult && (
        <div className="space-y-6">
          {/* Summary Stats Header */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Target Course</p>
              <p className="text-xs font-bold text-indigo-400 truncate">{getEffectiveCategory()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">File Name</p>
              <p className="text-xs font-bold text-white truncate">{parseResult.fileName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total Detected</p>
              <p className="text-base font-extrabold text-indigo-400">{parseResult.totalDetected}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Successfully Parsed</p>
              <p className="text-base font-extrabold text-emerald-400">{parseResult.successfullyParsed}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Needs Review</p>
              <p className="text-base font-extrabold text-amber-400">{parseResult.needsReview}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              Questions Review ({questions.length} Items)
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetImport}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel / Upload New
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={confirming || questions.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition disabled:opacity-50"
              >
                <FiCheck className="text-base" />
                <span>Confirm & Import All Questions</span>
              </button>
            </div>
          </div>

          {/* Questions Cards List */}
          <div className="space-y-4">
            {questions.map((q, qIndex) => (
              <div
                key={q.tempId || qIndex}
                className={`p-5 rounded-2xl bg-slate-900 border transition ${
                  q.needsReview
                    ? 'border-amber-500/40 shadow-lg shadow-amber-950/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      #{qIndex + 1}
                    </span>
                    {q.needsReview ? (
                      <Badge variant="pending_review">Needs Review</Badge>
                    ) : (
                      <Badge variant="published">Parsed OK</Badge>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(qIndex)}
                    title="Remove question"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <FiTrash2 className="text-base" />
                  </button>
                </div>

                {q.needsReview && q.reviewNotes && (
                  <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center space-x-2">
                    <FiAlertTriangle className="text-sm flex-shrink-0" />
                    <span>{q.reviewNotes}</span>
                  </div>
                )}

                {/* Question Text Textarea */}
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Question Text
                  </label>
                  <textarea
                    rows={2}
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Options List */}
                {importType === 'theory' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {opt.label}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Meta Controls (Correct Answer, Category, Difficulty) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
                  {importType === 'theory' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Correct Answer
                      </label>
                      <select
                        value={q.correctAnswer}
                        onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none"
                      >
                        {q.options.map((opt) => (
                          <option key={opt.label} value={opt.label}>
                            Option {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={q.category}
                      onChange={(e) => handleQuestionChange(qIndex, 'category', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Difficulty
                    </label>
                    <select
                      value={q.difficulty}
                      onChange={(e) => handleQuestionChange(qIndex, 'difficulty', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Success Confirmation Screen */}
      {step === 'success' && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
            <FiCheckCircle />
          </div>
          <h2 className="text-xl font-bold text-white">PDF Questions Imported Successfully!</h2>
          <p className="text-xs text-slate-400">
            All reviewed questions have been saved to the MongoDB Question Bank and are ready to be included in assessments.
          </p>
          <button
            onClick={resetImport}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <span>Import Another PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFImport;
