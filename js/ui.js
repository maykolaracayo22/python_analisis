// Módulo de Interfaz de Usuario
const UI = (() => {
    // Formatear coeficiente para mostrarlo
    function formatearCoeficiente(coef) {
        if (coef === 0) return '0';
        if (coef === 1) return '';
        if (coef === -1) return '-';
        return coef.toString();
    }

    // Actualizar visualización de la función objetivo
    function actualizarObjetivo() {
        const tipo = document.getElementById('objetivo-tipo').value;
        const coefX = parseFloat(document.getElementById('coef-x').value) || 0;
        const coefY = parseFloat(document.getElementById('coef-y').value) || 0;
        
        const objetivoText = `<strong>${tipo}:</strong> ${formatearCoeficiente(coefX)}x + ${formatearCoeficiente(coefY)}y`;
        
        // Animación suave al actualizar
        const displays = [document.getElementById('objetivo-display'), document.getElementById('resumen-objetivo')];
        displays.forEach(display => {
            display.style.transform = 'scale(0.95)';
            display.style.opacity = '0.7';
            setTimeout(() => {
                display.innerHTML = objetivoText;
                display.style.transform = 'scale(1)';
                display.style.opacity = '1';
            }, 150);
        });
    }

    // Agregar nueva restricción
    function agregarRestriccion() {
        const state = App.getState();
        state.restricciones.push({x: 1, y: 1, comparacion: '<=', valor: 10});
        renderizarRestricciones(state.restricciones);
        actualizarResumen(state.restricciones);
        
        // Animación para nueva restricción
        setTimeout(() => {
            const items = document.querySelectorAll('.restriction-item');
            const ultimoItem = items[items.length - 1];
            ultimoItem.style.transform = 'translateX(-20px)';
            ultimoItem.style.opacity = '0';
            setTimeout(() => {
                ultimoItem.style.transform = 'translateX(0)';
                ultimoItem.style.opacity = '1';
            }, 100);
        }, 50);
    }

    // Limpiar todas las restricciones
    function limpiarRestricciones() {
        if (confirm('¿Estás seguro de que quieres limpiar todas las restricciones? Esto restaurará los valores por defecto.')) {
            const state = App.getState();
            state.restricciones = [
                {x: 2, y: 1, comparacion: '<=', valor: 20},
                {x: 1, y: 2, comparacion: '<=', valor: 16},
                {x: 1, y: 1, comparacion: '<=', valor: 9}
            ];
            App.updateRestricciones(state.restricciones);
            renderizarRestricciones(state.restricciones);
            actualizarResumen(state.restricciones);
            ocultarResultados();
            mostrarTutorialInicial();
            
            // Mostrar notificación
            mostrarNotificacion('✅ Restricciones restauradas a valores por defecto', 'success');
        }
    }

    // Renderizar lista de restricciones
    function renderizarRestricciones(restricciones) {
        const container = document.getElementById('restricciones-container');
        container.innerHTML = '';
        
        restricciones.forEach((restriccion, index) => {
            const div = document.createElement('div');
            div.className = 'restriction-item';
            div.innerHTML = `
                <div class="restriction-header">📌 Restricción ${index + 1}</div>
                <div class="form-row">
                    <div style="flex: 1;">
                        <label>Coef. X</label>
                        <input type="number" value="${restriccion.x}" step="0.1" 
                               onchange="UI.actualizarRestriccion(${index}, 'x', this.value)"
                               placeholder="Coef. X">
                    </div>
                    <div style="flex: 1;">
                        <label>Coef. Y</label>
                        <input type="number" value="${restriccion.y}" step="0.1" 
                               onchange="UI.actualizarRestriccion(${index}, 'y', this.value)"
                               placeholder="Coef. Y">
                    </div>
                    <div style="flex: 0.8;">
                        <label>Operador</label>
                        <select onchange="UI.actualizarRestriccion(${index}, 'comparacion', this.value)">
                            <option value="<=" ${restriccion.comparacion === '<=' ? 'selected' : ''}>≤</option>
                            <option value=">=" ${restriccion.comparacion === '>=' ? 'selected' : ''}>≥</option>
                            <option value="=" ${restriccion.comparacion === '=' ? 'selected' : ''}>=</option>
                        </select>
                    </div>
                    <div style="flex: 1;">
                        <label>Valor</label>
                        <input type="number" value="${restriccion.valor}" step="0.1" 
                               onchange="UI.actualizarRestriccion(${index}, 'valor', this.value)"
                               placeholder="Límite">
                    </div>
                    <div style="flex: 0.5;">
                        <button class="btn btn-danger" onclick="UI.eliminarRestriccion(${index})" 
                                title="Eliminar restricción">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="restriction-formula">
                    ${formatearCoeficiente(restriccion.x)}x + ${formatearCoeficiente(restriccion.y)}y ${restriccion.comparacion} ${restriccion.valor}
                </div>
            `;
            container.appendChild(div);
        });
    }

    // Actualizar una restricción específica
    function actualizarRestriccion(index, campo, valor) {
        const state = App.getState();
        
        if (campo === 'x' || campo === 'y' || campo === 'valor') {
            state.restricciones[index][campo] = parseFloat(valor) || 0;
        } else {
            state.restricciones[index][campo] = valor;
        }
        
        // Actualizar solo la fórmula de esa restricción
        const formulas = document.querySelectorAll('.restriction-formula');
        if (formulas[index]) {
            const r = state.restricciones[index];
            formulas[index].textContent = `${formatearCoeficiente(r.x)}x + ${formatearCoeficiente(r.y)}y ${r.comparacion} ${r.valor}`;
            
            // Animación de actualización
            formulas[index].style.background = 'linear-gradient(135deg, rgba(74, 222, 128, 0.3), rgba(34, 197, 94, 0.3))';
            setTimeout(() => {
                formulas[index].style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(240, 147, 251, 0.2))';
            }, 500);
        }
        
        actualizarResumen(state.restricciones);
    }

    // Eliminar una restricción
    function eliminarRestriccion(index) {
        const state = App.getState();
        
        if (state.restricciones.length <= 1) {
            mostrarNotificacion('⚠️ Debe haber al menos una restricción', 'warning');
            return;
        }
        
        state.restricciones.splice(index, 1);
        App.updateRestricciones(state.restricciones);
        renderizarRestricciones(state.restricciones);
        actualizarResumen(state.restricciones);
        mostrarNotificacion('🗑️ Restricción eliminada', 'info');
    }

    // Actualizar resumen de restricciones
    function actualizarResumen(restricciones) {
        const container = document.getElementById('resumen-restricciones');
        container.innerHTML = '';
        
        restricciones.forEach(r => {
            const div = document.createElement('div');
            div.className = 'restriction-formula';
            div.textContent = `${formatearCoeficiente(r.x)}x + ${formatearCoeficiente(r.y)}y ${r.comparacion} ${r.valor}`;
            container.appendChild(div);
        });
    }

    // Mostrar tutorial inicial
    function mostrarTutorialInicial() {
        const placeholder = document.getElementById('grafico-placeholder');
        placeholder.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
                <h3 style="color: var(--primary); margin-bottom: 1rem;">¡Bienvenido al Optimizador!</h3>
                <p style="margin-bottom: 1.5rem; color: rgba(255,255,255,0.8);">
                    Configura tu función objetivo y restricciones, luego presiona <strong>'RESOLVER PROBLEMA'</strong> 
                    para obtener la solución óptima con visualización gráfica interactiva.
                </p>
                <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
                    <span style="background: rgba(102, 126, 234, 0.2); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">⚡ Algoritmo Símplex</span>
                    <span style="background: rgba(240, 147, 251, 0.2); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">📊 Visualización 3D</span>
                    <span style="background: rgba(74, 222, 128, 0.2); padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">📝 Paso a paso</span>
                </div>
            </div>
        `;
    }

    // Mostrar resultados de la solución
    function mostrarResultados(solucion) {
        document.getElementById('valor-x').textContent = solucion.x.toFixed(4);
        document.getElementById('valor-y').textContent = solucion.y.toFixed(4);
        document.getElementById('valor-objetivo').textContent = solucion.valorObjetivo.toFixed(4);
        
        // Tabla de restricciones
        const tbody = document.getElementById('tabla-restricciones-body');
        tbody.innerHTML = '';
        
        const state = App.getState();
        state.restricciones.forEach((r, index) => {
            const valorCalculado = r.x * solucion.x + r.y * solucion.y;
            const cumple = 
                (r.comparacion === '<=' && valorCalculado <= r.valor + 1e-10) ||
                (r.comparacion === '>=' && valorCalculado >= r.valor - 1e-10) ||
                (r.comparacion === '=' && Math.abs(valorCalculado - r.valor) <= 1e-10);
            
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${formatearCoeficiente(r.x)}x + ${formatearCoeficiente(r.y)}y ${r.comparacion} ${r.valor}</td>
                <td>${valorCalculado.toFixed(4)}</td>
                <td>${r.valor}</td>
                <td style="color: ${cumple ? 'var(--success)' : 'var(--error)'};">
                    ${cumple ? '✅ Cumple' : '❌ Viola'}
                </td>
            `;
        });
        
        // Mostrar resultados con animación
        const container = document.getElementById('resultados-container');
        container.style.display = 'block';
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
            container.style.transition = 'all 0.5s ease';
        }, 100);
        
        // Mostrar botón paso a paso
        const btnPaso = document.getElementById('btn-paso-paso');
        btnPaso.style.display = 'block';
        btnPaso.style.opacity = '0';
        setTimeout(() => {
            btnPaso.style.opacity = '1';
            btnPaso.style.transition = 'opacity 0.3s ease';
        }, 200);
        
        // Ocultar mensajes de error si los hubiera
        document.getElementById('error-container').style.display = 'none';
    }

    // Mostrar mensaje de error
    function mostrarError(mensaje) {
        document.getElementById('error-message').textContent = mensaje;
        document.getElementById('error-container').style.display = 'block';
        document.getElementById('resultados-container').style.display = 'none';
        document.getElementById('btn-paso-paso').style.display = 'none';
    }

    // Ocultar todos los resultados
    function ocultarResultados() {
        document.getElementById('resultados-container').style.display = 'none';
        document.getElementById('error-container').style.display = 'none';
        document.getElementById('btn-paso-paso').style.display = 'none';
        document.getElementById('grafico-placeholder').style.display = 'block';
        document.getElementById('grafico-canvas').style.display = 'none';
    }

    // Mostrar solución paso a paso
    function mostrarPasoAPaso() {
        const state = App.getState();
        const container = document.getElementById('paso-a-paso-container');
        const contenido = document.getElementById('pasos-contenido');
        
        contenido.innerHTML = '';
        
        // Crear elementos para cada paso
        state.pasosProceso.forEach((paso, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step-item';
            stepDiv.innerHTML = `
                <div class="step-title">Paso ${index + 1}: ${paso.titulo}</div>
                <div class="step-content">${paso.contenido.replace(/\n/g, '<br>')}</div>
            `;
            contenido.appendChild(stepDiv);
        });
        
        // Animación para mostrar el contenedor
        container.style.display = 'block';
        container.style.opacity = '0';
        container.style.height = '0';
        container.style.overflow = 'hidden';
        
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.height = 'auto';
            container.style.transition = 'all 0.5s ease';
            
            // Scroll suave al contenedor
            container.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    // Mostrar notificación
    function mostrarNotificacion(mensaje, tipo) {
        const notificacion = document.createElement('div');
        notificacion.className = `alert alert-${tipo}`;
        notificacion.innerHTML = `<strong>${mensaje}</strong>`;
        notificacion.style.position = 'fixed';
        notificacion.style.bottom = '20px';
        notificacion.style.right = '20px';
        notificacion.style.zIndex = '1000';
        notificacion.style.width = '300px';
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateY(20px)';
        notificacion.style.transition = 'all 0.3s ease';
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.opacity = '1';
            notificacion.style.transform = 'translateY(0)';
        }, 10);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notificacion.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }

    // Toggle para elementos expandibles
    function toggleExpandable(header) {
        const content = header.nextElementSibling;
        const icon = header.querySelector('.expandable-icon');
        
        content.classList.toggle('open');
        icon.textContent = content.classList.contains('open') ? '▲' : '▼';
        
        // Animación adicional
        if (content.classList.contains('open')) {
            content.style.maxHeight = '0';
            setTimeout(() => {
                content.style.maxHeight = content.scrollHeight + 'px';
            }, 10);
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            setTimeout(() => {
                content.style.maxHeight = '0';
            }, 10);
        }
    }

    return {
        formatearCoeficiente,
        actualizarObjetivo,
        agregarRestriccion,
        limpiarRestricciones,
        renderizarRestricciones,
        actualizarRestriccion,
        eliminarRestriccion,
        actualizarResumen,
        mostrarTutorialInicial,
        mostrarResultados,
        mostrarError,
        ocultarResultados,
        mostrarPasoAPaso,
        mostrarNotificacion,
        toggleExpandable
    };
})();