// ============================================================
// GOOGLE APPS SCRIPT — Nuevo Sol Inversiones
// Registro de Propiedades → Google Sheets
// ============================================================
//
// INSTRUCCIONES DE INSTALACIÓN:
//
// 1. Ve a Google Sheets → Crea un nuevo spreadsheet
//    Nómbralo: "Nuevo Sol — Registro de Propiedades"
//
// 2. Crea 3 hojas (tabs en la parte inferior):
//    - "Propiedades" (hoja principal)
//    - "Dashboard" (resumen automático)  
//    - "Config" (configuración)
//
// 3. En la hoja "Propiedades", pega estos headers en la fila 1:
//    A1: Timestamp
//    B1: Referencia ID
//    C1: Título Propiedad
//    D1: Moneda
//    E1: Precio Venta
//    F1: Sector
//    G1: Ciudad
//    H1: Estado Propiedad
//    I1: M² Construcción
//    J1: M² Terreno
//    K1: Nivel/Piso
//    L1: Habitaciones
//    M1: Baños
//    N1: Medio Baño
//    O1: Parqueos Cantidad
//    P1: Tipo Parqueos
//    Q1: Espacios Incluidos
//    R1: Terminaciones
//    S1: Áreas Sociales
//    T1: Servicios Edificio
//    U1: Costo Mantenimiento
//    V1: Reserva
//    W1: Separación
//    X1: Cuotas Obra
//    Y1: Fecha Entrega
//    Z1: Descripción Web
//    AA1: Documentos Disponibles
//    AB1: Notas Internas
//
// 4. En la hoja "Config", pon:
//    A1: Versión      B1: 1.0
//    A2: Último Registro  B2: (se llenará automáticamente)
//
// 5. Ve a Extensiones (Extensions) → Apps Script
//
// 6. Borra todo el contenido de Code.gs y pega TODO este código
//
// 7. Guarda (Ctrl+S)
//
// 8. Click en "Implementar" (Deploy) → "Nueva implementación" (New deployment)
//    - Tipo: "Aplicación web" (Web app)
//    - Ejecutar como: "Yo" (Me)
//    - Quién tiene acceso: "Cualquiera" (Anyone)
//
// 9. Click en "Implementar" (Deploy)
//    - La primera vez te pedirá autorizar permisos → Autoriza
//
// 10. Copia la URL que te da (algo como https://script.google.com/macros/s/xxx/exec)
//
// 11. Pega esa URL en el formulario web (en el banner amarillo de configuración)
//
// ¡LISTO! Cada vez que envíes un formulario, los datos llegarán a tu Google Sheet.
//
// ============================================================

/**
 * Maneja las solicitudes POST del formulario web
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Propiedades');
    
    if (!sheet) {
      sheet = ss.insertSheet('Propiedades');
      // Agregar headers automáticamente si la hoja no existe
      addHeaders(sheet);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    // Formatear timestamp en zona horaria de RD
    var timestamp = Utilities.formatDate(
      new Date(), 
      'America/Santo_Domingo', 
      'dd/MM/yyyy HH:mm:ss'
    );
    
    // Agregar fila con todos los datos
    sheet.appendRow([
      timestamp,                        // A: Timestamp
      data.referencia_id || '',         // B: Referencia ID
      data.titulo_propiedad || '',      // C: Título Propiedad
      data.moneda || '',                // D: Moneda
      data.precio_venta || '',          // E: Precio Venta
      data.sector || '',                // F: Sector
      data.ciudad || '',                // G: Ciudad
      data.estado_propiedad || '',      // H: Estado Propiedad
      data.metros_construccion || '',   // I: M² Construcción
      data.metros_terreno || '',        // J: M² Terreno
      data.nivel_piso || '',            // K: Nivel/Piso
      data.habitaciones || '',          // L: Habitaciones
      data.banos || '',                 // M: Baños
      data.medio_bano || '',            // N: Medio Baño
      data.parqueos_cantidad || '',     // O: Parqueos Cantidad
      data.tipo_parqueos || '',         // P: Tipo Parqueos
      data.espacios_incluidos || '',    // Q: Espacios Incluidos
      data.terminaciones || '',         // R: Terminaciones
      data.areas_sociales || '',        // S: Áreas Sociales
      data.servicios_edificio || '',    // T: Servicios Edificio
      data.costo_mantenimiento || '',   // U: Costo Mantenimiento
      data.reserva || '',               // V: Reserva
      data.separacion || '',            // W: Separación
      data.cuotas_obra || '',           // X: Cuotas Obra
      data.fecha_entrega || '',         // Y: Fecha Entrega
      data.descripcion_web || '',       // Z: Descripción Web
      data.documentos || '',            // AA: Documentos Disponibles
      data.notas_internas || ''         // AB: Notas Internas
    ]);
    
    // Actualizar Config con último registro
    updateConfig(ss, timestamp, data.referencia_id);
    
    // Actualizar Dashboard
    updateDashboard(ss);
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success', message: 'Propiedad registrada exitosamente' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Maneja solicitudes GET (para verificar que el script funciona)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      status: 'active', 
      message: 'Nuevo Sol Inversiones — API de Registro activa',
      version: '1.0'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Agrega los headers a la hoja de Propiedades
 */
