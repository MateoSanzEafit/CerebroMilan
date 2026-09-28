#!/usr/bin/env python3
"""Ingesta · Seguridad vial en Milán (Incidentes y lesionados por municipio).
Dataset oficial del Comune di Milano: ds177.
Sin llaves: usa solo la biblioteca estándar de Python."""
import datetime, json, pathlib, urllib.request, ssl

URL = "https://dati.comune.milano.it/dataset/9f7bcc9c-20a4-4e48-a7cd-99b15ed11102/resource/38d2171d-1067-4252-9f96-02867a2cc617/download/ds177_trafficotrasporti_incidenti_stradali.json"
ctx = ssl._create_unverified_context()

req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
    raw_data = json.load(r)

base_dir = pathlib.Path(__file__).resolve().parent.parent
raw_dir = base_dir / "lago" / "raw"
raw_dir.mkdir(parents=True, exist_ok=True)
(raw_dir / "incidenti_raw.json").write_text(json.dumps(raw_data), encoding="utf-8")

# Agregación por año y conteo último año cerrado
anios = {}
heridos_anios = {}
for row in raw_data:
    try:
        a = str(row.get("Anno") or row.get("ANNO"))
        inc = int(row.get("Incidenti") or row.get("INCIDENTI") or 0)
        fer = int(row.get("Feriti") or row.get("FERITI") or 0)
        anios[a] = anios.get(a, 0) + inc
        heridos_anios[a] = heridos_anios.get(a, 0) + fer
    except (ValueError, TypeError):
        continue

puntos = sorted([[k, v] for k, v in anios.items() if k.isdigit()])
ultimo = puntos[-1]
ultimo_anio = ultimo[0]
heridos_ultimo = heridos_anios.get(ultimo_anio, 0)

lago = {
    "tema": "seguridad",
    "probado": datetime.date.today().isoformat(),
    "fuentes": [{
        "id": "comune_milano_incidenti",
        "nombre": "Comune di Milano - Incidenti stradali per zona (ds177)",
        "url": URL,
        "estado": "vivo",
        "licencia": "IODL 2.0 (Italian Open Data License / CC BY)"
    }],
    "cifras": {
        "incidentes_ultimo_anio": {
            "valor": ultimo[1],
            "unidad": "siniestros viales registrados",
            "vigencia": ultimo_anio,
            "fuente": "comune_milano_incidenti"
        },
        "lesionados_ultimo_anio": {
            "valor": heridos_ultimo,
            "unidad": "personas lesionadas en siniestros",
            "vigencia": ultimo_anio,
            "fuente": "comune_milano_incidenti"
        }
    },
    "series": {
        "evolucion_anual": {
            "unidad": "siniestros viales",
            "fuente": "comune_milano_incidenti",
            "puntos": puntos[-10:]
        }
    }
}

lago_dir = base_dir / "lago"
lago_dir.mkdir(parents=True, exist_ok=True)
(lago_dir / "seguridad.json").write_text(json.dumps(lago, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Seguridad Vial Milán: procesado. Último año ({ultimo_anio}): {ultimo[1]} incidentes, {heridos_ultimo} lesionados.")
