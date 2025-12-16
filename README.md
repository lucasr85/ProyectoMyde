# Materiales y Dispositivos Electrónicos — Demo offline

Aplicación educativa e interactiva para acompañar una cursada de “Materiales y Dispositivos Electrónicos”. Todo funciona 100% offline con Vite + React + TypeScript y Recharts.

## Requerimientos cumplidos
- 7 módulos independientes: Ley de Ohm, Matthiessen, Movilidad/Scattering, Bandas, Grafeno vs Cobre, Superconductividad y Comparativa global.
- Cálculos en funciones puras (`src/physics/*`), componentes por módulo en `src/modules/*`, tipos comunes en `src/types.ts`.
- Gráficas con Recharts, diagramas SVG, estado global simple con eventos + localStorage para presets por módulo.
- Diseño sin dependencias externas ni fuentes remotas; CSS local y responsive básico.

## Cómo ejecutar OFFLINE
1) Instalar dependencias (solo la primera vez):
```bash
npm install
```
2) Ambiente de desarrollo con hot reload:
```bash
npm run dev
```
Abrí la URL local que imprime Vite (por defecto http://localhost:5173).

3) Build de producción:
```bash
npm run build
```

4) Servir `dist/` sin internet:
   - Opción rápida: `npx serve dist` (usa el `serve` que viene en tu `node_modules` si ya lo tenés instalado).
   - O bien abrir `dist/` con la extensión Live Server de VSCode apuntando a la carpeta `dist`.

No se usan CDNs ni recursos externos; todo queda empaquetado.

## Estructura clave
```
src/
  physics/       // Motores de cálculo por tema
  modules/       // Componentes UI por tema
  components/    // UI compartida (modal de presets)
  state/         // Hook para presets en localStorage
  utils/         // Clamp, formato numérico
  App.tsx        // Layout general (sidebar + header + panel)
  main.tsx       // Punto de entrada React
```

## Notas de uso
- Botones del header: Reset total (recarga), Guardar preset, Cargar preset (modal). Los presets se guardan por módulo en `localStorage`.
- Todos los inputs validan rangos por `clamp` y muestran unidades. Magnitudes se formatean en notación científica cuando corresponde.
- Cada módulo incluye un bloque de ayuda breve para la explicación física.
