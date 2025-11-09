# 💧 Natek Dashboard

**Natek Dashboard** es una aplicación web desarrollada por **Natek** para la visualización, gestión y análisis de datos hidrológicos recolectados por estaciones de monitoreo en todo el Perú.  
El sistema permite explorar estaciones, visualizar niveles y caudales, analizar alertas, generar reportes y acceder a datos en tiempo real para la gestión inteligente del agua.

---

## 🧱 Estructura del Proyecto
src/
├── app/                    # Configuración global (rutas, layouts, providers)
├── components/             # Componentes reutilizables de la UI
│   ├── map/                # Módulo del mapa (MapView, hooks y capas)
│   ├── ui/                 # Botones, inputs, modales, etc.
│   └── …
├── features/               # Lógica agrupada por dominio (Feature-Based)
│   ├── auth/               # Login, registro y autenticación
│   ├── stations/           # Vista de estaciones y detalle con tabs
│   ├── reports/            # Reportes y predicciones
│   ├── alerts/             # Alertas de estaciones
│   └── home/               # Página principal
├── hooks/                  # Hooks globales reutilizables
├── services/               # Configuración y funciones de API
├── types/                  # Tipos globales compartidos
└── main.tsx / App.tsx      # Punto de entrada

> 💡 La arquitectura sigue el patrón **Feature-Based Folder Structure (FSD)** para mantener alta cohesión por módulo y bajo acoplamiento entre dominios.
