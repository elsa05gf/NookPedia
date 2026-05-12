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

// --- 3. LÓGICA DE TRANSICIÓN A OTRA PÁGINA (Botón Start) ---
    const btnStart = document.getElementById("btn-start");
    const inicioDemo = document.getElementById("inicio-demo");

    btnStart.addEventListener("click", () => {
        // Animamos la salida de la pantalla actual para que el cambio no sea brusco
        gsap.to(inicioDemo, {
            opacity: 0,
            y: -30,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                // Una vez termina la animación, redirigimos al nuevo HTML
                window.location.href = "../html/demoCards.html";
            }
        });
    });
// API de Nookipedia para obtener aldeanos
const API_URL = 'https://api.nookipedia.com/villagers';
// NOTA: Necesitarás una API key de Nookipedia (es gratis registrarse)
// Si no tienes key, se usan datos de ejemplo
const API_KEY = 'TU_API_KEY_AQUI'; // Reemplaza con tu API key

let currentCards = [];
let currentDraggable = null;
let isAnimating = false;
let villagersData = [];

// Elementos del DOM
const container = document.getElementById("cardsContainer");
const startBtn = document.getElementById("startBtn");
const noBtn = document.getElementById("noBtn");
const matchBtn = document.getElementById("matchBtn");

// Datos de ejemplo por si no se puede conectar a la API
const sampleVillagers = [
    { name: "Tom Nook", personality: "Negociante", species: "Tanuki", quote: "¡Los intereses son mi pasión!", img: "https://acnhapi.com/v1/images/villagers/1", catchphrase: "sí, sí" },
    { name: "Isabelle", personality: "Diligente", species: "Perro", quote: "¡Un nuevo día en la isla!", img: "https://acnhapi.com/v1/images/villagers/2", catchphrase: "¡vamos!" },
    { name: "Marshal", personality: "Vasco", species: "Ardilla", quote: "La vida es como un café, a veces amargo, a veces dulce", img: "https://acnhapi.com/v1/images/villagers/664", catchphrase: "esquincle" },
    { name: "Raymond", personality: "Ejecutivo", species: "Gato", quote: "El estilo es una forma de expresión", img: "https://acnhapi.com/v1/images/villagers/798", catchphrase: "cris" },
    { name: "Audie", personality: "Deportista", species: "Lobo", quote: "Be the kind of person your future self won't regret having been.", img: "https://acnhapi.com/v1/images/villagers/924", catchphrase: "foxtrot" }
];