function addHeaders(sheet) {
  var headers = [
    'Timestamp', 'Referencia ID', 'Título Propiedad', 'Moneda', 'Precio Venta',
    'Sector', 'Ciudad', 'Estado Propiedad', 'M² Construcción', 'M² Terreno',
    'Nivel/Piso', 'Habitaciones', 'Baños', 'Medio Baño', 'Parqueos Cantidad',
    'Tipo Parqueos', 'Espacios Incluidos', 'Terminaciones', 'Áreas Sociales',
    'Servicios Edificio', 'Costo Mantenimiento', 'Reserva', 'Separación',
    'Cuotas Obra', 'Fecha Entrega', 'Descripción Web', 'Documentos Disponibles',
    'Notas Internas'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formatear headers
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#1a3c5e');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontSize(10);
  
  // Congelar fila de headers
  sheet.setFrozenRows(1);
  
  // Ajustar anchos de columnas
  for (var i = 1; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 140);
  }
}

/**
 * Actualiza la hoja Config con la última actividad
 */
function updateConfig(ss, timestamp, refId) {
  var configSheet = ss.getSheetByName('Config');
  
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    configSheet.getRange('A1').setValue('Versión');
    configSheet.getRange('B1').setValue('1.0');
    configSheet.getRange('A2').setValue('Último Registro');
    configSheet.getRange('A3').setValue('Total Propiedades');
    
    // Formatear
    configSheet.getRange('A1:A3').setFontWeight('bold');
    configSheet.setColumnWidth(1, 180);
    configSheet.setColumnWidth(2, 250);
  }
  
  configSheet.getRange('B2').setValue(timestamp + ' — ' + (refId || 'Sin Ref'));
  
  var propSheet = ss.getSheetByName('Propiedades');
  if (propSheet) {
    var totalRows = Math.max(0, propSheet.getLastRow() - 1);
    configSheet.getRange('B3').setValue(totalRows);
  }
}

/**
 * Actualiza el Dashboard con estadísticas resumidas
 */
