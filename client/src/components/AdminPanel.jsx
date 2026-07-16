/**
 * client/src/components/AdminPanel.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Clean, modern Admin Panel layout at route /admin.
 * Features:
 *   1. Authentication: Login screen matching backend admin token.
 *   2. Stage Manager: List view with Drag-and-Drop reordering using @dnd-kit.
 *   3. Stage Editor: Form to create/edit story_text, game_type, and background image.
 *   4. Options Editor: Dynamic adding/removing of Options with label, image, and hidden score_weight.
 *   5. Clean UI: Slate/indigo modern dashboard distinct from the game's comic theme.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Sortable Stage Item Component for Sidebar ────────────────────────────────
function SortableStageItem({ stage, isSelected, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const gameTypeBadges = {
    swipe:     { label: 'Swipe',     color: 'bg-blue-100 text-blue-800 border-blue-200' },
    mixology:  { label: 'Mixology',  color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    drag_drop: { label: 'Drag Drop', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    tarot:     { label: 'Tarot',     color: 'bg-purple-100 text-purple-800 border-purple-200' },
  };

  const badge = gameTypeBadges[stage.game_type] || { label: stage.game_type, color: 'bg-gray-100 text-gray-800' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
        isDragging
          ? 'opacity-50 border-indigo-500 bg-indigo-50 shadow-lg scale-[1.02]'
          : isSelected
          ? 'border-indigo-600 bg-indigo-50/90 shadow-sm ring-1 ring-indigo-600'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
      onClick={() => onSelect(stage)}
    >
      {/* Drag Handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder stage"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Order Badge */}
      <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 font-bold text-xs text-slate-700">
        #{stage.step_order}
      </span>

      {/* Stage Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.color}`}>
            {badge.label}
          </span>
          <span className="text-xs text-slate-400 font-mono">ID:{stage.id}</span>
        </div>
        <p className="text-sm font-medium text-slate-800 truncate">
          {stage.story_text || 'Untitled Stage...'}
        </p>
      </div>

      {/* Chevron */}
      <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

