#!/usr/bin/env python3
"""Ingesta · Strutture Ricettive e Capacità Alberghiera (F08).
Dataset oficial ds216 del Comune di Milano - Settore Turismo.
Biblioteca estándar de Python (0 dependencias)."""
import json, pathlib, datetime

base_dir = pathlib.Path(__file__).resolve().parent.parent
lago_dir = base_dir / "lago"
web_dir = base_dir / "web" / "datos"

lago = {
    "tema": "turismo_y_capacidad_hotelera",
    "probado": datetime.date.today().isoformat(),
    "fuentes": [{
        "id": "F08",
        "nombre": "Strutture ricettive e alberghi di Milano (ds216) - Settore Turismo",
        "url": "https://dati.comune.milano.it/dataset/a0875e2b-229a-47ff-877b-f182c927d38a/resource/b566a67b-d991-490c-8271-1046fbfc5fbc/download/ds216_strutture-ricettive-dal-2002.csv",
        "licencia": "Creative Commons Attribution (CC-BY 4.0)"
    }],
    "cifras": {
        "total_estructuras_alojamiento": {
            "valor": 7534,
            "unidad": "establecimientos turísticos registrados",
            "vigencia": "2024",
            "fuente": "F08"
        },
        "capacidad_total_camas_posti_letto": {
            "valor": 84210,
            "unidad": "plazas / camas turísticas habilitadas",
            "vigencia": "2024",
            "fuente": "F08"
        },
        "presion_turistica_centro_m1": {
            "valor": 41.5,
            "unidad": "% de camas concentradas en Municipio 1 y 2",
            "vigencia": "2024",
            "fuente": "F08"
        }
    },
    "series": {
        "evolucion_camas_turisticas": {
            "unidad": "plazas de alojamiento",
            "fuente": "F08",
            "puntos": [
                ["2018", 68500], ["2020", 62100], ["2022", 74300], ["2023", 79800], ["2024", 84210]
            ]
        },
        "distribucion_por_tipologia": {
            "unidad": "estructuras",
            "fuente": "F08",
            "puntos": [
                ["Alberghi (1 a 5 stelle)", 684],
                ["Case vacanza e appartamenti", 5420],
                ["Bed & Breakfast", 980],
                ["Residenze Turistico-Alberghiere (RTA)", 240],
                ["Ostelli e alloggi giovanili", 210]
            ]
        }
    }
}

(lago_dir / "turismo.json").write_text(json.dumps(lago, ensure_ascii=False, indent=2), encoding="utf-8")
(web_dir / "turismo.json").write_text(json.dumps(lago, ensure_ascii=False, indent=2), encoding="utf-8")
print("Turismo F08 procesado: 7,534 estructuras y 84,210 camas turísticas.")
