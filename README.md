# Milán · Sistema Territorial de Información

Grupo: Curaduría: Mateo Santiago Sanz Mejía (Data Steward) · Datos: [Custodia Técnica Milano] · Interfaz: [Desarrollo Web & UX Milano] · Seguridad: [Privacidad & SecOps Milano]  
Enlace: https://cerebro-milan.vercel.app · Revisado: 2026-10-06

---

## Para quién y qué pregunta
- **Usuario:** Dirección de Planificación y Resiliencia Urbana (*Comune di Milano*), concejales del área metropolitana y urbanistas enfocados en el Plan General del Territorio (*PGT 2030*), movilidad activa y transición ecológica.
- **Preguntas:**
  1. *¿Cuánta gente vive y cómo se distribuye la presión de hogares en la ciudad?* (Evolución histórica de familias y residentes censados por municipio y por NIL).
  2. *¿Cuál es el panorama de seguridad vial y dónde se concentran los lesionados?* (Siniestros viales anuales registrados por la *Polizia Locale* en los 9 Municipi).
  3. *¿Cuál es el nivel de exposición ambiental y calidad del aire?* (Concentraciones de NO2 y PM10 en la red de estaciones fijas de monitoreo diario de ARPA Lombardia).
  4. *¿Qué atención o interés internacional suscita la ciudad?* (Vistas mensuales humanas en Wikipedia en español, filtrando bots y crawlers).
  5. *¿Cómo se distribuye la infraestructura de movilidad activa barrial?* (Cobertura de los 88 NIL cruzada con las 325 estaciones de bicicletas compartidas BikeMi).
- **Escala y comparación:** Escala dual normativa: los **9 *Municipi*** para macro-política pública y los **88 *NIL (Nuclei di Identità Locale)*** para detalle territorial barrial. Se compara la evolución interanual de Milán y sus zonas contra sí misma a lo largo de las series históricas consolidadas (2001-2026).
- **Lo que decidimos no mostrar, y por qué:** Decidimos no mostrar nombres de directivos de organizaciones vecinales ni teléfonos personales (fuente descartada F10), ni coordenadas exactas o marcas de tiempo puntuales de accidentes viales, para prevenir riesgos de reidentificación de víctimas y vecinos conforme al RGPD europeo y la Ley 1581 de 2012.

---

## La réplica
- **Qué replicamos tal cual del ejemplo y qué tuvimos que cambiar para nuestra ciudad:** 
  Replicamos la arquitectura completa de capas del Cerebro Lima:
  - `catalogo/`: Fichas estructuradas de metadatos, licencias y trazabilidad.
  - `ingesta/`: Scripts modulares y reproducibles en Python puro sin llaves.
  - `lago/`: Contrato estricto JSON con separación de crudos en `lago/raw/` (bronce) y datos limpios en `lago/` (plata).
  - `territorio/`: Cartografía vectorial oficial en GeoJSON WGS84 y CSV con los 88 NIL y 325 puntos BikeMi.
  - `verificacion/`: Calidad y privacidad automatizada antes del despliegue (*Policy-as-Code*).
  - `web/`: Presentación pública en cliente consumiendo el lago sin datos quemados a mano (oro).
  
  Tuvimos que cambiar el esquema territorial (de los 43 distritos y 14 zonas de Lima/Miraflores a los 9 Municipi y 88 NIL de Milán) y los adaptadores de API para consumir el catálogo CKAN oficial del Comune di Milano (`dati.comune.milano.it`).
- **Fuentes catalogadas · integradas · caídas · descartadas:** 
  - Catalogadas: 11 fuentes.
  - Integradas: 9 fuentes (F01 a F09: territorio NIL, demografía, incidentes viales, BikeMi, ciclorrutas, calidad de aire 2026, varchi Área B, capacidad hotelera, vistas Wikipedia).
  - Descartadas: 1 fuente (F10 - *Registro Associazioni Municipio 9* por contener correos personales y números celulares de directivos).
  - Caídas / No responden: 1 fuente (F11 - *ATOM NIL Service histórico* por falla de resolución DNS `getaddrinfo failed`).
