# Optimizador de Programación Lineal - Guía de Instalación y Uso

## 📋 Requisitos previos
- Navegador web moderno (Chrome, Firefox, Edge)
- Git (opcional, solo para descargar desde GitHub)
- Python 3.x o Node.js (opcional, para servidor local)

## 🚀 Instalación paso a paso

### Método 1: Desde GitHub Pages (recomendado para uso rápido)
1. Abre tu navegador web
2. Visita: [https://tusuario.github.io/turepo/](https://tusuario.github.io/turepo/)

### Método 2: Clonar y ejecutar localmente
```bash
# 1. Clona el repositorio
git clone https://github.com/tusuario/turepo.git

# 2. Navega al directorio del proyecto
cd turepo

# 3. (Opcional) Inicia un servidor local con Python
python3 -m http.server 8000

# 4. Abre en tu navegador:
#    http://localhost:8000
🖥️ Comandos básicos para desarrollo
bash
# Actualizar el repositorio local
git pull origin main

# Si necesitas reinstalar dependencias (package.json debe existir)
npm install

# Ejecutar con live-server (Node.js)
npx live-server
🎯 Guía de uso del sistema
1. Configurar el problema
bash
1. Selecciona tipo de optimización: Maximizar/Minimizar
2. Ingresa coeficientes para X e Y
3. Configura las restricciones:
   - Click en "➕ Agregar" para nuevas restricciones
   - Usa "🗑️" para eliminar restricciones
2. Resolver el problema
bash
1. Click en "🔍 RESOLVER PROBLEMA"
2. Espera a que se calcule la solución
3. Los resultados aparecerán en:
   - Valores óptimos de X e Y
   - Valor de la función objetivo
   - Tabla de evaluación de restricciones
3. Visualizar resultados
bash
1. Gráfico interactivo muestra:
   - Región factible (área roja)
   - Líneas de restricción
   - Solución óptima (punto rojo)
2. Para ver detalles:
   - Click en "📝 VER SOLUCIÓN PASO A PASO"
🛠️ Solución de problemas comunes
Gráfico no se muestra
bash
1. Verifica conexión a internet (se carga Chart.js desde CDN)
2. Ejecuta con servidor local si estás en modo offline:
   python3 -m http.server 8000
Error "No hay solución factible"
bash
1. Revisa que las restricciones no sean contradictorias
2. Asegúrate que al menos 2 restricciones estén bien definidas
3. Verifica que los coeficientes sean números válidos
📱 Compatibilidad
✔️ Desktop (Chrome, Firefox, Edge)

✔️ Tablets (modo horizontal recomendado)

⚠️ Móviles (funciona pero con experiencia limitada)

📄 Licencia
MIT License - Libre uso y modificación


Este archivo README.md está listo para:
1. Copiar y pegar directamente en tu repositorio
2. Contiene todos los comandos necesarios
3. Explica el flujo de uso paso a paso
4. Incluye solución de problemas comunes
