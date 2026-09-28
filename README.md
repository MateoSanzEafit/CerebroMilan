# Milán · Sistema Territorial de Información

Grupo: Curaduría: [Integrante 1] · Datos: [Integrante 2] · Interfaz: [Integrante 3] · Seguridad: [Integrante 4]  
Enlace: `https://cerebro-milano.vercel.app` (o despliegue local) · Revisado: 2026-09-28

---

## Para quién y qué pregunta
- **Usuario:** Dirección de Planificación y Resiliencia Urbana (*Comune di Milano*), concejales del área metropolitana y urbanistas enfocados en movilidad activa y transición ecológica.
- **Preguntas:**
  1. *¿Cuánta gente vive y cómo se distribuye la presión de hogares en la ciudad?* (Evolución de familias y residentes por municipio y NIL).
  2. *¿Cuál es el panorama de seguridad vial y dónde se concentran los lesionados?* (Siniestros viales anuales registrados por la *Polizia Locale*).
  3. *¿Cuál es el nivel de exposición ambiental y calidad del aire?* (Concentraciones de NO2 y PM10 en estaciones fijas de monitoreo diario).
  4. *¿Qué atención o interés internacional suscita la ciudad?* (Vistas mensuales humanas en Wikipedia).
- **Escala y comparación:** Escala dual: los 9 *Municipi* para macro-política pública y los 88 *NIL (Nuclei di Identità Locale)* para detalle territorial barrial. Se compara la evolución interanual de Milán y sus zonas contra sí misma a lo largo de las series históricas (2001-2026).
- **Lo que decidimos no mostrar, y por qué:** Decidimos no mostrar nombres de directivos de organizaciones vecinales ni denuncias individuales ciudadanas con texto libre o direcciones exactas de viviendas, para prevenir riesgos de reidentificación de personas conforme al RGPD (Reglamento General de Protección de Datos de la UE) y la Ley 1581 de 2012.

---

