/* ═══════════════════════════════════════════════
   MAIN — Boot
   Woli Trace · Trazabilidad Semilla → Producto
═══════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Seed demo data on first load
  DB.seedDemoData();

  // FIX: reconcile ALL existing batches so currentStage/status always matches
  // the actual saved events. This fixes any data left in inconsistent state
  // from previous sessions or previous versions of the app.
  DB.reconcileAll();

  // Load sidebar
  App.refreshList();

  // Auto-select first batch if any
  const batches = DB.getBatches();
  if (batches.length > 0) App.selectBatch(batches[0].id);
});