function updateDashboard(ss) {
  var dashSheet = ss.getSheetByName('Dashboard');
  
  if (!dashSheet) {
    dashSheet = ss.insertSheet('Dashboard');
  }
  
  var propSheet = ss.getSheetByName('Propiedades');
  if (!propSheet) return;
  
  var lastRow = propSheet.getLastRow();
  if (lastRow < 2) return; // No hay datos aún
  
  // Limpiar dashboard
  dashSheet.clear();
  
  // --- TÍTULO ---
  dashSheet.getRange('A1').setValue('📊 DASHBOARD — NUEVO SOL INVERSIONES');
  dashSheet.getRange('A1').setFontSize(14).setFontWeight('bold').setFontColor('#1a3c5e');
  dashSheet.getRange('A2').setValue('Actualizado: ' + Utilities.formatDate(new Date(), 'America/Santo_Domingo', 'dd/MM/yyyy HH:mm'));
  dashSheet.getRange('A2').setFontSize(10).setFontColor('#888');
  
  // --- RESUMEN GENERAL ---
  dashSheet.getRange('A4').setValue('📋 RESUMEN GENERAL').setFontWeight('bold').setFontSize(12).setFontColor('#2e6da4');
  
  var totalProps = lastRow - 1;
  dashSheet.getRange('A5').setValue('Total Propiedades Registradas');
  dashSheet.getRange('B5').setValue(totalProps).setFontWeight('bold').setFontSize(14);
  
  // --- POR ESTADO ---
  dashSheet.getRange('A7').setValue('🏗️ POR ESTADO').setFontWeight('bold').setFontSize(12).setFontColor('#2e6da4');
  
  var estados = {};
  if (lastRow >= 2) {
    var estadoData = propSheet.getRange(2, 8, lastRow - 1, 1).getValues(); // Columna H
    estadoData.forEach(function(row) {
      var val = row[0] ? row[0].toString().trim() : 'Sin especificar';
      estados[val] = (estados[val] || 0) + 1;
    });
  }
  
  var row = 8;
  for (var estado in estados) {
    dashSheet.getRange('A' + row).setValue(estado);
    dashSheet.getRange('B' + row).setValue(estados[estado]).setFontWeight('bold');
    row++;
  }
  
  // --- POR CIUDAD ---
  row += 1;
  dashSheet.getRange('A' + row).setValue('🌆 POR CIUDAD').setFontWeight('bold').setFontSize(12).setFontColor('#2e6da4');
  row++;
  
  var ciudades = {};
  if (lastRow >= 2) {
    var ciudadData = propSheet.getRange(2, 7, lastRow - 1, 1).getValues(); // Columna G
    ciudadData.forEach(function(r) {
      var val = r[0] ? r[0].toString().trim() : 'Sin especificar';
      ciudades[val] = (ciudades[val] || 0) + 1;
    });
  }
  
  for (var ciudad in ciudades) {
    dashSheet.getRange('A' + row).setValue(ciudad);
    dashSheet.getRange('B' + row).setValue(ciudades[ciudad]).setFontWeight('bold');
    row++;
  }
  
  // --- RANGO DE PRECIOS ---
  row += 1;
  dashSheet.getRange('A' + row).setValue('💰 RANGO DE PRECIOS').setFontWeight('bold').setFontSize(12).setFontColor('#2e6da4');
  row++;
  
  if (lastRow >= 2) {
    var precioData = propSheet.getRange(2, 5, lastRow - 1, 1).getValues(); // Columna E
    var precios = [];
    precioData.forEach(function(r) {
      var val = parseFloat(r[0].toString().replace(/[^0-9.]/g, ''));
      if (!isNaN(val) && val > 0) precios.push(val);
    });
    
    if (precios.length > 0) {
      dashSheet.getRange('A' + row).setValue('Precio Mínimo');
      dashSheet.getRange('B' + row).setValue('$' + Math.min.apply(null, precios).toLocaleString());
      row++;
      dashSheet.getRange('A' + row).setValue('Precio Máximo');
      dashSheet.getRange('B' + row).setValue('$' + Math.max.apply(null, precios).toLocaleString());
      row++;
      var avg = precios.reduce(function(a, b) { return a + b; }, 0) / precios.length;
      dashSheet.getRange('A' + row).setValue('Precio Promedio');
      dashSheet.getRange('B' + row).setValue('$' + Math.round(avg).toLocaleString());
    } else {
      dashSheet.getRange('A' + row).setValue('Sin datos de precios aún');
    }
  }
  
  // Ajustar columnas
  dashSheet.setColumnWidth(1, 280);
  dashSheet.setColumnWidth(2, 180);
}

/**
 * Función de inicialización — Ejecutar una vez para crear las hojas
 * Puedes ejecutar esta función manualmente desde el editor de Apps Script
 * haciendo clic en ▶️ Run
 */
function inicializarHojas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Crear hoja Propiedades si no existe
  var propSheet = ss.getSheetByName('Propiedades');
  if (!propSheet) {
    propSheet = ss.insertSheet('Propiedades');
    addHeaders(propSheet);
    Logger.log('✅ Hoja "Propiedades" creada con headers');
  } else {
    Logger.log('ℹ️ Hoja "Propiedades" ya existe');
  }
  
  // Crear hoja Dashboard si no existe
  var dashSheet = ss.getSheetByName('Dashboard');
  if (!dashSheet) {
    dashSheet = ss.insertSheet('Dashboard');
    dashSheet.getRange('A1').setValue('📊 DASHBOARD — NUEVO SOL INVERSIONES');
    dashSheet.getRange('A1').setFontSize(14).setFontWeight('bold');
    dashSheet.getRange('A2').setValue('Sin datos aún. Envía tu primer formulario.');
    Logger.log('✅ Hoja "Dashboard" creada');
  } else {
    Logger.log('ℹ️ Hoja "Dashboard" ya existe');
  }
  
  // Crear hoja Config si no existe
  var configSheet = ss.getSheetByName('Config');
  if (!configSheet) {
    configSheet = ss.insertSheet('Config');
    configSheet.getRange('A1').setValue('Versión');
    configSheet.getRange('B1').setValue('1.0');
    configSheet.getRange('A2').setValue('Último Registro');
    configSheet.getRange('B2').setValue('Ninguno aún');
    configSheet.getRange('A3').setValue('Total Propiedades');
    configSheet.getRange('B3').setValue(0);
    configSheet.getRange('A1:A3').setFontWeight('bold');
    configSheet.setColumnWidth(1, 180);
    configSheet.setColumnWidth(2, 250);
    Logger.log('✅ Hoja "Config" creada');
  } else {
    Logger.log('ℹ️ Hoja "Config" ya existe');
  }
  
  Logger.log('🎉 Inicialización completada');
}
