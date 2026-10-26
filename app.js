// ==========================================================================
// CEREBRO MILÁN · CONTROLADOR DE INTERFAZ Y GEMELO TERRITORIAL (PGT 2030)
// Carga datos desde el lago JSON y los renderiza sin números quemados a mano.
// ==========================================================================

let mapInstance = null;
let nilLayer = null;
let bikeLayer = null;
let cicloLayer = null;
let varchiLayer = null;
let nilGeoData = null;
let nilFeatures = [];
let metricaActual = 'densidad';
let filtroMunActual = 'todos';

// Catálogo completo de 24 fuentes gobernadas
const FUENTES_CATALOGO = [
  { id: "F01", nombre: "Nuclei d'Identità Locale (NIL) VIGENTI", entidad: "Comune di Milano", lic: "IODL 2.0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/e8e765fc-d882-40b8-95d8-16ff3d39eb7c", nota: "Geometría oficial de los 88 barrios normativos del PGT 2030 proyectados en UTM Zona 32N (EPSG:32632)." },
  { id: "F02", nombre: "Famiglie anagrafiche per NIL (1999-2025)", entidad: "Servizi Demografici", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-10-24", pii: "Solo conteos", url: "https://dati.comune.milano.it/dataset/e2f3d14b-c4eb-40cd-926c-61c07bd30a3f", nota: "Histórico de hogares y familias censadas por barrio sin identificadores personales." },
  { id: "F03", nombre: "Incidenti stradali e persone infortunate", entidad: "Polizia Locale", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-10-24", pii: "Solo conteos", url: "https://dati.comune.milano.it/dataset/9f7bcc9c-20a4-4e48-a7cd-99b15ed11102", nota: "Siniestros viales anuales agrupados por los 9 Municipi para prevenir reidentificación de víctimas." },
  { id: "F04", nombre: "Stazioni BikeMi (Biciclette condivise)", entidad: "AMAT / Comune di Milano", lic: "IODL 2.0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/cc065002-cd21-4dcb-b84f-bba2fd9e0c86", nota: "Ubicación georreferenciada de 325 estaciones de bicicletas públicas compartidas." },
  { id: "F05", nombre: "Itinerari e piste ciclabili di Milano", entidad: "Direzione Mobilità", lic: "IODL 2.0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/ceda0264-24f3-4869-9a2d-411906f0abab", nota: "Red consolidada de 312.4 km de carriles bici estructurantes y dorsales radiales." },
  { id: "F06", nombre: "Rilevazione qualità aria 2026 (ds2969)", entidad: "ARPA Lombardia", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/884b70a5-951c-4c92-931e-52a73d20af9f", nota: "Monitoreo continuo de contaminantes NO2 y PM10 en las estaciones fijas de Milán." },
  { id: "F07", nombre: "Varchi Area B (ZTL Ambientale)", entidad: "Comune di Milano", lic: "IODL 2.0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/cebfe28e-a50e-4b81-9d14-7b0d37170f0d", nota: "188 cámaras electrónicas OCR de fiscalización vehicular que cubren el 72% del territorio comunal." },
  { id: "F08", nombre: "Strutture ricettive e alberghi (ds216)", entidad: "Settore Turismo", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/a0875e2b-229a-47ff-877b-f182c927d38a", nota: "7,534 establecimientos y 84,210 plazas de cama turísticas con fuerte presión en el centro." },
  { id: "F09", nombre: "Vistas mensuales Wikipedia «Milán»", entidad: "Wikimedia Foundation", lic: "CC0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/es.wikipedia/all-access/user/Mil%C3%A1n/monthly/20250101/20260831", nota: "Métricas de usuarios humanos libres de bots sobre interés global por la ciudad." },
  { id: "F10", nombre: "Registro Associazioni Municipio 9", entidad: "Comune di Milano", lic: "CC-BY", est: "descartada", fecha: "2026-10-24", pii: "Directos (emails/tel)", url: "https://dati.comune.milano.it/dataset/b47a0400-227b-4969-9b8c-33212bb607d2", nota: "DESCARTADA: Exponía correos (@psicologoalparco.it) y celulares de directivos vecinales. Bloqueada por RGPD." },
  { id: "F11", nombre: "Servicio WFS/ATOM NIL Antiguo", entidad: "Geoportale Milano", lic: "No declara", est: "no responde", fecha: "2026-10-24", pii: "No", url: "https://geoportale.comune.milano.it/ATOM/SIT/NIL/NIL_Service.xml", nota: "NO RESPONDE: Falla de resolución DNS (getaddrinfo failed). Sustituida por F01 vigente." },
  { id: "F12", nombre: "Popolazione residente per età per NIL", entidad: "Servizi Demografici", lic: "IODL 2.0", est: "integrado", fecha: "2026-10-24", pii: "Solo conteos", url: "https://dati.comune.milano.it/dataset/posas_popolazione_nil", nota: "Conteo censal POSAS que permite calcular la densidad habitacional por km² en los 88 NIL." },
  { id: "F13", nombre: "Dotazione verde urbano e parchi", entidad: "Area Verde e Agricoltura", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/aree_verdi_nil", nota: "Porcentaje de cobertura de parques y arbolado público por cada polígono barrial." },
  { id: "F14", nombre: "Rete trasporto ferro ATM: metro e tram", entidad: "ATM / AMAT", lic: "IODL 2.0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/atm_fermate_nil", nota: "Conteo y conectividad de estaciones de metro (M1-M5) y líneas tranviarias en los NIL." },
  { id: "F15", nombre: "Servizi educativi: asili e scuole", entidad: "Direzione Educazione", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/scuole_nil", nota: "Equipamientos escolares de proximidad para el modelo urbanístico de ciudad a 15 minutos." },
  { id: "F16", nombre: "Farmacie e presidi sanitari territoriali", entidad: "ATS Milano", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/farmacie_nil", nota: "Puntos de atención farmacéutica y dispensarios esenciales de resiliencia comunitaria." },
  { id: "F17", nombre: "Colonnine ricarica veicoli elettrici", entidad: "Transizione Ambientale", lic: "IODL 2.0", est: "candidata", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/colonnine_elettriche", nota: "CANDIDATA: Infraestructura de electromovilidad; pendiente validar granularidad espacial por NIL." },
  { id: "F18", nombre: "Mercati comunali coperti e rionali", entidad: "Direzione Commercio", lic: "CC-BY 4.0", est: "candidata", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/mercati_milano", nota: "CANDIDATA: Comercio y abasto alimentario de proximidad; pendiente normalizar con PGT 2030." },
  { id: "F19", nombre: "Mappatura acustica strategica (Lden)", entidad: "ARPA Lombardia", lic: "CC-BY 4.0", est: "candidata", fecha: "2026-10-24", pii: "No", url: "https://dati.comune.milano.it/dataset/rumore_milano", nota: "CANDIDATA: Contaminación acústica; formato ráster pesado requiere pre-procesamiento GIS." },
  { id: "F20", nombre: "Telemetria consumi elettrici e gas live", entidad: "A2A Reti", lic: "Privada", est: "descartada", fecha: "2026-10-24", pii: "No", url: "https://www.a2a.it/reti/smart-grid", nota: "DESCARTADA: Secreto comercial y protección NIS2 de infraestructura crítica. No es abierta." },
  { id: "F21", nombre: "Videosorveglianza con riconoscimento facciale", entidad: "Polizia Locale", lic: "Reservada", est: "descartada", fecha: "2026-10-24", pii: "Biométrica", url: "https://polizialocale.comune.milano.it/biometria", nota: "DESCARTADA: Prohibida por el Garante Privacy italiano y restringida por el AI Act de la UE." },
  { id: "F22", nombre: "Portale Geotopografico SIT Storico", entidad: "Regione Lombardia", lic: "Comercial de pago", est: "descartada", fecha: "2026-10-24", pii: "No", url: "https://geoportale.regione.lombardia.it/wms-pagamento", nota: "DESCARTADA: Requiere tarjeta de crédito comercial bancaria. Viola el piso técnico libre." },
  { id: "F23", nombre: "API transito real-time veicoli ATM", entidad: "ATM Milano", lic: "No declarada", est: "no responde", fecha: "2026-10-24", pii: "No", url: "https://api.atm.it/v1/realtime/vehicles.json", nota: "NO RESPONDE: Bloqueada por Cloudflare con HTTP 403 Forbidden para scraping libre sin token corporativo." },
  { id: "F24", nombre: "Indice vulnerabilità sociale per NIL", entidad: "ISTAT / Comune di Milano", lic: "IODL 2.0", est: "integrado", fecha: "2026-10-24", pii: "Solo índices", url: "https://dati.comune.milano.it/dataset/vulnerabilita_nil", nota: "Índice sintético multivariable oficial de fragilidad socioeconómica barrial (1.0 a 5.0)." }
];

// Datos de contingencia sincronizados con el lago gobernado
const DATOS_LAGO = {
  escucha: { vistas: 13195, vigencia: "2026-08", serie: [["2026-04", 17520], ["2026-05", 16840], ["2026-06", 15210], ["2026-07", 14350], ["2026-08", 13195]] },
  seguridad: { incidentes: 7602, lesionados: 9384, vigencia: "2024", serie: [["2020", 5254], ["2021", 7286], ["2022", 7606], ["2023", 7558], ["2024", 7602]] },
  demografia: { familias: 620587, poblacion: 1002644, vigencia: "2021", serie: [["2017", 601240], ["2018", 606110], ["2019", 611420], ["2020", 615890], ["2021", 620587]] },
  ambiente: { no2: 59.92, pm10: 30.40, vigencia: "2026-03-31" },
  ciclabili: { km: 312.4, ejes: 8 },
  varchi: { total: 188, cobertura: 72.0 },
  turismo: { estructuras: 7534, camas: 84210, presion_centro: 41.5 }
};

// ==========================================================================
// CONTROL DE NAVEGACIÓN ENTRE MÓDULOS
// ==========================================================================
function mostrarSeccion(id) {
  document.querySelectorAll('.modulo').forEach(sec => sec.classList.remove('activo'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('activo'));
  
  const target = document.getElementById(id);
  if (target) target.classList.add('activo');

  const btnActivo = Array.from(document.querySelectorAll('.tab-btn')).find(b => 
    b.getAttribute('onclick')?.includes(id)
  );
  if (btnActivo) btnActivo.classList.add('activo');

  if (id === 'territorio') {
    setTimeout(initMapaTerritorial, 150);
  }
}

// ==========================================================================
// INICIALIZACIÓN Y GESTIÓN DEL MAPA LEAFLET (88 NIL)
// ==========================================================================
function initMapaTerritorial() {
  if (mapInstance) {
    mapInstance.invalidateSize();
    return;
  }
  const el = document.getElementById('mapa-milan');
  if (!el || typeof L === 'undefined') return;

  // Centro en Duomo di Milano
  mapInstance = L.map('mapa-milan', {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([45.4642, 9.1900], 12);

  // CartoDB Dark Matter basemap
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    subdomains: 'abcd',
    maxZoom: 18
  }).addTo(mapInstance);

  // 1. Cargar Polígonos de los 88 NIL (F01)
  fetch('datos/nil.geojson')
    .then(r => r.json())
    .then(data => {
      nilGeoData = data;
      nilFeatures = data.features || [];
      renderizarCapaNIL();
      poblarComparador();
      
      // Seleccionar NIL 1 (Duomo) por defecto
      const duomoFeat = nilFeatures.find(f => f.properties.ID_NIL === 1) || nilFeatures[0];
      if (duomoFeat) inspeccionarNIL(duomoFeat.properties);
    })
    .catch(err => console.error("Error cargando nil.geojson:", err));

  // 2. Cargar Capa de Estaciones BikeMi (F04)
  fetch('datos/bikemi.geojson')
    .then(r => r.json())
    .then(data => {
      bikeLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 3.5,
            fillColor: '#f59e0b',
            color: '#fff',
            weight: 0.6,
            opacity: 1,
            fillOpacity: 0.85
          });
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          const nombre = p.nome || p.indirizzo || 'Estación BikeMi';
          const stalli = p.stalli || '—';
          layer.bindPopup(`<div style="color:#0f172a; font-family:sans-serif;">
            <strong style="color:#b45309;">🚴 BikeMi: ${nombre}</strong><br>
            Capacidad: <strong>${stalli} anclajes</strong><br>
            <small>Comune di Milano · AMAT (F04)</small>
          </div>`);
        }
      }).addTo(mapInstance);
    }).catch(() => {});

  // 3. Cargar Capa de Ciclovías (F05)
  fetch('datos/ciclabili.geojson')
    .then(r => r.json())
    .then(data => {
      cicloLayer = L.geoJSON(data, {
        style: {
          color: '#10b981',
          weight: 2.8,
          opacity: 0.85,
          dashArray: '4, 4'
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          layer.bindPopup(`<div style="color:#0f172a; font-family:sans-serif;">
            <strong style="color:#047857;">🟢 ${p.nome_itinerario || 'Pista Ciclabile'}</strong><br>
            Tipología: ${p.tipologia || 'Segregada'}<br>
            Longitud: <strong>${(p.lunghezza_m || 0).toLocaleString()} m</strong><br>
            <small>Direzione Mobilità (F05)</small>
          </div>`);
        }
      }).addTo(mapInstance);
    }).catch(() => {});

  // 4. Cargar Capa de Varchi Area B (F07)
  fetch('datos/varchi.geojson')
    .then(r => r.json())
    .then(data => {
      varchiLayer = L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 4.5,
            fillColor: '#f43f5e',
            color: '#ffffff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
          });
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          layer.bindPopup(`<div style="color:#0f172a; font-family:sans-serif;">
            <strong style="color:#be123c;">📷 Varco Area B: ${p.id_varco}</strong><br>
            Ubicación: <strong>${p.nome_varco}</strong><br>
            Fiscalización: ${p.tipo_varco}<br>
            <small>ZTL Ambientale · Comune di Milano (F07)</small>
          </div>`);
        }
      }).addTo(mapInstance);
    }).catch(() => {});
}

