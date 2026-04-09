# 🔬 Woli Trace

> **Trazabilidad Semilla → Producto**
> Sistema de trazabilidad completo para cannabis medicinal y cáñamo industrial. Woli CBD S.A. · Costa Rica.

![Estado](https://img.shields.io/badge/estado-MVP%20funcional-brightgreen)
![Versión](https://img.shields.io/badge/versión-1.0.0-green)
![Regulación](https://img.shields.io/badge/regulación-SENASA%20%2F%20COMCANNABIS%20%2F%20MINSA-blue)
![Blockchain](https://img.shields.io/badge/blockchain-Polygon%20(planificado)-yellow)
![Licencia](https://img.shields.io/badge/licencia-privada-red)

---

## ¿Qué es Woli Trace?

Woli Trace es un sistema web de trazabilidad de ciclo completo para la industria del cáñamo y cannabis medicinal. Registra cada evento desde la semilla hasta la distribución, genera una **cadena de hash inmutable** por lote, y produce reportes de cumplimiento regulatorio exportables como PDF.

Está diseñado para cumplir con los requerimientos de **SENASA, COMCANNABIS y MINSA** en Costa Rica, con una arquitectura pensada para anclar los registros **on-chain** en Polygon como paso futuro.

---

## 🚀 Cómo correr el proyecto

No requiere instalación ni servidor.

```bash
# 1. Cloná el repositorio
git clone https://github.com/wolicbd/woli-trace.git
cd woli-trace

# 2. Abrí index.html en tu navegador
open index.html
```

Para resetear todos los datos:
```javascript
// Pegá en la consola del navegador (F12)
localStorage.removeItem('wolitrace_batches_v1');
localStorage.removeItem('wolitrace_events_v1');
location.reload();
```

---

## 🌱 Pipeline de Trazabilidad — 11 Etapas

Cada lote recorre el siguiente ciclo. Cada etapa genera un registro sellado con hash encadenado al anterior.

| # | Etapa | Icono | Descripción |
|---|-------|-------|-------------|
| 1 | Semilla | 🌱 | Registro de semilla, origen genético, lote y certificación orgánica |
| 2 | Germinación | 🪴 | Método, fechas, temperatura, humedad y tasa de germinación |
| 3 | Vivero | 🌿 | Trasplante, sustrato, luz, pH, EC, insumos aplicados |
| 4 | Vegetación | 🌳 | Ambiente, técnicas de entrenamiento, nutrientes, IPM, temperatura/humedad |
| 5 | Floración | 🌸 | Ciclo de luz, VPD, desarrollo de capullo, verificación de tricomas |
| 6 | Cosecha | ✂️ | Fecha/hora, peso fresco, método, testigos, notificación a SENASA |
| 7 | Secado/Curado | 🌬️ | Temperatura/humedad sala, peso seco, % pérdida, curado en frasco |
| 8 | Procesamiento | ⚗️ | Tipo de extracción, rendimiento, solventes, socio procesador, GMP |
| 9 | Control de Calidad | 🔬 | COA completo: cannabinoides, pesticidas, microbiológico, metales pesados |
| 10 | Empaque | 📦 | Tipo de empaque, unidades, código de lote, vencimiento, etiqueta MINSA |
| 11 | Distribución | 🚚 | Despacho, destinatario, factura, transportista, recepción |

---

## 🔗 Sistema de Hash e Inmutabilidad

Cada evento registrado genera un **hash único** derivado de:
- Los datos del formulario
- El timestamp de registro
- El hash del evento anterior (`prevHash`)

Esto crea una **cadena de bloques local** que detecta cualquier modificación retroactiva. Los registros están marcados como `⏳ Pendiente de anclaje` hasta que se integre el ancla en Polygon.

```
Hash Evento 1 → Hash Evento 2 → Hash Evento 3 → ... → Hash Evento N
(prevHash: 0x00)   (prevHash: hash1)   (prevHash: hash2)
```

---

## ✅ Panel de Cumplimiento Regulatorio

Cada etapa incluye checklists de cumplimiento que se evalúan automáticamente donde es posible:

| Check | Evaluación automática |
|-------|----------------------|
| THC ≤ 0.3% (hemp) | ✅ Auto — lee el campo `thcTotal` |
| Pesticidas dentro de límite | ✅ Auto — lee resultado del COA |
| Tasa de germinación ≥ 70% | ✅ Auto — calcula del formulario |
| Humedad final ≤ 12% | ✅ Auto — lee `finalMoisture` |
| Licencias, actas, notificaciones | ⏳ Manual — confirmado por el operario |

Los ítems fallidos generan **alertas de lote** visibles en la barra lateral.

---

## 📤 Exportación

| Formato | Descripción |
|---------|-------------|
| **PDF (HTML print)** | Reporte completo por lote con todos los eventos, hashes y metadatos |
| **CSV** | Exportación de todos los lotes activos para análisis en Excel |
| **QR por lote** | Código QR imprimible con ID, cadena de hash y datos del lote |

---

## 🗂 Estructura del Proyecto

```
woli-trace/
├── index.html               # SPA entry point
├── vercel.json              # Configuración de deploy
├── README.md
│
├── css/
│   ├── base.css             # Variables, reset, topbar, modales, toast
│   ├── layout.css           # App grid, sidebar, main panel, responsive
│   ├── components.css       # Pipeline, stage form, timeline, compliance, QR
│   ├── forms.css            # Inputs, selects, textareas, botones
│   └── animations.css       # @keyframes fadeIn, slideIn
│
└── js/
    ├── config.js            # ⚙️  Definición completa de 11 etapas + campos + compliance
    ├── db.js                # 💾 CRUD de lotes y eventos, hash chain, localStorage
    ├── stages.js            # 🌿 Pipeline renderer, formularios por etapa, cálculos
    ├── batch.js             # 📋 Cards del sidebar, detalle de lote
    ├── timeline.js          # 📜 Historial de eventos con edición y borrado
    ├── compliance.js        # ✅ Evaluación de checks regulatorios por etapa
    ├── qr.js                # 🔲 Generador de QR por lote (qrcodejs)
    ├── export.js            # 📤 Reporte HTML/PDF y CSV de todos los lotes
    ├── ui.js                # 🖥️  Toast, modales
    ├── app.js               # 🎮 Controlador principal: filtros, búsqueda, acciones
    └── main.js              # 🚀 Boot: seed demo, reconcile, render inicial
```

### Dependencias entre módulos

```
config.js  ←──────────────────────── (base de todo)
db.js      ← config
stages.js  ← config, db, ui, app
batch.js   ← config, db, stages, timeline, compliance, qr, app
timeline.js← config, db, stages, ui, app
compliance.js ← config, db
qr.js      ← db
export.js  ← config, db
app.js     ← config, db, batch, export, qr, ui
main.js    ← db, app                (boot)
```

---

## 🔧 Personalización

Todo el sistema se configura desde `js/config.js`:

```javascript
// Cambiar umbrales de alertas
alerts: {
  thcHempMax:     0.3,   // % THC límite para hemp
  minGermRate:    70,    // % mínimo de germinación
  maxMoistureDry: 12,    // % humedad máxima post-secado
}

// Agregar una etapa nueva — solo agregar al array stages[]
{
  key:      'nueva_etapa',
  label:    'Mi Etapa',
  icon:     '🧪',
  color:    '#ff6600',
  shortDesc:'Descripción corta',
  fields:   [ /* campos */ ],
  compliance: [ /* checks */ ],
}
```

---

## 📦 Dependencias externas

| Librería | Versión | CDN | Propósito |
|----------|---------|-----|-----------|
| qrcodejs | 1.0.0 | cdnjs | Generación de QR por lote |
| Google Fonts | — | fonts.googleapis.com | Playfair Display, DM Sans, DM Mono |

Sin npm. Sin bundler. Sin frameworks.

---

## 🔗 Roadmap Blockchain

| Fase | Estado | Descripción |
|------|--------|-------------|
| 🟢 MVP local | ✅ Completo | Hash chain local en localStorage, UI completa |
| 🔵 Ancla on-chain | 📋 Planificado | Polygon — hash de cada evento → ERC-721 o calldata |
| 🟡 NFT por lote | 📋 Planificado | NFT Soulbound por lote completo con todos los hashes |
| 🔴 API pública | 📋 Futuro | Endpoint de verificación pública de autenticidad del lote |

---

## 📋 Tipos de cultivo soportados

- **Cáñamo Industrial (CBD)** — Ley 9566, regulado por SENASA
- **Cannabis Medicinal (THC)** — Ley 9459, regulado por COMCANNABIS / MINSA
- **Híbrido CBD/THC** — Combinación de perfiles

---

## 🌿 Sobre Woli CBD

Woli Trace es desarrollado por **Woli CBD S.A.**, empresa costarricense de cáñamo industrial.

🌐 [wolicbd.com](https://wolicbd.com)

---

## 📄 Licencia

Proyecto privado — © 2025 Woli CBD S.A. · Todos los derechos reservados.

---

<div align="center">
  <b>🔬 WOLI TRACE · SEMILLA → PRODUCTO</b><br/>
  <sub>v1.0.0 · Costa Rica · SENASA / COMCANNABIS / MINSA · wolicbd.com</sub>
</div>
