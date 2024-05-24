document.addEventListener('DOMContentLoaded', function () {
    function ocultarContenido() {
        // Obtén todas las filas de la tabla
        var filas = document.querySelectorAll("table tr");

        // Itera sobre cada fila
        filas.forEach(function(fila) {
            // Obtén todas las celdas de la fila
            var celdas = fila.querySelectorAll("td");
            // Si la fila tiene celdas
            if (celdas.length > 0) {
                // Obtén la última celda
                var ultimaCelda = celdas[celdas.length - 1];
                // Reemplaza el contenido de la última celda con asteriscos
                var contenido = ultimaCelda.textContent;
                var longitud = contenido.length;
                var asteriscos = '*'.repeat(longitud);
                ultimaCelda.textContent = asteriscos;
                ultimaCelda.classList.add("hidden-text"); // Aplicar una clase para estilos adicionales, si es necesario
            }
        });
    }

    // Ejecutar la función
    ocultarContenido();
});
