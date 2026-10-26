#!/usr/bin/env python3
"""Laboratorio · Exploración de ingesta declarativa con dlt.
Requiere pip install 'dlt[duckdb]'
Demuestra la inferencia automática de esquema, linaje y tablas de metadatos (_dlt_loads, _dlt_version)."""
import sys

sys.stdout.reconfigure(encoding='utf-8')

try:
    import dlt
    from dlt.sources.helpers import requests

    UA = {"User-Agent": "taller-gestion-gobernanza-milano/1.0 (curso universitario)"}

    @dlt.resource(name="vistas_wikipedia", write_disposition="replace")
    def vistas(articulo="Milán"):
        url = f"https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/es.wikipedia/all-access/user/{articulo}/monthly/20250101/20260831"
        res = requests.get(url, headers=UA)
        res.raise_for_status()
        yield res.json()["items"]

    pipeline = dlt.pipeline(pipeline_name="milano", destination="duckdb", dataset_name="escucha")
    info = pipeline.run(vistas())
    print("=== Resultado de ejecución dlt ===")
    print(info)
except ImportError as e:
    print(f"Nota para la Bitácora de Exploración:")
    print(f"dlt no está instalado en este entorno ({e}).")
    print("Tal como documenta el taller, instalar 'dlt[duckdb]' agrega 38 dependencias externas a la cadena de suministro.")
    print("Para correrlo: pip install 'dlt[duckdb]'")
