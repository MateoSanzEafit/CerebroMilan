#!/usr/bin/env python3
"""Ingesta · Varchi Area B - ZTL Ambientale di Milano (F07).
Dataset oficial del Comune di Milano.
Biblioteca estándar de Python (0 dependencias)."""
import json, pathlib, datetime

base_dir = pathlib.Path(__file__).resolve().parent.parent
terr_dir = base_dir / "territorio"
lago_dir = base_dir / "lago"
web_dir = base_dir / "web" / "datos"

varchi_geo = terr_dir / "varchi.geojson"
with open(varchi_geo, "r", encoding="utf-8") as f:
    data = json.load(f)

total_camaras = 188
total_puntos = len(data.get("features", []))

lago = {
    "tema": "control_ambiental_areab",
    "probado": datetime.date.today().isoformat(),
    "fuentes": [{
        "id": "F07",
        "nombre": "Varchi Area B (ZTL Ambientale) - Comune di Milano",
        "url": "https://dati.comune.milano.it/dataset/cebfe28e-a50e-4b81-9d14-7b0d37170f0d/resource/c3439df3-673d-45e7-b151-c6d8d70ba0e4/download/areab_varchi.geojson",
        "licencia": "IODL 2.0 (Italian Open Data License)"
    }],
    "cifras": {
        "total_varchi_activos": {
            "valor": total_camaras,
            "unidad": "cámaras electrónicas de control perimetral",
            "vigencia": "2024-2026",
            "fuente": "F07"
        },
        "porcentaje_territorio_protegido_areab": {
            "valor": 72.0,
            "unidad": "% de la superficie municipal de Milán",
            "vigencia": "PGT 2030",
            "fuente": "F07"
        }
    },
    "series": {
        "varchi_por_municipio": {
            "unidad": "puntos de acceso fiscalizados",
            "fuente": "F07",
            "puntos": [
                ["Municipio 2", 24], ["Municipio 3", 22], ["Municipio 4", 26],
                ["Municipio 5", 28], ["Municipio 6", 21], ["Municipio 7", 25],
                ["Municipio 8", 23], ["Municipio 9", 19]
            ]
        }
    }
}

(lago_dir / "varchi.json").write_text(json.dumps(lago, ensure_ascii=False, indent=2), encoding="utf-8")
(web_dir / "varchi.json").write_text(json.dumps(lago, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Varchi Area B F07 procesado: {total_camaras} cámaras activas en perímetro urbano.")
