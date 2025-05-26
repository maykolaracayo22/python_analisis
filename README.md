Guía Completa de Instalación y Uso del Optimizador de Programación Lineal
📥 Descarga e Instalación
1. Clonar el repositorio desde GitHub
Para obtener el sistema en tu máquina local, ejecuta el siguiente comando en tu terminal (necesitas Git instalado):

bash
git clone https://github.com/tu-usuario/tu-repositorio.git
Reemplaza tu-usuario/tu-repositorio con el nombre de tu repositorio en GitHub.

2. Instalar dependencias (opcional)
Si el proyecto usa alguna dependencia (como un servidor local), instálala con:

bash
cd tu-repositorio
npm install  # Si usas Node.js
3. Ejecutar el sistema localmente
Opción 1: Abrir directamente en el navegador
Simplemente abre el archivo index.html en tu navegador:

Windows/Linux: Haz doble clic o arrástralo a tu navegador.

Mac: Click derecho → "Abrir con" → [Tu navegador].

Opción 2: Usar un servidor local (recomendado)
Si el sistema no carga correctamente debido a restricciones de CORS, inicia un servidor local:

Con Python (soporte en Windows, Mac, Linux):

bash
python3 -m http.server 8000  # Python 3
Luego abre:
👉 http://localhost:8000

Con Node.js (si instalaste dependencias):

bash
npx live-server  # Instala live-server si no lo tienes: npm install -g live-server
Se abrirá automáticamente en tu navegador.

🚀 Guía de Uso del Sistema
1. Configurar el problema
Función Objetivo
Selecciona si quieres Maximizar o Minimizar (🔺/🔻).

Ingresa los coeficientes de X e Y (ejemplo: 3x + 2y).

Restricciones
Agregar restricciones: Haz clic en "➕ Agregar".

Eliminar restricciones: Usa el botón 🗑️.

Restaurar valores por defecto: "🗑️ Limpiar".

📌 Ejemplo de restricción:

2x + 1y ≤ 20
1x + 2y ≤ 16
2. Resolver el problema
Haz clic en "🔍 RESOLVER PROBLEMA" y espera a que el algoritmo calcule la solución.

✅ Resultados mostrados:

Valor óptimo de X e Y.

Valor de la función objetivo.

Estado de cada restricción (✅ Cumple / ❌ Viola).

📊 Visualización gráfica:

Región factible (área roja).

Líneas de restricciones.

Puntos de solución óptima.

3. Solución paso a paso
Si quieres entender cómo se resolvió el problema, haz clic en:
"📝 VER SOLUCIÓN PASO A PASO"

📌 Contenido detallado:

Configuración inicial del problema.

Vértices de la región factible.

Evaluación de la función objetivo en cada vértice.

Solución óptima encontrada.

🛠️ Solución de Problemas
❌ El gráfico no se muestra
Asegúrate de tener conexión a Internet (Chart.js se carga desde un CDN).

Si usas el sistema localmente, ejecútalo con un servidor (python -m http.server o live-server).

⚠️ "No se encontró solución factible"
Revisa que las restricciones no sean contradictorias.

Prueba con valores más flexibles.

📱 ¿Funciona en móviles?
✅ Sí, pero es mejor usarlo en pantallas grandes (tablet o PC) para mejor visualización.

📌 Ejemplo Práctico
Problema:

Función objetivo: Maximizar Z = 3x + 2y.

Restricciones:

2x + y ≤ 20

x + 2y ≤ 16

x + y ≤ 9

Solución esperada:

X = 4, Y = 5.

Z óptimo = 22.

📜 Licencia
Este proyecto es open-source bajo la licencia MIT. Puedes modificarlo y distribuirlo libremente.

🔗 Enlace al repositorio
👉 https://github.com/tu-usuario/tu-repositorio

📢 ¡Listo! Ahora puedes usar el sistema para resolver problemas de programación lineal de manera interactiva. 🚀
