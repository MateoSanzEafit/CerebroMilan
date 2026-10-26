#!/usr/bin/env python3
"""Verificación de gobernanza antes de publicar: con un solo FAIL no se despliega."""
import glob, json, re, sys, os

fallos = 0
# Regex para correos y números telefónicos italianos / internacionales
PII = re.compile(r"[\w.+-]+@[\w-]+\.[a-z]{2,}|(?<!\d)(?:\+39\s?)?3\d{8,9}(?!\d)")
CAMPOS_PERSONALES = re.compile(r"codice_fiscale|documento|telefono|cellulare|email|nominativo|nome_cognome", re.I)

def check(nombre, ok, detalle=""):
    global fallos
    print(("PASS " if ok else "FAIL ") + nombre + ("" if ok else f"  <- {detalle}"))
    fallos += 0 if ok else 1

def recorre(x, clave=""):
    if isinstance(x, dict):
        for k, v in x.items():
            yield from recorre(v, k)
    elif isinstance(x, list):
        for v in x:
            yield from recorre(v, clave)
    else:
        yield clave, x

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lago_dir = os.path.join(base_dir, "lago")

archivos = sorted(glob.glob(os.path.join(lago_dir, "*.json")))
if not archivos:
    print("FAIL No hay archivos en lago/")
    sys.exit(1)

for ruta in archivos:
    rel_path = os.path.relpath(ruta, base_dir)
    try:
        with open(ruta, "r", encoding="utf-8") as f:
            lago = json.load(f)
    except Exception as e:
        check(f"{rel_path}: archivo JSON válido", False, str(e))
        continue

    fuentes = lago.get("fuentes", [])
    ids = {f.get("id") for f in fuentes}
    
    check(f"{rel_path}: probado es un día (AAAA-MM-DD)", bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(lago.get("probado")))), lago.get("probado"))
    check(f"{rel_path}: toda fuente con url y licencia", bool(fuentes and all(f.get("url") and f.get("licencia") for f in fuentes)), fuentes)
    
    for clave, c in lago.get("cifras", {}).items():
        completa = c.get("valor") is not None and c.get("unidad") and c.get("vigencia") and c.get("fuente") in ids
        check(f"{rel_path}: cifra '{clave}' con valor, unidad, vigencia y fuente conocida", bool(completa), c)
        
    pares = list(recorre(lago))
    sospechosos = sorted({k for k, _ in pares if CAMPOS_PERSONALES.search(k)})
    check(f"{rel_path}: ningún campo con nombre de dato personal", not sospechosos, sospechosos)
    hallado = next((v for _, v in pares if isinstance(v, str) and PII.search(v)), None)
    check(f"{rel_path}: ningún texto con correo o teléfono", hallado is None, hallado)

# Comprobaciones de dominio específicas para Milán
try:
    with open(os.path.join(lago_dir, "demografia.json"), "r", encoding="utf-8") as f:
        fams = json.load(f)["cifras"]["familias_residentes_ultimo_anio"]["valor"]
    check("Dominio: total de familias en Milán en rango sensato (500k - 900k)", 500_000 <= fams <= 900_000, fams)
except Exception as e:
    check("Dominio: lectura demografía para rango", False, str(e))

try:
    with open(os.path.join(lago_dir, "seguridad.json"), "r", encoding="utf-8") as f:
        inc = json.load(f)["cifras"]["incidentes_ultimo_anio"]["valor"]
    check("Dominio: siniestros viales anuales en rango metropolitano (5k - 15k)", 5_000 <= inc <= 15_000, inc)
except Exception as e:
    check("Dominio: lectura seguridad para rango", False, str(e))

try:
    with open(os.path.join(lago_dir, "ambiente.json"), "r", encoding="utf-8") as f:
        no2 = json.load(f)["cifras"]["promedio_no2"]["valor"]
    check("Dominio: promedio NO2 en rango ambiental urbano (10 - 100 µg/m³)", 10 <= no2 <= 100, no2)
except Exception as e:
    check("Dominio: lectura ambiente para rango", False, str(e))

# Comprobaciones de las nuevas fuentes integradas: F05, F07, F08
try:
    with open(os.path.join(lago_dir, "ciclabili.json"), "r", encoding="utf-8") as f:
        km_ciclo = json.load(f)["cifras"]["longitud_total_red_ciclista_km"]["valor"]
    check("Integración F05: red ciclable mayor a 200 km", km_ciclo >= 200, km_ciclo)
except Exception as e:
    check("Integración F05: ciclabili.json", False, str(e))

try:
    with open(os.path.join(lago_dir, "varchi.json"), "r", encoding="utf-8") as f:
        varchi_cnt = json.load(f)["cifras"]["total_varchi_activos"]["valor"]
    check("Integración F07: cámaras Area B registradas (150 - 250)", 150 <= varchi_cnt <= 250, varchi_cnt)
except Exception as e:
    check("Integración F07: varchi.json", False, str(e))

try:
    with open(os.path.join(lago_dir, "turismo.json"), "r", encoding="utf-8") as f:
        camas = json.load(f)["cifras"]["capacidad_total_camas_posti_letto"]["valor"]
    check("Integración F08: capacidad hotelera y camas turísticas (50k - 120k)", 50_000 <= camas <= 120_000, camas)
except Exception as e:
    check("Integración F08: turismo.json", False, str(e))

# Comprobaciones de la malla territorial (88 NIL de Milán) y proyección métrica
nil_geo_path = os.path.join(base_dir, "territorio", "nil.geojson")
if os.path.exists(nil_geo_path):
    try:
        with open(nil_geo_path, "r", encoding="utf-8") as f:
            nil_data = json.load(f)
        total_nil = len(nil_data.get("features", []))
        check("Territorio: malla oficial contiene exactamente los 88 NIL vigentes", total_nil == 88, f"{total_nil} features")
        
        # Auditoría de proyección métrica (EPSG:32632 vs EPSG:4326)
        all_metric = all(
            f["properties"].get("area_m2", 0) > 10_000 and 
            "EPSG:32632" in str(f["properties"].get("proyeccion_sistema", ""))
            for f in nil_data.get("features", [])
        )
        check("Territorio: área proyectada en sistema métrico oficial UTM Zona 32N (EPSG:32632) y no en grados (EPSG:4326)", all_metric, "Área en grados detectada o falta proyección")
    except Exception as e:
        check("Territorio: archivo nil.geojson válido", False, str(e))
else:
    check("Territorio: archivo nil.geojson presente", False, "No existe territorio/nil.geojson")

nil_csv_path = os.path.join(base_dir, "territorio", "nil.csv")
check("Territorio: archivo nil.csv presente en lago", os.path.exists(nil_csv_path), nil_csv_path)

print(f"\nResultado: {fallos} fallos")
sys.exit(1 if fallos else 0)
