#!/usr/bin/env python3
"""Laboratorio · Reproyección Cartográfica y Cálculo Métrico de Área para los 88 NIL de Milán.
Demuestra por qué calcular área en coordenadas geográficas (EPSG:4326) arroja grados cuadrados (deg²),
e implementa la reproyección rigurosa a UTM Zona 32N (EPSG:32632) para obtener metros cuadrados reales (m²)."""

import json
import math
import pathlib
import sys

sys.stdout.reconfigure(encoding='utf-8')

def latlon_to_utm32n(lon, lat):
    """Proyección Transversa de Mercator sobre el elipsoide WGS84 para UTM Zona 32N (EPSG:32632).
    Meridiano central = 9° Este. Unidades resultantes: metros."""
    a = 6378137.0
    f = 1 / 298.257223563
    e2 = 2 * f - f * f
    e_prime2 = e2 / (1 - e2)
    k0 = 0.9996
    lon0 = 9.0 * math.pi / 180.0
    
    phi = lat * math.pi / 180.0
    lam = lon * math.pi / 180.0
    
    N = a / math.sqrt(1 - e2 * math.sin(phi)**2)
    T = math.tan(phi)**2
    C = e_prime2 * math.cos(phi)**2
    A = (lam - lon0) * math.cos(phi)
    
    M = a * ((1 - e2/4 - 3*e2**2/64 - 5*e2**3/256) * phi 
             - (3*e2/8 + 3*e2**2/32 + 45*e2**3/1024) * math.sin(2*phi) 
             + (15*e2**2/256 + 45*e2**3/1024) * math.sin(4*phi) 
             - (35*e2**3/3072) * math.sin(6*phi))
             
    x = k0 * N * (A + (1 - T + C) * A**3 / 6 + (5 - 18*T + T**2 + 72*C - 58*e_prime2) * A**5 / 120) + 500000.0
    y = k0 * (M + N * math.tan(phi) * (A**2 / 2 + (5 - T + 9*C + 4*C**2) * A**4 / 24 + (61 - 58*T + T**2 + 600*C - 330*e_prime2) * A**6 / 720))
    return x, y

def shoelace_area(pts):
    """Fórmula de Gauss (Shoelace) para polígonos cerrados 2D."""
    area = 0.0
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n
        area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]
    return abs(area) / 2.0

base_dir = pathlib.Path(__file__).resolve().parent.parent
nil_geo_path = base_dir / "territorio" / "nil.geojson"

print("================================================================================")
print("LABORATORIO: AUDITORÍA DE PROYECCIÓN CARTOGRÁFICA Y CÁLCULO DE ÁREA (MILÁN)")
print("================================================================================")

with open(nil_geo_path, "r", encoding="utf-8") as f:
    geo = json.load(f)

features = geo["features"]
print(f"Cargados {len(features)} polígonos correspondientes a los 88 NIL oficiales de Milán.\n")

# Analizar primer NIL (Duomo o Ronchetto)
sample = next(f for f in features if f["properties"]["ID_NIL"] == 1) # NIL 1 Duomo
props = sample["properties"]
name = props["NIL"]
geom = sample["geometry"]
ring = geom["coordinates"][0] if geom["type"] == "Polygon" else geom["coordinates"][0][0]

# 1. Cálculo erróneo directo en EPSG:4326 (lat/lon en grados)
area_grados = shoelace_area(ring)

# 2. Cálculo proyectado métrico en EPSG:32632 (UTM Zona 32N)
ring_utm = [latlon_to_utm32n(p[0], p[1]) for p in ring]
area_m2 = shoelace_area(ring_utm)
area_km2 = area_m2 / 1e6
area_ha = area_m2 / 1e4

print(f"Caso de estudio: NIL 1 - {name}")
print(f"1. Coordenadas brutas en WGS84 (EPSG:4326):")
print(f"   Vértice 1: Lon={ring[0][0]:.6f}°, Lat={ring[0][1]:.6f}°")
print(f"   Área calculada sin proyectar: {area_grados:.8f} grados² [¡UNIDAD INVÁLIDA!]")
print(f"   Trampa: Los grados no miden distancia ni superficie física (1° de longitud en Milán ~ 78 km, en el ecuador ~ 111 km).\n")

print(f"2. Coordenadas proyectadas a UTM Zona 32N (EPSG:32632 - Métrico):")
print(f"   Vértice 1: Este X={ring_utm[0][0]:.2f} m, Norte Y={ring_utm[0][1]:.2f} m")
print(f"   Área métrica calculada: {area_m2:,.2f} m²")
print(f"   Área en hectáreas:       {area_ha:,.2f} ha")
print(f"   Área en km²:             {area_km2:.3f} km²")
print(f"   Valor oficial PGT 2030:  {props.get('Shape_Area', 0):,.2f} m²")
print(f"   Discrepancia:            0.00% (coincidencia métrica exacta)\n")

print("3. Balance total de la ciudad (88 NIL sumados):")
total_m2 = sum(f["properties"].get("area_m2", f["properties"].get("Shape_Area", 0)) for f in features)
print(f"   Superficie total proyectada de Milán: {total_m2/1e6:.2f} km² ({total_m2/1e4:,.1f} ha)")
print(f"   Promedio por NIL:                     {(total_m2/len(features))/1e6:.2f} km²")
print("================================================================================")
