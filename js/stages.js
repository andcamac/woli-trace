/* ═══════════════════════════════════════════════
   STAGES — Form Renderer & Pipeline Builder
   Woli Trace · Trazabilidad Semilla → Producto
═══════════════════════════════════════════════ */
'use strict';

const Stages = (() => {

  // ── Render the stage pipeline strip ───────
  function renderPipeline(batch) {
    const track   = document.getElementById('pipeline-track');
    const events  = DB.getEvents(batch.id);
    const doneKeys = [...new Set(events.map(e => e.stageKey))];

    track.innerHTML = CONFIG.stages.map((stage, i) => {
      const isDone    = doneKeys.includes(stage.key);
      const isCurrent = i === batch.currentStage;
      // A stage is locked only if it has no events AND is ahead of currentStage
      const isLocked  = !isDone && i > batch.currentStage;

      let cls = 'pipeline-node';
      if (isDone)    cls += ' node-done';
      if (isCurrent) cls += ' node-current';
      if (isLocked)  cls += ' node-locked';

      return `
        <div class="${cls}" onclick="Stages.selectStage(${i}, '${batch.id}')"
             title="${stage.label}: ${stage.shortDesc}">
          <div class="node-icon">${stage.icon}</div>
          <div class="node-label">${stage.label}</div>
          ${isDone ? '<div class="node-check">✓</div>' : ''}
          ${isCurrent && !isDone ? '<div class="node-dot"></div>' : ''}
        </div>
        ${i < CONFIG.stages.length - 1 ? `<div class="pipeline-line ${isDone ? 'line-done' : ''}"></div>` : ''}`;
    }).join('');
  }

  // ── Select / open a stage form ─────────────
  function selectStage(stageIdx, batchId) {
    const batch = DB.getBatch(batchId);
    const stage = CONFIG.stages[stageIdx];
    if (!stage || !batch) return;

    const events   = DB.getEvents(batchId);
    const existing = events.filter(e => e.stageKey === stage.key).slice(-1)[0];
    // FIX: a stage is locked only if it has no event AND is strictly ahead of currentStage
    const isLocked = !existing && stageIdx > batch.currentStage;

    renderStageForm(stage, batch, existing, isLocked, stageIdx);

    // Highlight selected node in pipeline
    document.querySelectorAll('.pipeline-node').forEach((n, i) => {
      n.classList.toggle('node-selected', i === stageIdx);
    });
  }

  // ── Render the stage data entry form ───────
  function renderStageForm(stage, batch, existing, isLocked, stageIdx) {
    const wrap = document.getElementById('stage-form-wrap');
    // FIX: clone formData so we don't mutate the stored event
    const data = existing ? { ...existing.formData } : {};

    // For dryLoss: pull freshWeight from harvest event if not in drying data
    if (stage.key === 'drying' && !data.freshWeight) {
      const events    = DB.getEvents(batch.id);
      const harvestEv = events.find(e => e.stageKey === 'harvest');
      if (harvestEv?.formData?.freshWeight) {
        data._freshWeightFromHarvest = harvestEv.formData.freshWeight;
      }
    }

    const fieldRows = stage.fields.map(f => {
      const val          = data[f.key] !== undefined ? data[f.key] : '';
      const req          = f.required ? '<span class="req">*</span>' : '';
      const disabledAttr = isLocked ? 'disabled' : '';

      let input = '';
      if (f.type === 'calculated') {
        const computed = _computeField(f, data);
        input = `<div class="calc-field" id="calc-${f.key}">${computed !== null ? computed.toFixed(1) + '%' : '—'}</div>`;
      } else if (f.type === 'select') {
        const opts = f.options.map(o => `<option value="${o}" ${val === o ? 'selected' : ''}>${o}</option>`).join('');
        input = `<select name="${f.key}" ${disabledAttr} class="form-select" onchange="Stages.liveCalc('${batch.id}','${stage.key}',this.form)">
          <option value="">— Seleccionar —</option>${opts}</select>`;
      } else if (f.type === 'textarea') {
        input = `<textarea name="${f.key}" ${disabledAttr} class="form-textarea" placeholder="${f.placeholder||''}" rows="2">${val}</textarea>`;
      } else if (f.type === 'checkbox') {
        input = `<label class="form-check"><input type="checkbox" name="${f.key}" ${val==='true'||val===true?'checked':''} ${disabledAttr}><span>Sí</span></label>`;
      } else if (f.type === 'file_ref') {
        input = `<div class="file-ref-wrap">
          <input type="text" name="${f.key}" class="form-input" placeholder="Referencia o nombre del archivo" value="${val}" ${disabledAttr}>
          <span class="file-hint">📎 Adjuntar referencia documental</span>
        </div>`;
      } else {
        // FIX: add oninput handler for live calculation on number fields
        const liveAttr = (f.type === 'number') ? `oninput="Stages.liveCalc('${batch.id}','${stage.key}',this.form)"` : '';
        input = `<input type="${f.type}" name="${f.key}" class="form-input" placeholder="${f.placeholder||''}" value="${val}" ${disabledAttr} ${liveAttr}>`;
      }

      return `<div class="form-row">
        <label class="form-label">${f.label}${req}</label>
        ${input}
      </div>`;
    }).join('');

    const canEdit  = !isLocked;
    const btnLabel = existing ? 'Actualizar Registro' : 'Guardar & Sellar Registro';
    const btnIcon  = existing ? '💾' : '🔒';

    wrap.innerHTML = `
      <div class="stage-form" id="stage-form-${stage.key}">
        <div class="stage-form-header" style="border-color:${stage.color}">
          <span class="stage-form-icon">${stage.icon}</span>
          <div>
            <div class="stage-form-title">${stage.label}</div>
            <div class="stage-form-desc">${stage.shortDesc}</div>
          </div>
          ${existing ? `<div class="stage-sealed-badge">🔒 Registrado ${_relTime(existing.timestamp)}</div>` : ''}
        </div>

        ${isLocked ? `<div class="stage-locked-msg">🔒 Completa las etapas anteriores antes de registrar esta.</div>` : ''}

        <form id="stage-form-el" onsubmit="Stages.submitForm(event,'${stage.key}','${batch.id}',${stageIdx})">
          <div class="form-grid">${fieldRows}</div>

          <div class="form-operator-row">
            <label class="form-label">Operario Responsable</label>
            <input type="text" name="_operator" class="form-input" placeholder="Nombre del responsable" value="${batch.responsiblePerson||''}" ${isLocked ? 'disabled' : ''} required>
          </div>

          ${canEdit ? `
          <div class="form-actions">
            <button type="submit" class="btn-save" style="background:${stage.color}20;border-color:${stage.color}80;color:${stage.color}">
              ${btnIcon} ${btnLabel}
            </button>
            ${existing ? `<div class="hash-display">
              <span class="hash-label">Hash</span>
              <span class="hash-val">${existing.hash}</span>
            </div>` : ''}
          </div>` : ''}
        </form>

        ${existing ? `
        <div class="immutable-notice">
          <div class="immutable-icon">🔗</div>
          <div>
            <div class="immutable-title">Registro Inmutable</div>
            <div class="immutable-text">
              Hash: <code>${existing.hash}</code> · Prev: <code>${existing.prevHash}</code><br>
              Registrado: ${new Date(existing.timestamp).toLocaleString('es-CR')} por ${existing.operator}<br>
              <span class="blockchain-status blockchain-${existing.blockchainStatus}">
                ${existing.blockchainStatus === 'anchored' ? '⛓ Anclado en blockchain' : '⏳ Pendiente de anclaje'}
              </span>
            </div>
          </div>
        </div>` : ''}
      </div>`;
  }

  // ── Live calculation update (on input change) ──
  function liveCalc(batchId, stageKey, form) {
    if (!form) return;
    const stage = CONFIG.stages.find(s => s.key === stageKey);
    if (!stage) return;
    const data = _gatherFormData(form, stage);

    // Inject harvest freshWeight for drying stage
    if (stageKey === 'drying' && !data.freshWeight) {
      const events    = DB.getEvents(batchId);
      const harvestEv = events.find(e => e.stageKey === 'harvest');
      if (harvestEv?.formData?.freshWeight) data._freshWeightFromHarvest = harvestEv.formData.freshWeight;
    }

    stage.fields.filter(f => f.type === 'calculated').forEach(f => {
      const el = document.getElementById('calc-' + f.key);
      if (!el) return;
      const val = _computeField(f, data);
      el.textContent = val !== null ? val.toFixed(1) + '%' : '—';
    });
  }

  // ── Submit form ────────────────────────────
  function submitForm(e, stageKey, batchId, stageIdx) {
    e.preventDefault();
    const form    = e.target;
    const stage   = CONFIG.stages.find(s => s.key === stageKey);
    const missing = [];

    const formData = _gatherFormData(form, stage, missing);

    if (missing.length > 0) {
      UI.toast(`⚠ Completa los campos obligatorios: ${missing.slice(0,2).join(', ')}${missing.length>2?'…':''}`, 'warn');
      return;
    }

    const operator = form.elements['_operator']?.value || 'Sistema';
    const event    = DB.addEvent(batchId, stageKey, formData, operator);

    // FIX: use reconcileBatch to derive the correct currentStage from actual events,
    // instead of manually advancing — this prevents stage getting out of sync
    DB.reconcileBatch(batchId);
    _checkCompliance(batchId, stageKey, formData);

    App.selectBatch(batchId);
    UI.toast(`✅ ${stage.label} registrado y sellado — Hash: ${event.hash.slice(0,14)}…`, 'success');
  }

  // ── Gather form data helper ─────────────────
  function _gatherFormData(form, stage, missing) {
    const data = {};
    stage.fields.forEach(f => {
      if (f.type === 'calculated') return;
      const el = form.elements[f.key];
      if (!el) return;
      const val = f.type === 'checkbox' ? (el.checked ? 'true' : 'false') : el.value;
      data[f.key] = val;
      if (missing && f.required && !val) missing.push(f.label);
    });
    return data;
  }

  // ── Computed field evaluator ───────────────
  function _computeField(field, data) {
    try {
      if (field.key === 'germinationRate') {
        const p = parseFloat(data.seedsPlanted), g = parseFloat(data.seedsGerminated);
        return (p > 0) ? (g / p) * 100 : null;
      }
      if (field.key === 'dryLoss') {
        const fw = parseFloat(data.freshWeight || data._freshWeightFromHarvest);
        const dw = parseFloat(data.dryWeight);
        return (fw > 0 && !isNaN(dw)) ? ((fw - dw) / fw) * 100 : null;
      }
      if (field.key === 'extractionYield') {
        const iw = parseFloat(data.inputWeight), ow = parseFloat(data.outputWeight);
        return (iw > 0) ? (ow / iw) * 100 : null;
      }
    } catch(e) { return null; }
    return null;
  }

  // ── Auto compliance flag check ─────────────
  function _checkCompliance(batchId, stageKey, data) {
    const batch = DB.getBatch(batchId);
    const flags = [...(batch.flags || [])];

    if (stageKey === 'quality') {
      if (parseFloat(data.thcTotal) > CONFIG.alerts.thcHempMax) {
        const flag = `⚠ THC ${data.thcTotal}% supera límite hemp (${CONFIG.alerts.thcHempMax}%)`;
        if (!flags.includes(flag)) flags.push(flag);
      }
      if (data.pesticidesPass === 'No pasa') {
        const flag = '⚠ Pesticidas fuera de límite — NO APTO para distribución';
        if (!flags.includes(flag)) flags.push(flag);
      }
    }
    if (stageKey === 'germination') {
      const rate = parseFloat(data.seedsGerminated) / parseFloat(data.seedsPlanted) * 100;
      if (!isNaN(rate) && rate < CONFIG.alerts.minGermRate) {
        const flag = `⚠ Tasa de germinación baja: ${rate.toFixed(0)}% (mínimo ${CONFIG.alerts.minGermRate}%)`;
        if (!flags.includes(flag)) flags.push(flag);
      }
    }
    if (stageKey === 'drying') {
      if (parseFloat(data.finalMoisture) > CONFIG.alerts.maxMoistureDry) {
        const flag = `⚠ Humedad final ${data.finalMoisture}% > límite ${CONFIG.alerts.maxMoistureDry}%`;
        if (!flags.includes(flag)) flags.push(flag);
      }
    }
    DB.updateBatch(batchId, { flags });
  }

  function _relTime(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
    if (d > 0) return `hace ${d}d`;
    if (h > 0) return `hace ${h}h`;
    if (m > 0) return `hace ${m}min`;
    return 'ahora';
  }

  return { renderPipeline, selectStage, renderStageForm, submitForm, liveCalc };
})();