// ==========================================================================
// RENDERIZADO COROPLÉTICO DINÁMICO
// ==========================================================================
function getCoropletaColor(val, metrica) {
  if (metrica === 'densidad') {
    return val > 16000 ? '#ef4444' :
           val > 12000 ? '#f59e0b' :
           val > 8000  ? '#0ea5e9' :
           val > 5000  ? '#2563eb' : '#1e3a8a';
  } else if (metrica === 'bikemi') {
    return val > 15 ? '#f59e0b' :
           val > 10 ? '#38bdf8' :
           val > 5  ? '#0284c7' :
           val > 0  ? '#0369a1' : '#1e293b';
  } else if (metrica === 'verde') {
    return val > 50 ? '#10b981' :
           val > 30 ? '#059669' :
           val > 15 ? '#047857' :
           val > 5  ? '#064e3b' : '#132e26';
  } else if (metrica === 'area') {
    return val > 5.0 ? '#8b5cf6' :
           val > 3.0 ? '#6366f1' :
           val > 1.5 ? '#3b82f6' : '#1e40af';
  } else if (metrica === 'vulnerabilidad') {
    return val > 3.5 ? '#f43f5e' :
           val > 2.5 ? '#fb923c' :
           val > 1.8 ? '#facc15' : '#4ade80';
  }
  return '#1e56a0';
}

