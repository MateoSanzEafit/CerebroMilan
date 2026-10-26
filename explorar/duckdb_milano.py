#!/usr/bin/env python3
"""Laboratorio · Exploración de consulta en memoria con DuckDB.
Consulta directamente el archivo JSON del lago o la URL remota sin servidor intermedio."""
import duckdb
import os
import pathlib
import sys

sys.stdout.reconfigure(encoding='utf-8')

base_dir = pathlib.Path(__file__).resolve().parent.parent
lago_json = base_dir / "lago" / "seguridad.json"

print("=== DuckDB: Consulta analítica sobre el lago local (seguridad.json) ===")
# Leer el archivo local generado por la ingesta
con = duckdb.connect()
rel = con.sql(f"""
    SELECT 
        tema,
        probado,
        cifras.incidentes_ultimo_anio.valor AS total_incidentes,
        cifras.incidentes_ultimo_anio.vigencia AS vigencia,
        cifras.lesionados_ultimo_anio.valor AS total_lesionados
    FROM read_json_auto('{lago_json.as_posix()}')
""")
print(rel)

print("\n=== DuckDB: Consulta analítica directa sobre el JSON crudo en raw/ ===")
raw_json = base_dir / "lago" / "raw" / "incidenti_raw.json"
if raw_json.exists():
    res_agrupado = con.sql(f"""
        SELECT 
            Anno, 
            SUM(TRY_CAST(Incidenti AS INTEGER)) as total_incidentes,
            SUM(TRY_CAST(Feriti AS INTEGER)) as total_heridos,
            SUM(TRY_CAST(Morti AS INTEGER)) as total_fallecidos
        FROM read_json_auto('{raw_json.as_posix()}')
        WHERE TRY_CAST(Anno AS INTEGER) >= 2020
        GROUP BY Anno
        ORDER BY Anno DESC
    """)
    print(res_agrupado)
