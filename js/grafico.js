// Módulo de visualización gráfica
const Grafico = (() => {
    let chart = null;

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

    // Ordenar vértices para formar un polígono correcto (sentido horario o antihorario)
    function ordenarVerticesPoligono(vertices) {
        if (vertices.length < 3) return vertices;
        
        // Encontrar el centroide
        const centroide = {
            x: vertices.reduce((sum, v) => sum + v.x, 0) / vertices.length,
            y: vertices.reduce((sum, v) => sum + v.y, 0) / vertices.length
        };
        
        // Ordenar por ángulo respecto al centroide
        const verticesOrdenados = vertices.slice().sort((a, b) => {
            const anguloA = Math.atan2(a.y - centroide.y, a.x - centroide.x);
            const anguloB = Math.atan2(b.y - centroide.y, b.x - centroide.x);
            return anguloA - anguloB;
        });
        
        return verticesOrdenados;
    }
        
        // Calcular límites del gráfico de forma más robusta
        const limites = calcularLimites(solucion, restricciones);
        const xMax = limites.xMax;
        const yMax = limites.yMax;
        
        console.log('Límites del gráfico:', { xMax, yMax }); // Debug
        
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
        
        // 1. Región factible (área sombreada en rojo)
        if (solucion.vertices && solucion.vertices.length >= 2) {
            // Ordenar vértices para formar un polígono correcto
            const verticesOrdenados = ordenarVerticesPoligono(solucion.vertices);
            
            // Si solo tenemos 2 vértices, agregamos el origen (0,0) si no está incluido
            if (verticesOrdenados.length === 2) {
                const contieneOrigen = verticesOrdenados.some(v => 
                    Math.abs(v.x) < 1e-10 && Math.abs(v.y) < 1e-10);
                
                if (!contieneOrigen) {
                    verticesOrdenados.push({x: 0, y: 0});
                }
            }
            
            datasets.push({
                type: 'line', // Cambiar a tipo line para mejor control del relleno
                label: 'Región Factible',
                data: verticesOrdenados,
                backgroundColor: 'rgba(255, 0, 0, 0.3)', // ROJO con transparencia
                borderColor: 'rgba(255, 0, 0, 0.6)', // Borde rojo
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: true,
                showLine: true,
                tension: 0,
                order: 1, // Renderizar primero (abajo)
                spanGaps: false
            });
        }
        
        // 2. Líneas de restricción
        restricciones.forEach((restriccion, index) => {
            const puntosLinea = generarPuntosRestriccion(restriccion, xMax, yMax);
            const color = colors[index % colors.length];
            
            console.log(`Restricción ${index + 1}:`, restriccion, 'Puntos:', puntosLinea); // Debug
            
            if (puntosLinea.length > 0) {
                datasets.push({
                    type: 'line', // Especificar tipo line
                    label: `R${index+1}: ${formatearRestriccion(restriccion)}`,
                    data: puntosLinea,
                    borderColor: color,
                    backgroundColor: 'transparent', // Sin relleno para las líneas
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    showLine: true,
                    borderDash: restriccion.comparacion === '=' ? [] : [5, 5],
                    tension: 0,
                    order: 2 // Renderizar después de la región factible
                });
            }
        });
        
        // 3. Vértices de la región factible
        if (solucion.vertices && solucion.vertices.length > 0) {
            datasets.push({
                type: 'scatter', // Tipo scatter para puntos
                label: 'Vértices Factibles',
                data: solucion.vertices,
                backgroundColor: 'rgba(74, 222, 128, 0.8)',
                borderColor: 'rgba(74, 222, 128, 1)',
                borderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false,
                order: 3 // Renderizar encima
            });
        }
        
        // 4. Solución óptima
        if (solucion.factible && solucion.x !== undefined && solucion.y !== undefined) {
            datasets.push({
                type: 'scatter', // Tipo scatter para puntos
                label: 'Solución Óptima',
                data: [{x: solucion.x, y: solucion.y}],
                backgroundColor: 'rgba(220, 38, 38, 1)',
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 3,
                pointRadius: 10,
                pointHoverRadius: 12,
                showLine: false,
                order: 4 // Renderizar al final (encima de todo)
            });
        }
        
        // Crear el gráfico con todos los datasets
        chart = new Chart(ctx, {
            type: 'line', // Cambiar tipo base a 'line' para mejor soporte de relleno
            data: {
                datasets: datasets
            },
            options: getChartOptions(xMax, yMax)
        });
    }

    // Calcular límites del gráfico de manera más robusta
    function calcularLimites(solucion, restricciones) {
        let xMax = 10; // Valor mínimo por defecto
        let yMax = 10; // Valor mínimo por defecto
        
        // Considerar vértices si existen
        if (solucion.vertices && solucion.vertices.length > 0) {
            const xVertices = solucion.vertices.map(v => v.x);
            const yVertices = solucion.vertices.map(v => v.y);
            xMax = Math.max(xMax, ...xVertices);
            yMax = Math.max(yMax, ...yVertices);
        }
        
        // Considerar la solución óptima
        if (solucion.factible && solucion.x !== undefined && solucion.y !== undefined) {
            xMax = Math.max(xMax, solucion.x);
            yMax = Math.max(yMax, solucion.y);
        }
        
        // Considerar las restricciones para encontrar intersecciones con los ejes
        restricciones.forEach(restriccion => {
            if (restriccion.x > 0 && restriccion.valor > 0) {
                // Intersección con eje X (y = 0)
                const xIntercept = restriccion.valor / restriccion.x;
                xMax = Math.max(xMax, xIntercept);
            }
            
            if (restriccion.y > 0 && restriccion.valor > 0) {
                // Intersección con eje Y (x = 0)
                const yIntercept = restriccion.valor / restriccion.y;
                yMax = Math.max(yMax, yIntercept);
            }
        });
        
        // Agregar margen del 20%
        xMax = Math.ceil(xMax * 1.2);
        yMax = Math.ceil(yMax * 1.2);
        
        return { xMax, yMax };
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