#!/usr/bin/env python3
"""Laboratorio · Exploración de vistas con Streamlit.
Demuestra una aplicación de datos alternativa en Python.
Para ejecutar: streamlit run explorar/streamlit_milano.py"""
import json
import pathlib
import sys

base_dir = pathlib.Path(__file__).resolve().parent.parent

try:
    import streamlit as st
    import pandas as pd

    st.set_page_config(page_title="Cerebro Milán · Streamlit Lab", layout="wide")
    st.title("🏛️ Cerebro Milán · Laboratorio Streamlit (Alternativa de Vistas)")
    st.caption("EAFIT · Tópicos de Sistemas de Información / Gobernanza de Datos 2026-2")

    # Cargar datos desde el lago JSON
    with open(base_dir / "lago" / "demografia.json", "r", encoding="utf-8") as f:
        dem = json.load(f)
    with open(base_dir / "lago" / "seguridad.json", "r", encoding="utf-8") as f:
        seg = json.load(f)
    with open(base_dir / "lago" / "ambiente.json", "r", encoding="utf-8") as f:
        amb = json.load(f)

    # KPIs
    c1, c2, c3 = st.columns(3)
    c1.metric("Familias Residentes", f"{dem['cifras']['familias_residentes_ultimo_anio']['valor']:,}", "Censo Anagráfico")
    c2.metric("Siniestros Viales Anuales", f"{seg['cifras']['incidentes_ultimo_anio']['valor']:,}", "Polizia Locale")
    c3.metric("Promedio NO2", f"{amb['cifras']['promedio_no2']['valor']} µg/m³", "ARPA Lombardia")

    st.subheader("Serie Temporal: Siniestralidad Vial")
    df_seg = pd.DataFrame(seg["series"]["evolucion_anual"]["puntos"], columns=["Año", "Incidentes"])
    st.line_chart(df_seg.set_index("Año"))

    st.info("""
    **Bitácora de exploración (Streamlit vs HTML/JS Vanilla):**
    - **Qué resolvió:** Permitió maquetar un tablero interactivo funcional en Python en menos de 40 líneas de código.
    - **Qué no pudo:** Streamlit requiere un servidor con runtime de Python permanentemente activo en la nube (Streamlit Community Cloud / Docker), consume más de 200MB de memoria en ejecución y expone el estado de sesión si no se controla adecuadamente. Además, en repositorios públicos, la app es pública sin compuerta controlable.
    - **Decisión:** Descartado para producción. Se prefirió HTML, CSS y Vanilla JS porque se compila a un sitio estático puro en Vercel, consume 0 MB de servidor, no expone runtime y permite control estricto de cliente.
    """)

except ImportError:
    print("Streamlit no instalado en este entorno. pip install streamlit")
