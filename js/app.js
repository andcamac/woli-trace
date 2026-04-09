/* ═══════════════════════════════════════════════
   APP — Application Controller
   Woli Trace · Trazabilidad Semilla → Producto
═══════════════════════════════════════════════ */
'use strict';

const App = (() => {

  let _currentBatchId = null;
  let _currentFilter  = 'all';
  let _currentQuery   = '';

  // ── Sidebar toggle (mobile) ────────────────
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isOpen  = sidebar.classList.contains('sidebar-open');
    sidebar.classList.toggle('sidebar-open', !isOpen);
    if (overlay) overlay.classList.toggle('sidebar-overlay-show', !isOpen);
  }

  function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('sidebar-open');
    document.getElementById('sidebar-overlay')?.classList.remove('sidebar-overlay-show');
  }

  // ── Refresh sidebar ────────────────────────
  function refreshList() {
    // FIX: always reconcile all batches before rendering list
    // so that event counts and stage labels are always in sync
    DB.reconcileAll();

    const batches = _currentQuery
      ? DB.searchBatches(_currentQuery)
      : DB.filterBatches(_currentFilter);
    Batch.renderList(batches);
  }

  // ── Select a batch ─────────────────────────
  function selectBatch(id) {
    _currentBatchId = id;
    Batch.renderDetail(id);
    refreshList(); // re-render sidebar to highlight active card
    // Scroll main panel to top
    const panel = document.getElementById('main-panel');
    if (panel) panel.scrollTop = 0;
    // Close sidebar on mobile
    closeSidebar();
  }

  // ── Filter & search ─────────────────────────
  function filter(status, btn) {
    _currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    _currentQuery = '';
    document.getElementById('search-input').value = '';
    refreshList();
  }

  function search(query) {
    _currentQuery = query;
    if (query) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    } else {
      // Restore the active filter button
      document.querySelectorAll('.filter-btn').forEach(b => {
        const map = { all:'Todos', active:'Activos', complete:'Completos' };
        if (b.textContent.trim() === map[_currentFilter]) b.classList.add('active');
      });
    }
    refreshList();
  }

  // ── New batch modal ─────────────────────────
  function openNewBatch() {
    const ctOptions = CONFIG.cultivationTypes.map(c =>
      `<option value="${c.key}">${c.label}</option>`).join('');

    const html = `
      <form id="new-batch-form" onsubmit="App.createBatch(event)">
        <div class="form-grid">
          <div class="form-row">
            <label class="form-label">Nombre del Lote <span class="req">*</span></label>
            <input type="text" name="name" class="form-input" placeholder="Ej: Cannatonic CBD Premium — Lote 01" required>
          </div>
          <div class="form-row">
            <label class="form-label">Cepa / Variedad <span class="req">*</span></label>
            <input type="text" name="strain" class="form-input" placeholder="Ej: Cannatonic, Charlotte's Web, ACDC" required>
          </div>
          <div class="form-row">
            <label class="form-label">Tipo de Cultivo <span class="req">*</span></label>
            <select name="cultivationType" class="form-select" required>${ctOptions}</select>
          </div>
          <div class="form-row">
            <label class="form-label">Responsable Principal <span class="req">*</span></label>
            <input type="text" name="responsiblePerson" class="form-input" placeholder="Nombre completo" required>
          </div>
          <div class="form-row">
            <label class="form-label">Ubicación / Finca</label>
            <input type="text" name="location" class="form-input" placeholder="Ej: Finca Woli — Cartago">
          </div>
          <div class="form-row">
            <label class="form-label">Notas Iniciales</label>
            <textarea name="notes" class="form-textarea" rows="2" placeholder="Propósito del lote, observaciones iniciales..."></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-save" style="background:rgba(45,122,79,.2);border-color:rgba(76,175,120,.5);color:#4caf78">
            🌱 Crear Lote y Comenzar Trazabilidad
          </button>
        </div>
      </form>`;

    UI.openModal('Nuevo Lote de Trazabilidad', html);
  }

  function createBatch(e) {
    e.preventDefault();
    const f    = e.target;
    const data = {
      name:             f.elements.name.value,
      strain:           f.elements.strain.value,
      cultivationType:  f.elements.cultivationType.value,
      responsiblePerson:f.elements.responsiblePerson.value,
      location:         f.elements.location.value,
      notes:            f.elements.notes.value,
    };
    const batch = DB.createBatch(data);
    UI.closeModalBtn();
    refreshList();
    selectBatch(batch.id);
    UI.toast(`✅ Lote ${batch.id} creado. ¡Registra la primera etapa!`, 'success');
  }

  // ── Export ─────────────────────────────────
  function exportReport() {
    Export.allBatchesCSV();
    UI.toast('📥 CSV exportado', 'success');
  }

  function exportBatchPDF() {
    if (!_currentBatchId) { UI.toast('Selecciona un lote primero', 'warn'); return; }
    Export.batchReport(_currentBatchId);
  }

  // ── QR Scanner ─────────────────────────────
  function openScanner() {
    if (!_currentBatchId) { UI.toast('Selecciona un lote para ver su QR', 'warn'); return; }
    QRGen.showModal(_currentBatchId);
  }

  // ── Delete batch ───────────────────────────
  function deleteBatch(id) {
    const batch      = DB.getBatch(id);
    if (!batch) return;
    const eventCount = DB.getEvents(id).length;
    const msg = `¿Eliminar el lote ${id}?\n\n"${batch.name || batch.strain}"\n\n${eventCount} evento(s) registrado(s) serán eliminados permanentemente.\n\nEsta acción no se puede deshacer.`;
    if (!confirm(msg)) return;

    DB.deleteBatch(id);

    if (_currentBatchId === id) {
      _currentBatchId = null;
      document.getElementById('batch-detail').classList.add('hidden');
      document.getElementById('empty-state').classList.remove('hidden');
    }

    refreshList();
    UI.toast(`🗑 Lote ${id} eliminado`, 'warn');
  }

  // ── Modal helpers ───────────────────────────
  function closeModal(e)     { UI.closeModal(e); }
  function closeModalBtn()   { UI.closeModalBtn(); }
  function closeQRModal(e)   {
    if (e?.target === document.getElementById('qr-modal-overlay'))
      document.getElementById('qr-modal-overlay').className = 'modal-hidden';
  }
  function closeQRModalBtn() { document.getElementById('qr-modal-overlay').className = 'modal-hidden'; }

  return {
    refreshList, selectBatch, filter, search,
    openNewBatch, createBatch,
    exportReport, exportBatchPDF,
    openScanner, deleteBatch,
    toggleSidebar, closeSidebar,
    closeModal, closeModalBtn, closeQRModal, closeQRModalBtn,
  };
})();
