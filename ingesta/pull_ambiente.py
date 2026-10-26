#!/usr/bin/env python3
"""Ingesta · Calidad del Aire en Milán (Estaciones de monitoreo 2026).
Dataset oficial del Comune di Milano: ds2969.
Sin llaves: usa solo la biblioteca estándar de Python."""
import datetime, json, pathlib, urllib.request, ssl

URL = "https://dati.comune.milano.it/dataset/884b70a5-951c-4c92-931e-52a73d20af9f/resource/ddecb297-6e09-456e-aed3-7c934eec4dd3/download/qaria_datoariagiornostazione_2026-09-26.json"
ctx = ssl._create_unverified_context()

req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
    raw_data = json.load(r)

base_dir = pathlib.Path(__file__).resolve().parent.parent
raw_dir = base_dir / "lago" / "raw"
raw_dir.mkdir(parents=True, exist_ok=True)
(raw_dir / "ambiente_raw.json").write_text(json.dumps(raw_data), encoding="utf-8")

# Agregación por contaminante
contaminantes = {}
fechas = set()
for row in raw_data:
    try:
        inq = str(row.get("inquinante"))
        val = float(row.get("valore") or 0.0)
        d = str(row.get("data") or "")[:10]
        if d:
            fechas.add(d)
        if inq not in contaminantes:
            contaminantes[inq] = []
        contaminantes[inq].append(val)
    except (ValueError, TypeError):
        continue

med_no2 = round(sum(contaminantes.get("NO2", [0])) / max(len(contaminantes.get("NO2", [1])), 1), 2)
med_pm10 = round(sum(contaminantes.get("PM10", [0])) / max(len(contaminantes.get("PM10", [1])), 1), 2)
ultima_fecha = sorted(list(fechas))[-1] if fechas else "2026-09-26"

lago = {
    "tema": "ambiente",
    "probado": datetime.date.today().isoformat(),
    "fuentes": [{
        "id": "comune_milano_aria",
        "nombre": "Comune di Milano - Rilevazione qualità dell'aria (ds2969)",
        "url": URL,
        "estado": "vivo",
        "licencia": "Creative Commons Attribution"
    }],
    "cifras": {
        "promedio_no2": {
            "valor": med_no2,
            "unidad": "µg/m³ (Dióxido de nitrógeno)",
            "vigencia": ultima_fecha,
            "fuente": "comune_milano_aria"
        },
        "promedio_pm10": {
            "valor": med_pm10,
            "unidad": "µg/m³ (Partículas suspendidas PM10)",
            "vigencia": ultima_fecha,
            "fuente": "comune_milano_aria"
        }
    },
    "series": {
        "resumen_contaminantes": {
            "unidad": "µg/m³ promedio",
            "fuente": "comune_milano_aria",
            "puntos": [
                ["NO2", med_no2],
                ["PM10", med_pm10]
            ]
        }
    }
}

lago_dir = base_dir / "lago"
lago_dir.mkdir(parents=True, exist_ok=True)
(lago_dir / "ambiente.json").write_text(json.dumps(lago, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Ambiente Milán: procesado. Última fecha ({ultima_fecha}): NO2 prom = {med_no2} µg/m³, PM10 prom = {med_pm10} µg/m³.")
