/* ═══════════════════════════════════════════════
   EXPORT — Print/HTML Report Generator
   Woli Trace · Trazabilidad Semilla → Producto
═══════════════════════════════════════════════ */
'use strict';

const Export = (() => {

  function batchReport(batchId) {
    const batch  = DB.getBatch(batchId);
    const events = DB.getEvents(batchId);
    if (!batch) return;

    const stagesHTML = events.map(ev => {
      const stage  = CONFIG.stages.find(s => s.key === ev.stageKey);
      const fields = stage?.fields || [];
      const rows   = fields.map(f => {
        const v = ev.formData?.[f.key];
        if (!v || f.type === 'calculated') return '';
        return `<tr><td class="rpt-field">${f.label}</td><td class="rpt-val">${v}</td></tr>`;
      }).filter(Boolean).join('');

      return `
        <div class="rpt-stage">
          <div class="rpt-stage-header">${stage?.icon || ''} ${ev.stageLabel}</div>
          <div class="rpt-stage-meta">
            Registrado: ${new Date(ev.timestamp).toLocaleString('es-CR')} · Operario: ${ev.operator}
          </div>
          <table class="rpt-table">${rows}</table>
          <div class="rpt-hash">Hash: ${ev.hash} · Prev: ${ev.prevHash}</div>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Trazabilidad — ${batch.id}</title>
<style>
  body{font-family:'DM Sans',Arial,sans-serif;color:#1a1a1a;max-width:900px;margin:0 auto;padding:2rem}
  .rpt-header{border-bottom:3px solid #2d7a4f;padding-bottom:1rem;margin-bottom:2rem;display:flex;justify-content:space-between;align-items:flex-start}
  .rpt-logo{font-size:1.5rem;font-weight:900;color:#1a4a2e}
  .rpt-logo span{color:#4caf78}
  .rpt-batch-id{font-family:monospace;font-size:1.8rem;font-weight:900;color:#1a4a2e}
  .rpt-batch-name{font-size:1.1rem;color:#444;margin-top:.25rem}
  .rpt-meta{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;background:#f0f9f4;padding:1rem;border-radius:8px;margin-bottom:2rem}
  .rpt-meta-item .k{font-size:.7rem;color:#888;text-transform:uppercase;letter-spacing:.05em}
  .rpt-meta-item .v{font-size:.95rem;font-weight:500;color:#1a1a1a}
  .rpt-stage{margin-bottom:1.5rem;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden}
  .rpt-stage-header{background:#1a4a2e;color:#fff;padding:.6rem 1rem;font-weight:700;font-size:.95rem}
  .rpt-stage-meta{padding:.4rem 1rem;font-size:.75rem;color:#888;background:#f9f9f9;border-bottom:1px solid #eee}
  .rpt-table{width:100%;border-collapse:collapse;padding:0 1rem}
  .rpt-field{padding:.3rem 1rem;font-size:.8rem;color:#555;width:40%;border-bottom:1px solid #f0f0f0}
  .rpt-val{padding:.3rem 1rem;font-size:.8rem;font-weight:500;border-bottom:1px solid #f0f0f0}
  .rpt-hash{font-family:monospace;font-size:.65rem;color:#888;padding:.4rem 1rem;background:#fafafa;border-top:1px solid #eee}
  .rpt-flags{background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:1rem;margin-bottom:1.5rem}
  .rpt-flags h3{color:#856404;margin:0 0 .5rem}
  .rpt-flag{font-size:.85rem;color:#856404;padding:.25rem 0}
  .rpt-footer{margin-top:3rem;padding-top:1rem;border-top:1px solid #eee;font-size:.75rem;color:#aaa;text-align:center}
  @media print{body{padding:1rem}}
</style>
</head>
<body>
<div class="rpt-header">
  <div>
    <div class="rpt-logo">WOLI <span>TRACE</span></div>
    <div style="font-size:.75rem;color:#888">Trazabilidad Semilla → Producto · ${CONFIG.company}</div>
    <div style="font-size:.75rem;color:#888">Generado: ${new Date().toLocaleString('es-CR')}</div>
  </div>
  <div style="text-align:right">
    <div class="rpt-batch-id">${batch.id}</div>
    <div class="rpt-batch-name">${batch.name || batch.strain}</div>
    <div style="font-size:.8rem;color:#2d7a4f;margin-top:.25rem">${batch.status === 'complete' ? '✅ CICLO COMPLETO' : '🔄 EN PROGRESO'}</div>
  </div>
</div>

<div class="rpt-meta">
  <div class="rpt-meta-item"><div class="k">Cepa / Variedad</div><div class="v">${batch.strain}</div></div>
  <div class="rpt-meta-item"><div class="k">Tipo de Cultivo</div><div class="v">${batch.cultivationType}</div></div>
  <div class="rpt-meta-item"><div class="k">Responsable</div><div class="v">${batch.responsiblePerson}</div></div>
  <div class="rpt-meta-item"><div class="k">Ubicación</div><div class="v">${batch.location || '—'}</div></div>
  <div class="rpt-meta-item"><div class="k">Fecha Inicio</div><div class="v">${new Date(batch.createdAt).toLocaleDateString('es-CR')}</div></div>
  <div class="rpt-meta-item"><div class="k">Eventos Registrados</div><div class="v">${events.length}</div></div>
</div>

${batch.flags?.length > 0 ? `<div class="rpt-flags"><h3>⚠ Alertas del Lote</h3>${batch.flags.map(f=>`<div class="rpt-flag">${f}</div>`).join('')}</div>` : ''}

${stagesHTML}

<div class="rpt-footer">
  ${CONFIG.appName} v${CONFIG.version} · ${CONFIG.company} · ${CONFIG.country} · Regulado por ${CONFIG.regBody}
  <br>Hash Chain: ${(batch.hashChain||[]).join(' → ').slice(0,120)}…
  <br>Este documento es un registro de trazabilidad oficial. Conservar por mínimo 5 años.
</div>
</body></html>`;

    const win = window.open('', '_blank');
    if (!win) {
      // Popup blocked — offer download as blob instead
      const blob = new Blob([html], { type: 'text/html' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `woli-trace-${batch.id}.html`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  }

  function allBatchesCSV() {
    const batches = DB.getBatches();
    const headers = ['ID','Nombre','Cepa','Tipo','Responsable','Ubicación','Estado','Etapa Actual','Eventos','Creado'];
    const rows    = batches.map(b => [
      b.id, b.name||'', b.strain||'', b.cultivationType||'', b.responsiblePerson||'',
      b.location||'', b.status, b.currentStage,
      DB.getEvents(b.id).length,
      new Date(b.createdAt).toLocaleDateString('es-CR'),
    ].map(v => `"${v}"`).join(','));
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url; a.download = `woli-trace-export-${Date.now()}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  return { batchReport, allBatchesCSV };
})();
