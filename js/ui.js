/* ═══════════════════════════════════════════════
   UI — Toast, Modal, Utilities
   Woli Trace · Trazabilidad Semilla → Producto
═══════════════════════════════════════════════ */
'use strict';

const UI = (() => {
  let _toastT = null;

  function toast(msg, type = 'info') {
    const el  = document.getElementById('toast');
    el.textContent = msg;
    el.className   = `toast-show toast-${type}`;
    clearTimeout(_toastT);
    _toastT = setTimeout(() => el.className = '', 3200);
  }

  function openModal(title, bodyHTML) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML    = bodyHTML;
    document.getElementById('modal-overlay').className = 'modal-show';
  }

  function closeModal(e) {
    if (e?.target !== document.getElementById('modal-overlay')) return;
    closeModalBtn();
  }

  function closeModalBtn() {
    document.getElementById('modal-overlay').className = 'modal-hidden';
  }

  return { toast, openModal, closeModal, closeModalBtn };
})();
