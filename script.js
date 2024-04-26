// Your public and private keys provided by Marvel
var publicKey = '5d47c8ea303299ebc80a20a648b2ac5b';
var privateKey = '33c1609a394d358f9c1da816cbdebd1b5ca6f14a';

// Current timestamp (ts)
var ts = new Date().getTime();

// Generate the hash: md5(ts + privateKey + publicKey)
var hash = CryptoJS.MD5(ts + privateKey + publicKey).toString();

var names = new Set();

// DOM elements
const searchEle = document.getElementById('searchHero');
const resultDiv = document.getElementById('results');
const detailDiv = document.getElementById('details');
const comicsDiv = document.querySelector('#comics ol');
const eventDiv = document.querySelector('#events ol');
const seriesDiv = document.querySelector('#series ol');
const storiesDiv = document.querySelector('#stories ol');
const favoriteDiv = document.getElementById('favoriteHero');

if(!localStorage.getItem('favHero')){
    localStorage.setItem("favHero", JSON.stringify([]));
}

searchEle.addEventListener('input', async()=>{
    const query = searchEle.value.trim();
    try{
        const response = await fetch(
        `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}&nameStartsWith=${query}`
        );
        let data = await response.json();
        if(data.data.results.length === 0){
            throw new Error('Searched Superhero not found');
        }
        displaySuperHero(data.data.results, resultDiv);
    }
    catch(error){
        resultDiv.innerHTML = `<h3 style="color:red;">${error}</h3>`;
    }
});

function displaySuperHero(heros, showresults){
    showresults.innerHTML = '';
    let ss = JSON.parse(localStorage.getItem("favHero"));
    heros.forEach(hero => {
        const heroEle = document.createElement('div');
        heroEle.classList.add('superhero');
        heroEle.accessKey = hero.id;
        heroEle.innerHTML = 
        `<img src="${hero.thumbnail.path}.${hero.thumbnail.extension}" alt="${hero.name}">
        <h5>${hero.name}</h5>`;

        const btnDiv = document.createElement('div');
        btnDiv.classList.add('btn-box');

        const favBtn = document.createElement("button");
        favBtn.classList.add('btn');
        favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        favBtn.addEventListener('click', (event)=>{
            renderFavorites(event, hero);

        });

        for (let item of ss) {
            if (item.id == hero.id)
              favBtn.classList.add("favHero");
          }
        
        const moreBtn = document.createElement('button');
        moreBtn.classList.add('btn');
        moreBtn.textContent = 'More Details';
        moreBtn.addEventListener('click', ()=>{
            localStorage.setItem('selectedhero', JSON.stringify(hero));
            window.location.href = 'superhero.html';
            renderHeroDetails();
        });

        btnDiv.appendChild(moreBtn);
        btnDiv.appendChild(favBtn);

        heroEle.appendChild(btnDiv);
        showresults.appendChild(heroEle);
    });
}

function renderFavorites(eve, hero){
    let ss = JSON.parse(localStorage.getItem('favHero'));
    if(eve.target.closest('button').classList.contains('favHero')){
        eve.target.closest('button').classList.remove('favHero');
        ss = ss.filter(item => item.id != hero.id);
        localStorage.setItem('favHero', JSON.stringify(ss));
    }
    else{
        eve.target.closest("button").classList.add("favHero");
        ss.push(hero);
        localStorage.setItem("favHero", JSON.stringify(ss));
    }
}

function loadFavorites(){
    let heros = JSON.parse(localStorage.getItem('favHero'));
    displaySuperHero(heros, favoriteDiv);
}
function renderHeroDetails(){
    // render basic details of superhero
    const selecthero = JSON.parse(localStorage.getItem('selectedhero'));
    console.log(selecthero);
    if(selecthero){
        let ele1 = `
            <img src="${selecthero.thumbnail.path}.${selecthero.thumbnail.extension}" alt="${selecthero.name}">
            <div>
                <h2>${selecthero.name}</h2>
                <p>${selecthero.description}</p>
            </div>`;
        detailDiv.innerHTML = ele1;
        if(selecthero.comics.available != 0){
            selecthero.comics.items.forEach(item =>{
                let ele2 = `<li> ${item.name}</li>`
                comicsDiv.innerHTML += ele2;
        });} else comicsDiv.innerHTML = 'Comics not available';
        if(selecthero.events.available != 0){
        selecthero.events.items.forEach(item =>{
            let ele = `<li> ${item.name}</li>`
            eventDiv.innerHTML += ele;
        });} else eventDiv.innerHTML = 'Events not available';
        if(selecthero.series.available != 0){
        selecthero.series.items.forEach(item =>{
            let ele2 = `<li> ${item.name}</li>`
            seriesDiv.innerHTML += ele2;
        });} else seriesDiv.innerHTML = 'Series not available';
        if(selecthero.stories.available != 0){
        selecthero.stories.items.forEach(item =>{
            let ele2 = `<li> ${item.name}</li>`
            storiesDiv.innerHTML += ele2;
        });} else storiesDiv.innerHTML = 'Stories not available';

    }

}