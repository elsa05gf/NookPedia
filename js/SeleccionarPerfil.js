document.addEventListener('DOMContentLoaded', function() {
    
    // Seleccionar todos los contenedor-click
    const opciones = document.querySelectorAll('.contenedor-click');
    
    // Pronombres en orden
    const pronombres = ['they', 'she', 'he'];
    
    opciones.forEach(function(opcion, index) {
        opcion.style.cursor = 'pointer';
        opcion.addEventListener('click', function() {
            localStorage.setItem('pronombre', pronombres[index]);
            window.location.href = 'Perfil.html';
        });
    });
    
});