document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

const API_KEY = "955e9378-ac80-4d2d-9f7f-09003656bb3c";

const track = document.getElementById("track");

// PETICIÓN A LA API

async function loadVillagers(){

    const response = await fetch("https://api.nookipedia.com/villagers",{

        headers:{
            "X-API-KEY": API_KEY,
            "Accept-Version":"1.0.0"
        }

    });

    const data = await response.json();

    console.log(data);

    // SOLO ALGUNOS PERSONAJES
    const villagers = data.slice(0,50);

    villagers.forEach(villager => {

        // CREAR DIV
        const card = document.createElement("div");

        card.classList.add("character-card");

        // CREAR IMG
        const img = document.createElement("img");

        img.src = villager.image_url;

        img.alt = villager.name;

        // AÑADIR IMG AL DIV
        card.appendChild(img);

        // AÑADIR DIV AL TRACK
        track.appendChild(card);

    });

}

loadVillagers();

const next = document.getElementById("next");
const prev = document.getElementById("prev");

let currentPosition = 0;

next.addEventListener("click", () => {

    currentPosition -= 300;

    track.style.transform = `translateX(${currentPosition}px)`;

});

prev.addEventListener("click", () => {

    currentPosition += 300;

    if(currentPosition > 0){
        currentPosition = 0;
    }

    track.style.transform = `translateX(${currentPosition}px)`;

});