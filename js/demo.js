const card = document.getElementById("card");

// Crear etiquetas MATCH y NO
const likeLabel = document.createElement("div");
likeLabel.className = "like-label";
likeLabel.innerText = "MATCH";

const nopeLabel = document.createElement("div");
nopeLabel.className = "nope-label";
nopeLabel.innerText = "NO";

card.appendChild(likeLabel);
card.appendChild(nopeLabel);

let isDragging = false;

let startX = 0;
let currentX = 0;

card.addEventListener("mousedown", startDrag);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", endDrag);

function startDrag(e) {
  isDragging = true;
  startX = e.clientX;

  card.style.cursor = "grabbing";
}

function drag(e) {
  if (!isDragging) return;

  currentX = e.clientX - startX;

  // mover tarjeta
  gsap.set(card, {
    x: currentX,
    rotation: currentX / 10
  });

  // mostrar etiquetas
  if (currentX > 0) {
    gsap.to(likeLabel, {
      opacity: currentX / 100
    });

    gsap.to(nopeLabel, {
      opacity: 0
    });

  } else {

    gsap.to(nopeLabel, {
      opacity: Math.abs(currentX) / 100
    });

    gsap.to(likeLabel, {
      opacity: 0
    });
  }
}

function endDrag() {
  if (!isDragging) return;

  isDragging = false;
  card.style.cursor = "grab";

  // MATCH
  if (currentX > 150) {

    gsap.to(card, {
      x: 1000,
      rotation: 45,
      duration: 0.5,
      onComplete: () => {
        nextCard("MATCH");
      }
    });

  }

  // NO
  else if (currentX < -150) {

    gsap.to(card, {
      x: -1000,
      rotation: -45,
      duration: 0.5,
      onComplete: () => {
        nextCard("NO");
      }
    });

  }

  // volver al centro
  else {

    gsap.to(card, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.3
    });

    gsap.to([likeLabel, nopeLabel], {
      opacity: 0,
      duration: 0.2
    });
  }

  currentX = 0;
}

function nextCard(action) {

  console.log("Resultado:", action);

  // Aquí luego podéis cargar la siguiente tarjeta
  // por ejemplo desde una API

  // Reiniciar posición
  gsap.set(card, {
    x: 0,
    y: 0,
    rotation: 0
  });

  gsap.set([likeLabel, nopeLabel], {
    opacity: 0
  });

  // Ejemplo visual temporal
  if (action === "MATCH") {
    card.querySelector(".card-title").innerText = "MATCH ❤️";
  } else {
    card.querySelector(".card-title").innerText = "NO ❌";
  }
}