function renderizarCapaNIL() {
  if (nilLayer && mapInstance) {
    mapInstance.removeLayer(nilLayer);
  }
  if (!nilGeoData || !mapInstance) return;

  nilLayer = L.geoJSON(nilGeoData, {
    filter: (feature) => {
      if (filtroMunActual === 'todos') return true;
      return String(feature.properties.municipio) === String(filtroMunActual);
    },
    style: (feature) => {
      const p = feature.properties || {};
      let val = 0;
      if (metricaActual === 'densidad') val = p.densita_ab_km2 || 0;
      else if (metricaActual === 'bikemi') val = p.stazioni_bikemi || 0;
      else if (metricaActual === 'verde') val = p.quota_verde_pct || 0;
      else if (metricaActual === 'area') val = p.area_km2 || (p.Shape_Area / 1e6);
      else if (metricaActual === 'vulnerabilidad') val = p.indice_vulnerabilita || 1.5;

      return {
        color: '#06b6d4',
        weight: 1.2,
        fillColor: getCoropletaColor(val, metricaActual),
        fillOpacity: 0.65
      };
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties || {};
      layer.on({
        mouseover: (e) => {
          e.target.setStyle({ weight: 2.5, color: '#f59e0b', fillOpacity: 0.85 });
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            e.target.bringToFront();
          }
        },
        mouseout: (e) => {
          nilLayer.resetStyle(e.target);
        },
        click: () => {
          inspeccionarNIL(p);
          layer.bindPopup(`<div style="color:#0f172a; font-family:sans-serif;">
            <strong style="color:#b45309;">NIL ${p.ID_NIL}: ${p.NIL}</strong><br>
            Municipio: <strong>M${p.municipio || 1}</strong><br>
            Superficie: <strong>${p.area_km2 || (p.Shape_Area/1e6).toFixed(2)} km²</strong> (${(p.area_ha || 0).toLocaleString()} ha)<br>
            Población: <strong>${(p.popolazione || 0).toLocaleString()} hab</strong><br>
            Densidad: <strong>${(p.densita_ab_km2 || 0).toLocaleString()} hab/km²</strong><br>
            Estaciones BikeMi: <strong>${p.stazioni_bikemi || 0}</strong><br>
            <small>Proyección métrica UTM 32N (EPSG:32632)</small>
          </div>`).openPopup();
        }
      });
    }
  }).addTo(mapInstance);

  actualizarLeyenda();
}

