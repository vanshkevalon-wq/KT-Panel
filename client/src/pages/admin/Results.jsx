import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import {
  FiAward,
  FiEye,
  FiEdit,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiUser,
  FiCheck,
} from 'react-icons/fi';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail & Evaluation Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Evaluation Form state
  const [practicalScores, setPracticalScores] = useState([]);
  const [reviewerFeedback, setReviewerFeedback] = useState('');
  const [evaluating, setEvaluating] = useState(false);

  const { showToast, user } = useAuth();

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await API.get('/results');
      setResults(res.data || []);
    } catch (err) {
      showToast('Failed to load candidate results', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const openDetailModal = async (r) => {
    try {
      const res = await API.get(`/results/${r._id}`);
      const fullRes = res.data;
      setSelectedResult(fullRes);
      setReviewerFeedback(fullRes.reviewerFeedback || '');

      // Initialize practical evaluation state array
      if (fullRes.practicalSubmissions) {
        setPracticalScores(
          fullRes.practicalSubmissions.map((sub) => ({
            taskId: sub.taskId?._id || sub.taskId,
            scoreAwarded: sub.scoreAwarded || 0,
            feedback: sub.feedback || '',
          }))
        );
      } else {
        setPracticalScores([]);
      }

      setIsDetailOpen(true);
    } catch (err) {
      showToast('Failed to load detailed result record', 'error');
    }
  };

  const handleScoreChange = (taskId, score) => {
    setPracticalScores((prev) =>
      prev.map((item) => (item.taskId === taskId ? { ...item, scoreAwarded: Number(score) } : item))
    );
  };

  const handleFeedbackChange = (taskId, feedback) => {
    setPracticalScores((prev) =>
      prev.map((item) => (item.taskId === taskId ? { ...item, feedback } : item))
    );
  };

  const handleEvaluateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResult) return;

    setEvaluating(true);
    try {
      await API.put(`/results/${selectedResult._id}/evaluate`, {
        practicalScores,
        reviewerFeedback,
      });

      showToast('Practical evaluation completed and result updated!', 'success');
      setIsDetailOpen(false);
      fetchResults();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit evaluation', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Candidate Assessment Results</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review theory scores, inspect practical submissions, grade practical tasks, and track pass/fail criteria.
          </p>
        </div>
      </div>

      {/* Datatable */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-6 py-3.5">Assessment</th>
                <th className="px-6 py-3.5">Theory Score</th>
                <th className="px-6 py-3.5">Practical Score</th>
                <th className="px-6 py-3.5">Total %</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    Loading results...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No completed assessment results yet.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white text-xs">{r.candidateId?.name || 'Candidate'}</p>
                      <p className="text-[11px] text-slate-400">{r.candidateId?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white max-w-xs truncate">
                        {r.assessmentId?.title || 'Assessment'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Submitted: {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-indigo-400">
                        {r.theoryMarksObtained} / {r.totalTheoryMarks}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        ({r.correct} correct, {r.incorrect} wrong)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-emerald-400">
                        {r.practicalScore} / {r.totalPracticalMarks}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-white text-sm">{r.percentage}%</span>
                      <span className="text-[10px] text-slate-500 block">
                        ({r.totalMarks} / {r.maxMarks} marks)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={r.status}>{r.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetailModal(r)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition"
                      >
                        <FiEye className="text-xs" />
                        <span>Inspect / Grade</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Inspection & Grade Modal */}
      {selectedResult && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Candidate Assessment Evaluation: ${selectedResult.candidateId?.name}`}
          maxWidth="max-w-4xl"
        >
          <form onSubmit={handleEvaluateSubmit} className="space-y-6">
            {/* Candidate Summary Header */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Candidate</span>
                <span className="font-bold text-white">{selectedResult.candidateId?.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Theory Score</span>
                <span className="font-bold text-indigo-400">
                  {selectedResult.theoryMarksObtained} / {selectedResult.totalTheoryMarks} ({selectedResult.correct} Correct)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Total</span>
                <span className="font-bold text-emerald-400">
                  {selectedResult.totalMarks} / {selectedResult.maxMarks} ({selectedResult.percentage}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Status</span>
                <Badge variant={selectedResult.status}>{selectedResult.status.replace('_', ' ')}</Badge>
              </div>
            </div>

            {/* Theory Answers Review */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Theory Answers Performance ({selectedResult.theoryAnswers?.length || 0} Questions)
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                {selectedResult.theoryAnswers?.map((ta, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300 truncate max-w-md">
                      #{idx + 1} Selected Option: <strong className="text-white font-mono">{ta.selectedOption || 'Skipped'}</strong>
                    </span>
                    <Badge variant={ta.isCorrect ? 'passed' : 'failed'}>
                      {ta.isCorrect ? `+${ta.marksAwarded} Marks` : '0 Marks'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Tasks Submissions & Grading Form */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Practical Coding Task Submissions & Evaluator Grading
              </h4>

              {selectedResult.practicalSubmissions?.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3">No practical tasks in this assessment.</p>
              ) : (
                selectedResult.practicalSubmissions?.map((ps, idx) => {
                  const currentScoreObj = practicalScores.find(
                    (item) => item.taskId === (ps.taskId?._id || ps.taskId)
                  ) || { scoreAwarded: ps.scoreAwarded || 0, feedback: ps.feedback || '' };

                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-white text-xs">
                          Task #{idx + 1}: {ps.taskId?.title || 'Practical Task'}
                        </h5>
                        <span className="text-xs text-slate-400">
                          Max Marks: <strong>{ps.taskId?.marks || 10}</strong>
                        </span>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg font-mono text-[11px] text-slate-200 overflow-x-auto">
                        <p className="text-[10px] font-sans font-bold text-slate-500 uppercase mb-1">Candidate Submitted Code / Text:</p>
                        <pre className="whitespace-pre-wrap">{ps.submissionText || 'No code provided.'}</pre>
                      </div>

                      {ps.candidateComments && (
                        <p className="text-xs text-slate-400">
                          <strong>Candidate Notes:</strong> {ps.candidateComments}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-900">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Award Score (0 to {ps.taskId?.marks || 10})
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={ps.taskId?.marks || 10}
                            value={currentScoreObj.scoreAwarded}
                            onChange={(e) =>
                              handleScoreChange(ps.taskId?._id || ps.taskId, e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Evaluator Task Feedback
                          </label>
                          <input
                            type="text"
                            value={currentScoreObj.feedback}
                            onChange={(e) =>
                              handleFeedbackChange(ps.taskId?._id || ps.taskId, e.target.value)
                            }
                            placeholder="Provide constructive feedback..."
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Overall Feedback & Submit button */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Overall Assessment Feedback
              </label>
              <textarea
                rows={2}
                value={reviewerFeedback}
                onChange={(e) => setReviewerFeedback(e.target.value)}
                placeholder="Final remarks for candidate report..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={evaluating}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
              >
                <FiCheck />
                <span>Save Evaluation & Finalize Status</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Results;
