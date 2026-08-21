import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import {
  FiPlus,
  FiCheckSquare,
  FiEdit,
  FiTrash2,
  FiUserPlus,
  FiClock,
  FiAward,
} from 'react-icons/fi';

const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [theoryQuestions, setTheoryQuestions] = useState([]);
  const [practicalTasks, setPracticalTasks] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assessment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTheoryIds, setSelectedTheoryIds] = useState([]);
  const [selectedPracticalIds, setSelectedPracticalIds] = useState([]);
  const [totalDuration, setTotalDuration] = useState(60);
  const [passingMarksPercentage, setPassingMarksPercentage] = useState(60);
  const [status, setStatus] = useState('published');

  // Assign Modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [targetAssessment, setTargetAssessment] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { showToast } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, tRes, pRes, cRes] = await Promise.all([
        API.get('/assessments'),
        API.get('/theory/questions'),
        API.get('/practical/questions'),
        API.get('/candidates'),
      ]);

      setAssessments(aRes.data || []);
      setTheoryQuestions(tRes.data || []);
      setPracticalTasks(pRes.data || []);
      setCandidates(cRes.data || []);
    } catch (err) {
      showToast('Failed to load assessment builder data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingAssessment(null);
    setTitle('');
    setDescription('');
    setSelectedTheoryIds([]);
    setSelectedPracticalIds([]);
    setTotalDuration(60);
    setPassingMarksPercentage(60);
    setStatus('published');
    setIsModalOpen(true);
  };

  const openEditModal = (a) => {
    setEditingAssessment(a);
    setTitle(a.title);
    setDescription(a.description || '');
    setSelectedTheoryIds((a.theoryQuestions || []).map((q) => q._id || q));
    setSelectedPracticalIds((a.practicalTasks || []).map((t) => t._id || t));
    setTotalDuration(a.totalDuration || 60);
    setPassingMarksPercentage(a.passingMarksPercentage || 60);
    setStatus(a.status || 'published');
    setIsModalOpen(true);
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        theoryQuestions: selectedTheoryIds,
        practicalTasks: selectedPracticalIds,
        totalDuration,
        passingMarksPercentage,
        status,
      };

      if (editingAssessment) {
        await API.put(`/assessments/${editingAssessment._id}`, payload);
        showToast('Assessment updated', 'success');
      } else {
        await API.post('/assessments', payload);
        showToast('Assessment created successfully', 'success');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save assessment', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment?')) return;
    try {
      await API.delete(`/assessments/${id}`);
      showToast('Assessment deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete assessment', 'error');
    }
  };

  const openAssignModal = (a) => {
    setTargetAssessment(a);
    setSelectedCandidateId(candidates[0]?._id || '');
    // Default 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setDueDate(d.toISOString().split('T')[0]);
    setIsAssignOpen(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!selectedCandidateId || !targetAssessment) return;

    try {
      await API.post(`/assessments/${targetAssessment._id}/assign`, {
        candidateId: selectedCandidateId,
        dueDate,
        duration: targetAssessment.totalDuration,
      });

      showToast('Assessment successfully assigned to candidate!', 'success');
      setIsAssignOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign assessment', 'error');
    }
  };

  const toggleTheorySelection = (id) => {
    if (selectedTheoryIds.includes(id)) {
      setSelectedTheoryIds(selectedTheoryIds.filter((item) => item !== id));
    } else {
      setSelectedTheoryIds([...selectedTheoryIds, id]);
    }
  };

  const togglePracticalSelection = (id) => {
    if (selectedPracticalIds.includes(id)) {
      setSelectedPracticalIds(selectedPracticalIds.filter((item) => item !== id));
    } else {
      setSelectedPracticalIds([...selectedPracticalIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Assessment Builder</h1>
          <p className="text-xs text-slate-400 mt-1">
            Construct combined technical assessments containing Theory MCQs and Practical coding tasks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          <FiPlus className="text-base" />
          <span>Create New Assessment</span>
        </button>
      </div>

      {/* Grid of Assessments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-slate-500">
            Loading assessment catalog...
          </div>
        ) : assessments.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No assessments created yet. Click "+ Create New Assessment" to build one.
          </div>
        ) : (
          assessments.map((a) => (
            <div key={a._id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={a.status}>{a.status}</Badge>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center space-x-1">
                      <FiClock className="text-indigo-400" />
                      <span>{a.totalDuration} Mins</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FiAward className="text-emerald-400" />
                      <span>Pass: {a.passingMarksPercentage}%</span>
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{a.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{a.description || 'No description provided.'}</p>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl text-xs font-semibold">
                  <div className="text-slate-300">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Theory MCQs</span>
                    <span className="text-indigo-400 font-extrabold text-sm">{a.theoryQuestions?.length || 0} Questions</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="block text-[10px] text-slate-500 uppercase font-bold">Practical Tasks</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{a.practicalTasks?.length || 0} Tasks</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => openAssignModal(a)}
                  className="inline-flex items-center space-x-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition"
                >
                  <FiUserPlus className="text-sm" />
                  <span>Assign Candidate</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(a)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-indigo-400 transition"
                  >
                    <FiEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 transition"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Assessment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssessment ? `Edit Assessment: ${editingAssessment.title}` : 'Create New Technical Assessment'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveAssessment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Assessment Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full Stack Developer Evaluation"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief instructions or purpose..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Select Theory Questions */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Select Theory Questions ({selectedTheoryIds.length} Selected)
            </label>
            <div className="max-h-36 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-1">
              {theoryQuestions.map((tq) => (
                <label
                  key={tq._id}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-900 rounded-lg cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedTheoryIds.includes(tq._id)}
                    onChange={() => toggleTheorySelection(tq._id)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                  />
                  <span className="text-white font-medium truncate flex-1">{tq.questionText}</span>
                  <Badge variant={tq.difficulty}>{tq.difficulty}</Badge>
                </label>
              ))}
            </div>
          </div>

          {/* Select Practical Tasks */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Select Practical Tasks ({selectedPracticalIds.length} Selected)
            </label>
            <div className="max-h-36 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-2 space-y-1">
              {practicalTasks.map((pt) => (
                <label
                  key={pt._id}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-900 rounded-lg cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={selectedPracticalIds.includes(pt._id)}
                    onChange={() => togglePracticalSelection(pt._id)}
                    className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700"
                  />
                  <span className="text-white font-medium truncate flex-1">{pt.title}</span>
                  <Badge variant={pt.difficulty}>{pt.difficulty}</Badge>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="15"
                required
                value={totalDuration}
                onChange={(e) => setTotalDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Passing Marks (%)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                required
                value={passingMarksPercentage}
                onChange={(e) => setPassingMarksPercentage(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              Save Assessment
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Assessment Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Assign "${targetAssessment?.title}" to Candidate`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Select Candidate
            </label>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {candidates.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.position} - {c.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Assessments;
