#!/usr/bin/env python3
"""Ingesta · Demografía y Familias en Milán por Municipio.
Dataset oficial del Comune di Milano: ds133.
Sin llaves: usa solo la biblioteca estándar de Python."""
import datetime, json, pathlib, urllib.request, ssl

URL = "https://dati.comune.milano.it/dataset/6eaedaa7-0ddf-44fc-a33c-45f2ebe95d3f/resource/fb84e80d-c065-40db-97fc-500e46b9380d/download/ds133_popolazione_residenti_famiglie_zona_2003_2021.json"
ctx = ssl._create_unverified_context()

req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
    raw_data = json.load(r)

base_dir = pathlib.Path(__file__).resolve().parent.parent
raw_dir = base_dir / "lago" / "raw"
raw_dir.mkdir(parents=True, exist_ok=True)
(raw_dir / "demografia_raw.json").write_text(json.dumps(raw_data), encoding="utf-8")

# Agregación por año de total de familias y personas estimadas
familias_por_anio = {}
personas_por_anio = {}
municipios_ultimo = {}

for row in raw_data:
    try:
        a = str(row.get("Anno"))
        fams = int(row.get("Famiglie") or 0)
        comp = int(row.get("Numero componenti") or 1)
        pers = fams * comp
        mun = str(row.get("Municipio (Ex Zona di Decentramento)") or "Municipio")
        
        familias_por_anio[a] = familias_por_anio.get(a, 0) + fams
        personas_por_anio[a] = personas_por_anio.get(a, 0) + pers
        
        if a == "2021":
            municipios_ultimo[mun] = municipios_ultimo.get(mun, 0) + fams
    except (ValueError, TypeError):
        continue

puntos_fam = sorted([[k, v] for k, v in familias_por_anio.items()])
ultimo_fam = puntos_fam[-1]
ultimo_anio = ultimo_fam[0]
total_personas = personas_por_anio.get(ultimo_anio, 0)

lago = {
    "tema": "demografia",
    "probado": datetime.date.today().isoformat(),
    "fuentes": [{
        "id": "comune_milano_demografia",
        "nombre": "Comune di Milano - Famiglie residenti per municipio (ds133)",
        "url": URL,
        "estado": "vivo",
        "licencia": "IODL 2.0 / CC-BY"
    }],
    "cifras": {
        "familias_residentes_ultimo_anio": {
            "valor": ultimo_fam[1],
            "unidad": "familias censadas en el padrón",
            "vigencia": ultimo_anio,
            "fuente": "comune_milano_demografia"
        },
        "poblacion_estimada_familias": {
            "valor": total_personas,
            "unidad": "habitantes en hogares familiares",
            "vigencia": ultimo_anio,
            "fuente": "comune_milano_demografia"
        }
    },
    "series": {
        "evolucion_familias": {
            "unidad": "familias residentes",
            "fuente": "comune_milano_demografia",
            "puntos": puntos_fam
        }
    }
}

lago_dir = base_dir / "lago"
lago_dir.mkdir(parents=True, exist_ok=True)
(lago_dir / "demografia.json").write_text(json.dumps(lago, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Demografía Milán: procesado. Último año ({ultimo_anio}): {ultimo_fam[1]} familias, ~{total_personas} habitantes.")
