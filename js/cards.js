document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // LÓGICA DE LA PANTALLA DE INICIO (demoInicio)
    // ==========================================
    const inicioDemo = document.getElementById("inicio-demo");
    const btnStart = document.getElementById("btn-start");

    if (inicioDemo && btnStart) {
        const tl = gsap.timeline();
        tl.from(".logo-container", { y: -50, opacity: 0, duration: 1.2, ease: "bounce.out" })
          .from(".btn-acrinder", { y: 30, opacity: 0, duration: 0.6, stagger: 0.2, ease: "back.out(1.7)" }, "-=0.6");

        btnStart.addEventListener("click", () => {
            gsap.to(inicioDemo, {
                opacity: 0, y: -30, duration: 0.5, ease: "power2.in",
                onComplete: () => { window.location.href = "demoCards.html"; }
            });
        });

        const botones = document.querySelectorAll(".btn-acrinder");
        botones.forEach(btn => {
            btn.addEventListener("mouseenter", () => gsap.to(btn, { scale: 1.05, duration: 0.2 }));
            btn.addEventListener("mouseleave", () => gsap.to(btn, { scale: 1, duration: 0.2 }));
            btn.addEventListener("mousedown", () => gsap.to(btn, { y: 4, duration: 0.1 }));
            btn.addEventListener("mouseup", () => gsap.to(btn, { y: 0, duration: 0.1 }));
        });
    }