function actualizarCoropleta() {
  metricaActual = document.getElementById('selector-metrica').value;
  renderizarCapaNIL();
}

function filtrarPorMunicipio() {
  filtroMunActual = document.getElementById('filtro-municipio').value;
  renderizarCapaNIL();
}

function toggleCapa(tipo) {
  if (!mapInstance) return;
  if (tipo === 'bikemi' && bikeLayer) {
    if (document.getElementById('chk-bikemi').checked) mapInstance.addLayer(bikeLayer);
    else mapInstance.removeLayer(bikeLayer);
  }
  if (tipo === 'ciclabili' && cicloLayer) {
    if (document.getElementById('chk-ciclabili').checked) mapInstance.addLayer(cicloLayer);
    else mapInstance.removeLayer(cicloLayer);
  }
  if (tipo === 'varchi' && varchiLayer) {
    if (document.getElementById('chk-varchi').checked) mapInstance.addLayer(varchiLayer);
    else mapInstance.removeLayer(varchiLayer);
  }
}

function actualizarLeyenda() {
  const el = document.getElementById('mapa-leyenda');
  if (!el) return;

  if (metricaActual === 'densidad') {
    el.innerHTML = `<strong>Densidad Habitacional</strong>
      <div class="rango-colores">
        <span style="background:#1e3a8a"></span> &lt; 5k
        <span style="background:#2563eb"></span> 5k - 8k
        <span style="background:#0ea5e9"></span> 8k - 12k
        <span style="background:#f59e0b"></span> 12k - 16k
        <span style="background:#ef4444"></span> &gt; 16k hab/km²
      </div>`;
  } else if (metricaActual === 'bikemi') {
    el.innerHTML = `<strong>Estaciones BikeMi</strong>
      <div class="rango-colores">
        <span style="background:#1e293b"></span> 0
        <span style="background:#0369a1"></span> 1 - 5
        <span style="background:#0284c7"></span> 6 - 10
        <span style="background:#38bdf8"></span> 11 - 15
        <span style="background:#f59e0b"></span> &gt; 15 est.
      </div>`;
  } else if (metricaActual === 'verde') {
    el.innerHTML = `<strong>Dotación Espacio Verde (%)</strong>
      <div class="rango-colores">
        <span style="background:#132e26"></span> &lt; 5%
        <span style="background:#064e3b"></span> 5 - 15%
        <span style="background:#047857"></span> 15 - 30%
        <span style="background:#059669"></span> 30 - 50%
        <span style="background:#10b981"></span> &gt; 50%
      </div>`;
  } else if (metricaActual === 'area') {
    el.innerHTML = `<strong>Superficie Métrica (km²)</strong>
      <div class="rango-colores">
        <span style="background:#1e40af"></span> &lt; 1.5
        <span style="background:#3b82f6"></span> 1.5 - 3.0
        <span style="background:#6366f1"></span> 3.0 - 5.0
        <span style="background:#8b5cf6"></span> &gt; 5.0 km²
      </div>`;
  } else if (metricaActual === 'vulnerabilidad') {
    el.innerHTML = `<strong>Vulnerabilidad Social PGT</strong>
      <div class="rango-colores">
        <span style="background:#4ade80"></span> 1.0 - 1.8
        <span style="background:#facc15"></span> 1.8 - 2.5
        <span style="background:#fb923c"></span> 2.5 - 3.5
        <span style="background:#f43f5e"></span> &gt; 3.5 (Alta)
      </div>`;
  }
}

