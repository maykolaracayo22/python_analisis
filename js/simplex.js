// Módulo del algoritmo Simplex
const Simplex = (() => {
    // Resolver problema de programación lineal
    function resolver(funcionObjetivo, esMaximizar, restricciones) {
        const pasos = [];
        
        // Paso 1: Configurar problema
        pasos.push({
            titulo: 'Configuración inicial del problema',
            contenido: `Función objetivo: ${esMaximizar ? 'Maximizar' : 'Minimizar'} Z = ${funcionObjetivo.x}x + ${funcionObjetivo.y}y
Restricciones:
${restricciones.map((r, i) => `  R${i+1}: ${r.x}x + ${r.y}y ${r.comparacion} ${r.valor}`).join('\n')}
Restricciones de no negatividad: x ≥ 0, y ≥ 0`
        });
        
        // Encontrar vértices de la región factible
        const vertices = encontrarVertices(restricciones);
        
        pasos.push({
            titulo: 'Identificación de vértices de la región factible',
            contenido: `Vértices encontrados: ${vertices.length}
${vertices.map((v, i) => `  V${i+1}: (${v.x.toFixed(4)}, ${v.y.toFixed(4)})`).join('\n')}`
        });
        
        if (vertices.length === 0) {
            return { factible: false, pasos };
        }
        
        // Evaluar función objetivo en cada vértice
        let mejorX = 0, mejorY = 0, mejorZ = 0;
        
        for (let vertex of vertices) {
            const z = funcionObjetivo.x * vertex.x + funcionObjetivo.y * vertex.y;
            vertex.z = z;
            
            if (esMaximizar ? z > mejorZ : z < mejorZ || mejorZ === 0) {
                mejorX = vertex.x;
                mejorY = vertex.y;
                mejorZ = z;
            }
        }
        
        pasos.push({
            titulo: 'Evaluación de la función objetivo',
            contenido: `Evaluación en cada vértice:
${vertices.map((v, i) => `  V${i+1}: Z(${v.x.toFixed(4)}, ${v.y.toFixed(4)}) = ${v.z.toFixed(4)}`).join('\n')}

Solución óptima encontrada en: (${mejorX.toFixed(4)}, ${mejorY.toFixed(4)})
Valor óptimo: Z* = ${mejorZ.toFixed(4)}`
        });
        
        return {
            factible: true,
            x: mejorX,
            y: mejorY,
            valorObjetivo: mejorZ,
            vertices,
            pasos
        };
    }

    // Encontrar vértices de la región factible
    // En simplex.js, reemplaza la función encontrarVertices con esta versión mejorada:

        // En simplex.js, modifica la función encontrarVertices:

        function encontrarVertices(restricciones) {
            const vertices = [];
            const xMax = 50; // Límite superior para búsqueda
            const yMax = 50; // Límite superior para búsqueda
            
            // 1. Intersecciones con ejes para cada restricción
            for (let r of restricciones) {
                // Intersección con eje X (y = 0)
                if (r.x !== 0) {
                    const x = r.valor / r.x;
                    if (x >= 0 && x <= xMax && esPuntoFactible(x, 0, restricciones)) {
                        vertices.push({x: x, y: 0});
                    }
                }
                
                // Intersección con eje Y (x = 0)
                if (r.y !== 0) {
                    const y = r.valor / r.y;
                    if (y >= 0 && y <= yMax && esPuntoFactible(0, y, restricciones)) {
                        vertices.push({x: 0, y: y});
                    }
                }
            }
            
            // 2. Intersecciones entre todas las combinaciones de restricciones
            for (let i = 0; i < restricciones.length; i++) {
                for (let j = i + 1; j < restricciones.length; j++) {
                    const interseccion = encontrarInterseccion(restricciones[i], restricciones[j]);
                    if (interseccion && interseccion.x >= 0 && interseccion.y >= 0 && 
                        interseccion.x <= xMax && interseccion.y <= yMax &&
                        esPuntoFactible(interseccion.x, interseccion.y, restricciones)) {
                        vertices.push(interseccion);
                    }
                }
            }
            
            // 3. Puntos adicionales para restricciones "≥" que no intersectan los ejes
            for (let r of restricciones.filter(r => r.comparacion === '>=')) {
                // Punto aleatorio que cumpla la restricción para ayudar a definir la región
                const xTest = r.valor / r.x * 1.5;
                const yTest = r.valor / r.y * 1.5;
                if (xTest <= xMax && yTest <= yMax && esPuntoFactible(xTest, yTest, restricciones)) {
                    vertices.push({x: xTest, y: yTest});
                }
            }
            
            // Eliminar duplicados
            const verticesUnicos = [];
            const encontrados = new Set();
            
            for (const v of vertices) {
                const clave = `${v.x.toFixed(4)}_${v.y.toFixed(4)}`;
                if (!encontrados.has(clave)) {
                    encontrados.add(clave);
                    verticesUnicos.push(v);
                }
            }
            
            return verticesUnicos;
        }

    // Encontrar intersección entre dos restricciones
    function encontrarInterseccion(r1, r2) {
        const det = r1.x * r2.y - r2.x * r1.y;
        if (Math.abs(det) < 1e-10) return null; // Líneas paralelas
        
        const x = (r1.valor * r2.y - r2.valor * r1.y) / det;
        const y = (r1.x * r2.valor - r2.x * r1.valor) / det;
        
        return {x: x, y: y};
    }

    // Verificar si un punto es factible
    function esPuntoFactible(x, y, restricciones) {
        if (x < -1e-10 || y < -1e-10) return false; // Violación de no negatividad
        
        for (let r of restricciones) {
            const valor = r.x * x + r.y * y;
            if (r.comparacion === '<=' && valor > r.valor + 1e-10) return false;
            if (r.comparacion === '>=' && valor < r.valor - 1e-10) return false;
            if (r.comparacion === '=' && Math.abs(valor - r.valor) > 1e-10) return false;
        }
        
        return true;
    }

    return {
        resolver,
        encontrarVertices
    };
})();