// Función para obtener aldeanos de la API
async function fetchVillagers() {
    try {
        showTemporaryMessage("Cargando aldeanos... 🏝️", "info");
        
        // Si no hay API key o quieres usar datos de ejemplo
        if (API_KEY === '955e9378-ac80-4d2d-9f7f-09003656bb3c') {
            console.log("Usando datos de ejemplo (sin API key)");
            return sampleVillagers;
        }
        
        const response = await fetch(API_URL, {
            headers: {
                'X-API-Key': API_KEY,
                'Accept-Version': '1.0.0'
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar la API');
        
        const data = await response.json();
        // Filtrar para obtener solo los más populares o limitar a 15
        const limitedVillagers = data.slice(0, 15).map(villager => ({
            name: villager.name,
            personality: villager.personality,
            species: villager.species,
            quote: villager.saying || "¡Seremos grandes amigos!",
            img: villager.image_url || `https://acnhapi.com/v1/images/villagers/${villager.id}`,
            catchphrase: villager.catchphrase || "amigo"
        }));
        
        return limitedVillagers;
    } catch (error) {
        console.error("Error al obtener datos:", error);
        showTemporaryMessage("Usando datos de ejemplo 🌟", "warning");
        return sampleVillagers;
    }
}

// Función para crear el HTML de una tarjeta
function createCardElement(villager) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card-item";
    cardDiv.innerHTML = `
        <img src="${villager.img}" alt="${villager.name}" onerror="this.src='https://via.placeholder.com/300x400?text=${villager.name}'">
        <div class="card-content">
            <h3>${villager.name}</h3>
            <span class="personality"><i class="fas fa-smile"></i> ${villager.personality || "Amigable"}</span>
            <span class="personality ms-2"><i class="fas fa-paw"></i> ${villager.species || "Aldeano"}</span>
            <div class="quote">"${villager.quote}"</div>
            <div class="question">
                <i class="fas fa-question-circle"></i> ¿Te gustaría conocerle mejor?
            </div>
        </div>
    `;
    return cardDiv;
}

// Renderiza todas las tarjetas en el contenedor
function renderCards(cardsArray) {
    container.innerHTML = "";
    for (let i = cardsArray.length - 1; i >= 0; i--) {
        const card = createCardElement(cardsArray[i]);
        container.appendChild(card);
    }
    setupDraggableOnTopCard();
}

// Configurar Draggable en la tarjeta superior
function setupDraggableOnTopCard() {
    if (currentDraggable) {
        currentDraggable.kill();
        currentDraggable = null;
    }
    
    const cards = document.querySelectorAll(".card-item");
    if (cards.length === 0) return;
    
    const topCard = cards[cards.length - 1];
    if (!topCard) return;
    
    // Añadir efectos visuales durante el arrastre
    currentDraggable = Draggable.create(topCard, {
        type: "x",
        edgeResistance: 0.7,
        bounds: { minX: -200, maxX: 200 },
        throwProps: false,
        onDragStart: function() {
            if (isAnimating) return false;
            gsap.set(topCard, { cursor: "grabbing" });
        },
        onDrag: function() {
            if (isAnimating) return;
            const x = this.x;
            const rotation = x * 0.1;
            gsap.set(topCard, { rotation: rotation });
            
            // Efectos visuales SOLO EFECTO - RECHAZAR o ACEPTAR
            if (x > 50) {
                topCard.classList.add('accept-effect');
                topCard.classList.remove('reject-effect');
            } else if (x < -50) {
                topCard.classList.add('reject-effect');
                topCard.classList.remove('accept-effect');
            } else {
                topCard.classList.remove('accept-effect', 'reject-effect');
            }
        },
        onDragEnd: function() {
            if (isAnimating) return;
            const x = this.x;
            const threshold = 120;
            
            topCard.classList.remove('accept-effect', 'reject-effect');
            
            if (x > threshold) {
                handleSwipe(topCard, "right");
            } else if (x < -threshold) {
                handleSwipe(topCard, "left");
            } else {
                gsap.to(topCard, {
                    x: 0,
                    rotation: 0,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        }
    })[0];
}

// Manejar el swipe
function handleSwipe(cardElement, direction) {
    if (isAnimating) return;
    isAnimating = true;
    
    const isMatch = (direction === "right");
    const endX = isMatch ? 600 : -600;
    const rotationEnd = isMatch ? 15 : -15;
    
    // Animación de salida
    gsap.to(cardElement, {
        x: endX,
        rotation: rotationEnd,
        opacity: 0,
        duration: 0.5,
        ease: "back.in(1)",
        onComplete: () => {
            cardElement.remove();
            
            if (isMatch) {
                console.log("✅ ACEPTADO a:", currentCards[0]?.name);
                showTemporaryMessage(`❤️ ¡MATCH con ${currentCards[0]?.name}! ❤️`, "success");
                saveMatch(currentCards[0]);
            } else {
                console.log("❌ RECHAZADO a:", currentCards[0]?.name);
                showTemporaryMessage(`💔 Rechazaste a ${currentCards[0]?.name} 💔`, "danger");
            }
            
            if (currentCards.length > 0) {
                currentCards.shift();
            }
            
            if (currentCards.length > 0) {
                renderCards(currentCards);
            } else {
                container.innerHTML = `
                    <div class="card-item bg-white d-flex align-items-center justify-content-center" style="position:relative; flex-direction: column;">
                        <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
                        <h4>✨ ¡Has visto a todos los aldeanos! ✨</h4>
                        <p class="text-center mt-2">Tienes ${matchesArray.length} match(es) guardados</p>
                        <button class="btn btn-primary mt-3" onclick="location.reload()">Volver a empezar</button>
                    </div>
                `;
                if (currentDraggable) {
                    currentDraggable.kill();
                    currentDraggable = null;
                }
                showTemporaryMessage(`🎉 ¡Búsqueda completada! ${matchesArray.length} matches 🎉`, "info");
            }
            
            isAnimating = false;
        }
    });
}

// Array para guardar los matches
let matchesArray = [];

function saveMatch(villager) {
    if (villager) {
        matchesArray.push(villager);
        console.log("Matches guardados:", matchesArray);
        // Mostrar en consola los matches acumulados
        const matchNames = matchesArray.map(v => v.name).join(", ");
        console.log(`Tus matches hasta ahora: ${matchNames}`);
    }
}

// Mostrar mensaje temporal
function showTemporaryMessage(text, type = "info") {
    const msgDiv = document.createElement("div");
    msgDiv.className = `temp-message alert alert-${type === "success" ? "success" : type === "danger" ? "danger" : "info"} shadow-lg`;
    msgDiv.innerHTML = `<i class="fas ${type === "success" ? "fa-heart" : type === "danger" ? "fa-times" : "fa-info-circle"} me-2"></i>${text}`;
    document.body.appendChild(msgDiv);
    setTimeout(() => {
        msgDiv.style.animation = "slideDown 0.3s ease-out reverse";
        setTimeout(() => msgDiv.remove(), 300);
    }, 2000);
}

// Iniciar el juego
async function startGame() {
    startBtn.disabled = true;
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Cargando...';
    
    villagersData = await fetchVillagers();
    currentCards = [...villagersData];
    matchesArray = [];
    isAnimating = false;
    
    if (currentDraggable) {
        currentDraggable.kill();
        currentDraggable = null;
    }
    
    renderCards(currentCards);
    
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="fas fa-play me-2"></i>Comenzar búsqueda';
    showTemporaryMessage(`🎮 ${currentCards.length} aldeanos listos para conocer!`, "success");
}

// Swipe forzado desde botones
function swipeFromButton(direction) {
    if (isAnimating) return;
    const cards = document.querySelectorAll(".card-item");
    if (cards.length === 0) return;
    const topCard = cards[cards.length - 1];
    if (!topCard) return;
    
    // Añadir efecto visual momentáneo
    if (direction === "left") {
        topCard.classList.add('reject-effect');
        setTimeout(() => topCard.classList.remove('reject-effect'), 200);
        handleSwipe(topCard, "left");
    } else if (direction === "right") {
        topCard.classList.add('accept-effect');
        setTimeout(() => topCard.classList.remove('accept-effect'), 200);
        handleSwipe(topCard, "right");
    }
}

// Event listeners
startBtn.addEventListener("click", startGame);
noBtn.addEventListener("click", () => swipeFromButton("left"));
matchBtn.addEventListener("click", () => swipeFromButton("right"));

// Inicializar placeholder
container.innerHTML = `
    <div class="card-item bg-white d-flex align-items-center justify-content-center" style="position:relative; flex-direction: column; text-align: center;">
        <i class="fas fa-leaf fa-4x text-success mb-3"></i>
        <h5>¡Presiona START!</h5>
        <p class="text-muted">Encuentra a tu aldeano ideal</p>
    </div>
`;