## La réplica
- **Qué replicamos tal cual del ejemplo y qué tuvimos que cambiar para nuestra ciudad:** Replicamos exactamente la arquitectura de capas (*lago/raw* como bronce, *lago/* como plata y *web/* como oro), el contrato de datos estricto en JSON y el verificador automatizado de calidad y PII. Tuvimos que cambiar el esquema territorial (de los 43 distritos y 14 zonas de Lima/Miraflores pasamos a los 9 Municipi y 88 NIL de Milán) y los adaptadores de API para consumir el catálogo CKAN oficial italiano (`dati.comune.milano.it`).
- **Fuentes catalogadas · integradas · caídas · descartadas:** 
  - Catalogadas: 11 fuentes.
  - Integradas: 9 fuentes (F01 a F09: territorio NIL, demografía, incidentes viales, BikeMi, ciclorrutas, calidad de aire 2026, varchi Área B, capacidad hotelera, vistas Wikipedia).
  - Descartadas: 1 fuente (F10 - *Registro Associazioni Municipio 9* por contener correos y celulares de personas naturales).
  - Caídas / No responden: 1 fuente (F11 - *ATOM NIL Service histórico* por falla de resolución DNS `getaddrinfo failed`).
- **Huecos: lo que buscamos y no existe abierto para esta ciudad:** Buscamos telemetría de consumo eléctrico y gas en tiempo real por cada NIL abierta sin credenciales comerciales pagas, pero el operador metropolitano (*A2A*) no la publica como dato abierto libre. Se sustituyó utilizando como proxy los puntos de control ambiental de tráfico de Área B (F07) y las mediciones continuas de dióxido de nitrógeno (F06).

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
| F07 (Varchi Area B) | IODL 2.0 | No | Integrada | Atribución al Comune |
| F08 (Strutture ricettive) | CC-BY 4.0 | No | Integrada | Citar Settore Turismo |
| F09 (Wikipedia Milán) | CC0 | No | Integrada | Dominio público (Wikimedia API) |
| F10 (Associazioni M9) | CC-BY | Personas identificables | Descartada | Violación de PII / Minimización |
| F11 (NIL ATOM Antiguo) | No declara | No | No responde | Subdominio no resuelve (DNS caído) |

---

## Bitácora de exploración
| Tramo | Herramienta | Qué pidió para empezar | Licencia | Dónde quedan los datos | ¿Se rehace con un comando? | Estado del proyecto | Qué resolvió | Qué no pudo | ¿Quedó? ¿Por qué? |
|---|---|---|---|---|---|---|---|---|---|
| Ingesta | Python estándar (`urllib`, `json`) | Solo Python base (0 paquetes) | PSF License | En la máquina local y repositorio | Sí (`python script.py`) | Estable nativo | Ingesta directa sin dependencias externas | No infiere esquemas automáticamente | **SÍ**. Máxima reproducibilidad y 0 dependencias añadidas. |
| Ingesta | `dlt` (data load tool) | pip install `dlt[duckdb]` (+38 paquetes) | Apache 2.0 | Base DuckDB local | Sí (`python dlt_script.py`) | Activo 2026 | Inferencia automática y metadatos `_dlt_loads` | Añade 38 dependencias a la cadena de suministro | **NO**. Excesiva sobrecarga para 4 fuentes JSON limpias. |
| Lago | `DuckDB` | pip install `duckdb` (1 paquete) | MIT | En archivo o en memoria | Sí (`duckdb.sql(...)`) | v1.5.6 (2026) | Consultas SQL relacionales analíticas inmediatas | No genera UI gráfica por sí solo | **SÍ (Laboratorio)**. Excelente motor analítico para auditoría de crudos. |

---

## Protección
- **Nivel:** Abierto, solo agregados (con separación estricta de crudos y sanitización PII).
- **Qué protegemos, y de quién:** Protegemos la identidad de ciudadanos, víctimas de siniestros viales y directivos vecinales frente a raspadores automáticos, cruces maliciosos de bases de datos y actores que busquen perfilar o reidentificar personas.
- **Pruebas de terminal o de ventana privada:**
  ```bash
  # Verificación de integridad y ausencia de PII:
  python verificacion/verificar.py
  # Resultado: 0 fallos
  ```
- **Revisión de secretos en el historial:**
  ```bash
  git log -p | grep -n -i -E "clave|secret|password|api_key|token"
  # Resultado: Ningún secreto ni credencial expuesta en el historial
  ```

---

## Herramienta elegida para las vistas
- **Qué necesitábamos mostrar:** Indicadores clave (KPIs) con procedencia visible a un clic, tablas de series temporales de familias e incidentes, monitoreo ambiental y el catálogo de fuentes.
- **Qué teníamos que proteger:** La reproducibilidad del dato, garantizando que ninguna cifra dependa de servidores de terceros que puedan cobrar o caerse.
- **Por qué esta herramienta cumple las dos cosas, y cuál descartamos por poco:** Elegimos **HTML, CSS moderno y JavaScript Vanilla** porque funciona en cualquier navegador móvil o de escritorio sin frameworks pesados, no expone datos fuera de nuestro control y consume directamente el lago JSON. Descartamos *Streamlit* porque requería hospedar un contenedor con runtime de Python en la nube y su plan comunitario limita el control de sesiones y privacidad.

---

## Nuestra posición frente a las reflexiones

### 1. Reflexión de Gestión y Gobierno de Datos: *Privacidad: Público no es inocuo*
* **Nuestra postura:** Coincidimos plenamente con la tesis de Latanya Sweeney y el principio de acceso y circulación restringida de la Ley 1581 / RGPD. Que un portal público libere un dataset (como ocurrió con la fuente F10 de asociaciones vecinales) no significa que sea ético o seguro incorporarlo en un gemelo urbano.
* **Evidencia en nuestro sistema:** Durante el rastreo identificamos que el dataset `ds1341` contenía nombres propios, correos (`@psicologoalparco.it`) y números de contacto directo. Si este conjunto se hubiera cruzado con la cartografía de los NIL o los censos de vivienda, habría permitido geolocalizar y perfilar a directivos vecinales sin su consentimiento explícito para este fin. La decisión de gobernanza fue **clasificarla como Descartada**, configurar el verificador con regex para celulares italianos (`+39 3...`) y correos, y asegurar que solo datos agregados por zona alimenten las vistas.

### 2. Reflexión de Ciberseguridad: *Cadena de suministro: Explorar es ampliar la superficie de ataque*
* **Nuestra postura:** Cada dependencia adicional instalada representa un tercero no auditado con capacidad de ejecutar código en nuestra infraestructura. En proyectos de datos la tendencia a instalar bibliotecas de moda (*hype*) multiplica la superficie de exposición a ataques como los documentados en XZ Utils o paquetes maliciosos en PyPI.
* **Evidencia en nuestro sistema:** En la exploración del laboratorio medimos que la ingesta estándar con Python requirió **0 dependencias adicionales**, mientras que `dlt[duckdb]` trajo consigo **38 paquetes ajenos**. Por esa razón técnica y de ciberseguridad, decidimos mantener la ingesta en producción sobre la biblioteca estándar de Python, reservando herramientas más complejas únicamente para entornos aislados de análisis.

---

## Bitácora de IA
| Tramo | Herramienta | Qué le encargamos | Qué entregó | Qué le corregimos |
|---|---|---|---|---|
| Rastreo | Claude Code / Antigravity | Localizar la API oficial de calidad de aire en tiempo real para Milán | Sugirió la ruta ficticia `/api/v1/airquality/stations.json` | Comprobamos con curl que devolvía 404; rastreamos mediante el script CKAN oficial el dataset real vigente `ds2969` (septiembre 2026). |
| Ingesta | Antigravity | Script para calcular las vistas de Wikipedia para Milán | Script base con acento en la URL (`Milán`) | La API de Wikimedia exige el título canónico normalizado con URL encoding (`Mil%C3%A1n`) para evitar respuestas de desambiguación. |
| Verificación | Antigravity | Escribir regex para detección de PII | Regex limitada a celulares colombianos (`3\d{9}`) | Se corrigió agregando el prefijo internacional y el formato de numeración móvil de Italia (`(?:\+39\s?)?3\d{8,9}`). |

---

## Revisión cruzada
- **Tres cifras auditadas por otro grupo:** Se auditaron: (1) Las 13.195 visitas de Wikipedia en agosto 2026; (2) Los 7.602 incidentes viales de 2024; (3) Los 59.92 µg/m³ de promedio de NO2. Las 3 cifras coinciden exactamente con los registros descargados de las fuentes primarias.
- **Ataque autorizado:** Intentos de inyección y bypass sobre parámetros de consulta demostraron que el sistema estático no expone bases de datos relacionales subyacentes ni ejecuta sentencias SQL en el cliente.
- **Vueltas atrás en la ruta:** Del tramo de *Permiso* volvimos al *Rastreo* cuando el análisis de la fuente F10 demostró PII directo; y de *Ingesta* volvimos al *Catálogo* al verificar que el servicio ATOM F11 tenía el DNS caído.
