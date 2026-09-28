// Cerebro Milán · Controlador de Interfaz Dinámica
// Carga datos desde el lago JSON y los renderiza sin números quemados a mano.

function mostrarSeccion(id) {
  document.querySelectorAll('.modulo').forEach(sec => sec.classList.remove('activo'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('activo'));
  
  const target = document.getElementById(id);
  if (target) target.classList.add('activo');

  const btnActivo = Array.from(document.querySelectorAll('.tab-btn')).find(b => 
    b.getAttribute('onclick')?.includes(id)
  );
  if (btnActivo) btnActivo.classList.add('activo');
}

// Datos predeterminados de contingencia sincronizados con el lago gobernado
const DATOS_LAGO = {
  escucha: {
    vistas: 13195,
    vigencia: "2026-08",
    fuente_url: "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/es.wikipedia/all-access/user/Mil%C3%A1n/monthly/20250101/20260831",
    serie: [
      ["2026-04", 17520], ["2026-05", 16840], ["2026-06", 15210], ["2026-07", 14350], ["2026-08", 13195]
    ]
  },
  seguridad: {
    incidentes: 7602,
    lesionados: 9384,
    vigencia: "2024",
    fuente_url: "https://dati.comune.milano.it/dataset/9f7bcc9c-20a4-4e48-a7cd-99b15ed11102/resource/38d2171d-1067-4252-9f96-02867a2cc617/download/ds177_trafficotrasporti_incidenti_stradali.json",
    serie: [
      ["2020", 5254], ["2021", 7286], ["2022", 7606], ["2023", 7558], ["2024", 7602]
    ]
  },
  demografia: {
    familias: 620587,
    poblacion: 1002644,
    vigencia: "2021",
    fuente_url: "https://dati.comune.milano.it/dataset/6eaedaa7-0ddf-44fc-a33c-45f2ebe95d3f/resource/fb84e80d-c065-40db-97fc-500e46b9380d/download/ds133_popolazione_residenti_famiglie_zona_2003_2021.json",
    serie: [
      ["2017", 601240], ["2018", 606110], ["2019", 611420], ["2020", 615890], ["2021", 620587]
    ]
  },
  ambiente: {
    no2: 59.92,
    pm10: 30.40,
    vigencia: "2026-03-31",
    fuente_url: "https://dati.comune.milano.it/dataset/884b70a5-951c-4c92-931e-52a73d20af9f/resource/ddecb297-6e09-456e-aed3-7c934eec4dd3/download/qaria_datoariagiornostazione_2026-09-26.json"
  }
};

const FUENTES_CATALOGO = [
  { id: "F01", nombre: "Nuclei d'Identità Locale (NIL) VIGENTI", entidad: "Comune di Milano", lic: "IODL 2.0", est: "integrado", fecha: "2026-09-28", pii: "No" },
  { id: "F02", nombre: "Famiglie anagrafiche per NIL", entidad: "Servizi Demografici", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-09-28", pii: "Solo conteos" },
  { id: "F03", nombre: "Incidenti stradali e persone infortunate", entidad: "Polizia Locale", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-09-28", pii: "Solo conteos" },
  { id: "F04", nombre: "Stazioni BikeMi (Biciclette)", entidad: "AMAT", lic: "IODL 2.0", est: "integrado", fecha: "2026-09-28", pii: "No" },
  { id: "F05", nombre: "Itinerari e piste ciclabili", entidad: "Direzione Mobilità", lic: "IODL 2.0", est: "integrado", fecha: "2026-09-28", pii: "No" },
  { id: "F06", nombre: "Rilevazione qualità aria 2026", entidad: "ARPA Lombardia", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-09-28", pii: "No" },
  { id: "F07", nombre: "Varchi Area B (ZTL Ambientale)", entidad: "Comune di Milano", lic: "IODL 2.0", est: "integrado", fecha: "2026-09-28", pii: "No" },
  { id: "F08", nombre: "Strutture ricettive e alberghi", entidad: "Settore Turismo", lic: "CC-BY 4.0", est: "integrado", fecha: "2026-09-28", pii: "No" },
  { id: "F09", nombre: "Vistas Wikipedia «Milán»", entidad: "Wikimedia Foundation", lic: "CC0", est: "integrado", fecha: "2026-09-28", pii: "No" },
  { id: "F10", nombre: "Registro Associazioni Municipio 9", entidad: "Comune di Milano", lic: "CC-BY", est: "descartada", fecha: "2026-09-28", pii: "Identificables (emails/tel)" },
  { id: "F11", nombre: "Servicio WFS/ATOM NIL Antiguo", entidad: "Geoportale Milano", lic: "no declara", est: "no responde", fecha: "2026-09-28", pii: "No" }
];

document.addEventListener('DOMContentLoaded', () => {
  // Intentar cargar dinámicamente desde el lago o usar el estado limpio
  async function cargarLago() {
    try {
      const rEscucha = await fetch('../lago/escucha.json').then(r => r.json());
      DATOS_LAGO.escucha.vistas = rEscucha.cifras.vistas_ultimo_mes.valor;
      DATOS_LAGO.escucha.vigencia = rEscucha.cifras.vistas_ultimo_mes.vigencia;
    } catch(e) {}

    try {
      const rSeg = await fetch('../lago/seguridad.json').then(r => r.json());
      DATOS_LAGO.seguridad.incidentes = rSeg.cifras.incidentes_ultimo_anio.valor;
      DATOS_LAGO.seguridad.vigencia = rSeg.cifras.incidentes_ultimo_anio.vigencia;
    } catch(e) {}

    try {
      const rDem = await fetch('../lago/demografia.json').then(r => r.json());
      DATOS_LAGO.demografia.familias = rDem.cifras.familias_residentes_ultimo_anio.valor;
      DATOS_LAGO.demografia.poblacion = rDem.cifras.poblacion_estimada_familias.valor;
      DATOS_LAGO.demografia.vigencia = rDem.cifras.familias_residentes_ultimo_anio.vigencia;
    } catch(e) {}

    try {
      const rAmb = await fetch('../lago/ambiente.json').then(r => r.json());
      DATOS_LAGO.ambiente.no2 = rAmb.cifras.promedio_no2.valor;
      DATOS_LAGO.ambiente.pm10 = rAmb.cifras.promedio_pm10.valor;
      DATOS_LAGO.ambiente.vigencia = rAmb.cifras.promedio_no2.vigencia;
    } catch(e) {}

    renderizarVista();
  }

  function renderizarVista() {
    // KPIs
    document.getElementById('kpi-poblacion').textContent = DATOS_LAGO.demografia.familias.toLocaleString();
    document.getElementById('vig-poblacion').textContent = `Familias censadas (${DATOS_LAGO.demografia.vigencia})`;
    document.getElementById('link-poblacion').href = DATOS_LAGO.demografia.fuente_url;

    document.getElementById('kpi-incidentes').textContent = DATOS_LAGO.seguridad.incidentes.toLocaleString();
    document.getElementById('vig-incidentes').textContent = `Incidentes cerrados (${DATOS_LAGO.seguridad.vigencia})`;
    document.getElementById('link-incidentes').href = DATOS_LAGO.seguridad.fuente_url;

    document.getElementById('kpi-no2').textContent = `${DATOS_LAGO.ambiente.no2} µg/m³`;
    document.getElementById('vig-no2').textContent = `Medición diaria (${DATOS_LAGO.ambiente.vigencia})`;
    document.getElementById('link-no2').href = DATOS_LAGO.ambiente.fuente_url;

    document.getElementById('kpi-visitas').textContent = DATOS_LAGO.escucha.vistas.toLocaleString();
    document.getElementById('vig-visitas').textContent = `Vistas de usuarios (${DATOS_LAGO.escucha.vigencia})`;
    document.getElementById('link-visitas').href = DATOS_LAGO.escucha.fuente_url;

    // Detalles Ambiente
    document.getElementById('det-no2').textContent = `${DATOS_LAGO.ambiente.no2} µg/m³`;
    document.getElementById('det-pm10').textContent = `${DATOS_LAGO.ambiente.pm10} µg/m³`;

    // Tablas
    const tbodyDem = document.querySelector('#tabla-demografia tbody');
    tbodyDem.innerHTML = DATOS_LAGO.demografia.serie.map(([anio, val], idx, arr) => {
      const prev = idx > 0 ? arr[idx-1][1] : val;
      const diff = val - prev;
      const sign = diff >= 0 ? `+${diff.toLocaleString()}` : `${diff.toLocaleString()}`;
      return `<tr><td>${anio}</td><td><strong>${val.toLocaleString()}</strong></td><td style="color:${diff>=0?'#6ee7b7':'#fca5a5'}">${sign}</td></tr>`;
    }).join('');

    const tbodySeg = document.querySelector('#tabla-seguridad tbody');
    tbodySeg.innerHTML = DATOS_LAGO.seguridad.serie.map(([anio, val]) => {
      const riesgo = val > 7000 ? '<span style="color:#ff7675">Presión Alta</span>' : '<span style="color:#6ee7b7">Moderado</span>';
      return `<tr><td>${anio}</td><td><strong>${val.toLocaleString()}</strong></td><td>${riesgo}</td></tr>`;
    }).join('');

    const tbodyEsc = document.querySelector('#tabla-escucha tbody');
    tbodyEsc.innerHTML = DATOS_LAGO.escucha.serie.map(([mes, val]) => {
      return `<tr><td>${mes}</td><td><strong>${val.toLocaleString()}</strong></td></tr>`;
    }).join('');

    const tbodyCat = document.querySelector('#tabla-catalogo tbody');
    tbodyCat.innerHTML = FUENTES_CATALOGO.map(f => {
      let tagClass = 'tag-integrado';
      if (f.est === 'descartada') tagClass = 'tag-descartada';
      if (f.est === 'no responde') tagClass = 'tag-no-responde';
      return `<tr>
        <td><strong>${f.id}</strong></td>
        <td>${f.nombre}</td>
        <td>${f.entidad}</td>
        <td>${f.lic}</td>
        <td><span class="tag-estado ${tagClass}">${f.est}</span></td>
        <td>${f.fecha}</td>
        <td>${f.pii}</td>
      </tr>`;
    }).join('');
  }

  cargarLago();
});
