#!/usr/bin/env python3
"""Laboratorio · Exploración Geoespacial de los 88 NIL de Milán.
Compara herramientas geoespaciales: Leaflet / GeoJSON vs Kepler.gl / QGIS."""
import json
import pathlib
import sys

sys.stdout.reconfigure(encoding='utf-8')

base_dir = pathlib.Path(__file__).resolve().parent.parent
nil_geo = base_dir / "territorio" / "nil.geojson"
bikemi_geo = base_dir / "territorio" / "bikemi.geojson"

print("=== Exploración Geoespacial: Malla Barrial y Movilidad Activa de Milán ===")

if nil_geo.exists():
    with open(nil_geo, "r", encoding="utf-8") as f:
        data_nil = json.load(f)
    features = data_nil.get("features", [])
    print(f"Total de polígonos NIL cargados: {len(features)}")
    areas = [f["properties"].get("Shape_Area", 0) for f in features]
    max_area_nil = max(features, key=lambda f: f["properties"].get("Shape_Area", 0))
    min_area_nil = min(features, key=lambda f: f["properties"].get("Shape_Area", 0))
    print(f"- NIL más extenso: {max_area_nil['properties']['NIL']} ({max_area_nil['properties']['Shape_Area']/1e6:.2f} km²)")
    print(f"- NIL más compacto: {min_area_nil['properties']['NIL']} ({min_area_nil['properties']['Shape_Area']/1e6:.2f} km²)")

if bikemi_geo.exists():
    with open(bikemi_geo, "r", encoding="utf-8") as f:
        data_bike = json.load(f)
    print(f"Total de estaciones BikeMi georreferenciadas: {len(data_bike.get('features', []))}")

print("\nBitácora de exploración (Leaflet vs Kepler.gl vs QGIS):")
print("- QGIS: Herramienta de escritorio ideal para curaduría geográfica, reproyección de coordenadas y corrección de topología, pero no sirve para publicación web directa sin servidor de mapas.")
print("- Kepler.gl: Potente motor WebGL en navegador para capas masivas 3D y mapas de calor en fase de exploración; sin embargo, no permite personalización fina de UI ni contratos de datos dinámicos, y exportar mapas web incrusta dependencias pesadas de React/Redux.")
print("- Leaflet / GeoJSON: Liviano (39 KB gzipped), sin dependencias de servidor, compatible con cualquier navegador móvil, renderiza polígonos WGS84 vectoriales y puntos con tooltips y eventos en milisegundos.")
print("- Decisión: Quedó Leaflet + GeoJSON en 'web/' para la vista territorial interactiva del gemelo, garantizando el cumplimiento del piso técnico del encargo.")
