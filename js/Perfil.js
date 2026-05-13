document.addEventListener('DOMContentLoaded', function() {
    
    // Obtener el pronombre guardado
    const pronombre = localStorage.getItem('pronombre');
    
    // Seleccionar el contenedor
    const contenedor = document.getElementById('contenedor-pronombre');
    
    if (!contenedor) return;
    
    const imagenes = {
        'they': '../imagenes/They.webp',
        'she': '../imagenes/She.webp',
        'he': '../imagenes/He.webp'
    };
    
    if (pronombre && imagenes[pronombre]) {
        
        // Crear el círculo
        const circulo = document.createElement('div');
        circulo.style.width = '200px';
        circulo.style.height = '200px';
        circulo.style.backgroundColor = '#FFFAE5';
        circulo.style.border = '8px solid #786951';
        circulo.style.borderRadius = '50%';
        circulo.style.display = 'flex';
        circulo.style.justifyContent = 'center';
        circulo.style.alignItems = 'center';
        circulo.style.overflow = 'hidden';
        circulo.style.cursor = 'pointer';
        
        // Al hacer click en el círculo, volver a SeleccionarPerfil
        circulo.addEventListener('click', function() {
            window.location.href = 'SeleccionarPerfil.html';
        });
        
        // Crear la imagen
        const imagen = document.createElement('img');
        imagen.src = imagenes[pronombre];
        imagen.alt = pronombre;
        imagen.style.width = '100%';
        imagen.style.height = '100%';
        imagen.style.objectFit = 'cover';
        imagen.style.objectPosition = 'center 0%';
        
        // Añadir imagen al círculo
        circulo.appendChild(imagen);
        
        // Limpiar el contenedor y añadir el círculo
        contenedor.innerHTML = '';
        contenedor.appendChild(circulo);
        
    } else {
        // Si no hay pronombre, ir a seleccionar
        window.location.href = 'SeleccionarPerfil.html';
    }
    
});