// ─── Main Admin Panel Component ───────────────────────────────────────────────
export default function AdminPanel() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    step_order: 1,
    story_text: '',
    game_type: 'swipe',
    background_image_url: '',
    options: [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Show temporary toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  // Verify stored token on initial mount
  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (authToken) => {
    setLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/admin/stages', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToken(authToken);
        localStorage.setItem('admin_token', authToken);
        setIsAuthenticated(true);
        setStages(data.data || []);
        if (data.data && data.data.length > 0) {
          selectStageForEditing(data.data[0]);
        }
      } else {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        setLoginError(data.error || 'Invalid admin token/password.');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setLoginError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginInput.trim()) return;
    verifyToken(loginInput.trim());
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setIsAuthenticated(false);
    setSelectedStage(null);
  };

  const fetchStages = async () => {
    try {
      const res = await fetch('/api/admin/stages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStages(data.data || []);
        return data.data || [];
      }
    } catch (err) {
      console.error('Fetch stages error:', err);
    }
    return [];
  };

  const selectStageForEditing = (stage) => {
    setSelectedStage(stage);
    setFormData({
      id: stage.id,
      step_order: stage.step_order,
      story_text: stage.story_text || '',
      game_type: stage.game_type || 'swipe',
      background_image_url: stage.background_image_url || '',
      options: (stage.options || []).map((opt) => ({
        id: opt.id,
        label: opt.label || '',
        image_url: opt.image_url || '',
        score_weight: Number(opt.score_weight) || 0,
      })),
    });
  };

  const handleNewStage = () => {
    setSelectedStage(null);
    const nextOrder = stages.length > 0 ? Math.max(...stages.map((s) => s.step_order)) + 1 : 1;
    setFormData({
      id: null,
      step_order: nextOrder,
      story_text: '',
      game_type: 'swipe',
      background_image_url: '',
      options: [
        { label: 'Option A', image_url: '', score_weight: 0 },
        { label: 'Option B', image_url: '', score_weight: 5 },
      ],
    });
  };

  // Drag and Drop reordering handler
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stages.findIndex((s) => s.id === active.id);
    const newIndex = stages.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(stages, oldIndex, newIndex);
    // Update step_order numbers locally
    const updatedWithOrder = reordered.map((stage, idx) => ({
      ...stage,
      step_order: idx + 1,
    }));
    setStages(updatedWithOrder);

    // Call reorder API
    try {
      const orderedIds = updatedWithOrder.map((s) => s.id);
      const res = await fetch('/api/admin/stages/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderedIds }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Stages reordered and saved successfully.', 'success');
      } else {
        showToast(data.error || 'Failed to reorder stages on server.', 'error');
        fetchStages(); // revert on failure
      }
    } catch (err) {
      console.error('Reorder error:', err);
      showToast('Error communicating with server.', 'error');
      fetchStages();
    }
  };

  // Form field changes
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Option changes
  const handleOptionChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedOptions = [...prev.options];
      updatedOptions[index] = { ...updatedOptions[index], [field]: value };
      return { ...prev, options: updatedOptions };
    });
  };

  const handleAddOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { label: 'New Option', image_url: '', score_weight: 1 }],
    }));
  };

  const handleRemoveOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index),
    }));
  };

  // File upload via /api/upload-photo
  const handleFileUpload = async (file, onSuccess) => {
    if (!file) return;
    setUploadingImage(true);
    const body = new FormData();
    body.append('photo', file);

    try {
      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(data.imageUrl);
        showToast('Image uploaded successfully.', 'success');
      } else {
        showToast(data.error || 'Failed to upload image.', 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Error uploading image.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save stage (CREATE or UPDATE)
  const handleSaveStage = async (e) => {
    e.preventDefault();
    if (!formData.story_text.trim()) {
      showToast('Story text is required.', 'error');
      return;
    }

    const isEditing = Boolean(formData.id);
    const url = isEditing ? `/api/admin/stages/${formData.id}` : '/api/admin/stages';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          step_order: Number(formData.step_order),
          story_text: formData.story_text.trim(),
          game_type: formData.game_type,
          background_image_url: formData.background_image_url || null,
          options: formData.options.map((opt) => ({
            ...(opt.id ? { id: opt.id } : {}),
            label: opt.label.trim() || 'Option',
            image_url: opt.image_url || null,
            score_weight: Number(opt.score_weight) || 0,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isEditing ? 'Stage updated successfully!' : 'New stage created successfully!', 'success');
        const updatedList = await fetchStages();
        if (data.data) {
          const fresh = updatedList.find((s) => s.id === data.data.id) || data.data;
          selectStageForEditing(fresh);
        }
      } else {
        showToast(data.error || 'Failed to save stage.', 'error');
      }
    } catch (err) {
      console.error('Save error:', err);
      showToast('Error connecting to server.', 'error');
    }
  };

  // Delete stage
  const handleDeleteStage = async () => {
    if (!formData.id) return;
    if (!window.confirm(`Are you sure you want to delete Stage #${formData.step_order}? This will cascade delete its options.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/stages/${formData.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Stage deleted successfully.', 'success');
        const remaining = await fetchStages();
        if (remaining.length > 0) {
          selectStageForEditing(remaining[0]);
        } else {
          handleNewStage();
        }
      } else {
        showToast(data.error || 'Failed to delete stage.', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Error deleting stage.', 'error');
    }
  };

  // ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Game CMS Admin</h1>
            <p className="text-sm text-slate-400 mt-1">Enter admin token to manage stages and options</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Admin Secret Password / Token
              </label>
              <input
                type="password"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="e.g. admin_secret_token"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
            <a href="/" className="text-xs text-slate-400 hover:text-slate-200 transition-colors">
              ← Return to Main Game
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD SCREEN ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl border flex items-center gap-3 animate-fade-in ${
            toast.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-emerald-600 text-white border-emerald-700'
          }`}
        >
          <span className="font-semibold text-sm">{toast.message}</span>
        </div>
      )}

      {/* ── SIDEBAR: STAGE MANAGER ────────────────────────────────────────────── */}
      <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen sticky top-0">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
              <span>Game Stages CMS</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Drag & drop to reorder stages</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleNewStage}
            type="button"
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Stage</span>
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Game in New Tab"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-sm font-medium transition-colors"
          >
            🎮
          </a>
        </div>

        {/* Stage List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {stages.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 text-sm font-medium">No stages created yet</p>
              <p className="text-slate-400 text-xs mt-1">Click "Create New Stage" above to begin</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {stages.map((stage) => (
                  <SortableStageItem
                    key={stage.id}
                    stage={stage}
                    isSelected={selectedStage?.id === stage.id && formData.id === stage.id}
                    onSelect={selectStageForEditing}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </aside>

      {/* ── MAIN AREA: STAGE EDITOR & OPTIONS EDITOR ───────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1 block">
                {formData.id ? `Editing Stage #${formData.step_order}` : 'New Stage Creation'}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {formData.id ? `Edit Stage (ID: ${formData.id})` : 'Create New Game Stage'}
              </h2>
            </div>

            {formData.id && (
              <button
                type="button"
                onClick={handleDeleteStage}
                className="self-start sm:self-auto px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Stage</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSaveStage} className="space-y-8">
            {/* ── CARD 1: STAGE METADATA ───────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Stage Configuration</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Step Order */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Step Order (Sequence)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.step_order}
                    onChange={(e) => handleFormChange('step_order', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-900"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1.5">Sequential order in the scrollytelling experience</p>
                </div>

                {/* Game Type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Game Type (Mini-game logic)
                  </label>
                  <select
                    value={formData.game_type}
                    onChange={(e) => handleFormChange('game_type', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-900 bg-white"
                  >
                    <option value="swipe">👆 Swipe (Binary Choice / Tinder style)</option>
                    <option value="mixology">🧪 Mixology (Drag & Drop Ranking / Bowl)</option>
                    <option value="tarot">🃏 Tarot (3D Card Draw & Flip)</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1.5">Controls which interactive UI renders for this stage</p>
                </div>
              </div>

              {/* Story Text */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Story Text / Narrative Question
                </label>
                <textarea
                  rows="3"
                  value={formData.story_text}
                  onChange={(e) => handleFormChange('story_text', e.target.value)}
                  placeholder="e.g. How do you start your morning in the bustling streets of Bangkok?"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-900"
                  required
                />
              </div>

              {/* Background Image URL & File Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Background Image URL / Upload
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={formData.background_image_url}
                    onChange={(e) => handleFormChange('background_image_url', e.target.value)}
                    placeholder="e.g. /images/stages/morning-bangkok.png"
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-xs text-slate-800"
                  />
                  <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0], (url) => handleFormChange('background_image_url', url));
                        }
                      }}
                    />
                  </label>
                </div>
                {formData.background_image_url && (
                  <div className="mt-3 relative w-36 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                    <img src={formData.background_image_url} alt="Stage preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* ── CARD 2: OPTIONS EDITOR ───────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Game Options ({formData.options.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure selectable answers and hidden score weights</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Option</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.options.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-sm text-slate-400">No options defined for this stage</p>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      + Add the first option
                    </button>
                  </div>
                ) : (
                  formData.options.map((opt, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center gap-4 transition-all hover:border-slate-300"
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-200 font-bold text-xs flex items-center justify-center text-slate-700 flex-shrink-0">
                        {index + 1}
                      </span>

                      {/* Label Input */}
                      <div className="flex-1 min-w-0 w-full md:w-auto">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Option Label / Text
                        </label>
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                          placeholder="e.g. Slow stretch with morning breeze"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                          required
                        />
                      </div>

                      {/* Image URL Input */}
                      <div className="flex-1 min-w-0 w-full md:w-auto">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Image URL / Upload
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt.image_url || ''}
                            onChange={(e) => handleOptionChange(index, 'image_url', e.target.value)}
                            placeholder="/images/options/slow.png"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                          />
                          <label className="px-2.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer text-slate-600 transition-colors flex-shrink-0" title="Upload option image">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingImage}
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(e.target.files[0], (url) => handleOptionChange(index, 'image_url', url));
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Score Weight Input */}
                      <div className="w-28 flex-shrink-0">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
                          Score Weight
                        </label>
                        <input
                          type="number"
                          value={opt.score_weight}
                          onChange={(e) => handleOptionChange(index, 'score_weight', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 text-center bg-indigo-50/50"
                          required
                        />
                      </div>

                      {/* Remove Option Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        title="Remove Option"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors self-end md:self-center"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── SUBMIT ACTION BAR ────────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => selectedStage && selectStageForEditing(selectedStage)}
                className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-sm rounded-xl transition-colors"
              >
                Reset Changes
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{formData.id ? 'Update Stage' : 'Create Stage'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
