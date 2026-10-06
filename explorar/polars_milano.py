#!/usr/bin/env python3
"""Laboratorio · Exploración de consulta analítica en memoria con Polars.
Compara Polars vs DuckDB para procesamiento columnar in-memory."""
import sys
import os
import pathlib
import json

sys.stdout.reconfigure(encoding='utf-8')

try:
    import polars as pl

    base_dir = pathlib.Path(__file__).resolve().parent.parent
    seg_json = base_dir / "lago" / "seguridad.json"

    print("=== Polars: Carga y análisis sobre lago/seguridad.json ===")
    with open(seg_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    puntos = data["series"]["evolucion_anual"]["puntos"]
    df = pl.DataFrame(puntos, schema=["anno", "incidenti"], orient="row")
    
    # Transformaciones analíticas con Polars
    df = df.with_columns(
        pl.col("incidenti").cast(pl.Int64),
        (pl.col("incidenti") - pl.col("incidenti").shift(1)).alias("variacion_anual"),
        (pl.col("incidenti") / pl.col("incidenti").mean() * 100).round(1).alias("indice_vs_media")
    )
    print(df)

    print("\nResumen Estadístico con Polars:")
    print(f"Total histórico (10 años): {df['incidenti'].sum():,} siniestros")
    print(f"Promedio anual: {df['incidenti'].mean():,.1f} siniestros/año")
    print(f"Pico de siniestros: {df['incidenti'].max()} en el año {df.filter(pl.col('incidenti') == df['incidenti'].max())['anno'][0]}")

    print("\nBitácora de exploración (Polars vs DuckDB):")
    print("- Polars: Requiere convertir JSON semi-estructurado a formato tabular antes de operar; API imperativa de DataFrames.")
    print("- DuckDB: Lee JSON anidado directamente con 'read_json_auto' y sintaxis SQL relacional estándar.")
    print("- Decisión: DuckDB quedó para el laboratorio analítico por su interoperabilidad directa con el lago JSON sin adaptadores intermedios.")

except ImportError as e:
    print(f"Polars no instalado: {e}. Para instalar: pip install polars")
