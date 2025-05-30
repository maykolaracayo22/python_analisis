// Módulo de visualización gráfica - Versión corregida completa
const Grafico = (() => {
    let chart = null;

    // Función para verificar si un punto es factible
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

    // Crear gráfico con la solución
    function crear(solucion, restricciones) {
        const canvas = document.getElementById('grafico-canvas');
        const ctx = canvas.getContext('2d');
        
        // Ocultar placeholder y mostrar canvas
        document.getElementById('grafico-placeholder').style.display = 'none';
        canvas.style.display = 'block';
        
        // Destruir gráfico anterior si existe
        if (chart) {
            chart.destroy();
        }

        // Calcular límites del gráfico
        const limites = calcularLimites(solucion, restricciones);
        const xMax = limites.xMax;
        const yMax = limites.yMax;
        
        // Colores para las restricciones
        const colors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
        ];
        
        // Preparar datasets para el gráfico
        const datasets = [];
        
        // 1. Líneas de restricción
        restricciones.forEach((restriccion, index) => {
            const puntosLinea = generarPuntosRestriccion(restriccion, xMax, yMax);
            const color = colors[index % colors.length];
            
            if (puntosLinea.length > 0) {
                datasets.push({
                    type: 'line',
                    label: `R${index+1}: ${formatearRestriccion(restriccion)}`,
                    data: puntosLinea,
                    borderColor: color,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    borderDash: restriccion.comparacion === '=' ? [] : [5, 5],
                    tension: 0,
                    order: 1
                });
            }
        });
        
        // 2. Región factible (área sombreada)
if (solucion.factible) {
    const esMinimizar = document.getElementById('objetivo-tipo').value === 'Minimizar';
    const puntosRegion = [];
    
    // Función auxiliar para encontrar intersección entre dos líneas
    function encontrarInterseccion(r1, r2) {
        const det = r1.x * r2.y - r1.y * r2.x;
        if (Math.abs(det) < 1e-10) return null; // Líneas paralelas
        
        const x = (r2.y * r1.valor - r1.y * r2.valor) / det;
        const y = (r1.x * r2.valor - r2.x * r1.valor) / det;
        
        return { x, y };
    }
    
    // Agregar puntos candidatos
    const puntosCandidatos = [];
    
    // 1. Origen (si es factible)
    if (esPuntoFactible(0, 0, restricciones)) {
        puntosCandidatos.push({ x: 0, y: 0 });
    }
    
    // 2. Intersecciones con los ejes
    restricciones.forEach(r => {
        // Intersección con eje X (y = 0)
        if (r.y !== 0) {
            const x = r.valor / r.x;
            if (x >= 0 && esPuntoFactible(x, 0, restricciones)) {
                puntosCandidatos.push({ x: x, y: 0 });
            }
        }
        
        // Intersección con eje Y (x = 0)
        if (r.x !== 0) {
            const y = r.valor / r.y;
            if (y >= 0 && esPuntoFactible(0, y, restricciones)) {
                puntosCandidatos.push({ x: 0, y: y });
            }
        }
    });
    
    // 3. Intersecciones entre restricciones
    for (let i = 0; i < restricciones.length; i++) {
        for (let j = i + 1; j < restricciones.length; j++) {
            const interseccion = encontrarInterseccion(restricciones[i], restricciones[j]);
            if (interseccion && 
                interseccion.x >= -1e-10 && 
                interseccion.y >= -1e-10 && 
                esPuntoFactible(interseccion.x, interseccion.y, restricciones)) {
                puntosCandidatos.push(interseccion);
            }
        }
    }
    
    // 4. Para problemas de minimización, agregar puntos en los límites del gráfico
    if (esMinimizar) {
        // Intersecciones con los bordes del gráfico
        restricciones.forEach(r => {
            // Intersección con x = xMax
            if (r.y !== 0) {
                const y = (r.valor - r.x * xMax) / r.y;
                if (y >= 0 && y <= yMax && esPuntoFactible(xMax, y, restricciones)) {
                    puntosCandidatos.push({ x: xMax, y: y });
                }
            }
            
            // Intersección con y = yMax
            if (r.x !== 0) {
                const x = (r.valor - r.y * yMax) / r.x;
                if (x >= 0 && x <= xMax && esPuntoFactible(x, yMax, restricciones)) {
                    puntosCandidatos.push({ x: x, y: yMax });
                }
            }
        });
        
        // Esquinas del gráfico (si son factibles)
        const esquinas = [
            { x: 0, y: yMax },
            { x: xMax, y: 0 },
            { x: xMax, y: yMax }
        ];
        
        esquinas.forEach(punto => {
            if (esPuntoFactible(punto.x, punto.y, restricciones)) {
                puntosCandidatos.push(punto);
            }
        });
    }
    
    // Eliminar puntos duplicados
    const puntosUnicos = [];
    puntosCandidatos.forEach(punto => {
        const existe = puntosUnicos.some(p => 
            Math.abs(p.x - punto.x) < 1e-6 && Math.abs(p.y - punto.y) < 1e-6
        );
        if (!existe) {
            puntosUnicos.push(punto);
        }
    });
    
    // Filtrar puntos que realmente forman la región factible
    if (puntosUnicos.length >= 3) {
        // Para maximización: usar solo los vértices del polígono convexo
        // Para minimización: usar todos los puntos factibles encontrados
        let puntosFinales;
        
        if (esMinimizar) {
            puntosFinales = puntosUnicos;
        } else {
            // Para maximización, calcular el casco convexo
            puntosFinales = calcularCascoConvexo(puntosUnicos);
        }
        
        // Ordenar puntos para formar un polígono cerrado
        const puntosOrdenados = ordenarPuntosPoligono(puntosFinales);
        
        if (puntosOrdenados.length >= 3) {
            datasets.push({
                type: 'line',
                label: 'Región Factible',
                data: puntosOrdenados,
                backgroundColor: esMinimizar ? 'rgba(34, 197, 94, 0.07)' : 'rgba(239, 68, 68, 0.2)',
                borderColor: esMinimizar ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0,
                order: 2
            });
        }
    }
}

// Función auxiliar para calcular el casco convexo (algoritmo de Graham)
function calcularCascoConvexo(puntos) {
    if (puntos.length <= 3) return puntos;
    
    // Encontrar el punto más bajo (y menor x en caso de empate)
    let puntoBase = puntos[0];
    for (let i = 1; i < puntos.length; i++) {
        if (puntos[i].y < puntoBase.y || 
            (puntos[i].y === puntoBase.y && puntos[i].x < puntoBase.x)) {
            puntoBase = puntos[i];
        }
    }
    
    // Función para calcular el producto cruzado
    function productoCruzado(o, a, b) {
        return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    }
    
    // Ordenar puntos por ángulo polar respecto al punto base
    const puntosOrdenados = puntos.filter(p => p !== puntoBase)
        .sort((a, b) => {
            const cruz = productoCruzado(puntoBase, a, b);
            if (cruz === 0) {
                // Si están en la misma línea, ordenar por distancia
                const distA = Math.pow(a.x - puntoBase.x, 2) + Math.pow(a.y - puntoBase.y, 2);
                const distB = Math.pow(b.x - puntoBase.x, 2) + Math.pow(b.y - puntoBase.y, 2);
                return distA - distB;
            }
            return -cruz;
        });
    
    // Construir el casco convexo
    const casco = [puntoBase];
    
    for (let punto of puntosOrdenados) {
        while (casco.length > 1 && 
               productoCruzado(casco[casco.length-2], casco[casco.length-1], punto) <= 0) {
            casco.pop();
        }
        casco.push(punto);
    }
    
    return casco;
}
        
        // 3. Solución óptima
        if (solucion.factible && solucion.x !== undefined && solucion.y !== undefined) {
            datasets.push({
                type: 'scatter',
                label: 'Solución Óptima',
                data: [{x: solucion.x, y: solucion.y}],
                backgroundColor: 'rgba(220, 38, 38, 1)',
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 3,
                pointRadius: 8,
                showLine: false,
                order: 3
            });
        }
        
        // Crear el gráfico
        chart = new Chart(ctx, {
            type: 'line',
            data: { datasets: datasets },
            options: getChartOptions(xMax, yMax)
        });
    }

    // Función auxiliar para ordenar puntos de un polígono
    function ordenarPuntosPoligono(puntos) {
        if (puntos.length < 3) return puntos;
        
        // Encontrar el centroide
        const centroide = {
            x: puntos.reduce((sum, p) => sum + p.x, 0) / puntos.length,
            y: puntos.reduce((sum, p) => sum + p.y, 0) / puntos.length
        };
        
        // Ordenar por ángulo respecto al centroide
        return puntos.slice().sort((a, b) => {
            const anguloA = Math.atan2(a.y - centroide.y, a.x - centroide.x);
            const anguloB = Math.atan2(b.y - centroide.y, b.x - centroide.x);
            return anguloA - anguloB;
        });
    }

    // Calcular límites del gráfico
    function calcularLimites(solucion, restricciones) {
        let xMax = 15; // Aumentado para mejor visualización
        let yMax = 15;
        
        // Considerar solución óptima
        if (solucion.factible && solucion.x !== undefined && solucion.y !== undefined) {
            xMax = Math.max(xMax, solucion.x * 1.8);
            yMax = Math.max(yMax, solucion.y * 1.8);
        }
        
        // Considerar intersecciones con ejes
        restricciones.forEach(r => {
            if (r.x > 0) xMax = Math.max(xMax, (r.valor / r.x) * 1.5);
            if (r.y > 0) yMax = Math.max(yMax, (r.valor / r.y) * 1.5);
        });
        
        return { xMax: Math.ceil(xMax), yMax: Math.ceil(yMax) };
    }

    // Generar puntos para dibujar una línea de restricción
    function generarPuntosRestriccion(restriccion, xMax, yMax) {
        const puntos = [];
        const { x: a, y: b, valor: c } = restriccion;
        
        // Caso 1: Línea vertical (b = 0, a ≠ 0)
        if (b === 0 && a !== 0) {
            const x = c / a;
            if (x >= 0 && x <= xMax) {
                puntos.push({ x: x, y: 0 });
                puntos.push({ x: x, y: yMax });
            }
            return puntos;
        }
        
        // Caso 2: Línea horizontal (a = 0, b ≠ 0)
        if (a === 0 && b !== 0) {
            const y = c / b;
            if (y >= 0 && y <= yMax) {
                puntos.push({ x: 0, y: y });
                puntos.push({ x: xMax, y: y });
            }
            return puntos;
        }
        
        // Caso 3: Línea oblicua (a ≠ 0, b ≠ 0)
        if (a !== 0 && b !== 0) {
            // Intersección con eje Y (x = 0)
            const yIntercept = c / b;
            if (yIntercept >= 0 && yIntercept <= yMax) {
                puntos.push({ x: 0, y: yIntercept });
            }
            
            // Intersección con eje X (y = 0)
            const xIntercept = c / a;
            if (xIntercept >= 0 && xIntercept <= xMax) {
                puntos.push({ x: xIntercept, y: 0 });
            }
            
            // Si solo tenemos un punto, buscar otro en los bordes
            if (puntos.length === 1) {
                // Probar en x = xMax
                const yAtXMax = (c - a * xMax) / b;
                if (yAtXMax >= 0 && yAtXMax <= yMax) {
                    puntos.push({ x: xMax, y: yAtXMax });
                }
                
                // Si aún necesitamos más puntos, probar en y = yMax
                if (puntos.length === 1) {
                    const xAtYMax = (c - b * yMax) / a;
                    if (xAtYMax >= 0 && xAtYMax <= xMax) {
                        puntos.push({ x: xAtYMax, y: yMax });
                    }
                }
            }
        }
        
        return puntos;
    }

    // Formatear restricción para mostrar en la leyenda
    function formatearRestriccion(restriccion) {
        const x = restriccion.x === 1 ? 'x' : restriccion.x === -1 ? '-x' : `${restriccion.x}x`;
        const y = restriccion.y === 1 ? '+y' : restriccion.y === -1 ? '-y' : 
                 restriccion.y > 0 ? `+${restriccion.y}y` : `${restriccion.y}y`;
        
        if (restriccion.y === 0) {
            return `${x} ${restriccion.comparacion} ${restriccion.valor}`;
        } else {
            return `${x}${y} ${restriccion.comparacion} ${restriccion.valor}`;
        }
    }

    // Mostrar gráfico de error
    function mostrarError() {
        const canvas = document.getElementById('grafico-canvas');
        const ctx = canvas.getContext('2d');
        
        // Ocultar placeholder y mostrar canvas
        document.getElementById('grafico-placeholder').style.display = 'none';
        canvas.style.display = 'block';
        
        if (chart) {
            chart.destroy();
        }
        
        // Configurar gráfico para mostrar problema sin solución
        chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Región Infactible',
                    data: [],
                    backgroundColor: 'rgba(248, 113, 113, 0.1)',
                    borderColor: 'rgba(248, 113, 113, 0.8)',
                    borderWidth: 2,
                    pointRadius: 0
                }]
            },
            options: getChartOptions(20, 20, 'No hay solución factible', '#f87171')
        });
    }

    // Opciones del gráfico
    function getChartOptions(xMax, yMax, title = 'Solución Gráfica del Problema', titleColor = '#ffffff') {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    color: titleColor
                },
                legend: {
                    position: 'right',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: 0,
                    max: xMax,
                    title: {
                        display: true,
                        text: 'Variable X',
                        color: '#ffffff',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                y: {
                    type: 'linear',
                    min: 0,
                    max: yMax,
                    title: {
                        display: true,
                        text: 'Variable Y',
                        color: '#ffffff',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            elements: {
                line: {
                    tension: 0
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        };
    }

    return {
        crear,
        mostrarError
    };
})();