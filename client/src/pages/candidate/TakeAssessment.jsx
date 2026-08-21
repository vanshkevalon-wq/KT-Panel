import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Badge from '../../components/common/Badge';
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiBookOpen,
  FiCode,
  FiChevronLeft,
  FiChevronRight,
  FiSend,
} from 'react-icons/fi';

const TakeAssessment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('theory'); // 'theory' | 'practical'
  const [currentTheoryIndex, setCurrentTheoryIndex] = useState(0);

  // Candidate answers state
  const [theoryAnswers, setTheoryAnswers] = useState({}); // { questionId: 'A' | 'B' | 'C' | 'D' }
  const [markedForReview, setMarkedForReview] = useState({}); // { questionId: true }
  const [practicalSubmissions, setPracticalSubmissions] = useState({}); // { taskId: { submissionText, candidateComments, submissionUrl } }

  // Timer state
  const [timeLeft, setTimeLeft] = useState(60 * 60); // seconds
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await API.get('/assessments/assignments/all');
        const found = res.data?.find((a) => a._id === assignmentId);

        if (!found) {
          alert('Assignment not found or expired.');
          navigate('/login');
          return;
        }

        setAssignment(found);
        setTimeLeft((found.duration || 60) * 60);
      } catch (err) {
        console.error('Failed to load assessment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  // Countdown timer
  useEffect(() => {
    if (submittedResult || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submittedResult]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold">Preparing Assessment Runner...</p>
        </div>
      </div>
    );
  }

  if (submittedResult) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 text-4xl mb-6 shadow-xl">
          <FiCheckCircle />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Assessment Submitted Successfully!</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          Thank you for completing the technical evaluation for Kevalon Technology. Your answers have been recorded.
        </p>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full text-left space-y-3 text-xs mb-8">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Candidate</span>
            <span className="font-bold text-white">{submittedResult.candidateId?.name || assignment.candidateId?.name}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Theory Marks Obtained</span>
            <span className="font-bold text-indigo-400">{submittedResult.theoryMarksObtained} / {submittedResult.totalTheoryMarks}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Assessment Status</span>
            <Badge variant={submittedResult.status}>{submittedResult.status.replace('_', ' ')}</Badge>
          </div>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg"
        >
          Return to Home Page
        </button>
      </div>
    );
  }

  const assessment = assignment.assessmentId;
  const theoryQs = assessment?.theoryQuestions || [];
  const practicalTasks = assessment?.practicalTasks || [];
  const currentTheoryQ = theoryQs[currentTheoryIndex];

  const handleSelectTheoryOption = (optionLabel) => {
    if (!currentTheoryQ) return;
    setTheoryAnswers({
      ...theoryAnswers,
      [currentTheoryQ._id]: optionLabel,
    });
  };

  const toggleMarkForReview = (qId) => {
    setMarkedForReview({
      ...markedForReview,
      [qId]: !markedForReview[qId],
    });
  };

  const handlePracticalTextChange = (taskId, text) => {
    setPracticalSubmissions({
      ...practicalSubmissions,
      [taskId]: {
        ...practicalSubmissions[taskId],
        submissionText: text,
      },
    });
  };

  const handleSubmitAssessment = async () => {
    if (!window.confirm('Are you sure you want to finalize and submit your assessment?')) return;

    setSubmitting(true);
    try {
      const formattedTheory = Object.keys(theoryAnswers).map((qId) => ({
        questionId: qId,
        selectedOption: theoryAnswers[qId],
      }));

      const formattedPractical = Object.keys(practicalSubmissions).map((tId) => ({
        taskId: tId,
        submissionText: practicalSubmissions[tId]?.submissionText || '',
        submissionUrl: practicalSubmissions[tId]?.submissionUrl || '',
        candidateComments: practicalSubmissions[tId]?.candidateComments || '',
      }));

      const res = await API.post('/results/submit', {
        assignmentId,
        theoryAnswers: formattedTheory,
        practicalSubmissions: formattedPractical,
      });

      setSubmittedResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center">
            KT
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">{assessment?.title}</h1>
            <p className="text-[10px] text-slate-400">Candidate: {assignment.candidateId?.name}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 font-mono text-xs text-amber-400 font-bold">
          <FiClock className="text-sm animate-pulse" />
          <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>

        <button
          onClick={handleSubmitAssessment}
          disabled={submitting}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center space-x-1.5"
        >
          <FiSend />
          <span>Submit Assessment</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Left Test Interface */}
        <div className="flex-1 space-y-6">
          {/* Section Tabs */}
          <div className="flex space-x-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'theory' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400'
              }`}
            >
              <FiBookOpen />
              <span>Theory Section ({theoryQs.length} MCQs)</span>
            </button>
            {practicalTasks.length > 0 && (
              <button
                onClick={() => setActiveTab('practical')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === 'practical' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                }`}
              >
                <FiCode />
                <span>Practical Section ({practicalTasks.length} Tasks)</span>
              </button>
            )}
          </div>

          {/* THEORY QUESTIONS VIEW */}
          {activeTab === 'theory' && currentTheoryQ && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-400">
                  Question {currentTheoryIndex + 1} of {theoryQs.length}
                </span>
                <button
                  onClick={() => toggleMarkForReview(currentTheoryQ._id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg border transition ${
                    markedForReview[currentTheoryQ._id]
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {markedForReview[currentTheoryQ._id] ? '★ Marked for Review' : 'Mark for Review'}
                </button>
              </div>

              <h3 className="text-base font-bold text-white">{currentTheoryQ.questionText}</h3>

              <div className="space-y-3">
                {currentTheoryQ.options?.map((opt) => {
                  const selected = theoryAnswers[currentTheoryQ._id] === opt.label;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleSelectTheoryOption(opt.label)}
                      className={`w-full text-left p-4 rounded-xl border flex items-center space-x-3 text-xs font-semibold transition ${
                        selected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        selected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {opt.label}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Prev / Next buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentTheoryIndex === 0}
                  onClick={() => setCurrentTheoryIndex(currentTheoryIndex - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold disabled:opacity-30 flex items-center space-x-1"
                >
                  <FiChevronLeft />
                  <span>Previous</span>
                </button>
                <button
                  disabled={currentTheoryIndex === theoryQs.length - 1}
                  onClick={() => setCurrentTheoryIndex(currentTheoryIndex + 1)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <span>Next Question</span>
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* PRACTICAL TASKS VIEW */}
          {activeTab === 'practical' && (
            <div className="space-y-6">
              {practicalTasks.map((pt, idx) => (
                <div key={pt._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="font-bold text-white text-sm">Task #{idx + 1}: {pt.title}</h3>
                    <Badge variant="practical">Marks: {pt.marks}</Badge>
                  </div>

                  <p className="text-xs text-slate-300">{pt.description}</p>
                  {pt.instructions && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                      <strong>Instructions:</strong> {pt.instructions}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Your Solution Code / Answer Text
                    </label>
                    <textarea
                      rows={8}
                      value={practicalSubmissions[pt._id]?.submissionText || ''}
                      onChange={(e) => handlePracticalTextChange(pt._id, e.target.value)}
                      placeholder="Type your code or detailed solution here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Question Palette Navigator */}
        <div className="w-64 hidden lg:block bg-slate-900 border border-slate-800 p-4 rounded-2xl h-fit space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Theory Navigator ({Object.keys(theoryAnswers).length} / {theoryQs.length} Answered)
          </h4>

          <div className="grid grid-cols-4 gap-2">
            {theoryQs.map((q, idx) => {
              const isAnswered = Boolean(theoryAnswers[q._id]);
              const isMarked = Boolean(markedForReview[q._id]);
              const isCurrent = idx === currentTheoryIndex;

              return (
                <button
                  key={q._id}
                  onClick={() => {
                    setActiveTab('theory');
                    setCurrentTheoryIndex(idx);
                  }}
                  className={`w-10 h-10 rounded-xl font-bold text-xs transition ${
                    isCurrent
                      ? 'ring-2 ring-indigo-400 bg-indigo-600 text-white'
                      : isMarked
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400">Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-400">Marked for Review</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-slate-800"></span>
              <span className="text-slate-400">Not Attempted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAssessment;