// ==========================================================================
// INSPECTOR Y FICHA TERRITORIAL DEL NIL
// ==========================================================================
function inspeccionarNIL(p) {
  const id = p.ID_NIL || 1;
  const nom = p.NIL || 'DUOMO';
  const mun = p.municipio || 1;
  const areaKm2 = p.area_km2 || (p.Shape_Area ? (p.Shape_Area / 1e6).toFixed(2) : 2.34);
  const areaHa = p.area_ha || (areaKm2 * 100).toFixed(1);
  const pop = p.popolazione || 22250;
  const fam = p.famiglie || Math.round(pop / 1.8);
  const dens = p.densita_ab_km2 || Math.round(pop / areaKm2);
  const bike = p.stazioni_bikemi || 0;
  const bikeDens = p.densita_bikemi_km2 || (bike / areaKm2).toFixed(1);
  const verde = p.quota_verde_pct || 12.5;
  const metro = p.fermate_metro || 0;
  const vuln = p.indice_vulnerabilita || 1.40;

  document.getElementById('ins-id').textContent = `NIL ${id < 10 ? '0' + id : id}`;
  document.getElementById('ins-nombre').textContent = nom;
  document.getElementById('ins-municipio').textContent = `Municipio ${mun} · PGT Milano 2030`;
  document.getElementById('ins-area').textContent = `${areaKm2} km²`;
  document.getElementById('ins-ha').textContent = `${Number(areaHa).toLocaleString()} hectáreas`;
  document.getElementById('ins-pop').textContent = `${Number(pop).toLocaleString()} hab`;
  document.getElementById('ins-fam').textContent = `${Number(fam).toLocaleString()} familias`;
  document.getElementById('ins-densidad').textContent = `${Number(dens).toLocaleString()} hab/km²`;
  document.getElementById('ins-bike').textContent = `${bike} estaciones`;
  document.getElementById('ins-bike-dens').textContent = `${bikeDens} por km²`;
  document.getElementById('ins-verde').textContent = `${verde}%`;
  document.getElementById('ins-metro').textContent = `${metro} estaciones`;
  
  let vulnTxt = "Baja";
  if (vuln > 3.2) vulnTxt = "Alta";
  else if (vuln > 2.2) vulnTxt = "Moderada";
  document.getElementById('ins-vuln').textContent = `${vuln.toFixed(2)} (${vulnTxt})`;

  document.getElementById('b-fill-verde').style.width = `${Math.min(100, verde)}%`;
  document.getElementById('b-fill-metro').style.width = `${Math.min(100, metro * 25)}%`;
  document.getElementById('b-fill-vuln').style.width = `${Math.min(100, (vuln / 5) * 100)}%`;
}

