import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import {
  FiPlus,
  FiFileText,
  FiSearch,
  FiFilter,
  FiEdit,
  FiTrash2,
  FiBookOpen,
  FiCode,
} from 'react-icons/fi';

const QuestionBank = () => {
  const [activeTab, setActiveTab] = useState('theory'); // 'theory' | 'practical'
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [categories, setCategories] = useState([]);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Form states
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAns, setCorrectAns] = useState('A');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState('medium');
  const [marks, setMarks] = useState(1);
  const [explanation, setExplanation] = useState('');
  const [status, setStatus] = useState('published');

  // Practical fields
  const [instructions, setInstructions] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [technologies, setTechnologies] = useState('React, Tailwind CSS');

  const { showToast } = useAuth();
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'theory' ? '/theory/questions' : '/practical/questions';
      const catEndpoint = activeTab === 'theory' ? '/theory/categories' : '/practical/categories';

      const [res, catRes] = await Promise.all([
        API.get(endpoint, {
          params: {
            search,
            category: categoryFilter,
            difficulty: difficultyFilter,
            source: sourceFilter,
            status: statusFilter,
          },
        }),
        API.get(catEndpoint).catch(() => ({ data: [] })),
      ]);

      setQuestions(res.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      showToast('Failed to fetch questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeTab, search, categoryFilter, difficultyFilter, sourceFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setCorrectAns('A');
    setCategory('General');
    setDifficulty('medium');
    setMarks(activeTab === 'theory' ? 1 : 10);
    setExplanation('');
    setStatus('published');
    setInstructions('');
    setExpectedOutput('');
    setTechnologies('React, Tailwind CSS');
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    if (activeTab === 'theory') {
      setQText(q.questionText);
      setOptA(q.options?.[0]?.text || '');
      setOptB(q.options?.[1]?.text || '');
      setOptC(q.options?.[2]?.text || '');
      setOptD(q.options?.[3]?.text || '');
      setCorrectAns(q.correctAnswer || 'A');
    } else {
      setQText(q.title);
      setExplanation(q.description);
      setInstructions(q.instructions || '');
      setExpectedOutput(q.expectedOutput || '');
      setTechnologies((q.technologies || []).join(', '));
    }
    setCategory(q.category || 'General');
    setDifficulty(q.difficulty || 'medium');
    setMarks(q.marks || 1);
    setStatus(q.status || 'published');
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'theory') {
        const payload = {
          questionText: qText,
          options: [
            { label: 'A', text: optA },
            { label: 'B', text: optB },
            { label: 'C', text: optC },
            { label: 'D', text: optD },
          ],
          correctAnswer: correctAns,
          category,
          difficulty,
          marks,
          explanation,
          status,
        };

        if (editingQuestion) {
          await API.put(`/theory/questions/${editingQuestion._id}`, payload);
        } else {
          await API.post('/theory/questions', payload);
        }
      } else {
        const payload = {
          title: qText,
          description: explanation,
          instructions,
          expectedOutput,
          technologies: technologies.split(',').map((t) => t.trim()),
          category,
          difficulty,
          marks,
          status,
        };

        if (editingQuestion) {
          await API.put(`/practical/questions/${editingQuestion._id}`, payload);
        } else {
          await API.post('/practical/questions', payload);
        }
      }

      showToast(`Question ${editingQuestion ? 'updated' : 'created'} successfully`, 'success');
      setIsModalOpen(false);
      fetchQuestions();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save question', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const endpoint = activeTab === 'theory' ? `/theory/questions/${id}` : `/practical/questions/${id}`;
      await API.delete(endpoint);
      showToast('Question deleted', 'success');
      fetchQuestions();
    } catch (err) {
      showToast('Failed to delete question', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Question Bank Repository</h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized bank for Theory MCQs and Practical Coding tasks with multi-field search and filters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <FiPlus className="text-base" />
            <span>+ Add {activeTab === 'theory' ? 'Theory Question' : 'Practical Task'}</span>
          </button>

          <button
            onClick={() => navigate('/admin/pdf-import')}
            className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition"
          >
            <FiFileText className="text-base" />
            <span>Import From PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('theory')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'theory'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FiBookOpen className="text-base" />
          <span>Theory Questions (MCQs)</span>
        </button>

        <button
          onClick={() => setActiveTab('practical')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'practical'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FiCode className="text-base" />
          <span>Practical Tasks</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions by text, category, or title..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <FiFilter className="text-slate-400" />
            <span className="font-semibold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="font-semibold">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="font-semibold">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All Sources</option>
              <option value="manual">Manual</option>
              <option value="pdf">PDF Import</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Datatable */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">#</th>
                <th className="px-6 py-3.5">{activeTab === 'theory' ? 'Question Text' : 'Task Title'}</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Difficulty</th>
                <th className="px-6 py-3.5">Source</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    Loading question bank...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No questions found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                questions.map((q, index) => (
                  <tr key={q._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-bold text-slate-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white max-w-md line-clamp-2">
                        {activeTab === 'theory' ? q.questionText : q.title}
                      </p>
                      {activeTab === 'theory' && (
                        <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                          Correct Answer: Option {q.correctAnswer}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{q.category}</td>
                    <td className="px-6 py-4">
                      <Badge variant={q.difficulty}>{q.difficulty}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={q.source}>{q.source}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={q.status}>{q.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 transition"
                        >
                          <FiEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(q._id)}
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingQuestion
            ? `Edit ${activeTab === 'theory' ? 'Theory Question' : 'Practical Task'}`
            : `Add New ${activeTab === 'theory' ? 'Theory Question' : 'Practical Task'}`
        }
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              {activeTab === 'theory' ? 'Question Text' : 'Task Title'}
            </label>
            <textarea
              rows={3}
              required
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Enter details..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {activeTab === 'theory' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option A</label>
                  <input type="text" required value={optA} onChange={(e) => setOptA(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option B</label>
                  <input type="text" required value={optB} onChange={(e) => setOptB(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option C</label>
                  <input type="text" required value={optC} onChange={(e) => setOptC(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Option D</label>
                  <input type="text" required value={optD} onChange={(e) => setOptD(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Correct Answer</label>
                <select value={correctAns} onChange={(e) => setCorrectAns(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold">
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Description / Task Details</label>
                <textarea rows={3} value={explanation} onChange={(e) => setExplanation(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Instructions</label>
                <input type="text" value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Expected Output</label>
                <input type="text" value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Technologies (Comma separated)</label>
                <input type="text" value={technologies} onChange={(e) => setTechnologies(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Marks</label>
              <input type="number" min="1" value={marks} onChange={(e) => setMarks(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white" />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30">
              Save Question
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuestionBank;
