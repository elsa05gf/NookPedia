document.addEventListener('DOMContentLoaded', function () {

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

        circulo.classList.add(
            'circulo-pronombre',
            'rounded-circle',
            'd-flex',
            'justify-content-center',
            'align-items-center',
            'overflow-hidden',
            'flex-shrink-0'
        );

        // Al hacer click en el círculo, volver a SeleccionarPerfil
        circulo.addEventListener('click', function () {
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

    // Seleccionar todos los botones del rectángulo
    const botones = document.querySelectorAll('.eleccion-acrinder');

    // Recorrer cada botón
    botones.forEach(function (boton) {
        boton.addEventListener('click', function () {
            // Quitar la clase 'seleccionado' de todos los botones
            botones.forEach(function (btn) {
                btn.classList.remove('seleccionado');
            });

            // Añadir la clase 'seleccionado' al botón clickeado
            this.classList.add('seleccionado');
        });
    });

    // Guardar el nombre cuando el usuario escribe
    const inputNombre = document.querySelector('.input-personalizado');

    if (inputNombre) {
        // Cargar el nombre guardado al cargar la página
        const nombreGuardado = localStorage.getItem('nombreUsuario');
        if (nombreGuardado) {
            inputNombre.value = nombreGuardado;
        }

        // Guardar el nombre cada vez que el usuario escribe
        inputNombre.addEventListener('input', function () {
            localStorage.setItem('nombreUsuario', this.value);
        });
    }

});