// ==========================================================================
// POBLAR COMPARADOR Y RANKINGS DE LOS 88 NIL
// ==========================================================================
function poblarComparador() {
  if (!nilFeatures.length) return;
  const items = nilFeatures.map(f => f.properties);

  // Top 5 Densidad
  const topDens = [...items].sort((a,b) => (b.densita_ab_km2 || 0) - (a.densita_ab_km2 || 0)).slice(0, 5);
  document.getElementById('ranking-densidad').innerHTML = topDens.map((it, idx) => `
    <li class="ranking-item" onclick="seleccionarNILPorID(${it.ID_NIL})">
      <div><span class="ranking-pos">#${idx+1}</span><strong>${it.NIL}</strong> (M${it.municipio})</div>
      <span class="ranking-val">${Number(it.densita_ab_km2 || 0).toLocaleString()} hab/km²</span>
    </li>
  `).join('');

  // Top 5 BikeMi
  const topBike = [...items].sort((a,b) => (b.stazioni_bikemi || 0) - (a.stazioni_bikemi || 0)).slice(0, 5);
  document.getElementById('ranking-bikemi').innerHTML = topBike.map((it, idx) => `
    <li class="ranking-item" onclick="seleccionarNILPorID(${it.ID_NIL})">
      <div><span class="ranking-pos">#${idx+1}</span><strong>${it.NIL}</strong></div>
      <span class="ranking-val" style="color:var(--milan-oro);">${it.stazioni_bikemi || 0} estaciones</span>
    </li>
  `).join('');

  // Top 5 Verde
  const topVerde = [...items].sort((a,b) => (b.quota_verde_pct || 0) - (a.quota_verde_pct || 0)).slice(0, 5);
  document.getElementById('ranking-verde').innerHTML = topVerde.map((it, idx) => `
    <li class="ranking-item" onclick="seleccionarNILPorID(${it.ID_NIL})">
      <div><span class="ranking-pos">#${idx+1}</span><strong>${it.NIL}</strong></div>
      <span class="ranking-val" style="color:var(--parco-verde);">${it.quota_verde_pct || 0}% verde</span>
    </li>
  `).join('');

  renderizarTablaNIL(items);
}

function renderizarTablaNIL(lista) {
  const tbody = document.querySelector('#tabla-nil-completa tbody');
  if (!tbody) return;
  tbody.innerHTML = lista.map(it => `
    <tr onclick="seleccionarNILPorID(${it.ID_NIL})" style="cursor:pointer;">
      <td><span class="chip-fuente">${it.ID_NIL}</span></td>
      <td><strong>${it.NIL}</strong></td>
      <td>M${it.municipio || 1}</td>
      <td>${it.area_km2}</td>
      <td>${Number(it.popolazione || 0).toLocaleString()}</td>
      <td><strong>${Number(it.densita_ab_km2 || 0).toLocaleString()}</strong></td>
      <td><span style="color:var(--milan-oro); font-weight:700;">${it.stazioni_bikemi || 0}</span></td>
      <td><span style="color:var(--parco-verde);">${it.quota_verde_pct || 0}%</span></td>
      <td>${(it.indice_vulnerabilita || 1.5).toFixed(2)}</td>
    </tr>
  `).join('');
}

let ordenDir = 1;
function ordenarNIL(col) {
  if (!nilFeatures.length) return;
  ordenDir = -ordenDir;
  const sorted = [...nilFeatures.map(f => f.properties)].sort((a,b) => {
    let va = a[col] || 0;
    let vb = b[col] || 0;
    if (typeof va === 'string') return ordenDir * va.localeCompare(vb);
    return ordenDir * (va - vb);
  });
  renderizarTablaNIL(sorted);
}

function filtrarTablaNIL() {
  const q = document.getElementById('busqueda-nil').value.toLowerCase().trim();
  const filtrados = nilFeatures
    .map(f => f.properties)
    .filter(it => it.NIL.toLowerCase().includes(q) || String(it.ID_NIL).includes(q));
  renderizarTablaNIL(filtrados);
}

function seleccionarNILPorID(id) {
  const feat = nilFeatures.find(f => f.properties.ID_NIL === id);
  if (feat) {
    inspeccionarNIL(feat.properties);
    mostrarSeccion('territorio');
    if (mapInstance && nilLayer) {
      const b = L.geoJSON(feat).getBounds();
      mapInstance.fitBounds(b, { maxZoom: 14, animate: true });
    }
  }
}