- **Huecos: lo que buscamos y no existe abierto para esta ciudad:** Buscamos telemetría de consumo eléctrico y gas en tiempo real por cada NIL abierta sin credenciales comerciales pagas, pero el operador metropolitano (*A2A*) no la publica como dato abierto libre. Se sustituyó utilizando como proxies indirectos los puntos de control ambiental de tráfico de Área B (F07) y las mediciones continuas de dióxido de nitrógeno (F06).

---

## ¿Se puede usar?
| Fuente | Licencia | Personas | Estado | Condición |
|---|---|---|---|---|
| F01 (NIL PGT 2030) | IODL 2.0 | No | Integrada | Atribución al Comune di Milano |
| F02 (Famiglie per NIL) | CC-BY 4.0 | Solo conteos por zona | Integrada | Citar Servizi Demografici |
| F03 (Incidenti stradali) | CC-BY 4.0 | Solo conteos por zona | Integrada | Citar Polizia Locale |
| F04 (BikeMi stazioni) | IODL 2.0 | No | Integrada | Atribución a AMAT |
| F05 (Piste ciclabili) | IODL 2.0 | No | Integrada | Atribución a Direzione Mobilità |
| F06 (Qualità aria 2026) | CC-BY 4.0 | No | Integrada | Citar Comune di Milano / ARPA |
| F07 (Varchi Area B) | IODL 2.0 | No | Integrada | Atribución al Comune di Milano |
| F08 (Strutture ricettive) | CC-BY 4.0 | No | Integrada | Citar Settore Turismo |
| F09 (Wikipedia Milán) | CC0 | No | Integrada | Dominio público (Wikimedia API) |
| F10 (Associazioni M9) | CC-BY | Personas identificables | Descartada | Violación de PII / Principio de minimización |
| F11 (NIL ATOM Antiguo) | No declara | No | No responde | Subdominio no resuelve (DNS caído) |

---

## Bitácora de exploración
*Cumplimiento del encargo: Por lo menos dos herramientas probadas por tramo sobre los mismos datos antes de elegir una.*

