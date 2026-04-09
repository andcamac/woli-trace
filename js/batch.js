/* ═══════════════════════════════════════════════
   BATCH — Sidebar Card Renderer
   Woli Trace · Trazabilidad Semilla → Producto
═══════════════════════════════════════════════ */
'use strict';

const Batch = (() => {

  function renderList(batches) {
    const list = document.getElementById('batch-list');
    const cnt  = document.getElementById('batch-count');
    if (!list) return;

    cnt.textContent = batches.length;

    if (batches.length === 0) {
      list.innerHTML = `<div class="batch-empty">Sin lotes. Crea el primero con el botón "Nuevo Lote".</div>`;
      return;
    }

    // FIX: get the currently selected batchId BEFORE rendering to correctly highlight active card
    const activeBatchId = document.getElementById('batch-detail')?.dataset?.batchId || '';

    list.innerHTML = batches.map(b => {
      // FIX: get real events count and derive displayed stage from actual events
      const events   = DB.getEvents(b.id);
      const doneKeys = [...new Set(events.map(e => e.stageKey))];

      // FIX: show the LAST COMPLETED stage, not just currentStage (which points to NEXT)
      // currentStage is the next stage to fill; last completed = currentStage - 1
      const lastCompletedIdx = Math.max(0, b.currentStage - (b.status === 'complete' ? 0 : 1));
      const displayStage     = CONFIG.stages[Math.min(lastCompletedIdx, CONFIG.stages.length - 1)];
      // If no events yet, show stage 0 label
      const stageLabel = events.length === 0
        ? CONFIG.stages[0]
        : displayStage;

      const ct      = CONFIG.cultivationTypes.find(c => c.key === b.cultivationType);
      // FIX: progress bar based on number of stages with actual events, not currentStage index
      const prog    = Math.round((doneKeys.length / CONFIG.stages.length) * 100);
      const hasFlag = b.flags?.length > 0;
      const active  = activeBatchId === b.id;

      return `
        <div class="batch-card ${active ? 'batch-card-active' : ''} ${hasFlag ? 'batch-card-flagged' : ''}"
             onclick="App.selectBatch('${b.id}')">
          <div class="bc-top">
            <div class="bc-id">${b.id}</div>
            <div class="bc-status">${b.status === 'complete' ? '✅' : '🔄'}</div>
          </div>
          <div class="bc-name">${b.name || b.strain || '—'}</div>
          <div class="bc-strain">${b.strain || ''}</div>
          <div class="bc-meta">
            <span style="color:${ct?.color||'#4caf78'}">${ct?.label || b.cultivationType}</span>
            <!-- FIX: show real event count from DB -->
            <span>· ${events.length} evento${events.length !== 1 ? 's' : ''}</span>
          </div>
          <!-- FIX: show last completed stage, with fallback -->
          <div class="bc-stage">${stageLabel?.icon || ''} ${stageLabel?.label || '—'}</div>
          <div class="bc-prog-track">
            <div class="bc-prog-fill" style="width:${prog}%;background:${ct?.color||'#4caf78'}"></div>
          </div>
          ${hasFlag ? `<div class="bc-flag">⚠ ${b.flags.length} alerta${b.flags.length>1?'s':''}</div>` : ''}
        </div>`;
    }).join('');
  }

  function renderDetail(batchId) {
    const batch = DB.getBatch(batchId);
    if (!batch) return;

    document.getElementById('empty-state').classList.add('hidden');
    const detailEl = document.getElementById('batch-detail');
    detailEl.classList.remove('hidden');
    detailEl.dataset.batchId = batchId;

    const ct = CONFIG.cultivationTypes.find(c => c.key === batch.cultivationType);
    document.getElementById('detail-id').textContent   = batch.id;
    document.getElementById('detail-name').textContent = batch.name || batch.strain;
    document.getElementById('detail-meta').textContent =
      `${batch.strain || ''} · ${batch.location || '—'} · ${batch.responsiblePerson || '—'}`;

    const statusEl = document.getElementById('detail-status');
    statusEl.textContent = batch.status === 'complete' ? '✅ Completo' : '🔄 En Progreso';
    statusEl.className   = `status-chip status-${batch.status}`;
    if (ct) statusEl.style.borderColor = ct.color;

    const delWrap = document.getElementById('detail-delete-wrap');
    if (delWrap) {
      delWrap.innerHTML = `<button class="btn-delete-batch" onclick="App.deleteBatch('${batchId}')" title="Eliminar lote">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
        Eliminar Lote
      </button>`;
    }

    QRGen.renderInline(batchId, 'detail-qr');
    Stages.renderPipeline(batch);
    // FIX: open the current stage form (the next one to fill)
    Stages.selectStage(batch.currentStage, batchId);
    Timeline.render(batchId);
    Compliance.render(batchId);
  }

  return { renderList, renderDetail };
})();
