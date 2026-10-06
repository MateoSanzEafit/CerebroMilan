#!/usr/bin/env python3
"""Laboratorio · Exploración de validación de esquemas con Frictionless Framework.
Compara Frictionless Framework contra el verificador personalizado (verificar.py)."""
import sys
import os
import pathlib

sys.stdout.reconfigure(encoding='utf-8')

try:
    import frictionless

    base_dir = pathlib.Path(__file__).resolve().parent.parent
    cat_json = base_dir / "catalogo" / "fuentes.json"
    nil_csv = base_dir / "territorio" / "nil.csv"

    print("=== Frictionless Framework: Validación declarativa de catálogo y tablas ===")
    
    # 1. Validar el catálogo de fuentes
    report_cat = frictionless.validate(cat_json.as_posix())
    print(f"Catálogo fuentes.json válido: {report_cat.valid}")
    print(f"Errores estructurales detectados: {len(report_cat.flatten())}")

    # 2. Validar la tabla territorial NIL
    if nil_csv.exists():
        report_nil = frictionless.validate(nil_csv.as_posix())
        print(f"Territorio nil.csv válido: {report_nil.valid}")
        print(f"Filas procesadas: {report_nil.stats.get('rows', 'N/A')}")
        print(f"Errores en CSV: {len(report_nil.flatten())}")

    print("\nBitácora de exploración (Frictionless vs verificar.py):")
    print("- Frictionless: Excelente para verificar tipos tabulares (integers, strings, headers duplicados, delimitadores).")
    print("- Qué NO pudo Frictionless: No evalúa contratos anidados personalizados ('cifras.valor.vigencia'), ni comprueba expresiones regulares de PII (teléfonos italianos o correos en texto libre), ni valida fechas de prueba en formato ISO dentro de JSON arbitrario.")
    print("- Cadena de suministro: Frictionless arrastra 39 dependencias externas adicionales.")
    print("- Decisión: Quedó 'verificar.py' (script propio en Python estándar) porque combina aseguramiento de contrato, verificación de PII en profundidad y 0 dependencias.")

except ImportError as e:
    print(f"Frictionless no instalado: {e}. Para instalar: pip install frictionless")
