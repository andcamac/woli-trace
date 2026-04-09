/* ═══════════════════════════════════════════════
   QR — QR Code Generator per Batch
   Woli Trace · Trazabilidad Semilla → Producto
═══════════════════════════════════════════════ */
'use strict';

const QRGen = (() => {

  function renderInline(batchId, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    try {
      new QRCode(el, {
        text: `WOLI-TRACE:${batchId}:${window.location.origin}`,
        width:  72,
        height: 72,
        colorDark:  '#1a4a2e',
        colorLight: '#f5f0e8',
        correctLevel: QRCode.CorrectLevel.M,
      });
    } catch(e) {
      el.innerHTML = `<div class="qr-fallback">${batchId}</div>`;
    }
  }

  function showModal(batchId) {
    const batch = DB.getBatch(batchId);
    if (!batch) return;
    const body = document.getElementById('qr-modal-body');
    body.innerHTML = `
      <div class="qr-modal-content">
        <div id="qr-large"></div>
        <div class="qr-batch-id">${batch.id}</div>
        <div class="qr-batch-name">${batch.name || batch.strain}</div>
        <div class="qr-info">
          <div>🌱 ${batch.strain} · ${batch.cultivationType}</div>
          <div>📍 ${batch.location || '—'}</div>
          <div>👤 ${batch.responsiblePerson || '—'}</div>
          <div>📅 Creado: ${new Date(batch.createdAt).toLocaleDateString('es-CR')}</div>
        </div>
        <div class="qr-hash-chain">
          <div class="qr-hash-title">🔗 Cadena de Hash (${batch.hashChain?.length || 0} eventos)</div>
          ${(batch.hashChain || []).slice(-3).map(h => `<code class="qr-hash-item">${h}</code>`).join('')}
        </div>
        <button class="qr-print-btn" onclick="window.print()">🖨 Imprimir Etiqueta QR</button>
      </div>`;

    try {
      new QRCode(document.getElementById('qr-large'), {
        text: `WOLI-TRACE:${batchId}`,
        width: 200, height: 200,
        colorDark: '#0a1f10', colorLight: '#f5f0e8',
        correctLevel: QRCode.CorrectLevel.H,
      });
    } catch(e) {}

    document.getElementById('qr-modal-overlay').className = 'modal-show';
  }

  return { renderInline, showModal };
})();