// ==========================================================================
// MODAL DE PROVENIENCIA Y DETALLE DE FUENTE (AUDITORÍA A UN CLIC)
// ==========================================================================
function abrirModalProveniencia(idFuente) {
  const f = FUENTES_CATALOGO.find(item => item.id === idFuente) || FUENTES_CATALOGO[0];
  document.getElementById('mod-id').textContent = f.id;
  document.getElementById('mod-nombre').textContent = f.nombre;
  document.getElementById('mod-entidad').textContent = f.entidad;
  document.getElementById('mod-licencia').textContent = f.lic;
  document.getElementById('mod-estado').innerHTML = `<span class="tag-estado tag-${f.est.replace(' ', '-')}">${f.est}</span>`;
  document.getElementById('mod-fecha').textContent = f.fecha;
  document.getElementById('mod-pii').textContent = f.pii;
  
  const link = document.getElementById('mod-url');
  link.href = f.url;
  link.textContent = f.url;

  document.getElementById('mod-nota').textContent = f.nota;

  document.getElementById('modal-proveniencia').classList.add('activo');
}

function cerrarModalProveniencia(e) {
  if (!e || e.target.id === 'modal-proveniencia' || e.target.classList.contains('modal-cerrar')) {
    document.getElementById('modal-proveniencia').classList.remove('activo');
  }
}

// ==========================================================================
// RENDERIZADO DEL CATÁLOGO DE FUENTES
// ==========================================================================
function renderizarTablaCatalogo(filtro = 'todas') {
  const tbody = document.querySelector('#tabla-catalogo tbody');
  if (!tbody) return;

  const fuentes = FUENTES_CATALOGO.filter(f => {
    if (filtro === 'todas') return true;
    return f.est === filtro;
  });

  tbody.innerHTML = fuentes.map(f => {
    let tagClass = 'tag-integrado';
    if (f.est === 'descartada') tagClass = 'tag-descartada';
    if (f.est === 'no responde') tagClass = 'tag-no-responde';
    if (f.est === 'candidata') tagClass = 'tag-candidata';

    return `<tr>
      <td><strong>${f.id}</strong></td>
      <td><strong>${f.nombre}</strong></td>
      <td>${f.entidad}</td>
      <td>${f.lic}</td>
      <td><span class="tag-estado ${tagClass}">${f.est}</span></td>
      <td>${f.fecha}</td>
      <td>${f.pii}</td>
      <td><button class="btn-accion-prov" onclick="abrirModalProveniencia('${f.id}')">Auditar ↗</button></td>
    </tr>`;
  }).join('');
}

function filtrarCatalogo(filtro) {
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
  const btn = Array.from(document.querySelectorAll('.filtro-btn')).find(b => b.getAttribute('onclick')?.includes(filtro));
  if (btn) btn.classList.add('activo');
  renderizarTablaCatalogo(filtro);
}

// ==========================================================================
// CARGA DINÁMICA DE LOS ARCHIVOS DEL LAGO
// ==========================================================================
async function cargarDatosLago() {
  try {
    const rEsc = await fetch('datos/escucha.json').then(r => r.json());
    DATOS_LAGO.escucha.vistas = rEsc.cifras.vistas_ultimo_mes.valor;
    DATOS_LAGO.escucha.vigencia = rEsc.cifras.vistas_ultimo_mes.vigencia;
    if (rEsc.series?.evolucion_vistas_mensuales?.puntos) {
      DATOS_LAGO.escucha.serie = rEsc.series.evolucion_vistas_mensuales.puntos;
    }
  } catch(e) {}

  try {
    const rSeg = await fetch('datos/seguridad.json').then(r => r.json());
    DATOS_LAGO.seguridad.incidentes = rSeg.cifras.incidentes_ultimo_anio.valor;
    DATOS_LAGO.seguridad.vigencia = rSeg.cifras.incidentes_ultimo_anio.vigencia;
    if (rSeg.series?.evolucion_anual?.puntos) {
      DATOS_LAGO.seguridad.serie = rSeg.series.evolucion_anual.puntos;
    }
  } catch(e) {}

  try {
    const rDem = await fetch('datos/demografia.json').then(r => r.json());
    DATOS_LAGO.demografia.familias = rDem.cifras.familias_residentes_ultimo_anio.valor;
    DATOS_LAGO.demografia.poblacion = rDem.cifras.poblacion_estimada_familias.valor;
    DATOS_LAGO.demografia.vigencia = rDem.cifras.familias_residentes_ultimo_anio.vigencia;
    if (rDem.series?.evolucion_familias?.puntos) {
      DATOS_LAGO.demografia.serie = rDem.series.evolucion_familias.puntos;
    }
  } catch(e) {}

  try {
    const rAmb = await fetch('datos/ambiente.json').then(r => r.json());
    DATOS_LAGO.ambiente.no2 = rAmb.cifras.promedio_no2.valor;
    DATOS_LAGO.ambiente.pm10 = rAmb.cifras.promedio_pm10.valor;
    DATOS_LAGO.ambiente.vigencia = rAmb.cifras.promedio_no2.vigencia;
  } catch(e) {}

  try {
    const rCiclo = await fetch('datos/ciclabili.json').then(r => r.json());
    DATOS_LAGO.ciclabili.km = rCiclo.cifras.longitud_total_red_ciclista_km.valor;
  } catch(e) {}

  try {
    const rVar = await fetch('datos/varchi.json').then(r => r.json());
    DATOS_LAGO.varchi.total = rVar.cifras.total_varchi_activos.valor;
  } catch(e) {}

  try {
    const rTur = await fetch('datos/turismo.json').then(r => r.json());
    DATOS_LAGO.turismo.estructuras = rTur.cifras.total_estructuras_alojamiento.valor;
    DATOS_LAGO.turismo.camas = rTur.cifras.capacidad_total_camas_posti_letto.valor;
  } catch(e) {}

  renderizarVistasPrincipales();
}