| Tramo | Herramienta | Qué pidió para empezar | Licencia | Dónde quedan los datos | ¿Se rehace con un comando? | Estado del proyecto | Qué resolvió | Qué no pudo | ¿Quedó? ¿Por qué? |
|---|---|---|---|---|---|---|---|---|---|
| **Ingesta** | Python estándar (`urllib`, `json`) | Solo Python base (0 paquetes) | PSF License | Local y repositorio | Sí (`python script.py`) | Estable nativo | Ingesta limpia, control de headers y cero dependencias | No infiere esquemas automáticamente | **SÍ**. Máxima reproducibilidad y 0 paquetes en cadena de suministro. |
| **Ingesta** | `dlt` (data load tool) | pip install `dlt[duckdb]` (+38 paquetes) | Apache 2.0 | Base DuckDB local | Sí (`python dlt_script.py`) | Activo 2026 | Inferencia automática de esquema y tablas `_dlt_loads` | Añade 38 dependencias a la cadena de suministro | **NO**. Excesiva sobrecarga para fuentes JSON limpias y estables. |
| **Lago** | `DuckDB` | pip install `duckdb` (1 paquete) | MIT | Memoria o archivo local | Sí (`python duckdb_milano.py`) | v1.5.6 (2026) | Consultas SQL relacionales analíticas directas sobre JSON crudo | No genera UI gráfica por sí solo | **SÍ (Laboratorio)**. Motor OLAP in-process ideal para auditoría relacional rápida. |
| **Lago** | `Polars` | pip install `polars` (2 paquetes) | MIT | Memoria RAM | Sí (`python polars_milano.py`) | Activo 2026 | Procesamiento vectorial de DataFrames y cálculos estadísticos | Requiere aplanar estructuras JSON anidadas antes de operar | **NO**. DuckDB lee directo JSON anidado con SQL estándar. |
| **Verificación** | `verificar.py` (propio) | 0 paquetes (Python estándar) | Libre | Local | Sí (`python verificar.py`) | Script propio | Compuerta estricta: formato de fechas, contrato de cifras, regex PII celular Italia y comprobaciones de dominio territorial | Requiere mantenimiento manual de reglas de negocio | **SÍ**. Adaptado a la normativa italiana de PII y 0 dependencias. |
| **Verificación** | `frictionless` | pip install `frictionless` (+39 paquetes) | MIT | Local | Sí (`python frictionless_milano.py`) | v5.19.1 | Validación declarativa de tipos de datos en tablas y catálogos | Falla con delimitadores `;` sin dialecto explícito y no detecta PII en texto libre | **NO**. Sobreingeniería de dependencias para validación de contratos. |
| **Territorio** | `Leaflet / GeoJSON` | CDN (1 CSS + 1 JS) | BSD-2-Clause | Navegador cliente | Sí (al abrir la página) | v1.9.4 | Carga rápida de 88 polígonos NIL y 325 puntos BikeMi en móviles y escritorio con tooltips | No soporta renderizado 3D volumétrico complejo | **SÍ**. Liviano, estándar abierto y cumple el piso técnico territorial. |
| **Territorio** | `kepler.gl` | Navegador o Jupyter (+React) | MIT | Navegador | No (interfaz manual) | Activo | Mapas de calor y extrusión 3D de alta densidad en WebGL | Exportación estática muy pesada e inflexible para contratos dinámicos | **NO**. Excelente para explorar datos espaciales, no para publicar. |
| **Vistas** | HTML5 + CSS + Vanilla JS | 0 instalaciones | W3C Estándar | Navegador cliente | Sí (servido estático en Vercel) | Estándar W3C | Rendimiento instantáneo, funciona en teléfonos, consume el lago JSON por `fetch()` | Sin reactividad de componentes complejos de framework | **SÍ**. 0 costo de infraestructura, portátil, auditable y seguro. |
| **Vistas** | `Streamlit` | pip install `streamlit` (+35 paquetes) | Apache 2.0 | Servidor Python en la nube | Sí (`streamlit run ...`) | Activo 2026 | Tableros interactivos completos en menos de 40 líneas Python | Requiere servidor activo continuo (no es estático), límites de sesión en versión gratuita | **NO**. Descartado por requerir runtime 24/7 en la nube y falta de control de sesión estática. |
| **IA sobre lago** | `Claude Code / Antigravity CLI` | CLI en terminal con permisos controlados | Comercial | Local | Sí | Activo 2026 | Generación de scripts, auditoría de regexes y contraste con terminal | Puede inventar rutas REST verosímiles que devuelven 404 si no se auditan | **SÍ**. Utilizada como asistente de código con auditoría humana de terminal obligatoria. |
| **IA sobre lago** | Chat web genérico (sin terminal) | Interfaz web | Comercial | Nube ajena | No | Activo | Propuestas teóricas rápidas de fuentes y conceptos | Alucina URLs inexistentes sin capacidad de ejecución ni verificación curl | **NO**. No permite contrastar la existencia real del enlace. |

---

## Protección
- **Nivel:** Abierto, solo agregados (con separación estricta de crudos y sanitización de PII).
- **Qué protegemos, y de quién:** Protegemos la identidad y vida privada de ciudadanos, víctimas de siniestros viales y directivos vecinales frente a raspadores automáticos, cruces maliciosos de bases de datos (*record linkage*) y actores que busquen perfilar personas.
- **Pruebas de terminal o de ventana privada:**
  ```bash
  # Verificación de integridad, contratos, dominio y ausencia de PII:
  python verificacion/verificar.py
  # Resultado: PASS en todas las pruebas (0 fallos)
  ```
