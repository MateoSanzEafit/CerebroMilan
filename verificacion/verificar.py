#!/usr/bin/env python3
"""Verificación antes de publicar: con un solo FAIL no se despliega."""
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

# Determinar ruta base relativa o absoluta
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

# Comprobaciones de dominio específicas para Milán (exigidas en el taller)
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

# Comprobaciones de la malla territorial (88 NIL de Milán)
nil_geo_path = os.path.join(base_dir, "territorio", "nil.geojson")
if os.path.exists(nil_geo_path):
    try:
        with open(nil_geo_path, "r", encoding="utf-8") as f:
            nil_data = json.load(f)
        total_nil = len(nil_data.get("features", []))
        check("Territorio: malla oficial contiene exactamente los 88 NIL vigentes", total_nil == 88, f"{total_nil} features")
    except Exception as e:
        check("Territorio: archivo nil.geojson válido", False, str(e))
else:
    check("Territorio: archivo nil.geojson presente", False, "No existe territorio/nil.geojson")

nil_csv_path = os.path.join(base_dir, "territorio", "nil.csv")
check("Territorio: archivo nil.csv presente en lago", os.path.exists(nil_csv_path), nil_csv_path)

print(f"\nResultado: {fallos} fallos")
sys.exit(1 if fallos else 0)
