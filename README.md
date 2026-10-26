# Milán · Sistema Territorial de Información y Gemelo Urbano Gobernado

**Grupo:**  
- **Curaduría (Data Steward):** Mateo Santiago Sanz Mejía  
- **Datos (Custodia Técnica):** Alyson Henao  
- **Interfaz (Desarrollo Web & UX):** Samuel Arango  
- **Seguridad (Privacidad & SecOps):** Emily Cardona  

**Enlace Público Desplegado:** [https://cerebro-milan.vercel.app](https://cerebro-milan.vercel.app)  
**Revisado:** 2026-10-26 (Entrega 2 · Visualización y Auditoría Cartográfica)

---

## Para quién y qué pregunta
- **Usuario:** Dirección de Planificación y Resiliencia Urbana (*Comune di Milano*), concejales del área metropolitana, urbanistas encargados del Plan General del Territorio (*PGT 2030*) y veedurías ciudadanas enfocadas en movilidad activa, calidad ambiental y descarbonización urbana.
- **Preguntas centrales que responde el lago:**
  1. *¿Cómo se distribuye la presión demográfica y la densidad habitacional entre los 88 barrios (NIL) y 9 municipios?* (Respondida con el histórico de familias y residentes censados en `lago/demografia.json` y `territorio/nil.geojson`, F02 y F12).
  2. *¿Cuál es el panorama forense de seguridad vial y dónde se concentran las colisiones y lesionados?* (Respondida con las estadísticas de la *Polizia Locale* en `lago/seguridad.json`, F03).
  3. *¿Cuál es la exposición diaria continua a contaminantes críticos como el dióxido de nitrógeno (NO2) y material particulado (PM10)?* (Respondida mediante las lecturas de ARPA Lombardia en `lago/ambiente.json`, F06).
  4. *¿Cómo se articula la red de movilidad activa barrial y qué cobertura ofrece la micromovilidad compartida frente a la zona de bajas emisiones?* (Respondida cruzando los 88 NIL en `territorio/nil.geojson` con las 325 estaciones de BikeMi en `territorio/bikemi.geojson`, los 312.4 km de ciclorrutas en `territorio/ciclabili.geojson` y las 188 cámaras de control ambiental de Área B en `territorio/varchi.geojson`, F01, F04, F05 y F07).
  5. *¿Cuál es el volumen y concentración de la presión turística y capacidad hotelera en la ciudad?* (Respondida con el censo del *Settore Turismo* en `lago/turismo.json`, F08).
  6. *¿Qué interés despierta Milán a nivel internacional en el ámbito hispanohablante?* (Respondida con las consultas humanas sin bots en Wikipedia en `lago/escucha.json`, F09).
- **Escala y comparación:** Escala dual normativa oficial: macro-política en los **9 *Municipi*** y micro-análisis territorial en los **88 *NIL (Nuclei di Identità Locale)***. Cada uno de los 88 barrios cuenta con superficie física exacta calculada mediante proyección métrica oficial en **UTM Zona 32N (EPSG:32632)**, eliminando las distorsiones de áreas en grados angulares (EPSG:4326).
- **Lo que decidimos no mostrar, y por qué:** Decidimos no mostrar nombres de personas, teléfonos personales ni correos de directivos de asociaciones comunitarias (fuente descartada F10), ni coordenadas exactas o marcas de tiempo al minuto de siniestros viales (F03), para mitigar cualquier riesgo de reidentificación de víctimas o estigmatización vecinal, en estricto cumplimiento del RGPD europeo (Reglamento UE 2016/679) y la Ley 1581 de 2012. Asimismo, descartamos telemetría energética comercial (F20) y cámaras con biometría facial (F21).

---

## La réplica
- **Qué replicamos tal cual del ejemplo y qué tuvimos que cambiar para nuestra ciudad:**  
  Replicamos la arquitectura rigurosa de capas del Cerebro Lima:
  - `catalogo/`: Fichas estructuradas de metadatos, licencias, formatos y trazabilidad.
  - `ingesta/`: Scripts modulares, reproducibles e idempotentes en Python puro con 0 dependencias ajenas en la cadena de suministro.
  - `lago/`: Contrato estricto JSON con separación de crudos en `lago/raw/` (bronce) y datos limpios en `lago/` (plata).
  - `territorio/`: Cartografía vectorial oficial en GeoJSON con proyección métrica verificada (UTM 32N / EPSG:32632) y CSV con los 88 NIL, 325 puntos BikeMi, 8 dorsales ciclistas y 188 varchi de Área B.
  - `verificacion/`: Compuerta de calidad y privacidad automatizada antes del despliegue (*Policy-as-Code* con `verificar.py`).
  - `web/`: Visualizador interactivo de alto impacto visual, responsive y ultra-ligero que consume dinámicamente el lago JSON sin números quemados a mano (oro).  
  
  Tuvimos que cambiar el esquema territorial (de los 43 distritos y 14 zonas de Lima a los 9 Municipi y 88 NIL de Milán), los adaptadores de descarga para la API CKAN del Comune di Milano (`dati.comune.milano.it`) y la expresión regular de auditoría PII para teléfonos móviles italianos (`(?<!\d)(?:\+39\s?)?3\d{8,9}(?!\d)`).

- **Rastreo ampliado (24 fuentes totales):**
  - **Integradas al lago (14 fuentes):** F01 (NIL PGT 2030), F02 (Familias per NIL), F03 (Siniestros viales), F04 (BikeMi), F05 (Ciclovías), F06 (Calidad de aire 2026), F07 (Varchi Área B), F08 (Capacidad hotelera), F09 (Vistas Wikipedia), F12 (Población por edad POSAS), F13 (Espacios verdes y parques), F14 (Metro y tranvía ATM), F15 (Servicios educativos), F16 (Farmacias y salud) y F24 (Índice de vulnerabilidad PGT 2030).
  - **Candidatas (3 fuentes):** F17 (Electrolineras públicas), F18 (Mercados comunales), F19 (Mapeo acústico Lden).
  - **Descartadas (4 fuentes):** F10 (Associazioni Municipio 9 por PII directo), F20 (Telemetría de consumo eléctrico A2A por secreto comercial NIS2), F21 (Cámaras con reconocimiento facial por prohibición del Garante Privacy y Ley de IA europea), F22 (Geoportal histórico regional por exigir tarjeta de crédito comercial).
  - **No responden / caídas (2 fuentes):** F11 (Servicio ATOM histórico por falla DNS `getaddrinfo failed`), F23 (API real-time ATM bloqueada por Cloudflare HTTP 403 Forbidden).

- **Huecos: lo que buscamos y no existe abierto para esta ciudad:**  
  Buscábamos telemetría de consumo de energía eléctrica y gas en tiempo real por cada uno de los 88 NIL para medir la presión energética vecinal (equivalente al caso de Miraflores en Lima). El operador metropolitano (*A2A Reti*) no publica este dato de forma abierta ni gratuita al amparo de la Directiva NIS2 de infraestructura crítica. Lo sustituimos asociando dos fuentes proxies indirectas: las 188 cámaras de control vehicular de la Zona de Bajas Emisiones Área B (F07) y las mediciones continuas de NO2 de ARPA (F06).

---

## ¿Se puede usar? (Semáforo de Licencias y Gobernanza)

| ID | Fuente | Licencia | Datos de Personas | Estado | Condición y Atribución |
|---|---|---|---|---|---|
| **F01** | Nuclei d'Identità Locale (NIL) VIGENTI | IODL 2.0 | No | Integrada | Atribución al Comune di Milano (PGT 2030) |
| **F02** | Famiglie anagrafiche per NIL (1999-2025) | CC-BY 4.0 | Solo conteos por zona | Integrada | Citar Servizi Demografici di Milano |
| **F03** | Incidenti stradali e persone infortunate | CC-BY 4.0 | Solo conteos por zona | Integrada | Citar Polizia Locale di Milano |
| **F04** | Stazioni BikeMi (Biciclette condivise) | IODL 2.0 | No | Integrada | Atribución a AMAT / Comune di Milano |
| **F05** | Itinerari e piste ciclabili di Milano | IODL 2.0 | No | Integrada | Atribución a Direzione Mobilità |
| **F06** | Qualità dell'aria 2026 (Stazioni fisse) | CC-BY 4.0 | No | Integrada | Citar Comune di Milano / ARPA Lombardia |
| **F07** | Varchi Area B (ZTL Ambientale) | IODL 2.0 | No | Integrada | Atribución al Comune di Milano |
| **F08** | Strutture ricettive e alberghi (ds216) | CC-BY 4.0 | No | Integrada | Citar Settore Turismo di Milano |
| **F09** | Vistas mensuales Wikipedia «Milán» | CC0 | No | Integrada | Dominio público (Wikimedia REST API) |
| **F10** | Registro Associazioni Municipio 9 | CC-BY | Personas identificables (email, cel) | **Descartada** | Violación flagrante de RGPD / Ley 1581 |
| **F11** | Servicio WFS/ATOM NIL Antiguo | No declara | No | **No responde** | Error DNS `getaddrinfo failed` en geoportale |
| **F12** | Popolazione per sesso ed età per NIL (POSAS) | IODL 2.0 | Solo conteos por zona | Integrada | Citar Comune di Milano - Servizi Demografici |
| **F13** | Dotazione verde urbano e parchi per NIL | CC-BY 4.0 | No | Integrada | Citar Area Verde e Agricoltura |
| **F14** | Rete trasporto pubblico su ferro ATM | IODL 2.0 | No | Integrada | Citar ATM Milano / AMAT |
| **F15** | Servizi educativi: asili nido e scuole | CC-BY 4.0 | No | Integrada | Citar Direzione Educazione |
| **F16** | Farmacie e presidi sanitari per NIL | CC-BY 4.0 | No | Integrada | Citar ATS Città Metropolitana di Milano |
| **F17** | Colonnine ricarica elettrica pubblica | IODL 2.0 | No | Candidata | Pendiente homologar cobertura por NIL |
| **F18** | Mercati comunali coperti e rionali | CC-BY 4.0 | No | Candidata | Pendiente normalizar topónimos con PGT |
| **F19** | Mappatura acustica strategica (Lden) | CC-BY 4.0 | No | Candidata | Requiere pre-procesamiento ráster GIS |
| **F20** | Telemetria consumi elettrici A2A live | Privada | No | **Descartada** | Secreto industrial y reserva legal NIS2 |
| **F21** | Videosorveglianza con biometria facial | Reservada | Personas identificables | **Descartada** | Prohibición Garante Privacy / AI Act UE |
| **F22** | Portale Geotopografico SIT Storico | Comercial | No | **Descartada** | Requiere tarjeta de crédito bancaria de pago |
| **F23** | API transito real-time veicoli ATM | No declara | No | **No responde** | Bloqueo Cloudflare HTTP 403 Forbidden |
| **F24** | Indice vulnerabilità sociale per NIL | IODL 2.0 | Solo índices | Integrada | Citar ISTAT / Comune di Milano |

---

## Bitácora de exploración de herramientas
*Cumplimiento del encargo: Por lo menos dos herramientas probadas por tramo sobre los mismos datos antes de elegir una.*

| Tramo | Herramienta | Qué pidió para empezar | Licencia | Dónde quedan los datos | ¿Se rehace con un comando? | Estado del proyecto | Qué resolvió | Qué no pudo | ¿Quedó? ¿Por qué? |
|---|---|---|---|---|---|---|---|---|---|
| **Ingesta** | Python estándar (`urllib`, `json`) | Solo Python base (0 paquetes) | PSF License | Local y repositorio | Sí (`python script.py`) | Nativo estable | Ingesta limpia, control de headers y cero dependencias | No infiere esquemas automáticamente | **SÍ**. Máxima reproducibilidad y 0 dependencias en cadena de suministro. |
| **Ingesta** | `dlt` (data load tool) | pip install `dlt[duckdb]` (+38 paquetes) | Apache 2.0 | Base DuckDB local | Sí (`python dlt_script.py`) | Activo 2026 | Inferencia automática de esquemas y tablas `_dlt_loads` | Añade 38 dependencias externas ajenas | **NO**. Excesiva sobrecarga para APIs y archivos JSON estables. |
| **Lago** | `DuckDB` | pip install `duckdb` (1 paquete) | MIT | Memoria o archivo local | Sí (`python duckdb_milano.py`) | v1.5.6 (2026) | Consultas SQL relacionales analíticas directas sobre JSON crudo | No genera interfaces web visuales | **SÍ (Laboratorio)**. Motor OLAP in-process ideal para auditoría analítica. |
| **Lago** | `Polars` | pip install `polars` (2 paquetes) | MIT | Memoria RAM | Sí (`python polars_milano.py`) | Activo 2026 | Procesamiento vectorial de DataFrames y estadísticas | Requiere aplanar estructuras JSON anidadas antes de operar | **NO**. DuckDB lee JSON anidado directo con sintaxis SQL estándar. |
| **Verificación** | `verificar.py` (propio) | 0 paquetes (Python estándar) | Libre | Local | Sí (`python verificar.py`) | Script propio | Compuerta estricta: fechas ISO, contrato de cifras, regex PII italiano y proyección métrica UTM 32N | Requiere programar reglas a mano | **SÍ**. Adaptado a la normativa italiana de PII y proyección EPSG:32632 con 0 dependencias. |
| **Verificación** | `frictionless` | pip install `frictionless` (+39 paquetes) | MIT | Local | Sí (`python frictionless_milano.py`) | v5.19.1 | Validación declarativa de tipos de datos en tablas y catálogos | Falla con delimitadores `;` sin dialecto explícito y no audita PII en texto | **NO**. Sobreingeniería de dependencias para validar contratos. |
| **Territorio** | `Leaflet / GeoJSON` + UTM 32N | CDN (1 CSS + 1 JS) | BSD-2-Clause | Navegador cliente | Sí (al abrir la página) | v1.9.4 | Carga instantánea de 88 polígonos NIL, 325 BikeMi, ciclovías y varchi con coropletas dinámicas | No renderiza modelos volumétricos 3D pesados | **SÍ**. Ligero (39 KB), abierto, compatible con móviles y cumple el piso técnico territorial. |
| **Territorio** | `kepler.gl` | Navegador o Jupyter (+React) | MIT | Navegador | No (interfaz manual) | Activo | Mapas de calor y extrusión 3D de alta densidad en WebGL | Exportación estática muy pesada e inflexible para contratos dinámicos | **NO**. Excelente para explorar datos espaciales, no para publicar. |
| **Vistas** | HTML5 + CSS moderno + Vanilla JS | 0 instalaciones | W3C Estándar | Navegador cliente | Sí (servido estático en Vercel) | Estándar W3C | Rendimiento instantáneo, funciona en teléfonos, consume el lago JSON por `fetch()` | Sin reactividad de framework pesado | **SÍ**. 0 costo de infraestructura, portable, auditable, rápido y seguro. |
| **Vistas** | `Streamlit` | pip install `streamlit` (+35 paquetes) | Apache 2.0 | Servidor Python en la nube | Sí (`streamlit run ...`) | Activo 2026 | Tableros interactivos completos en menos de 40 líneas Python | Requiere servidor activo continuo (no es estático), límites de sesión en nube gratuita | **NO**. Descartado por requerir runtime 24/7 en la nube y falta de control de sesión estática. |
| **IA sobre lago** | `Claude Code / Antigravity CLI` | CLI en terminal con permisos controlados | Comercial | Local | Sí | Activo 2026 | Generación de scripts, auditoría de regexes y contraste con terminal | Puede inventar rutas REST verosímiles que devuelven 404 si no se auditan | **SÍ**. Utilizada como asistente de código con auditoría humana de terminal obligatoria. |
| **IA sobre lago** | Chat web genérico (sin terminal) | Interfaz web | Comercial | Nube ajena | No | Activo | Propuestas teóricas rápidas de fuentes y conceptos | Alucina URLs inexistentes sin capacidad de ejecución ni verificación curl | **NO**. No permite contrastar la existencia real del enlace. |

---

## Protección y Seguridad
- **Nivel de protección:** Abierto, solo agregados (con separación estricta de crudos y sanitización activa de PII).
- **Qué protegemos, y de quién:** Protegemos la identidad, privacidad y derechos fundamentales de ciudadanos, víctimas de siniestros viales y líderes comunitarios frente a raspadores automáticos, cruces maliciosos de bases de datos (*record linkage*) y actores que busquen perfilar o reidentificar personas.
- **Pruebas de terminal y de gobernanza:**
  ```bash
  # Verificación automatizada de integridad, contratos, dominio, proyección métrica y ausencia de PII:
  python verificacion/verificar.py
  # Resultado: PASS en todas las comprobaciones (0 fallos)
  ```
- **Revisión de secretos en el historial:**
  ```bash
  git log -p | grep -n -i -E "clave|secret|password|api_key|token"
  # Resultado: Ningún secreto ni credencial expuesta en el historial git
  ```

---

## Herramienta elegida para las vistas
- **Qué necesitábamos mostrar:** Indicadores ejecutivos (KPIs) con procedencia visible a un clic mediante modal interactivo, mapa territorial temático con coropletas configurables sobre los 88 NIL, capas vectoriales de movilidad activa (BikeMi, ciclovías F05) y control ambiental (Varchi Área B F07), comparador barrial con rankings de densidad y áreas verdes, series temporales demográficas y forenses, y el catálogo completo de 24 fuentes gobernadas.
- **Qué teníamos que proteger:** La reproducibilidad del dato, garantizando que ninguna cifra dependa de servidores de terceros que puedan cobrar o caerse, y la privacidad de los usuarios finales al no enviar datos de navegación a servicios externos.
- **Por qué esta herramienta cumple las dos cosas, y cuál descartamos por poco:** Elegimos **HTML5, CSS moderno con estética milanesa (Slate Obsidian / Tram Gold / Navigli Cyan) y JavaScript Vanilla con Leaflet** porque funciona en cualquier navegador móvil o de escritorio sin frameworks pesados, no expone datos fuera de nuestro control y consume directamente el lago JSON estático. Descartamos *Streamlit* porque requería hospedar un contenedor con runtime de Python en la nube y su plan comunitario limita el control de sesiones y privacidad; y descartamos *Observable Framework* por arrastrar más de 260 dependencias en npm.

---

## Nuestra posición frente a las reflexiones

### 1. Reflexión de Gestión y Gobierno de Datos: *Privacidad: Público no es inocuo*
* **Nuestra postura:** Coincidimos plenamente con la tesis de Latanya Sweeney y el principio de acceso y circulación restringida de la Ley 1581 / RGPD. Que un portal público libere un dataset (como ocurrió con la fuente F10 de asociaciones vecinales) no significa que sea ético o seguro incorporarlo en un gemelo urbano.
* **Evidencia en nuestro sistema:** Durante el rastreo identificamos que el dataset `ds1341` contenía nombres propios, correos directos (`@psicologoalparco.it`) y números de celular. Si este conjunto se hubiera cruzado con la cartografía de los NIL o los censos de vivienda, habría permitido geolocalizar y perfilar a directivos vecinales sin su consentimiento. La decisión de gobernanza fue **clasificarla como Descartada**, configurar el verificador con regex para celulares italianos (`+39 3...`) y correos, y asegurar que solo datos agregados por zona alimenten las vistas.

### 2. Reflexión de Ciberseguridad: *Cadena de suministro: Explorar es ampliar la superficie de ataque*
* **Nuestra postura:** Cada dependencia adicional instalada representa un tercero no auditado con capacidad de ejecutar código en nuestra infraestructura. En proyectos de datos la tendencia a instalar bibliotecas de moda (*hype*) multiplica la superficie de exposición a ataques como los documentados en XZ Utils o paquetes maliciosos en PyPI.
* **Evidencia en nuestro sistema:** En la exploración del laboratorio medimos que la ingesta estándar con Python requirió **0 dependencias adicionales**, mientras que `dlt[duckdb]` trajo consigo **38 paquetes ajenos**, `frictionless` trajo **39 paquetes** y `streamlit` trajo **35 paquetes**. Por esa razón técnica y de ciberseguridad, decidimos mantener la ingesta y la verificación en producción sobre la biblioteca estándar de Python, reservando herramientas más complejas únicamente para entornos aislados de análisis.

---

## Bitácora de Auditoría a la Inteligencia Artificial

| # | Tramo | Herramienta | Qué le encargamos | Qué entregó | Qué le corregimos |
|---|---|---|---|---|---|
| 1 | Rastreo | Claude Code / Antigravity | Localizar la escala y subdivisión territorial oficial de Milán para el gemelo | Sugirió buscar por 'distretti' genéricos o comunas metropolitanas | Corregimos consultando la normativa del PGT 2030 del Comune: la unidad oficial son los 88 NIL (Nuclei di Identità Locale). |
| 2 | Rastreo | Claude Code / Antigravity | Localizar la API oficial de calidad de aire en tiempo real para Milán | Sugirió la ruta ficticia `/api/v1/airquality/stations.json` | Comprobamos con curl que devolvía 404; rastreamos mediante el catálogo CKAN oficial el dataset real vigente `ds2969` (septiembre 2026). |
| 3 | Ingesta | Antigravity | Script para calcular las vistas de Wikipedia para Milán | Script base con acento en la URL (`Milán`) | La API de Wikimedia exige el título canónico normalizado con URL encoding (`Mil%C3%A1n`) para evitar respuestas de desambiguación. |
| 4 | Verificación | Antigravity | Escribir regex para detección de PII | Regex limitada a celulares colombianos (`3\d{9}`) | Se corrigió agregando el prefijo internacional y el formato de numeración móvil de Italia (`(?:\+39\s?)?3\d{8,9}`). |
| 5 | Territorio | Antigravity / Claude | Auditar y verificar el cálculo de superficie territorial de los 88 NIL | Calculó área en Python aplicando Shoelace directamente sobre coordenadas de lat/lon en EPSG:4326, produciendo grados cuadrados (`0.00027 deg²`) | Corregimos implementando la reproyección cartográfica rigurosa Transversa de Mercator a **UTM Zona 32N (EPSG:32632)**, logrando coincidencia exacta en m² y km² con el catastro oficial (2.34 km² para Duomo). |
| 6 | Visualización | Antigravity | Diseñar la vista de los 88 NIL y capas de movilidad | Propuso tablas estáticas sin interactividad espacial | Implementamos mapa coroplético dinámico con Leaflet, selector de métricas, capas conmutables (BikeMi, ciclovías F05, varchi F07) y ficha territorial interactiva con rankings. |

---

## Revisión cruzada
- **Tres cifras auditadas por otro grupo:** Se auditaron: (1) Las 13,195 visitas de Wikipedia en agosto 2026; (2) Los 7,602 incidentes viales de 2024; (3) Los 59.92 µg/m³ de promedio de NO2. Las 3 cifras coinciden exactamente con los registros descargados de las fuentes primarias.
- **Ataque autorizado:** Intentos de inyección y bypass sobre parámetros de consulta demostraron que el sistema estático no expone bases de datos relacionales subyacentes ni ejecuta sentencias SQL en el cliente. Al no requerir autenticación para datos agregados públicos, no hay compuertas de mentira vulnerables en JavaScript.
- **Vueltas atrás en la ruta:** 
  1. Del tramo de *Permiso* volvimos al *Rastreo* cuando el análisis de la fuente F10 demostró PII directo (asociaciones vecinales).
  2. De *Ingesta* volvimos al *Catálogo* al verificar que el servicio ATOM F11 tenía el DNS caído (`getaddrinfo failed`).
  3. De *Vistas* volvimos al *Territorio* para corregir la proyección cartográfica de EPSG:4326 a UTM Zona 32N (EPSG:32632) al detectar que el área salía en grados cuadrados.

---

## Preparación para la Presentación en Clase (Las 3 Preguntas Obligatorias)

1. **¿Qué herramienta descartamos que casi elegimos?**  
   *Descartamos `dlt` en la ingesta y `Streamlit` en las vistas.* Estuvimos a punto de usar `dlt` por la comodidad de inferir esquemas y registrar metadatos de carga automáticamente, pero descubrimos que agregaba 38 dependencias externas a la cadena de suministro. En vistas casi elegimos `Streamlit`, pero requería mantener un servidor en Python corriendo en la nube permanentemente en lugar de un sitio estático ultra-rápido, interactivo y seguro servido en Vercel.

2. **¿Qué decidimos no mostrar?**  
   *Decidimos no mostrar los datos de contacto y nombres de directivos de asociaciones comunitarias del Municipio 9 (Fuente F10 - `ds1341`), ni las coordenadas submétricas de siniestros viales individuales (Fuente F03).* Mostrar F10 violaba el principio de minimización del RGPD y de la Ley 1581; mostrar coordenadas de colisiones en tiempo real permitiría reidentificar víctimas o estigmatizar negocios vecinales.

3. **¿Qué tendría que cambiar para que la respuesta fuera otra?**  
   - En la fuente F10: Que el *Comune di Milano* anonimizara el conjunto publicando solo conteos agrupados de asociaciones por actividad y barrio, sin nombres ni correos personales.
   - En la herramienta: Que `Streamlit` ofreciera exportación nativa a clientes estáticos (vía WebAssembly/Pyodide) sin depender de un contenedor servidor en la nube.
   - En nuestro sistema: Que implementáramos una compuerta de autenticación criptográfica en servidor (HMAC-SHA256 con cookies seguras) si en el futuro se incorporaran datos de telemetría de redes eléctricas y de gas comercialmente sensibles del operador *A2A*.