- **Revisión de secretos en el historial:**
  ```bash
  git log -p | grep -n -i -E "clave|secret|password|api_key|token"
  # Resultado: Ningún secreto ni credencial expuesta en el historial git
  ```

---

## Herramienta elegida para las vistas
- **Qué necesitábamos mostrar:** Indicadores clave (KPIs) con procedencia visible a un clic, mapas territoriales vectoriales con los 88 NIL y estaciones BikeMi, tablas de series temporales de familias e incidentes, monitoreo ambiental diario y el catálogo de fuentes.
- **Qué teníamos que proteger:** La reproducibilidad del dato, garantizando que ninguna cifra dependa de servidores de terceros que puedan cobrar o caerse, y la privacidad de los usuarios finales al no enviar datos de navegación a servicios externos.
- **Por qué esta herramienta cumple las dos cosas, y cuál descartamos por poco:** Elegimos **HTML5, CSS moderno y JavaScript Vanilla con Leaflet** porque funciona en cualquier navegador móvil o de escritorio sin frameworks pesados, no expone datos fuera de nuestro control y consume directamente el lago JSON estático. Descartamos *Streamlit* porque requería hospedar un contenedor con runtime de Python en la nube y su plan comunitario limita el control de sesiones y privacidad; y descartamos *Observable Framework* por arrastrar más de 260 dependencias en npm y no haber lanzado actualizaciones recientes.

---

## Nuestra posición frente a las reflexiones

### 1. Reflexión de Gestión y Gobierno de Datos: *Privacidad: Público no es inocuo*
* **Nuestra postura:** Coincidimos plenamente con la tesis de Latanya Sweeney y el principio de acceso y circulación restringida de la Ley 1581 / RGPD. Que un portal público libere un dataset (como ocurrió con la fuente F10 de asociaciones vecinales) no significa que sea ético o seguro incorporarlo en un gemelo urbano.
* **Evidencia en nuestro sistema:** Durante el rastreo identificamos que el dataset `ds1341` contenía nombres propios, correos (`@psicologoalparco.it`) y números de contacto directo. Si este conjunto se hubiera cruzado con la cartografía de los NIL o los censos de vivienda, habría permitido geolocalizar y perfilar a directivos vecinales sin su consentimiento explícito para este fin. La decisión de gobernanza fue **clasificarla como Descartada**, configurar el verificador con regex para celulares italianos (`+39 3...`) y correos, y asegurar que solo datos agregados por zona alimenten las vistas.

### 2. Reflexión de Ciberseguridad: *Cadena de suministro: Explorar es ampliar la superficie de ataque*
* **Nuestra postura:** Cada dependencia adicional instalada representa un tercero no auditado con capacidad de ejecutar código en nuestra infraestructura. En proyectos de datos la tendencia a instalar bibliotecas de moda (*hype*) multiplica la superficie de exposición a ataques como los documentados en XZ Utils o paquetes maliciosos en PyPI.
* **Evidencia en nuestro sistema:** En la exploración del laboratorio medimos que la ingesta estándar con Python requirió **0 dependencias adicionales**, mientras que `dlt[duckdb]` trajo consigo **38 paquetes ajenos**, `frictionless` trajo **39 paquetes** y `streamlit` trajo **35 paquetes**. Por esa razón técnica y de ciberseguridad, decidimos mantener la ingesta y la verificación en producción sobre la biblioteca estándar de Python, reservando herramientas más complejas únicamente para entornos aislados de análisis.

---

