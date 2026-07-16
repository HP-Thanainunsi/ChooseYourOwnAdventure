/**
 * client/src/components/DrinksLocationsManager.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive CMS Management Module for Final Destination Outcomes:
 *   1. Drinks & Outcomes: Name, description, image upload, score bands, ABV/sweetness, and store linkage.
 *   2. Store Map & Locations: Bar name, address, GPS coordinates (lat/lon), and Google Maps navigation link.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';

export default function DrinksLocationsManager({ token, showToast }) {
  const [subTab, setSubTab] = useState('drinks'); // 'drinks' | 'locations'
  const [loading, setLoading] = useState(false);
  const [drinks, setDrinks] = useState([]);
  const [locations, setLocations] = useState([]);

  // Drinks Form State
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [drinkForm, setDrinkForm] = useState({
    id: null,
    name: '',
    description: '',
    image_url: '',
    min_score: -15,
    max_score: 5,
    abv: 3,
    sweetness: 3,
    location_id: '',
  });
  const [uploadingDrinkImage, setUploadingDrinkImage] = useState(false);

  // Locations Form State
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locForm, setLocForm] = useState({
    id: null,
    name: '',
    address: '',
    latitude: 13.7388,
    longitude: 100.5144,
    google_maps_link: '',
  });

  // Fetch all drinks & locations on mount or tab change
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/drinks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const fetchedDrinks = data.data.drinks || [];
        const fetchedLocs = data.data.locations || [];
        setDrinks(fetchedDrinks);
        setLocations(fetchedLocs);

        // Auto select first items if none selected
        if (fetchedDrinks.length > 0 && !selectedDrink && !drinkForm.id) {
          selectDrink(fetchedDrinks[0]);
        }
        if (fetchedLocs.length > 0 && !selectedLocation && !locForm.id) {
          selectLocation(fetchedLocs[0]);
        }
      } else {
        showToast(data.error || 'Failed to fetch drinks data.', 'error');
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      showToast('Could not connect to server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  // ─── DRINK HANDLERS ──────────────────────────────────────────────────────────
  const selectDrink = (drink) => {
    setSelectedDrink(drink);
    setDrinkForm({
      id: drink.id,
      name: drink.name || '',
      description: drink.description || '',
      image_url: drink.image_url || '',
      min_score: drink.min_score !== undefined ? drink.min_score : 0,
      max_score: drink.max_score !== undefined ? drink.max_score : 5,
      abv: drink.abv !== undefined ? drink.abv : 3,
      sweetness: drink.sweetness !== undefined ? drink.sweetness : 3,
      location_id: drink.location_id || '',
    });
  };

  const handleNewDrink = () => {
    setSelectedDrink(null);
    setDrinkForm({
      id: null,
      name: '',
      description: '',
      image_url: '',
      min_score: 0,
      max_score: 5,
      abv: 3,
      sweetness: 3,
      location_id: locations.length > 0 ? locations[0].id : '',
    });
  };

  const handleDrinkFormChange = (field, value) => {
    setDrinkForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadDrinkPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDrinkImage(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success && data.imageUrl) {
        handleDrinkFormChange('image_url', data.imageUrl);
        showToast('Drink photo uploaded successfully!', 'success');
      } else {
        showToast(data.error || 'Failed to upload photo.', 'error');
      }
    } catch (err) {
      console.error('Upload photo error:', err);
      showToast('Error uploading photo.', 'error');
    } finally {
      setUploadingDrinkImage(false);
    }
  };

  const handleSaveDrink = async (e) => {
    e.preventDefault();
    if (!drinkForm.name.trim()) {
      showToast('Please enter a drink outcome name.', 'error');
      return;
    }
    if (Number(drinkForm.min_score) > Number(drinkForm.max_score)) {
      showToast('Min score cannot be higher than Max score.', 'error');
      return;
    }

    setLoading(true);
    try {
      const isEdit = Boolean(drinkForm.id);
      const url = isEdit ? `/api/admin/drinks/${drinkForm.id}` : '/api/admin/drinks';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...drinkForm,
          min_score: Number(drinkForm.min_score),
          max_score: Number(drinkForm.max_score),
          abv: Number(drinkForm.abv),
          sweetness: Number(drinkForm.sweetness),
          location_id: drinkForm.location_id ? Number(drinkForm.location_id) : null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isEdit ? 'Drink updated successfully!' : 'New drink created!', 'success');
        await fetchData();
        if (!isEdit && data.id) {
          setDrinkForm((prev) => ({ ...prev, id: data.id }));
        }
      } else {
        showToast(data.error || 'Failed to save drink.', 'error');
      }
    } catch (err) {
      console.error('Save drink error:', err);
      showToast('Could not save drink.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDrink = async (id) => {
    if (!window.confirm('Are you sure you want to delete this drink outcome?')) return;
    try {
      const res = await fetch(`/api/admin/drinks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Drink deleted successfully.', 'success');
        setSelectedDrink(null);
        await fetchData();
      } else {
        showToast(data.error || 'Failed to delete drink.', 'error');
      }
    } catch (err) {
      console.error('Delete drink error:', err);
      showToast('Error communicating with server.', 'error');
    }
  };

  // ─── LOCATION HANDLERS ───────────────────────────────────────────────────────
  const selectLocation = (loc) => {
    setSelectedLocation(loc);
    setLocForm({
      id: loc.id,
      name: loc.name || '',
      address: loc.address || '',
      latitude: loc.latitude !== undefined ? loc.latitude : 13.7388,
      longitude: loc.longitude !== undefined ? loc.longitude : 100.5144,
      google_maps_link: loc.google_maps_link || '',
    });
  };

  const handleNewLocation = () => {
    setSelectedLocation(null);
    setLocForm({
      id: null,
      name: '',
      address: '',
      latitude: 13.7388,
      longitude: 100.5144,
      google_maps_link: '',
    });
  };

  const handleLocFormChange = (field, value) => {
    setLocForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePresetLocation = (name, lat, lon, address, mapsLink) => {
    setLocForm((prev) => ({
      ...prev,
      name,
      latitude: lat,
      longitude: lon,
      address: address || prev.address,
      google_maps_link: mapsLink || prev.google_maps_link,
    }));
    showToast(`Applied preset for ${name}`, 'success');
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!locForm.name.trim()) {
      showToast('Please enter a bar or store name.', 'error');
      return;
    }

    setLoading(true);
    try {
      const isEdit = Boolean(locForm.id);
      const url = isEdit ? `/api/admin/locations/${locForm.id}` : '/api/admin/locations';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...locForm,
          latitude: Number(locForm.latitude),
          longitude: Number(locForm.longitude),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(isEdit ? 'Store location updated!' : 'New store location added!', 'success');
        await fetchData();
        if (!isEdit && data.id) {
          setLocForm((prev) => ({ ...prev, id: data.id }));
        }
      } else {
        showToast(data.error || 'Failed to save location.', 'error');
      }
    } catch (err) {
      console.error('Save location error:', err);
      showToast('Could not save location.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id) => {
    const linkedDrinks = drinks.filter((d) => Number(d.location_id) === Number(id));
    if (linkedDrinks.length > 0) {
      if (!window.confirm(`Warning: ${linkedDrinks.length} drink(s) are using this store location. Deleting it will unlink them. Continue?`)) {
        return;
      }
    } else if (!window.confirm('Are you sure you want to delete this store location?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/locations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Location deleted successfully.', 'success');
        setSelectedLocation(null);
        await fetchData();
      } else {
        showToast(data.error || 'Failed to delete location.', 'error');
      }
    } catch (err) {
      console.error('Delete location error:', err);
      showToast('Error communicating with server.', 'error');
    }
  };

  const currentDrinkLocation = locations.find((l) => Number(l.id) === Number(drinkForm.location_id)) || null;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-100 font-sans">
      {/* ── SUB-HEADER BAR ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-xl">🍹</span>
            <span>Final Destination & Store Map CMS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage the drink outcomes (`Drinks`) and secret bar locations (`Locations`) for the cinematic finale.
          </p>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSubTab('drinks')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              subTab === 'drinks'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🍸 Drinks & Outcomes</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              subTab === 'drinks' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {drinks.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('locations')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              subTab === 'locations'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📍 Store Map & GPS</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              subTab === 'locations' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {locations.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* ── VIEW 1: DRINKS MANAGEMENT ───────────────────────────────────────── */}
        {subTab === 'drinks' && (
          <>
            {/* Left Sidebar: Drinks List */}
            <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-auto md:h-[calc(100vh-8.5rem)] sticky top-[8.5rem]">
              <div className="p-4 border-b border-slate-200">
                <button
                  type="button"
                  onClick={handleNewDrink}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create New Drink Outcome</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {drinks.length === 0 ? (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400 text-sm font-medium">No drink outcomes configured.</p>
                  </div>
                ) : (
                  drinks.map((d) => {
                    const isSelected = drinkForm.id === d.id;
                    const loc = locations.find((l) => l.id === d.location_id);
                    return (
                      <div
                        key={d.id}
                        onClick={() => selectDrink(d)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-3 relative group ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700/50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {d.image_url ? (
                            <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg">🍸</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                              {d.name}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              Score: {d.min_score} to {d.max_score}
                            </span>
                            {loc ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 truncate max-w-[130px]">
                                📍 {loc.name}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                No Store Link
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete btn */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDrink(d.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Drink"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Right Form: Drink Editor */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    {drinkForm.id ? `Editing Drink ID: #${drinkForm.id}` : 'New Drink Outcome Configuration'}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    {drinkForm.name || 'Untitled Drink Outcome'}
                  </h3>
                </div>

                {drinkForm.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDrink(drinkForm.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Outcome</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveDrink} className="space-y-6">
                {/* ── CARD 1: BASIC INFO ───────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  <h4 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>Basic Information & Narrative</span>
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Drink Outcome Name (ชื่อเครื่องดื่มผลลัพธ์)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sparkling Water or THE BANGKOK ALCHEMIST"
                        value={drinkForm.name}
                        onChange={(e) => handleDrinkFormChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Storytelling & Final Description (คำบรรยายตอนจบที่ปรากฏในกรอบการ์ตูน)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. ค่ำคืนอันยาวนานสิ้นสุดลงที่นี่... สปิริตของคุณตรงกับความเย้ายวน ลึกลับ และเต็มไปด้วยชีวิตชีวาของมหานครที่ไม่เคยหลับใหล..."
                        value={drinkForm.description}
                        onChange={(e) => handleDrinkFormChange('description', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 text-sm leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* ── CARD 2: DRINK IMAGE MANAGEMENT ───────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  <h4 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>Drink Visual & Background Image</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                    {/* Preview Box */}
                    <div className="sm:col-span-1 bg-slate-900 rounded-2xl border-2 border-slate-700/60 aspect-[3/4] overflow-hidden flex flex-col items-center justify-center relative shadow-inner group">
                      {drinkForm.image_url ? (
                        <>
                          <img
                            src={drinkForm.image_url}
                            alt={drinkForm.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Full-Screen Finale Cover</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <span className="text-3xl block mb-2">🖼️</span>
                          <span className="text-xs font-semibold text-slate-400">No Image Uploaded</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="sm:col-span-2 space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                          Upload New Drink Photo (อัปโหลดรูปภาพ)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
                            uploadingDrinkImage
                              ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                          }`}>
                            <span>{uploadingDrinkImage ? '⏳ Uploading...' : '📁 Choose Image File'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadDrinkPhoto}
                              disabled={uploadingDrinkImage}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                          Upload a high-res drink or cocktail image (.png or .jpg). Stored directly and ready for full-screen display.
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                          Or Paste Direct Image URL (ลิงก์รูปภาพ)
                        </label>
                        <input
                          type="text"
                          placeholder="/images/drinks/tropical-smoothie.png or https://..."
                          value={drinkForm.image_url}
                          onChange={(e) => handleDrinkFormChange('image_url', e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-mono text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CARD 3: SCORE BAND & FLAVOR METRICS ──────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  <h4 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>Score Band & Flavor Ratings</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Min Score */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Min Score Threshold (คะแนนต่ำสุด)
                      </label>
                      <input
                        type="number"
                        value={drinkForm.min_score}
                        onChange={(e) => handleDrinkFormChange('min_score', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                        required
                      />
                    </div>

                    {/* Max Score */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Max Score Threshold (คะแนนสูงสุด)
                      </label>
                      <input
                        type="number"
                        value={drinkForm.max_score}
                        onChange={(e) => handleDrinkFormChange('max_score', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    💡 <strong>Note:</strong> When the player completes all swipe and tarot stages, their accumulated score weight is matched against these min/max bands ({'`min_score <= totalScore <= max_score`'}). Ensure bands do not overlap unnecessarily.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    {/* ABV Strength */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between">
                        <span>ABV / Spirit Kick (ระดับความสตรอง)</span>
                        <span className="text-sm font-black text-amber-600">{'⚡'.repeat(Number(drinkForm.abv) || 1)} ({drinkForm.abv}/5)</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={drinkForm.abv}
                        onChange={(e) => handleDrinkFormChange('abv', e.target.value)}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    {/* Sweetness */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between">
                        <span>Sweetness Profile (ระดับความหวาน)</span>
                        <span className="text-sm font-black text-rose-600">{'🍯'.repeat(Number(drinkForm.sweetness) || 1)} ({drinkForm.sweetness}/5)</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={drinkForm.sweetness}
                        onChange={(e) => handleDrinkFormChange('sweetness', e.target.value)}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                    </div>
                  </div>
                </div>

                {/* ── CARD 4: STORE LOCATION LINK & MAP SPECIFICATION ─────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>Store Map & Location Link (ระบุร้านค้า/บาร์ลับ)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setSubTab('locations')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span>📍 Manage Map Coordinates ({locations.length} Locations) →</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Associated Bar / Store Destination (เลือกร้านค้าที่จะนำทางในหน้าผลลัพธ์)
                    </label>
                    <select
                      value={drinkForm.location_id}
                      onChange={(e) => handleDrinkFormChange('location_id', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-sm bg-white"
                    >
                      <option value="">-- No Specific Location / Generic Destination --</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          📍 {l.name} — ({l.address})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Live Cyberpunk Ticket Preview */}
                  {currentDrinkLocation ? (
                    <div className="mt-4 p-5 rounded-2xl bg-[#0d0714] border border-cyan-500/40 shadow-xl text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-3">
                        <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                          ★ DESTINATION GPS TICKET PREVIEW
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                          ID #{currentDrinkLocation.id}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xl font-black text-amber-300 tracking-wide uppercase">
                          {currentDrinkLocation.name}
                        </h5>
                        <p className="text-xs text-slate-300 font-mono leading-relaxed">
                          {currentDrinkLocation.address}
                        </p>
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-cyan-300">
                          <span>LAT: {currentDrinkLocation.latitude}° N | LON: {currentDrinkLocation.longitude}° E</span>
                          <a
                            href={currentDrinkLocation.google_maps_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] px-3 py-1 bg-cyan-500 text-black font-extrabold rounded hover:bg-cyan-400 transition-colors inline-block"
                          >
                            🗺️ NAVIGATE TO LOCATION →
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      Select a bar location above to link a Google Maps navigation button and GPS coordinates to this drink outcome.
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{loading ? '⏳ Saving...' : drinkForm.id ? 'Save Changes to Drink' : 'Create New Drink Outcome'}</span>
                  </button>
                </div>
              </form>
            </main>
          </>
        )}

        {/* ── VIEW 2: LOCATIONS & STORE MAP MANAGEMENT ────────────────────────── */}
        {subTab === 'locations' && (
          <>
            {/* Left Sidebar: Locations List */}
            <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-auto md:h-[calc(100vh-8.5rem)] sticky top-[8.5rem]">
              <div className="p-4 border-b border-slate-200">
                <button
                  type="button"
                  onClick={handleNewLocation}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Create New Bar Location</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {locations.length === 0 ? (
                  <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400 text-sm font-medium">No store locations created yet.</p>
                  </div>
                ) : (
                  locations.map((loc) => {
                    const isSelected = locForm.id === loc.id;
                    const linkedDrinksCount = drinks.filter((d) => Number(d.location_id) === Number(loc.id)).length;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => selectLocation(loc)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-center gap-3 relative group ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base flex-shrink-0">
                          📍
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                            {loc.name}
                          </h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {loc.address}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              GPS: {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                            </span>
                            {linkedDrinksCount > 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                                {linkedDrinksCount} Drink(s)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Delete btn */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLocation(loc.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Location"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Right Form: Location Editor */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                    {locForm.id ? `Editing Store Location ID: #${locForm.id}` : 'New Store Map & GPS Configuration'}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    {locForm.name || 'Untitled Bar Location'}
                  </h3>
                </div>

                {locForm.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(locForm.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Location</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveLocation} className="space-y-6">
                {/* ── CARD 1: BAR DETAILS ──────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  <h4 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>Bar Details & Address</span>
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Store / Bar Name (ชื่อร้านหรือบาร์ลับ)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Teens of Thailand or Tropic City"
                        value={locForm.name}
                        onChange={(e) => handleLocFormChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Full Address (ที่อยู่ร้านค้า / ซอย / ถนน)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 76 Soi Nana, Charoen Krung Rd, Pom Prap, Bangkok 10100"
                        value={locForm.address}
                        onChange={(e) => handleLocFormChange('address', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ── CARD 2: GPS COORDINATES & GOOGLE MAPS LINK ───────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
                  <h4 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>GPS Coordinates & Google Maps Link</span>
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                        Google Maps Navigation URL (ลิงก์นำทางสำหรับปุ่ม NAVIGATE TO LOCATION)
                      </label>
                      <input
                        type="url"
                        placeholder="https://maps.app.goo.gl/... or https://maps.google.com/?q=..."
                        value={locForm.google_maps_link}
                        onChange={(e) => handleLocFormChange('google_maps_link', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-slate-800"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Latitude */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                          Latitude (พิกัดเส้นรุ้ง LAT)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={locForm.latitude}
                          onChange={(e) => handleLocFormChange('latitude', e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold font-mono text-slate-900"
                          required
                        />
                      </div>

                      {/* Longitude */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                          Longitude (พิกัดเส้นแวง LON)
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={locForm.longitude}
                          onChange={(e) => handleLocFormChange('longitude', e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold font-mono text-slate-900"
                          required
                        />
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="pt-3 border-t border-slate-100">
                      <span className="block text-xs font-semibold text-slate-500 mb-2">
                        ⚡ Quick Bangkok Nightlife Presets:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handlePresetLocation(
                            'Teens of Thailand',
                            13.7388,
                            100.5144,
                            '76 Soi Nana, Charoen Krung Rd, Pom Prap, Bangkok 10100',
                            'https://maps.app.goo.gl/TeensOfThailandBangkok'
                          )}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
                        >
                          📍 Teens of Thailand (Nana)
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetLocation(
                            'Tropic City',
                            13.7287,
                            100.5165,
                            '672/65 Soi Charoen Krung 28, Bang Rak, Bangkok 10500',
                            'https://maps.app.goo.gl/TropicCityBangkok'
                          )}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
                        >
                          📍 Tropic City (Charoen Krung)
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetLocation(
                            'Nana Cyber Speakeasy',
                            13.7405,
                            100.5532,
                            'Soi Nana (Sukhumvit Soi 4/11), Khlong Toei, Bangkok 10110',
                            'https://maps.app.goo.gl/NanaCyberSpeakeasyBangkok'
                          )}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
                        >
                          📍 Nana Speakeasy (Sukhumvit)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── CARD 3: LIVE CYBERPUNK TICKET PREVIEW ──────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>Mobile Ticket Preview (`FinalDestination.jsx`)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    This ticket will be pinned at the bottom of the screen on the cinematic finale page:
                  </p>

                  <div className="p-5 rounded-2xl bg-[#0d0714] border border-cyan-500/40 shadow-2xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-3">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                        ★ DESTINATION GPS TICKET PREVIEW
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                        ID #{locForm.id || 'NEW'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-xl font-black text-amber-300 tracking-wide uppercase">
                        {locForm.name || 'BAR NAME'}
                      </h5>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        {locForm.address || 'Bar full address will appear right here...'}
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-cyan-300">
                        <span>LAT: {Number(locForm.latitude)?.toFixed(4)}° N | LON: {Number(locForm.longitude)?.toFixed(4)}° E</span>
                        <a
                          href={locForm.google_maps_link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] px-3 py-1 bg-cyan-500 text-black font-extrabold rounded hover:bg-cyan-400 transition-colors inline-block"
                        >
                          🗺️ NAVIGATE TO LOCATION →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{loading ? '⏳ Saving...' : locForm.id ? 'Save Changes to Location' : 'Create New Bar Location'}</span>
                  </button>
                </div>
              </form>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
