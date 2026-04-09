/* ═══════════════════════════════════════════════
   TIMELINE — Event History Renderer
   Woli Trace · Trazabilidad Semilla → Producto
═══════════════════════════════════════════════ */
'use strict';

const Timeline = (() => {

  function render(batchId) {
    const events = DB.getEvents(batchId);
    const el     = document.getElementById('event-timeline');
    if (!el) return;

    if (events.length === 0) {
      el.innerHTML = `<div class="timeline-empty">Sin eventos registrados aún. Completa la primera etapa para iniciar la cadena de trazabilidad.</div>`;
      return;
    }

    el.innerHTML = events.map((ev, i) => {
      const stage  = CONFIG.stages.find(s => s.key === ev.stageKey);
      const color  = stage?.color || '#4caf78';
      const isLast = i === events.length - 1;
      // stageIdx needed so Edit button can jump to the right pipeline node
      const stageIdx = CONFIG.stages.findIndex(s => s.key === ev.stageKey);

      // Build complete field list — show ALL non-empty fields
      const allFields = _buildFieldRows(ev.formData, stage);

      return `
        <div class="tl-event ${isLast ? 'tl-latest' : ''}" id="tl-event-${ev.id}">
          <div class="tl-dot" style="background:${color}; border-color:${color}40">
            <span>${stage?.icon || '📌'}</span>
          </div>
          <div class="tl-line" ${isLast ? 'style="opacity:0"' : ''}></div>
          <div class="tl-card">

            <div class="tl-card-header">
              <div class="tl-stage-name" style="color:${color}">${ev.stageLabel}</div>
              <div class="tl-card-actions">
                <button class="tl-btn tl-btn-edit"
                  onclick="Timeline.jumpToStage('${batchId}', ${stageIdx})"
                  title="Ir al formulario de esta etapa">
                  ✏️ Editar
                </button>
                <button class="tl-btn tl-btn-delete"
                  onclick="Timeline.deleteEvent('${ev.id}', '${batchId}')"
                  title="Eliminar este registro">
                  🗑 Eliminar
                </button>
              </div>
            </div>

            <div class="tl-meta-row">
              <span class="tl-timestamp">🕐 ${new Date(ev.timestamp).toLocaleString('es-CR')}</span>
              <span class="tl-operator">👤 ${ev.operator}</span>
            </div>

            <div class="tl-fields-full">${allFields}</div>

            <div class="tl-hash-block">
              <div class="tl-hash-row">
                <span class="tl-hash-label">🔗 Hash:</span>
                <code class="tl-hash">${ev.hash}</code>
                <span class="tl-chain-status tl-${ev.blockchainStatus}">
                  ${ev.blockchainStatus === 'anchored' ? '⛓ On-chain' : '⏳ Pendiente'}
                </span>
              </div>
              <div class="tl-prev-row">
                <span class="tl-hash-label">↩ Prev:</span>
                <code class="tl-hash tl-prev">${ev.prevHash}</code>
              </div>
            </div>

          </div>
        </div>`;
    }).join('');
  }

  // ── Show ALL non-empty fields ───────────────
  function _buildFieldRows(data, stage) {
    if (!data || !stage) return '<span class="tl-no-fields">Sin datos registrados</span>';

    const rows = stage.fields
      .filter(f => f.type !== 'calculated')
      .map(f => {
        let v = data[f.key];
        if (v === undefined || v === null || v === '') return '';
        // Checkbox: show as Sí/No
        if (f.type === 'checkbox') v = (v === 'true' || v === true) ? 'Sí ✓' : 'No';
        // Truncate very long text for display
        const display = String(v).length > 120 ? String(v).slice(0, 120) + '…' : String(v);
        const reqMark = f.required ? '' : '<span class="tl-opt-tag">opc</span>';
        return `<div class="tl-field-row">
          <span class="tl-field-key">${f.label}${reqMark}</span>
          <span class="tl-field-val">${display}</span>
        </div>`;
      })
      .filter(Boolean);

    if (rows.length === 0) return '<span class="tl-no-fields">Sin campos completados</span>';
    return rows.join('');
  }

  // ── Jump to stage form from timeline ────────
  function jumpToStage(batchId, stageIdx) {
    // Select the stage in the pipeline — this re-renders the form
    Stages.selectStage(stageIdx, batchId);
    // Scroll the stage form into view
    setTimeout(() => {
      const formEl = document.getElementById('stage-form-wrap');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    UI.toast('✏️ Formulario listo para editar', 'info');
  }

  // ── Delete a single event ───────────────────
  function deleteEvent(eventId, batchId) {
    const ev    = DB.getEventById(eventId);
    if (!ev) return;
    const stage = CONFIG.stages.find(s => s.key === ev.stageKey);
    const label = stage?.label || ev.stageKey;

    if (!confirm(`¿Eliminar el registro de "${label}"?\n\nEsta acción no se puede deshacer. El lote volverá a la etapa anterior.`)) return;

    DB.deleteEvent(eventId, batchId);
    // Reconcile batch stage after deletion
    DB.reconcileBatch(batchId);
    // Refresh the whole detail view
    App.selectBatch(batchId);
    UI.toast(`🗑 Registro de ${label} eliminado`, 'warn');
  }

  return { render, jumpToStage, deleteEvent };
})();
