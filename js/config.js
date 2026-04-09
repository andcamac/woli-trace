/* ═══════════════════════════════════════════════════
   CONFIG — System Configuration & Stage Definitions
   Woli Trace · Trazabilidad Semilla → Producto
   Woli CBD S.A. · Costa Rica
═══════════════════════════════════════════════════ */
'use strict';

const CONFIG = Object.freeze({

  appName:    'Woli Trace',
  version:    '1.0.0',
  company:    'Woli CBD S.A.',
  country:    'Costa Rica',
  regBody:    'SENASA / COMCANNABIS / MINSA',
  labPartner: 'Argus Lab',

  // ── Cultivation types ──────────────────────
  cultivationTypes: [
    { key: 'hemp_cbd',   label: 'Cáñamo Industrial (CBD)',     color: '#4caf78' },
    { key: 'medicinal',  label: 'Cannabis Medicinal (THC)',    color: '#c8a84b' },
    { key: 'hybrid',     label: 'Híbrido CBD/THC',            color: '#8fd4a8' },
  ],

  // ── Growth environments ────────────────────
  environments: [
    'Interior (Indoor)',
    'Exterior (Outdoor)',
    'Invernadero (Greenhouse)',
    'Hidropónico',
    'Aeropónico',
  ],

  // ── Organic certifications ─────────────────
  certifications: [
    'SENASA Orgánico',
    'EU Organic',
    'USDA Organic',
    'Sin certificación',
    'En proceso',
  ],

  // ── THE FULL TRACEABILITY PIPELINE ────────
  // Each stage has a unique key, fields to capture, and compliance requirements.
  stages: [
    {
      key:      'seed',
      label:    'Semilla',
      icon:     '🌱',
      color:    '#2d7a4f',
      shortDesc:'Registro de semilla y origen genético',
      fields: [
        { key:'seedLot',      label:'Número de Lote Semilla',   type:'text',   required:true,  placeholder:'SL-2025-001' },
        { key:'seedOrigin',   label:'Origen / Proveedor',       type:'text',   required:true,  placeholder:'Ej: Dinafem, Royal Queen Seeds' },
        { key:'strain',       label:'Cepa / Variedad',          type:'text',   required:true,  placeholder:'Ej: Cannatonic, Charlotte\'s Web' },
        { key:'seedType',     label:'Tipo de Semilla',          type:'select', required:true,
          options:['Feminizada','Regular','Automática','Clon'] },
        { key:'seedCount',    label:'Cantidad de Semillas',     type:'number', required:true,  placeholder:'Ej: 100' },
        { key:'thcGenetics',  label:'THC Genético Estimado (%)',type:'number', required:false, placeholder:'Ej: 0.2' },
        { key:'cbdGenetics',  label:'CBD Genético Estimado (%)',type:'number', required:false, placeholder:'Ej: 18' },
        { key:'certOrganic',  label:'Certificación Orgánica',   type:'select', required:true,
          options:['SENASA Orgánico','EU Organic','USDA Organic','Sin certificación','En proceso'] },
        { key:'seedNotes',    label:'Notas / Observaciones',    type:'textarea',required:false, placeholder:'Condiciones de almacenamiento, test de viabilidad, etc.' },
        { key:'attachments',  label:'Documentos (COA semilla, factura)', type:'file_ref', required:false },
      ],
      compliance: [
        { key:'seedLicense',  label:'Licencia de semilla registrada en SENASA', required:true  },
        { key:'originDoc',    label:'Documentación de origen del proveedor',    required:true  },
        { key:'cbdLimit',     label:'THC genético confirmado < 0.3% (hemp)',    required:false },
      ],
    },

    {
      key:      'germination',
      label:    'Germinación',
      icon:     '🪴',
      color:    '#3a8d5a',
      shortDesc:'Condiciones de germinación y tasa de éxito',
      fields: [
        { key:'germinationMethod', label:'Método de Germinación',    type:'select', required:true,
          options:['Papel húmedo','Plugs de coco','Lana de roca','Tierra directa','Agua'] },
        { key:'startDate',       label:'Fecha de Inicio',           type:'date',   required:true  },
        { key:'germinationTemp', label:'Temperatura Promedio (°C)', type:'number', required:true,  placeholder:'22' },
        { key:'germinationHum',  label:'Humedad Relativa (%)',      type:'number', required:true,  placeholder:'70' },
        { key:'seedsPlanted',    label:'Semillas Sembradas',        type:'number', required:true  },
        { key:'seedsGerminated', label:'Semillas Germinadas',       type:'number', required:true  },
        { key:'germinationRate', label:'Tasa de Germinación (%)',   type:'calculated', formula:'(seedsGerminated/seedsPlanted)*100' },
        { key:'germNotes',       label:'Observaciones',             type:'textarea',required:false },
      ],
      compliance: [
        { key:'tempLog',    label:'Registro de temperatura documentado',  required:true  },
        { key:'rateAccept', label:'Tasa de germinación ≥ 70%',           required:false },
      ],
    },

    {
      key:      'nursery',
      label:    'Vivero',
      icon:     '🌿',
      color:    '#4caf78',
      shortDesc:'Etapa de plántula y trasplante inicial',
      fields: [
        { key:'transplantDate',  label:'Fecha de Trasplante',        type:'date',   required:true  },
        { key:'substrateType',   label:'Tipo de Sustrato',           type:'select', required:true,
          options:['Coco + perlita','Tierra orgánica','Hidro NFT','Aero','Mixto'] },
        { key:'potSize',         label:'Tamaño de Maceta/Contenedor',type:'text',   required:true,  placeholder:'Ej: 1L, 3L, rockwool 4x4' },
        { key:'lightSource',     label:'Fuente de Luz',              type:'select', required:true,
          options:['LED 18/6','CFL 18/6','T5 18/6','Luz solar','HID MH'] },
        { key:'plantCount',      label:'Número de Plantas',          type:'number', required:true  },
        { key:'nurseryDays',     label:'Días en Vivero',             type:'number', required:true  },
        { key:'irrigationMethod',label:'Sistema de Riego',           type:'select', required:true,
          options:['Manual','Goteo','NFT','Aeropónico','Inundación'] },
        { key:'phRange',         label:'Rango de pH agua/sustrato',  type:'text',   required:true,  placeholder:'Ej: 6.0 - 6.5' },
        { key:'ecRange',         label:'EC / TDS (mS/cm)',           type:'text',   required:false, placeholder:'Ej: 0.8 - 1.2' },
        { key:'inputsUsed',      label:'Insumos / Nutrientes aplicados', type:'textarea', required:false, placeholder:'Nombre, dosis, marca...' },
        { key:'nurseryNotes',    label:'Observaciones de salud',     type:'textarea',required:false },
      ],
      compliance: [
        { key:'organicInputs',  label:'Solo insumos orgánicos certificados', required:true  },
        { key:'phLog',          label:'Registro de pH documentado',          required:true  },
        { key:'inputList',      label:'Lista de insumos con fichas de seguridad', required:true },
      ],
    },

    {
      key:      'vegetation',
      label:    'Vegetación',
      icon:     '🌳',
      color:    '#58c87a',
      shortDesc:'Fase vegetativa — crecimiento activo',
      fields: [
        { key:'vegStartDate',    label:'Fecha Inicio Vegetativa',    type:'date',   required:true  },
        { key:'vegDays',         label:'Días en Vegetativa',         type:'number', required:true  },
        { key:'environment',     label:'Ambiente de Cultivo',        type:'select', required:true,
          options:['Interior (Indoor)','Exterior (Outdoor)','Invernadero','Hidropónico','Aeropónico'] },
        { key:'canopySize',      label:'Tamaño del Dosel (m²)',      type:'number', required:false },
        { key:'trainingMethod',  label:'Técnica de Entrenamiento',   type:'select', required:false,
          options:['Sin entrenamiento','LST','Topping','FIM','SCROG','SOG','Supercropping'] },
        { key:'lightCycle',      label:'Ciclo de Luz',               type:'text',   required:true,  placeholder:'18/6 o luz solar' },
        { key:'avgTemp',         label:'Temperatura Promedio (°C)',  type:'number', required:true  },
        { key:'avgHumidity',     label:'Humedad Promedio (%)',       type:'number', required:true  },
        { key:'co2Levels',       label:'CO₂ (ppm)',                  type:'number', required:false, placeholder:'400-1500' },
        { key:'irrigationsPerDay',label:'Riegos por Día',            type:'number', required:true  },
        { key:'nutrientSchedule',label:'Programa de Nutrientes',     type:'textarea',required:true,  placeholder:'Semana 1: ..., Semana 2: ...' },
        { key:'pestsObserved',   label:'Plagas/Enfermedades observadas', type:'textarea',required:false },
        { key:'treatmentsApplied',label:'Tratamientos aplicados',    type:'textarea',required:false },
        { key:'vegNotes',        label:'Observaciones generales',    type:'textarea',required:false },
      ],
      compliance: [
        { key:'ipmLog',      label:'Registro IPM (manejo integrado plagas)', required:true  },
        { key:'noProhibited',label:'Sin pesticidas prohibidos aplicados',     required:true  },
        { key:'tempHumLog',  label:'Registro temperatura/humedad diario',     required:true  },
        { key:'nutrientCert',label:'Nutrientes con certificación orgánica',   required:true  },
      ],
    },

    {
      key:      'flowering',
      label:    'Floración',
      icon:     '🌸',
      color:    '#c8a84b',
      shortDesc:'Fase de floración y maduración de capullos',
      fields: [
        { key:'flowerStartDate', label:'Fecha Inicio Floración',      type:'date',   required:true  },
        { key:'flowerWeeks',     label:'Semanas de Floración',        type:'number', required:true  },
        { key:'lightCycleFlower',label:'Ciclo de Luz',                type:'text',   required:true,  placeholder:'12/12 o fotoperiodo natural' },
        { key:'avgTempFlower',   label:'Temperatura Promedio (°C)',   type:'number', required:true  },
        { key:'avgHumFlower',    label:'Humedad en Floración (%)',    type:'number', required:true,  placeholder:'40-50%' },
        { key:'vpdRange',        label:'VPD Promedio (kPa)',          type:'text',   required:false, placeholder:'0.8 - 1.2' },
        { key:'budDevelopment',  label:'Desarrollo de Capullo',       type:'select', required:true,
          options:['Normal','Excelente','Por debajo de lo esperado','Con estrés'] },
        { key:'trichomeCheck',   label:'Verificación de Tricomas',    type:'select', required:false,
          options:['Mayoría claros','50% turbios','Mayoría turbios','Algunos ámbar','No verificado'] },
        { key:'preHarvestTest',  label:'Test pre-cosecha enviado a lab',type:'checkbox',required:false },
        { key:'flowerNutrients', label:'Nutrientes de Floración',     type:'textarea',required:true },
        { key:'flowerNotes',     label:'Observaciones',               type:'textarea',required:false },
      ],
      compliance: [
        { key:'flushingDone',   label:'Lavado de raíces completado (14+ días)', required:true  },
        { key:'preHarvestCOA',  label:'COA pre-cosecha enviado a laboratorio', required:false },
        { key:'noLateSpray',    label:'Sin aplicaciones foliares últimas 2 semanas', required:true },
      ],
    },

    {
      key:      'harvest',
      label:    'Cosecha',
      icon:     '✂️',
      color:    '#e08040',
      shortDesc:'Registro de cosecha y primer peso fresco',
      fields: [
        { key:'harvestDate',     label:'Fecha de Cosecha',            type:'date',   required:true  },
        { key:'harvestTime',     label:'Hora de Cosecha',             type:'time',   required:true  },
        { key:'plantsHarvested', label:'Plantas Cosechadas',          type:'number', required:true  },
        { key:'harvestMethod',   label:'Método de Cosecha',          type:'select', required:true,
          options:['Planta completa','Selectivo por rama','Progresivo'] },
        { key:'freshWeight',     label:'Peso Fresco Total (kg)',      type:'number', required:true  },
        { key:'wetTrimDone',     label:'Trim en húmedo realizado',    type:'checkbox',required:false },
        { key:'harvestConditions',label:'Condiciones de Cosecha',     type:'textarea',required:true,  placeholder:'Temperatura, humedad, iluminación del área...' },
        { key:'responsiblePerson',label:'Responsable de Cosecha',    type:'text',   required:true  },
        { key:'witnessName',     label:'Testigo / Segundo Responsable',type:'text',  required:false },
        { key:'harvestNotes',    label:'Observaciones',               type:'textarea',required:false },
      ],
      compliance: [
        { key:'harvestNotif',   label:'Notificación a SENASA/COMCANNABIS antes de cosecha', required:true },
        { key:'weightWitnessed',label:'Peso verificado por dos personas',                   required:true },
        { key:'harvestRecord',  label:'Acta de cosecha firmada',                            required:true },
      ],
    },

    {
      key:      'drying',
      label:    'Secado / Curado',
      icon:     '🌬️',
      color:    '#d4a020',
      shortDesc:'Control de secado y curado post-cosecha',
      fields: [
        { key:'dryStartDate',    label:'Fecha Inicio Secado',         type:'date',   required:true  },
        { key:'dryMethod',       label:'Método de Secado',            type:'select', required:true,
          options:['Colgado invertido','Rack de secado','Liofilización','Secado pasivo'] },
        { key:'dryRoomTemp',     label:'Temperatura Sala Secado (°C)',type:'number', required:true,  placeholder:'18-22' },
        { key:'dryRoomHum',      label:'Humedad Sala Secado (%)',     type:'number', required:true,  placeholder:'45-55' },
        { key:'dryDays',         label:'Días de Secado',              type:'number', required:true  },
        { key:'dryWeight',       label:'Peso Seco Final (kg)',        type:'number', required:true  },
        { key:'dryLoss',         label:'Pérdida por Secado (%)',      type:'calculated', formula:'((freshWeight-dryWeight)/freshWeight)*100' },
        { key:'cureStart',       label:'Fecha Inicio Curado',         type:'date',   required:false },
        { key:'cureWeeks',       label:'Semanas de Curado',           type:'number', required:false },
        { key:'cureContainers',  label:'Tipo de Contenedor de Curado',type:'select', required:false,
          options:['Frascos de vidrio','Bolsas Grove','Terplock','Otro'] },
        { key:'boveda',          label:'Packs Boveda utilizados',     type:'checkbox',required:false },
        { key:'targetMoisture',  label:'Humedad Final Meta (%)',      type:'number', required:true,  placeholder:'10-12' },
        { key:'finalMoisture',   label:'Humedad Final Medida (%)',    type:'number', required:false },
        { key:'dryNotes',        label:'Observaciones',               type:'textarea',required:false },
      ],
      compliance: [
        { key:'moistureLog',    label:'Registro de humedad diario documentado', required:true },
        { key:'mouldCheck',     label:'Inspección visual de moho completada',   required:true },
        { key:'targetReached',  label:'Humedad objetivo ≤ 12% alcanzada',       required:true },
      ],
    },

    {
      key:      'processing',
      label:    'Procesamiento',
      icon:     '⚗️',
      color:    '#8050c8',
      shortDesc:'Extracción, procesamiento y formulación',
      fields: [
        { key:'processDate',     label:'Fecha de Procesamiento',      type:'date',   required:true  },
        { key:'processType',     label:'Tipo de Proceso',             type:'select', required:true,
          options:['Extracción CO₂ supercrítico','Extracción etanol','Prensa de rosin','Seco en frío (bubble hash)','Maceración','Destilación','Sin procesamiento (flor directa)'] },
        { key:'processPartner',  label:'Lab / Socio Procesador',      type:'text',   required:true,  placeholder:'Ej: Argus Lab' },
        { key:'inputWeight',     label:'Peso de Entrada (kg)',        type:'number', required:true  },
        { key:'outputType',      label:'Tipo de Output',              type:'select', required:true,
          options:['Aceite CBD crudo','Destilado CBD','Aislado CBD','Live Rosin','Extracto de flor completa','Hash','Tintura base','Crema/Ungüento base'] },
        { key:'outputWeight',    label:'Peso/Volumen de Output',      type:'number', required:true  },
        { key:'outputUnit',      label:'Unidad',                      type:'select', required:true,
          options:['kg','g','L','mL'] },
        { key:'extractionYield', label:'Rendimiento de Extracción (%)', type:'calculated', formula:'(outputWeight/inputWeight)*100' },
        { key:'solventUsed',     label:'Solvente Utilizado (si aplica)', type:'text', required:false, placeholder:'Ej: Etanol grado alimentario 99.9%' },
        { key:'residualSolvent', label:'Solvente residual ppm (post-purga)', type:'number', required:false },
        { key:'processTemp',     label:'Temperatura de Proceso (°C)', type:'number', required:false },
        { key:'processPressure', label:'Presión de Proceso (bar)',    type:'number', required:false },
        { key:'batchRef',        label:'Referencia de Lote Procesador',type:'text',  required:false },
        { key:'processNotes',    label:'Notas del proceso',           type:'textarea',required:false },
      ],
      compliance: [
        { key:'labLicense',     label:'Laboratorio procesador con licencia vigente',    required:true },
        { key:'gmpProcess',     label:'Proceso bajo condiciones GMP documentadas',      required:true },
        { key:'solventPurge',   label:'Purga de solvente verificada (< 500 ppm)',       required:false },
        { key:'chainCustody',   label:'Cadena de custodia firmada al entregar material',required:true },
      ],
    },

    {
      key:      'quality',
      label:    'Control de Calidad',
      icon:     '🔬',
      color:    '#4080c8',
      shortDesc:'Análisis de laboratorio — COA oficial',
      fields: [
        { key:'coaDate',         label:'Fecha de Análisis COA',       type:'date',   required:true  },
        { key:'labName',         label:'Laboratorio Analista',        type:'text',   required:true,  placeholder:'Ej: Argus Lab, LaborCann' },
        { key:'coaNumber',       label:'Número de COA',               type:'text',   required:true  },
        { key:'sampleRef',       label:'Referencia de Muestra',       type:'text',   required:true  },
        { key:'testType',        label:'Tipo de Análisis',            type:'select', required:true,
          options:['Panel completo','Cannabinoides básico','Pesticidas + cannabinoides','Microbiológico + cannabinoides','Solo cannabinoides'] },
        // Cannabinoids
        { key:'thcTotal',        label:'THC Total (%)',               type:'number', required:true  },
        { key:'cbdTotal',        label:'CBD Total (%)',               type:'number', required:true  },
        { key:'cbgTotal',        label:'CBG Total (%)',               type:'number', required:false },
        { key:'cbnTotal',        label:'CBN Total (%)',               type:'number', required:false },
        { key:'cbcTotal',        label:'CBC Total (%)',               type:'number', required:false },
        // Pesticides
        { key:'pesticidesPass',  label:'Pesticidas: Resultado',       type:'select', required:true,
          options:['Pasa (ND / < límite)','No pasa','No analizado'] },
        // Microbiology
        { key:'microPass',       label:'Microbiológico: Resultado',   type:'select', required:true,
          options:['Pasa','No pasa','No analizado'] },
        { key:'heavyMetals',     label:'Metales Pesados: Resultado',  type:'select', required:false,
          options:['Pasa','No pasa','No analizado'] },
        { key:'residualSolventsQA',label:'Solventes Residuales',      type:'select', required:false,
          options:['Pasa','No pasa','No analizado'] },
        { key:'moisture',        label:'Humedad Final (%)',           type:'number', required:false },
        { key:'waterActivity',   label:'Actividad de Agua (Aw)',      type:'number', required:false },
        { key:'coaFileRef',      label:'Archivo COA (referencia)',    type:'file_ref',required:true  },
        { key:'qcNotes',         label:'Notas del QC',               type:'textarea',required:false },
      ],
      compliance: [
        { key:'thcCompliant',   label:'THC ≤ 0.3% confirmado (hemp) o dentro de licencia', required:true },
        { key:'pestPass',       label:'Pesticidas dentro de límites regulatorios',          required:true },
        { key:'microPass2',     label:'Microbiológico dentro de parámetros',                required:true },
        { key:'coaOnFile',      label:'COA original archivado físicamente y digital',       required:true },
        { key:'accredLab',      label:'Laboratorio con acreditación INTE o equivalente',   required:true },
      ],
    },

    {
      key:      'packaging',
      label:    'Empaque',
      icon:     '📦',
      color:    '#508060',
      shortDesc:'Empaque, etiquetado y serialización',
      fields: [
        { key:'packDate',        label:'Fecha de Empaque',            type:'date',   required:true  },
        { key:'packageType',     label:'Tipo de Empaque',             type:'select', required:true,
          options:['Frasco vidrio ámbar','Frasco PET','Bolsa doy-pack','Frasco gotero','Tubo cosmético','Caja con insert','Bolsa biodegradable'] },
        { key:'packageSize',     label:'Presentación / Volumen',      type:'text',   required:true,  placeholder:'Ej: 30mL, 50g, 100mL' },
        { key:'unitsPackaged',   label:'Unidades Empacadas',          type:'number', required:true  },
        { key:'batchCodeFinal',  label:'Código de Lote Final',        type:'text',   required:true  },
        { key:'expiryDate',      label:'Fecha de Vencimiento',        type:'date',   required:true  },
        { key:'labelRef',        label:'Versión de Etiqueta',         type:'text',   required:true,  placeholder:'Ej: v2.3 aprobada MINSA' },
        { key:'labelLanguages',  label:'Idiomas de Etiqueta',         type:'text',   required:true,  placeholder:'Español, Inglés' },
        { key:'childResistant',  label:'Empaque resistente niños',    type:'checkbox',required:true  },
        { key:'tamperEvident',   label:'Sello de seguridad/evidencia',type:'checkbox',required:true  },
        { key:'storageCond',     label:'Condiciones de Almacenamiento',type:'select',required:true,
          options:['Fresco y seco 15-25°C','Refrigerado 2-8°C','Congelado','Temperatura ambiente'] },
        { key:'packNotes',       label:'Observaciones',               type:'textarea',required:false },
      ],
      compliance: [
        { key:'labelApproved',  label:'Etiqueta aprobada por MINSA/SENASA',          required:true },
        { key:'batchOnLabel',   label:'Número de lote visible en etiqueta',           required:true },
        { key:'expiryOnLabel',  label:'Fecha de vencimiento en etiqueta',             required:true },
        { key:'childProof',     label:'Empaque resistente a niños (aplica)',          required:false },
        { key:'storageLabel',   label:'Condiciones de almacenamiento en etiqueta',    required:true },
      ],
    },

    {
      key:      'distribution',
      label:    'Distribución',
      icon:     '🚚',
      color:    '#4060a0',
      shortDesc:'Cadena de distribución y punto de venta',
      fields: [
        { key:'shipDate',        label:'Fecha de Despacho',           type:'date',   required:true  },
        { key:'shipTo',          label:'Destinatario / Cliente',      type:'text',   required:true  },
        { key:'shipAddress',     label:'Dirección de Entrega',        type:'textarea',required:true  },
        { key:'unitsShipped',    label:'Unidades Despachadas',        type:'number', required:true  },
        { key:'invoiceRef',      label:'Número de Factura',           type:'text',   required:true  },
        { key:'carrier',         label:'Transportista',               type:'text',   required:false, placeholder:'Ej: Correos CR, DHL, propio' },
        { key:'trackingNum',     label:'Número de Rastreo',           type:'text',   required:false },
        { key:'shipTemp',        label:'Temperatura de Transporte',   type:'select', required:false,
          options:['Temperatura ambiente','Cadena de frío 2-8°C','No aplica'] },
        { key:'receivedBy',      label:'Recibido por',                type:'text',   required:false },
        { key:'receivedDate',    label:'Fecha de Recepción',          type:'date',   required:false },
        { key:'returnPolicy',    label:'Política de devolución referenciada', type:'text', required:false },
        { key:'distNotes',       label:'Notas de distribución',       type:'textarea',required:false },
      ],
      compliance: [
        { key:'distLicense',    label:'Licencia de distribución cannabis vigente', required:true  },
        { key:'invoiceOnFile',  label:'Factura y albarán archivados',             required:true  },
        { key:'coldChain',      label:'Cadena de frío documentada (si aplica)',   required:false },
        { key:'clientVerified', label:'Cliente verificado (dispensario/farmacia licenciado)', required:true },
      ],
    },
  ], // end stages

  // ── Alert thresholds ───────────────────────
  alerts: {
    thcHempMax:     0.3,    // % THC limit for hemp
    minGermRate:    70,     // % minimum germination rate
    maxMoistureDry: 12,     // % max moisture for dried flower
    maxResidualSolvent: 500,// ppm
  },

  // ── Blockchain config (demo/future) ────────
  blockchain: {
    network:     'Polygon (planned)',
    tokenStandard:'ERC-721 (NFT per batch)',
    hashMethod:  'SHA-256 of event data',
    note:        'Each event will be hashed and stored on-chain as immutable proof of traceability.',
  },
});
