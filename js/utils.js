// Módulo de utilidades
const Utils = (() => {
    // Función debounce para optimizar eventos
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Formatear número con decimales fijos
    function formatNumber(num, decimals = 4) {
        return parseFloat(num.toFixed(decimals));
    }

    // Verificar si un valor es numérico
    function isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    return {
        debounce,
        formatNumber,
        isNumeric
    };
})();