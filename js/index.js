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

    // Número de personajes q va a pillar de la api
    const villagers = data.slice(0,50);
    const duplicatedVillagers = [...villagers, ...villagers];

    duplicatedVillagers.forEach(villager => {

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

const moveAmount = 300;

/* Total de lo que se mueve*/

function getMaxScroll(){

    return track.scrollWidth - track.parentElement.offsetWidth;
}


next.addEventListener("click", () => {

    currentPosition -= moveAmount;
    track.style.transition = "transform 0.5s ease";

    /*cuanddo llega a la ultima vuelve*/

    /*if(Math.abs(currentPosition) >= getMaxScroll()){

        currentPosition = 0;}*/

    track.style.transform = `translateX(${currentPosition}px)`;

    if(Math.abs(currentPosition) >= track.scrollWidth / 2){

    setTimeout(() => {

        track.style.transition = "none";

        currentPosition = 0;

        track.style.transform =
            `translateX(${currentPosition}px)`;

    }, 500);
}

});

prev.addEventListener("click", () => {

    currentPosition += moveAmount;

    if(currentPosition > 0){
        currentPosition = -getMaxScroll();
    }

    track.style.transform = `translateX(${currentPosition}px)`;

});