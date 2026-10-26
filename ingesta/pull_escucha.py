#!/usr/bin/env python3
"""Ingesta · Tráfico mensual de Wikipedia para Milán.
Sin llaves: usa solo la biblioteca estándar de Python."""
import datetime, json, pathlib, urllib.parse, urllib.request, ssl, os

CIUDAD = "Milán"
DESDE, HASTA = "20250101", "20260831"
UA = {"User-Agent": "taller-gestion-gobernanza-milano/1.0 (curso universitario)"}

ctx = ssl._create_unverified_context()

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, context=ctx, timeout=30) as r:
        return json.load(r)

# Canónico
t = urllib.parse.quote(CIUDAD.replace(" ", "_"))
resumen = get(f"https://es.wikipedia.org/api/rest_v1/page/summary/{t}")
assert resumen["type"] == "standard", f"«{CIUDAD}» no es artículo estándar"
canon = urllib.parse.quote(resumen["titles"]["canonical"])

url = f"https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/es.wikipedia/all-access/user/{canon}/monthly/{DESDE}/{HASTA}"
items = get(url)["items"]
puntos = [[i["timestamp"][:4] + "-" + i["timestamp"][4:6], i["views"]] for i in items]
ultimo = puntos[-1]

lago = {
    "tema": "escucha",
    "probado": datetime.date.today().isoformat(),
    "fuentes": [{
        "id": "wikimedia_pageviews",
        "nombre": "Wikimedia Pageviews API",
        "url": url,
        "estado": "vivo",
        "licencia": "CC0"
    }],
    "cifras": {
        "vistas_ultimo_mes": {
            "valor": ultimo[1],
            "unidad": "visitas de usuarios",
            "vigencia": ultimo[0],
            "fuente": "wikimedia_pageviews"
        }
    },
    "series": {
        "vistas_mensuales": {
            "unidad": "visitas de usuarios",
            "fuente": "wikimedia_pageviews",
            "puntos": puntos
        }
    }
}

base_dir = pathlib.Path(__file__).resolve().parent.parent
lago_dir = base_dir / "lago"
lago_dir.mkdir(parents=True, exist_ok=True)
(lago_dir / "escucha.json").write_text(json.dumps(lago, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Milán: {len(puntos)} meses procesados. Último mes ({ultimo[0]}): {ultimo[1]} visitas.")
