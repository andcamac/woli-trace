/* ═══════════════════════════════════════════════
   DB — Data Layer with Hash Simulation
   Woli Trace · Trazabilidad Semilla → Producto
═══════════════════════════════════════════════ */
'use strict';

const DB = (() => {
  const KEY_BATCHES = 'wolitrace_batches_v1';
  const KEY_EVENTS  = 'wolitrace_events_v1';

  function _load(key)       { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch(e){ return {}; } }
  function _save(key, data) { try { localStorage.setItem(key, JSON.stringify(data)); } catch(e){ console.warn('Storage full'); } }

  function _uid()     { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function _batchId() { const d = new Date(); return `WB-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${_uid().slice(0,6).toUpperCase()}`; }
  function _eventId() { return `EV-${_uid()}`; }

  function _hashData(data) {
    const str = JSON.stringify(data);
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return '0x' + h.toString(16).padStart(8,'0') + _uid().slice(0,8);
  }

  // ── Batch CRUD ─────────────────────────────
  function getBatches() {
    return Object.values(_load(KEY_BATCHES)).sort((a,b) => b.createdAt - a.createdAt);
  }

  function getBatch(id) { return _load(KEY_BATCHES)[id] || null; }

  function createBatch(data) {
    const raw = _load(KEY_BATCHES);
    const id  = _batchId();
    const now = Date.now();
    const batch = { id, ...data, currentStage:0, status:'active', flags:[], createdAt:now, updatedAt:now, completedAt:null, hashChain:[], blockchainTxRef:null };
    raw[id] = batch;
    _save(KEY_BATCHES, raw);
    return batch;
  }

  function updateBatch(id, updates) {
    const raw = _load(KEY_BATCHES);
    if (!raw[id]) return null;
    raw[id] = { ...raw[id], ...updates, updatedAt: Date.now() };
    _save(KEY_BATCHES, raw);
    return raw[id];
  }

  function deleteBatch(id) {
    const raw = _load(KEY_BATCHES);
    delete raw[id];
    _save(KEY_BATCHES, raw);
    const evs = _load(KEY_EVENTS);
    Object.keys(evs).forEach(k => { if (evs[k].batchId === id) delete evs[k]; });
    _save(KEY_EVENTS, evs);
  }

  // ── Event CRUD ─────────────────────────────
  function getEvents(batchId) {
    return Object.values(_load(KEY_EVENTS))
      .filter(e => e.batchId === batchId)
      .sort((a, b) => (a.timestamp || a.createdAt || 0) - (b.timestamp || b.createdAt || 0));
  }

  // NEW: get a single event by its ID
  function getEventById(eventId) {
    return _load(KEY_EVENTS)[eventId] || null;
  }

  function addEvent(batchId, stageKey, formData, operator) {
    const evs   = _load(KEY_EVENTS);
    const batch = getBatch(batchId);
    if (!batch) return null;

    // Replace existing event for this stage cleanly
    const existing = Object.values(evs).filter(e => e.batchId === batchId && e.stageKey === stageKey);
    const hashChain = [...(batch.hashChain || [])];
    if (existing.length > 0) {
      existing.forEach(ev => {
        const idx = hashChain.indexOf(ev.hash);
        if (idx !== -1) hashChain.splice(idx, 1);
        delete evs[ev.id];
      });
    }

    const id        = _eventId();
    const now       = Date.now();
    const prevHash  = hashChain.slice(-1)[0] || '0x00000000';
    const hash      = _hashData({ batchId, stageKey, formData, operator, timestamp: now, prevHash });

    const event = {
      id, batchId, stageKey,
      stageLabel:       CONFIG.stages.find(s => s.key === stageKey)?.label || stageKey,
      formData,
      operator:         operator || 'Sistema',
      timestamp:        now,
      createdAt:        now,
      hash, prevHash,
      blockchainStatus: 'pending',
      txHash:           null,
    };

    evs[id] = event;
    _save(KEY_EVENTS, evs);
    hashChain.push(hash);
    updateBatch(batchId, { hashChain, updatedAt: now });
    return event;
  }

  // NEW: delete a single event and rebuild the hash chain
  function deleteEvent(eventId, batchId) {
    const evs = _load(KEY_EVENTS);
    if (!evs[eventId]) return;
    delete evs[eventId];
    _save(KEY_EVENTS, evs);

    // Rebuild the hash chain from scratch from remaining events
    _rebuildHashChain(batchId);
  }

  // Rebuild hash chain from all remaining events in timestamp order
  function _rebuildHashChain(batchId) {
    const events = getEvents(batchId); // already sorted by timestamp
    const chain  = events.map(e => e.hash);
    updateBatch(batchId, { hashChain: chain });
  }

  // ── Reconcile: derive stage/status from actual events ──
  function reconcileBatch(id) {
    const batch  = getBatch(id);
    if (!batch) return;
    const events = getEvents(id);

    if (events.length === 0) {
      // No events — reset to stage 0, active
      if (batch.currentStage !== 0 || batch.status !== 'active') {
        updateBatch(id, { currentStage: 0, status: 'active', completedAt: null });
      }
      return;
    }

    const doneKeys = [...new Set(events.map(e => e.stageKey))];
    let maxDoneIdx = -1;
    CONFIG.stages.forEach((stage, i) => {
      if (doneKeys.includes(stage.key)) maxDoneIdx = i;
    });
    if (maxDoneIdx < 0) return;

    const totalStages = CONFIG.stages.length;
    const isComplete  = maxDoneIdx >= totalStages - 1;
    const nextStage   = isComplete ? maxDoneIdx : Math.min(maxDoneIdx + 1, totalStages - 1);

    if (batch.currentStage !== nextStage || batch.status !== (isComplete ? 'complete' : 'active')) {
      updateBatch(id, {
        currentStage: nextStage,
        status:       isComplete ? 'complete' : 'active',
        completedAt:  isComplete ? (batch.completedAt || Date.now()) : null,
      });
    }
  }

  function reconcileAll() {
    getBatches().forEach(b => reconcileBatch(b.id));
  }

  // ── Search & filter ─────────────────────────
  function searchBatches(query) {
    const q = (query || '').toLowerCase();
    return getBatches().filter(b =>
      b.id.toLowerCase().includes(q)
      || (b.strain  || '').toLowerCase().includes(q)
      || (b.name    || '').toLowerCase().includes(q)
      || (b.cultivationType || '').toLowerCase().includes(q)
    );
  }

  function filterBatches(status) {
    const all = getBatches();
    if (status === 'all')      return all;
    if (status === 'active')   return all.filter(b => b.status === 'active');
    if (status === 'complete') return all.filter(b => b.status === 'complete');
    if (status === 'flag')     return all.filter(b => b.flags && b.flags.length > 0);
    return all;
  }

  // ── Seed data ──────────────────────────────
  function seedDemoData() {
    if (getBatches().length > 0) return;
    const b1 = createBatch({ name:'Cannatonic CBD Premium', strain:'Cannatonic', cultivationType:'hemp_cbd', responsiblePerson:'Carlos Mora', location:'Finca Woli — Cartago, Costa Rica', notes:'Primer lote oficial bajo Ley 9566' });
    addEvent(b1.id, 'seed', { seedLot:'SL-2025-001', seedOrigin:'Royal Queen Seeds', strain:'Cannatonic', seedType:'Feminizada', seedCount:'100', thcGenetics:'0.18', cbdGenetics:'18', certOrganic:'EU Organic', seedNotes:'Semillas almacenadas a 8°C, viabilidad 96%' }, 'Carlos Mora');
    addEvent(b1.id, 'germination', { germinationMethod:'Papel húmedo', startDate:'2025-02-10', germinationTemp:'23', germinationHum:'72', seedsPlanted:'100', seedsGerminated:'94' }, 'Carlos Mora');
    reconcileBatch(b1.id);

    const b2 = createBatch({ name:"Charlotte's Web — Lote A", strain:"Charlotte's Web", cultivationType:'hemp_cbd', responsiblePerson:'Ana Jiménez', location:'Invernadero 1 — San Carlos', notes:'Lote para línea Woli Ungüento' });
    addEvent(b2.id, 'seed', { seedLot:'SL-2025-002', seedOrigin:'CW Hemp', strain:"Charlotte's Web", seedType:'Clon', seedCount:'50', thcGenetics:'0.07', cbdGenetics:'20', certOrganic:'USDA Organic' }, 'Ana Jiménez');
    reconcileBatch(b2.id);
  }

  function getStats() {
    const batches = getBatches();
    const evs     = Object.values(_load(KEY_EVENTS));
    return { totalBatches:batches.length, activeBatches:batches.filter(b=>b.status==='active').length, completeBatches:batches.filter(b=>b.status==='complete').length, flaggedBatches:batches.filter(b=>b.flags?.length>0).length, totalEvents:evs.length };
  }

  return {
    getBatches, getBatch, createBatch, updateBatch, deleteBatch,
    getEvents, getEventById, addEvent, deleteEvent,
    reconcileBatch, reconcileAll,
    searchBatches, filterBatches,
    seedDemoData, getStats,
  };
})();