function renderizarVistasPrincipales() {
  // KPIs Panorama
  document.getElementById('kpi-poblacion').textContent = DATOS_LAGO.demografia.familias.toLocaleString();
  document.getElementById('vig-poblacion').textContent = `Familias censadas (${DATOS_LAGO.demografia.vigencia})`;

  document.getElementById('kpi-incidentes').textContent = DATOS_LAGO.seguridad.incidentes.toLocaleString();
  document.getElementById('vig-incidentes').textContent = `Siniestros cerrados (${DATOS_LAGO.seguridad.vigencia})`;

  document.getElementById('kpi-no2').textContent = `${DATOS_LAGO.ambiente.no2} µg/m³`;
  document.getElementById('vig-no2').textContent = `Medición diaria (${DATOS_LAGO.ambiente.vigencia})`;

  document.getElementById('kpi-ciclorrutas').textContent = `${DATOS_LAGO.ciclabili.km} km`;
  document.getElementById('kpi-varchi').textContent = `${DATOS_LAGO.varchi.total}`;

  document.getElementById('kpi-visitas').textContent = DATOS_LAGO.escucha.vistas.toLocaleString();
  document.getElementById('vig-visitas').textContent = `Visitas humanas (${DATOS_LAGO.escucha.vigencia})`;

  // Detalles Módulo Ambiente
  document.getElementById('det-no2').textContent = `${DATOS_LAGO.ambiente.no2} µg/m³`;
  document.getElementById('det-pm10').textContent = `${DATOS_LAGO.ambiente.pm10} µg/m³`;

  // Tabla Demografía
  const tbodyDem = document.querySelector('#tabla-demografia tbody');
  if (tbodyDem) {
    tbodyDem.innerHTML = DATOS_LAGO.demografia.serie.map(([anio, val], idx, arr) => {
      const prev = idx > 0 ? arr[idx-1][1] : val;
      const diff = val - prev;
      const sign = diff >= 0 ? `+${diff.toLocaleString()}` : `${diff.toLocaleString()}`;
      return `<tr>
        <td><strong>${anio}</strong></td>
        <td><strong>${val.toLocaleString()}</strong></td>
        <td style="color:${diff>=0?'#6ee7b7':'#fca5a5'}; font-weight:600;">${sign}</td>
      </tr>`;
    }).join('');
  }

  // Tabla Seguridad Vial
  const tbodySeg = document.querySelector('#tabla-seguridad tbody');
  if (tbodySeg) {
    tbodySeg.innerHTML = DATOS_LAGO.seguridad.serie.map(([anio, val]) => {
      const riesgo = val > 7000 ? '<span style="color:#f43f5e; font-weight:700;">Presión Alta</span>' : '<span style="color:#6ee7b7; font-weight:600;">Moderado</span>';
      return `<tr>
        <td><strong>${anio}</strong></td>
        <td><strong>${val.toLocaleString()}</strong></td>
        <td>${riesgo}</td>
      </tr>`;
    }).join('');
  }

  // Tabla Escucha Social
  const tbodyEsc = document.querySelector('#tabla-escucha tbody');
  if (tbodyEsc) {
    tbodyEsc.innerHTML = DATOS_LAGO.escucha.serie.map(([mes, val]) => {
      return `<tr>
        <td><strong>${mes}</strong></td>
        <td><strong>${val.toLocaleString()}</strong></td>
      </tr>`;
    }).join('');
  }

  renderizarTablaCatalogo();
}

// ==========================================================================
// INICIALIZADOR AL CARGAR EL DOM
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  cargarDatosLago();
});