//  Inicio del Java

    const cardsContainer = document.getElementById("cardsContainer");
    
    if (cardsContainer) {

        const API_KEY = '955e9378-ac80-4d2d-9f7f-09003656bb3c'; 
        const API_URL = 'https://api.nookipedia.com/villagers?nhdetails=true';
        
        let villagersQueue = []; // Cola de aldeanos
        let currentIndex = 0;    // Por qué aldeano vamos
        let currentDraggable = null;
        let isAnimating = false;
        
        const bgTop = document.getElementById("bg-top");
        const noBtn = document.getElementById("noBtn");
        const matchBtn = document.getElementById("matchBtn");

        // Fallback ampliado por si la API falla o no hay key
        const sampleVillagers = [
            { name: "Audie", quote: "Be the kind of person your future self won't regret having been.", img: "https://dodo.ac/np/images/1/1b/Audie_NH.png" },
            { name: "Raymond", quote: "Stay on brand!", img: "https://dodo.ac/np/images/2/2a/Raymond_NH.png" },
            { name: "Marshal", quote: "Seize the day!", img: "https://dodo.ac/np/images/9/97/Marshal_NH.png" },
            { name: "Ankha", quote: "All that glitters is not gold.", img: "https://dodo.ac/np/images/5/56/Ankha_NH.png" },
            { name: "Apollo", quote: "What goes up must come down.", img: "https://dodo.ac/np/images/2/28/Apollo_NH.png" },
            { name: "Cherry", quote: "One dog's bark is another dog's bite.", img: "https://dodo.ac/np/images/b/b8/Cherry_NH.png" },
            { name: "Roald", quote: "You must learn to waddle before you can walk.", img: "https://dodo.ac/np/images/8/80/Roald_NH.png" },
            { name: "Shino", quote: "Better the demon you know than the demon you don't.", img: "https://dodo.ac/np/images/3/30/Shino_NH.png" },
            { name: "Sasha", quote: "Timing is everything.", img: "https://dodo.ac/np/images/1/10/Sasha_NH.png" }
        ];

        // Función para mezclar el array aleatoriamente (Fisher-Yates)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        async function initGame() {
            try {
                // Intentamos conectar a la API directamente, sin comprobaciones previas
                const response = await fetch(API_URL, {
                    headers: { 'X-API-Key': API_KEY, 'Accept-Version': '1.0.0' }
                });
                
                if (!response.ok) throw new Error('Error al conectar con Nookipedia');
                
                const data = await response.json();
                
                // Filtramos para que solo salgan aldeanos de New Horizons y que tengan foto
               // Filtramos para que solo salgan aldeanos de New Horizons y que tengan foto
                const mappedData = data
                    .filter(v => v.image_url && v.nh_details)
                    .map(v => ({
                        name: v.name,
                        quote: v.nh_details.quote || "¡Encantado de conocerte!",
                        img: v.image_url,
                        // --- AQUÍ ESTÁN LOS DATOS NUEVOS ---
                        species: v.species,
                        gender: v.gender,
                        personality: v.personality,
                        sign: v.sign,
                        birthday_month: v.birthday_month,
                        birthday_day: v.birthday_day
                    }));
                
                // Mezclamos la lista completa
                villagersQueue = shuffleArray(mappedData);
                
            } catch (error) {
                // Si hay algún problema (ej. te quedas sin internet), carga los de repuesto
                console.error("Usando aldeanos de repuesto por error en la API:", error);
                villagersQueue = shuffleArray([...sampleVillagers]);
            }
            
            // Mostramos la primera carta
            renderCurrentCard();
        }

        function createCardElement(villager) {
            const card = document.createElement("div");
            card.className = "card-item";
            
            // EL SEGUNDO TRUCO: Añadimos 'onerror' a la etiqueta <img>
            // Si la imagen falla, cargará el logo de ACRINDER en su lugar para no dejar el hueco feo
            card.innerHTML = `
                <div class="card-info">
                    <h2 class="card-name">${villager.name}</h2>
                    <div class="card-quote-box">${villager.quote}</div>
                    <p class="card-cta">¿Te gustaría<br>conocerla mejor?</p>
                </div>
                <div class="card-img-container">
                    <img src="${villager.img}" alt="${villager.name}" onerror="this.src='../imagenes/Logo_API_Marrón'; this.style.opacity='0.5';">
                </div>
            `;
            return card;
        }

        // Dibuja SOLO una carta a la vez en el HTML
        function renderCurrentCard() {
            cardsContainer.innerHTML = ""; 

            // Si ya no quedan aldeanos en la lista
            if (currentIndex >= villagersQueue.length) {
                cardsContainer.innerHTML = `
                    <div class="card-item" style="justify-content: center; align-items: center; flex-direction: column; text-align: center;">
                        <h2 class="card-name" style="font-size: 1.8rem; margin-bottom: 20px;">¡No hay más aldeanos!</h2>
                        <p style="color: #7A6C5D; font-weight: bold;">Has visto a todos.</p>
                    </div>`;
                return;
            }

            // Seleccionamos al aldeano que toca y creamos su carta
            const villager = villagersQueue[currentIndex];
            const card = createCardElement(villager);
            cardsContainer.appendChild(card);

            setupDraggable(card);
        }

        function setupDraggable(topCard) {
            if (currentDraggable) currentDraggable.kill();

            // Animación de aparición (Pop-in) para cada carta nueva que entra
            gsap.fromTo(topCard, 
                { scale: 0.8, opacity: 0, y: 50 }, 
                { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
            );

            currentDraggable = Draggable.create(topCard, {
                type: "x",
                edgeResistance: 0.8,
                bounds: { minX: -300, maxX: 300 },
                onDragStart: () => { isAnimating = true; },
                onDrag: function() {
                    const x = this.x;
                    gsap.set(topCard, { rotation: x * 0.05 });
                    
                    // Colores de fondo
                    if (x > 50) bgTop.className = 'bg-accept';
                    else if (x < -50) bgTop.className = 'bg-reject';
                    else bgTop.className = 'bg-presentation';
                },
                onDragEnd: function() {
                    isAnimating = false;
                    const x = this.x;
                    bgTop.className = 'bg-presentation'; 

                    if (x > 120) handleSwipe(topCard, "right");
                    else if (x < -120) handleSwipe(topCard, "left");
                    else gsap.to(topCard, { x: 0, rotation: 0, duration: 0.3, ease: "power2.out" });
                }
            })[0];
        }

     function handleSwipe(cardElement, direction) {
            if (isAnimating) return;
            isAnimating = true;
            
            const isMatch = (direction === "right");
            const endX = isMatch ? window.innerWidth : -window.innerWidth;
            const rotationEnd = isMatch ? 20 : -20;
            
            // Animación de salida (volando hacia el lado)
            gsap.to(cardElement, {
                x: endX, rotation: rotationEnd, opacity: 0, duration: 0.4,
                onComplete: () => {
                    isAnimating = false;
                    
                    // --- NUEVA LÓGICA AQUÍ ---
                    if (isMatch) {
                        // ¡ES UN MATCH! Guardamos los datos y vamos a la página de Info
                        localStorage.setItem("matchedVillager", JSON.stringify(villagersQueue[currentIndex]));
                        window.location.href = "demoInfo.html";
                    } else {
                        // NO ES MATCH. Pasamos al siguiente
                        currentIndex++;
                        renderCurrentCard();
                    }
                }
            });
        }

        // Botones de control manual
        noBtn.addEventListener("click", () => {
            const currentCard = document.querySelector(".card-item");
            if(currentCard && !isAnimating) handleSwipe(currentCard, "left");
        });
        
        matchBtn.addEventListener("click", () => {
            const currentCard = document.querySelector(".card-item");
            if(currentCard && !isAnimating) handleSwipe(currentCard, "right");
        });

        // Arrancamos el juego
        initGame();
    }
});