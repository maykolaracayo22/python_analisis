// Módulo principal de la aplicación
const App = (() => {
    // Estado de la aplicación
    const state = {
        restricciones: [
            {x: 2, y: 1, comparacion: '<=', valor: 20},
            {x: 1, y: 2, comparacion: '<=', valor: 16},
            {x: 1, y: 1, comparacion: '<=', valor: 9}
        ],
        resultado: null,
        pasosProceso: []
    };

    // Inicializar la aplicación
    function init() {
        // Configurar event listeners
        document.getElementById('objetivo-tipo').addEventListener('change', UI.actualizarObjetivo);
        document.getElementById('coef-x').addEventListener('input', Utils.debounce(UI.actualizarObjetivo, 300));
        document.getElementById('coef-y').addEventListener('input', Utils.debounce(UI.actualizarObjetivo, 300));
        document.getElementById('btn-agregar-restriccion').addEventListener('click', UI.agregarRestriccion);
        document.getElementById('btn-limpiar-restricciones').addEventListener('click', UI.limpiarRestricciones);
        document.getElementById('btn-resolver').addEventListener('click', resolverProblema);
        document.getElementById('btn-paso-paso').addEventListener('click', UI.mostrarPasoAPaso);

        // Renderizar estado inicial
        UI.renderizarRestricciones(state.restricciones);
        UI.actualizarObjetivo();
        UI.actualizarResumen(state.restricciones);
        UI.mostrarTutorialInicial();
    }

    // Resolver el problema
    async function resolverProblema() {
        const spinner = document.getElementById('loading-spinner');
        const btn = document.getElementById('btn-resolver');
        
        // Animación de carga
        btn.style.transform = 'scale(0.95)';
        spinner.style.display = 'block';
        btn.disabled = true;
        
        try {
            const coefX = parseFloat(document.getElementById('coef-x').value) || 0;
            const coefY = parseFloat(document.getElementById('coef-y').value) || 0;
            const esMaximizar = document.getElementById('objetivo-tipo').value === 'Maximizar';
            
            // Ejecutar algoritmo simplex
            const solucion = Simplex.resolver(
                { x: coefX, y: coefY },
                esMaximizar,
                state.restricciones
            );
            
            state.resultado = solucion;
            state.pasosProceso = solucion.pasos || [];
            
            if (solucion.factible) {
                UI.mostrarResultados(solucion);
                Grafico.crear(solucion, state.restricciones);
                UI.mostrarNotificacion('🎉 ¡Solución óptima encontrada!', 'success');
            } else {
                UI.mostrarError('No se encontró una solución factible para este problema.');
                UI.mostrarNotificacion('❌ No hay solución factible', 'error');
                Grafico.mostrarError();
            }
        } catch (error) {
            UI.mostrarError('Error al resolver el problema: ' + error.message);
            UI.mostrarNotificacion('💥 Error en el cálculo', 'error');
        } finally {
            // Restaurar botón
            spinner.style.display = 'none';
            btn.disabled = false;
            btn.style.transform = 'scale(1)';
        }
    }

    // Obtener estado actual
    function getState() {
        return state;
    }

    // Actualizar restricciones
    function updateRestricciones(nuevasRestricciones) {
        state.restricciones = nuevasRestricciones;
    }

    return {
        init,
        getState,
        updateRestricciones
    };
})();

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', App.init);