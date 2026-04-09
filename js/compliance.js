/* ═══════════════════════════════════════════════
   COMPLIANCE — Regulatory Panel Renderer
   Woli Trace · Trazabilidad Semilla → Producto
═══════════════════════════════════════════════ */
'use strict';

const Compliance = (() => {

  function render(batchId) {
    const grid   = document.getElementById('compliance-grid');
    const batch  = DB.getBatch(batchId);
    const events = DB.getEvents(batchId);
    if (!grid || !batch) return;

    // Build a map of formData by stageKey for cross-stage lookups
    const stageDataMap = {};
    events.forEach(e => { stageDataMap[e.stageKey] = e.formData; });

    // Build compliance status per stage
    const rows = CONFIG.stages.map(stage => {
      const ev      = events.filter(e => e.stageKey === stage.key).slice(-1)[0];
      const checks  = stage.compliance || [];
      if (checks.length === 0) return '';

      const checkRows = checks.map(c => {
        // Auto-evaluate what we can; pass stageDataMap for cross-stage lookups
        const status = ev ? _evalCheck(c, ev.formData, stage, stageDataMap) : 'pending';
        const icon   = status === 'pass' ? '✅' : status === 'fail' ? '❌' : status === 'na' ? '➖' : '⏳';
        const cls    = `comp-check comp-${status}`;
        return `<div class="${cls}">
          <span class="comp-icon">${icon}</span>
          <span class="comp-label">${c.label}</span>
          ${c.required ? '<span class="comp-req">obligatorio</span>' : '<span class="comp-opt">opcional</span>'}
        </div>`;
      }).join('');

      const allPass  = ev && checks.filter(c=>c.required).every(c => _evalCheck(c, ev.formData, stage, stageDataMap) !== 'fail');
      const headerCls = ev ? (allPass ? 'comp-stage-ok' : 'comp-stage-warn') : 'comp-stage-pending';

      return `<div class="comp-stage ${headerCls}">
        <div class="comp-stage-header">
          <span>${stage.icon} ${stage.label}</span>
          <span class="comp-stage-badge">${ev ? (allPass ? '✅ OK' : '⚠ Revisar') : '⏳ Pendiente'}</span>
        </div>
        <div class="comp-checks">${checkRows}</div>
      </div>`;
    }).join('');

    // Flags banner
    const flagsBanner = batch.flags?.length > 0
      ? `<div class="flags-banner">
          <div class="flags-title">⚠ Alertas del Lote</div>
          ${batch.flags.map(f => `<div class="flag-item">${f}</div>`).join('')}
        </div>` : '';

    // Overall score
    const totalReq  = CONFIG.stages.flatMap(s => s.compliance || []).filter(c => c.required).length;
    const doneStages = CONFIG.stages.filter(s => events.some(e => e.stageKey === s.key));
    const passedReq = doneStages.reduce((n, s) => {
      const ev = events.filter(e => e.stageKey === s.key).slice(-1)[0];
      if (!ev) return n;
      return n + (s.compliance||[]).filter(c => c.required && _evalCheck(c,ev.formData,s,stageDataMap) === 'pass').length;
    }, 0);

    grid.innerHTML = `
      ${flagsBanner}
      <div class="comp-summary">
        <div class="comp-score">
          <div class="comp-score-num">${passedReq}/${totalReq}</div>
          <div class="comp-score-lbl">Checks obligatorios aprobados</div>
        </div>
        <div class="comp-blockchain-note">
          🔗 ${CONFIG.blockchain.note}
        </div>
      </div>
      <div class="comp-grid">${rows}</div>`;
  }

  function _evalCheck(check, data, stage, stageDataMap) {
    if (!data) return 'pending';
    stageDataMap = stageDataMap || {};
    // Specific auto-evaluations
    if (check.key === 'thcCompliant') {
      const thc = parseFloat(data.thcTotal);
      if (isNaN(thc)) return 'pending';
      return thc <= CONFIG.alerts.thcHempMax ? 'pass' : 'fail';
    }
    if (check.key === 'pestPass' || check.key === 'pesticidesPass') {
      if (!data.pesticidesPass) return 'pending';
      return data.pesticidesPass === 'Pasa (ND / < límite)' ? 'pass' : 'fail';
    }
    if (check.key === 'microPass' || check.key === 'microPass2') {
      if (!data.microPass) return 'pending';
      return data.microPass === 'Pasa' ? 'pass' : data.microPass === 'No analizado' ? 'na' : 'fail';
    }
    if (check.key === 'targetReached') {
      const m = parseFloat(data.finalMoisture);
      if (isNaN(m)) return 'pending';
      return m <= CONFIG.alerts.maxMoistureDry ? 'pass' : 'fail';
    }
    if (check.key === 'rateAccept') {
      const rate = parseFloat(data.seedsGerminated) / parseFloat(data.seedsPlanted) * 100;
      if (isNaN(rate)) return 'pending';
      return rate >= CONFIG.alerts.minGermRate ? 'pass' : 'fail';
    }
    // If data exists for this stage, assume manual checks are pending (user must confirm)
    return 'pending';
  }

  return { render };
})();
