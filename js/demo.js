document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. ANIMACIONES DE ENTRADA CON GSAP ---
    const tl = gsap.timeline();

    // Animar el logo (cae desde arriba con un pequeño rebote)
    tl.from(".logo-container", {
        y: -50,
        opacity: 0,
        duration: 1.2,
        ease: "bounce.out"
    })
    // Animar los botones (aparecen desde abajo en secuencia)
    .from(".btn-acrinder", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "back.out(1.7)"
    }, "-=0.6"); // Se solapa con la animación del logo

    
    // --- 2. Hover de Botones ---
    const botones = document.querySelectorAll(".btn-acrinder");
    
    botones.forEach(btn => {
        // Al poner el ratón encima (escala un poco)
        btn.addEventListener("mouseenter", () => {
            gsap.to(btn, { scale: 1.05, duration: 0.2, ease: "power1.out" });
        });
        
        // Al quitar el ratón (vuelve a su tamaño)
        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, { scale: 1, duration: 0.2, ease: "power1.out" });
        });

        // Al hacer click (efecto de presionar el botón 3D)
        btn.addEventListener("mousedown", () => {
            gsap.to(btn, { y: 4, boxShadow: "0px 2px 0px #D8CBAE, 0px 5px 10px rgba(0,0,0,0.1)", duration: 0.1 });
        });
        
        btn.addEventListener("mouseup", () => {
            gsap.to(btn, { y: 0, boxShadow: "0px 6px 0px #D8CBAE, 0px 10px 15px rgba(0,0,0,0.15)", duration: 0.1 });
        });
    });


    // --- 3. Botón Start ---
    const btnStart = document.getElementById("btn-start");
    const inicioDemo = document.getElementById("inicio-demo");
    const screenSwipe = document.getElementById("screen-swipe");

    btnStart.addEventListener("click", () => {
        // Animamos la salida de la pantalla de inicio
        gsap.to(inicioDemo, {
            opacity: 0,
            y: -30,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                // Ocultar pantalla de inicio
                inicioDemo.classList.add("d-none");
                inicioDemo.classList.remove("d-flex");
                
                // Mostrar pantalla de Swipe
                screenSwipe.classList.remove("d-none");
                screenSwipe.classList.add("d-flex"); // O flex-column dependiendo de cómo lo estructures
                
                // Animar entrada de la pantalla de swipe
                gsap.fromTo(screenSwipe, { opacity: 0 }, { opacity: 1, duration: 0.5 });
            }
        });
    });
});