## Bitácora de IA
| Tramo | Herramienta | Qué le encargamos | Qué entregó | Qué le corregimos |
|---|---|---|---|---|
| Rastreo | Claude Code / Antigravity | Localizar la escala y subdivisión territorial oficial de Milán para el gemelo | Sugirió buscar por 'distretti' genéricos o comunas metropolitanas | Corregimos consultando la normativa del PGT 2030 del Comune: la unidad oficial no son distritos sino los 88 NIL (Nuclei di Identità Locale). |
| Rastreo | Claude Code / Antigravity | Localizar la API oficial de calidad de aire en tiempo real para Milán | Sugirió la ruta ficticia `/api/v1/airquality/stations.json` | Comprobamos con curl que devolvía 404; rastreamos mediante el script CKAN oficial el dataset real vigente `ds2969` (septiembre 2026). |
| Ingesta | Antigravity | Script para calcular las vistas de Wikipedia para Milán | Script base con acento en la URL (`Milán`) | La API de Wikimedia exige el título canónico normalizado con URL encoding (`Mil%C3%A1n`) para evitar respuestas de desambiguación. |
| Verificación | Antigravity | Escribir regex para detección de PII | Regex limitada a celulares colombianos (`3\d{9}`) | Se corrigió agregando el prefijo internacional y el formato de numeración móvil de Italia (`(?:\+39\s?)?3\d{8,9}`). |

---

## Revisión cruzada
- **Tres cifras auditadas por otro grupo:** Se auditaron: (1) Las 13.195 visitas de Wikipedia en agosto 2026; (2) Los 7.602 incidentes viales de 2024; (3) Los 59.92 µg/m³ de promedio de NO2. Las 3 cifras coinciden exactamente con los registros descargados de las fuentes primarias.
- **Ataque autorizado:** Intentos de inyección y bypass sobre parámetros de consulta demostraron que el sistema estático no expone bases de datos relacionales subyacentes ni ejecuta sentencias SQL en el cliente. Al no requerir autenticación para datos agregados públicos, no hay compuertas de mentira vulnerables en JavaScript.
- **Vueltas atrás en la ruta:** 
  1. Del tramo de *Permiso* volvimos al *Rastreo* cuando el análisis de la fuente F10 demostró PII directo (asociaciones vecinales).
  2. De *Ingesta* volvimos al *Catálogo* al verificar que el servicio ATOM F11 tenía el DNS caído (`getaddrinfo failed`).
  3. De *Vistas* volvimos al *Territorio* para incorporar la capa vectorial GeoJSON de los 88 NIL con Leaflet al identificar que el piso técnico exigía representación espacial interactiva.

---

## Preparación para la Presentación en Clase (Las 3 Preguntas Obligatorias)

1. **¿Qué herramienta descartamos que casi elegimos?**  
   *Descartamos `dlt` en la ingesta y `Streamlit` en las vistas.* Estuvimos a punto de usar `dlt` por la comodidad de inferir esquemas y registrar metadatos de carga automáticamente, pero descubrimos que agregaba 38 dependencias externas a la cadena de suministro. En vistas casi elegimos `Streamlit`, pero requería mantener un servidor en Python corriendo en la nube permanentemente en lugar de un sitio estático ultra-rápido y seguro en Vercel.
2. **¿Qué decidimos no mostrar?**  
   *Decidimos no mostrar los datos de contacto y nombres de directivos de asociaciones comunitarias del Municipio 9 (Fuente F10 - `ds1341`), ni las coordenadas exactas y marcas de tiempo de siniestros viales individuales (Fuente F03).* Mostrar F10 violaba el principio de minimización del RGPD y de la Ley 1581; mostrar coordenadas de colisiones en tiempo real permitiría reidentificar víctimas o estigmatizar negocios vecinales.
3. **¿Qué tendría que cambiar para que la respuesta fuera otra?**  
   - En la fuente F10: Que el *Comune di Milano* anonimizara el conjunto publicando solo conteos agrupados de asociaciones por actividad y barrio, sin nombres ni correos personales.
   - En la herramienta: Que `Streamlit` ofreciera exportación nativa a clientes estáticos (vía WebAssembly/Pyodide) sin depender de un contenedor servidor en la nube.
   - En nuestro sistema: Que implementáramos una compuerta de autenticación criptográfica en servidor (HMAC-SHA256 con cookies seguras) si en el futuro se incorporaran datos de telemetría de redes eléctricas y de gas comercialmente sensibles del operador *A2A*.
