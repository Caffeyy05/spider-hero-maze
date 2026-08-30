const SAVE_KEY="spiderHeroCompleteUpdatedV1",MAX_LIVES=5,FAST_LIFE_MS=180000,NORMAL_LIFE_MS=600000,FAST_LIFE_LIMIT=3,FAST_WINDOW_MS=86400000;
const A={heartFull:"assets/heart-full.svg",heartHalf:"assets/heart-half.svg",heartEmpty:"assets/heart-empty.svg",starFull:"assets/star-full.svg",starEmpty:"assets/star-empty.svg",coin:"assets/coin.svg",key:"assets/key.svg",orb:"assets/orb.svg",trap:"assets/trap.svg",switchOff:"assets/switch-off.svg",switchOn:"assets/switch-on.svg",doorLocked:"assets/door-locked.svg",doorOpen:"assets/door-open.svg",spider:"assets/spider-original.svg"};
const I={};Object.entries(A).forEach(([k,s])=>{I[k]=new Image();I[k].src=s});
const D={
  lives:5,lifeTimerStarted:null,fastLifeCount:0,fastLifeWindowStart:null,coins:0,stars:0,difficulty:"normal",
  sound:true,music:true,vibration:true,musicVolume:24,sfxVolume:55,controls:"both",
  ownedSkins:["classic"],equippedSkin:"classic",
  ownedBackgrounds:["blue"],equippedBackground:"blue",ownedCities:["moon"],equippedCity:"moon",lastCityMilestone:0,backgroundMode:"auto",ownedCities:["moon"],equippedCity:"moon",lastCityMilestone:0,
  ownedMusic:["calm"],equippedMusic:"calm",ownedTiles:["classicTile"],equippedTile:"classicTile",activeRound:null,flyerBest:0,
  mazeCurrent:1,mazeHighest:1,puzzleCurrent:1,puzzleHighest:1,mazeStars:{},puzzleStars:{},achievements:{}
};
const clone=()=>JSON.parse(JSON.stringify(D));function load(){try{const x=localStorage.getItem(SAVE_KEY);return x?{...clone(),...JSON.parse(x)}:clone()}catch{return clone()}}let S=load();const save=()=>localStorage.setItem(SAVE_KEY,JSON.stringify(S));const $=id=>document.getElementById(id);

// ---------- MUSIC ----------
const MUSIC_TRACKS={
 calm:"https://opengameart.org/sites/default/files/Relaxing.mp3",
 explore:"https://opengameart.org/sites/default/files/overworld.mp3",
 boss:"https://opengameart.org/sites/default/files/8bit_jrpg_boss_battle.mp3"
};
let musicAudio=null,currentMusicKey="";
function ensureMusic(){if(!musicAudio){musicAudio=new Audio();musicAudio.loop=true;musicAudio.preload="auto"}}
function currentTrack(){return selectedLevel%10===0?"boss":(S.equippedMusic||"calm")}
function playMusic(key=currentTrack()){
  if(!S.music)return;
  ensureMusic();
  currentMusicKey=key;

  const base=Math.max(0,Math.min(1,(S.musicVolume||24)/100));
  const target=base*(key==="boss"?.72:.46);
  const src=MUSIC_TRACKS[key]||MUSIC_TRACKS.calm;

  if(musicAudio.src!==src){
    musicAudio.pause();
    musicAudio.src=src;
    musicAudio.currentTime=0;
  }

  if(musicAudio._fadeTimer){
    clearInterval(musicAudio._fadeTimer);
    musicAudio._fadeTimer=null;
  }

  musicAudio.volume=Math.min(.02,target);
  const p=musicAudio.play();
  if(p&&p.catch)p.catch(()=>{});

  let current=musicAudio.volume;
  musicAudio._fadeTimer=setInterval(()=>{
    if(!S.music){
      clearInterval(musicAudio._fadeTimer);
      musicAudio._fadeTimer=null;
      return;
    }
    current=Math.min(target,current+.012);
    musicAudio.volume=current;
    if(current>=target-.001){
      clearInterval(musicAudio._fadeTimer);
      musicAudio._fadeTimer=null;
    }
  },90);
}
function stopMusic(){if(musicAudio)musicAudio.pause()}
function resumeMusicForScreen(){if(!S.music)return;if($("mazeGameScreen").classList.contains("active")||$("puzzleGameScreen").classList.contains("active"))playMusic(currentTrack());else playMusic(S.equippedMusic||"calm")}
document.addEventListener("pointerdown",()=>resumeMusicForScreen(),{once:true});
document.addEventListener("visibilitychange",()=>{if(document.hidden){if(musicAudio)musicAudio.pause()}else resumeMusicForScreen()});


let toastTimer=null;
function showToast(title,text,icon="assets/icons/shop.svg"){
  const box=$("gameToast");
  if(!box)return;
  $("toastTitle").textContent=title;
  $("toastText").textContent=text;
  $("toastIcon").src=icon;
  box.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>box.classList.remove("show"),2200);
}

// ---------- SHARED ----------
function resetFastLifeWindowIfNeeded(){
  const now=Date.now();
  if(!S.fastLifeWindowStart || now-S.fastLifeWindowStart>=FAST_WINDOW_MS){
    S.fastLifeWindowStart=now;
    S.fastLifeCount=0;
  }
}

function currentLifeInterval(){
  return 30*1000;
}

function updateLives(){
  resetFastLifeWindowIfNeeded();

  if(S.lives>=MAX_LIVES){
    S.lives=MAX_LIVES;
    S.lifeTimerStarted=null;
    save();
    return;
  }

  if(!S.lifeTimerStarted)S.lifeTimerStarted=Date.now();

  let now=Date.now();
  let elapsed=now-S.lifeTimerStarted;
  let changed=false;

  while(S.lives<MAX_LIVES){
    const interval=currentLifeInterval();
    if(elapsed<interval)break;

    elapsed-=interval;
    S.lifeTimerStarted+=interval;
    S.lives=Math.min(MAX_LIVES,S.lives+1);

    // Only the first 3 regenerated full hearts inside a 24-hour window
    // use the 3-minute recovery speed.
    if(interval===FAST_LIFE_MS){
      S.fastLifeCount=Math.min(FAST_LIFE_LIMIT,S.fastLifeCount+1);
    }

    changed=true;

    if(S.lives>=MAX_LIVES){
      S.lifeTimerStarted=null;
      break;
    }
  }

  if(changed)save();
}
function damage(amount){
  updateLives();
  S.lives=Math.max(0,Math.round((S.lives-amount)*2)/2);
  if(S.lives<MAX_LIVES&&!S.lifeTimerStarted)S.lifeTimerStarted=Date.now();
  save();hud();vibe(35);
  if(S.lives<=0){
    setTimeout(()=>{
      showToast("OUT OF LIVES","Movement is locked until a heart recovers.","assets/heart-empty.svg");
      noLives();
    },80);
  }
}
function hearts(){let h="";for(let i=0;i<5;i++){const rem=S.lives-i;h+=`<img src="${rem>=1?A.heartFull:rem>=.5?A.heartHalf:A.heartEmpty}">`}return h}
function hud(){
  updateLives();
  const rechargeLabel=document.querySelector(".recharge span");
  if(rechargeLabel){
    resetFastLifeWindowIfNeeded();
    const left=Math.max(0,FAST_LIFE_LIMIT-S.fastLifeCount);
    rechargeLabel.textContent=S.lives>=MAX_LIVES?"Lives full":left>0?`Next heart • ${left} fast left today`:"Next heart • 10 min";
  }
  $("homeLives").innerHTML=hearts();$("mazeLives").innerHTML=hearts();$("puzzleLives").innerHTML=hearts();$("homeCoins").textContent=S.coins;$("homeStars").textContent=S.stars;$("shopCoins").textContent=S.coins;applyBackground()}
function tick(){
  updateLives();
  let t="FULL";

  if(S.lives<MAX_LIVES){
    if(!S.lifeTimerStarted)S.lifeTimerStarted=Date.now();
    const interval=currentLifeInterval();
    const r=Math.max(0,interval-(Date.now()-S.lifeTimerStarted));
    const m=Math.floor(r/60000),s=Math.floor((r%60000)/1000);
    t=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  $("lifeTimer").textContent=t;
  $("noLivesTimer").textContent=t==="FULL"?"00:00":t;
  hud();
}
setInterval(tick,1000);
function vibe(ms=25){if(S.vibration&&navigator.vibrate)navigator.vibrate(ms)}
function cfg(){if(S.difficulty==="easy")return{buffer:.55,coins:1,haz:0,reveals:5};if(S.difficulty==="hard")return{buffer:.22,coins:1.5,haz:2,reveals:2};if(S.difficulty==="veryhard")return{buffer:.12,coins:2,haz:4,reveals:1};return{buffer:.35,coins:1.2,haz:1,reveals:3}}
function show(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$(id).classList.add("active");if(id==="homeScreen")hud();if(id==="levelsScreen")renderLevels();if(id==="shopScreen")renderShop();if(id==="achievementsScreen")renderAchievements();if(id==="settingsScreen")syncSettings();applyBackground();resumeMusicForScreen()}
document.querySelectorAll("[data-screen]").forEach(b=>b.onclick=()=>{buttonSound();show(b.dataset.screen)});
let selectedMode="maze",selectedLevel=1,levelModeView="maze";
$("playButton").onclick=()=>{initAudio();buttonSound();if(S.lives<=0)return noLives();show("modeScreen")};

$("skinsShortcut").onclick=()=>{
  shopMain="skins";
  shopRarity="basic";
  document.querySelectorAll("[data-shop-main]").forEach(x=>x.classList.toggle("active",x.dataset.shopMain==="skins"));
  document.querySelectorAll("[data-rarity]").forEach(x=>x.classList.toggle("active",x.dataset.rarity==="basic"));
  show("shopScreen");
};

document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{selectedMode=b.dataset.mode;selectedLevel=selectedMode==="maze"?S.mazeCurrent:selectedMode==="puzzle"?S.puzzleCurrent:1;show("difficultyScreen")});
function selectDifficulty(d){S.difficulty=d;save();document.querySelectorAll(".difficulty-card").forEach(c=>c.classList.toggle("selected",c.dataset.difficulty===d));$("difficultySelect").value=d}
document.querySelectorAll(".difficulty-card").forEach(c=>c.onclick=()=>selectDifficulty(c.dataset.difficulty));
$("startLevelButton").onclick=()=>{updateLives();if(S.lives<=0)return noLives();selectedMode==="maze"?startMaze(selectedLevel):selectedMode==="puzzle"?startPuzzle(selectedLevel):startFlyer(selectedLevel)};

// ---------- LEVELS ----------
document.querySelectorAll("[data-level-mode]").forEach(b=>b.onclick=()=>{levelModeView=b.dataset.levelMode;document.querySelectorAll("[data-level-mode]").forEach(x=>x.classList.toggle("active",x===b));renderLevels()});
function renderLevels(){const g=$("levelGrid");g.innerHTML="";const high=levelModeView==="maze"?S.mazeHighest:S.puzzleHighest,current=levelModeView==="maze"?S.mazeCurrent:S.puzzleCurrent,stars=levelModeView==="maze"?S.mazeStars:S.puzzleStars,max=Math.max(24,Math.ceil((high+8)/4)*4);for(let i=1;i<=max;i++){const b=document.createElement("button");b.className="level-button"+(i>high?" locked":"")+(i===current?" current":"")+(i%10===0?" boss":"");b.disabled=i>high;const n=stars[i]||0;b.innerHTML=`${i}${i%10===0?"<br><small>BOSS</small>":""}<br>${Array.from({length:n},()=>`<img src="${A.starFull}">`).join("")}`;b.onclick=()=>{selectedMode=levelModeView;selectedLevel=i;show("difficultyScreen")};g.appendChild(b)}}


const SKIN_PALETTES={
  classic:"red",blue:"blue",green:"green",purple:"purple",
  neon:"green",ice:"ice",electric:"blue",fire:"fire",shadow:"shadow",
  cyber:"green",gold:"gold",galaxy:"galaxy",
  maze10:"blue",maze20:"green",maze30:"fire",maze50:"gold",
  puzzle10:"red",puzzle20:"ice",puzzle30:"purple",puzzle50:"galaxy"
};
function currentSkinPalette(){
  return SKIN_PALETTES[S.equippedSkin]||"red";
}
function applySkinPalette(){
  const palettes=["red","blue","green","purple","fire","ice","shadow","gold","galaxy"];
  document.body.classList.remove(...palettes.map(x=>"palette-"+x));
  document.body.classList.add("palette-"+currentSkinPalette());
}

// ---------- SHOP ----------
const SKINS=[
{id:"classic",name:"Classic Red",rarity:"basic",price:0,cls:"skin-red",desc:"Starter spider."},
{id:"blue",name:"Blue Spider",rarity:"basic",price:100,cls:"skin-blue",desc:"Cool blue look."},
{id:"green",name:"Green Spider",rarity:"basic",price:120,cls:"skin-neon",desc:"Bright green style."},
{id:"purple",name:"Purple Spider",rarity:"basic",price:140,cls:"skin-galaxy",desc:"Purple starter style."},
{id:"neon",name:"Neon Spider",rarity:"rare",price:300,cls:"skin-neon",desc:"Glowing rare skin."},
{id:"ice",name:"Ice Spider",rarity:"rare",price:350,cls:"skin-ice",desc:"Frozen rare skin."},
{id:"electric",name:"Electric Spider",rarity:"rare",price:420,cls:"skin-blue",desc:"Charged rare skin."},
{id:"fire",name:"Fire Spider",rarity:"epic",price:650,cls:"skin-fire",desc:"Epic flame style."},
{id:"shadow",name:"Shadow Spider",rarity:"epic",price:700,cls:"skin-galaxy",desc:"Dark epic skin."},
{id:"cyber",name:"Cyber Spider",rarity:"epic",price:850,cls:"skin-neon",desc:"Futuristic epic skin."},
{id:"gold",name:"Gold Spider",rarity:"legendary",price:1600,cls:"skin-gold",desc:"Legendary gold skin."},
{id:"galaxy",name:"Galaxy Spider",rarity:"legendary",price:1900,cls:"skin-galaxy",desc:"Legendary cosmic skin."},
{id:"maze10",name:"Maze Rookie",rarity:"basic",price:null,cls:"skin-blue",desc:"Free at Maze Level 10.",milestone:["maze",10]},
{id:"maze20",name:"Maze Explorer",rarity:"rare",price:null,cls:"skin-neon",desc:"Free at Maze Level 20.",milestone:["maze",20]},
{id:"maze30",name:"Maze Guardian",rarity:"epic",price:null,cls:"skin-fire",desc:"Free at Maze Level 30.",milestone:["maze",30]},
{id:"maze50",name:"Maze Master",rarity:"legendary",price:null,cls:"skin-gold",desc:"Free at Maze Level 50.",milestone:["maze",50]},
{id:"puzzle10",name:"Web Rookie",rarity:"basic",price:null,cls:"skin-red",desc:"Free at Puzzle Level 10.",milestone:["puzzle",10]},
{id:"puzzle20",name:"Memory Spider",rarity:"rare",price:null,cls:"skin-ice",desc:"Free at Puzzle Level 20.",milestone:["puzzle",20]},
{id:"puzzle30",name:"Web Master",rarity:"epic",price:null,cls:"skin-neon",desc:"Free at Puzzle Level 30.",milestone:["puzzle",30]},
{id:"puzzle50",name:"Memory Master",rarity:"legendary",price:null,cls:"skin-galaxy",desc:"Free at Puzzle Level 50.",milestone:["puzzle",50]},
{id:"premium1",name:"Crimson Phantom",rarity:"premium",premium:true,cls:"skin-red",desc:"Premium — Coming Soon"},
{id:"premium2",name:"Cosmic Elite",rarity:"premium",premium:true,cls:"skin-galaxy",desc:"Premium — Coming Soon"},
{id:"premium3",name:"Mecha Spider",rarity:"premium",premium:true,cls:"skin-blue",desc:"Premium — Coming Soon"},
{id:"premium4",name:"Black Diamond",rarity:"premium",premium:true,cls:"skin-galaxy",desc:"Premium — Coming Soon"}
];

const CITIES=[
{id:"moon",name:"Moon Skyline",rarity:"basic",price:0,img:"assets/cities/moon-skyline.jpg",desc:"Calm blue skyline.",starter:true},
{id:"shanghai",name:"Waterfront Towers",rarity:"basic",price:0,img:"assets/cities/shanghai-waterfront.webp",desc:"Bright waterfront skyline.",starter:true},
{id:"hills",name:"Color Hills",rarity:"basic",price:0,img:"assets/cities/color-hills.webp",desc:"Colorful hillside city.",starter:true},
{id:"neonrain",name:"Rainy Neon",rarity:"basic",price:0,img:"assets/cities/rainy-neon.jpg",desc:"Rain-soaked neon streets.",starter:true},
{id:"sunset",name:"Sunset Skyline",rarity:"basic",price:0,img:"assets/cities/sunset-skyline.jpg",desc:"Soft sunset city.",starter:true},

{id:"rooftop",name:"Rooftop Glow",rarity:"rare",price:450,img:"assets/cities/rooftop-glow.jpg",desc:"Warm glowing rooftop.",unlockLevel:10},
{id:"rionight",name:"Rio Night",rarity:"rare",price:550,img:"assets/cities/rio-night.webp",desc:"Night lights over the bay.",unlockLevel:20},

{id:"riobay",name:"Rio Bay",rarity:"epic",price:850,img:"assets/cities/rio-bay.jpg",desc:"Epic bay panorama.",unlockLevel:30},
{id:"tropicalrio",name:"Tropical Heights",rarity:"epic",price:950,img:"assets/cities/tropical-rio.jpg",desc:"Tropical mountains and coast.",unlockLevel:40},

{id:"riooverlook",name:"Royal Overlook",rarity:"legendary",price:1600,img:"assets/cities/rio-overlook.jpg",desc:"Legendary aerial city view.",unlockLevel:50},
{id:"premiumcity",name:"Celestial Capital",rarity:"premium",premium:true,price:null,img:"assets/cities/moon-skyline.jpg",desc:"Premium — Coming Soon"}
];

function highestReachedLevel(){
  return Math.max(S.mazeHighest||1,S.puzzleHighest||1);
}
function cityUnlocked(c){
  if(c.premium)return false;
  if(c.starter)return true;
  return highestReachedLevel()>=(c.unlockLevel||9999);
}
function unlockStarterCities(){
  for(const c of CITIES){
    if(c.starter && !S.ownedCities.includes(c.id))S.ownedCities.push(c.id);
  }
}
function awardCityMilestones(){
  unlockStarterCities();
  const level=highestReachedLevel();
  const newly=[];
  for(const c of CITIES){
    if(!c.premium && c.unlockLevel && level>=c.unlockLevel && !S.ownedCities.includes(c.id)){
      S.ownedCities.push(c.id);
      newly.push(c);
    }
  }
  if(newly.length){
    const newest=newly[newly.length-1];
    S.equippedCity=newest.id;
    S.lastCityMilestone=newest.unlockLevel||level;
    showToast("NEW CITY UNLOCKED",`${newest.name} is now equipped.`,"assets/icons/city.svg");
  }
  save();
}
function currentCity(){
  return CITIES.find(c=>c.id===S.equippedCity)||CITIES[0];
}

const BACKGROUNDS=[
{id:"blue",name:"Blue City",price:0,cls:"bg-blue"},
{id:"night",name:"Night Rooftop",price:250,cls:"bg-night"},
{id:"neon",name:"Neon City",price:500,cls:"bg-neon"},
{id:"forest",name:"Forest Web",price:650,cls:"bg-forest"},
{id:"space",name:"Space Station",price:1000,cls:"bg-space"},
{id:"gold",name:"Golden City",price:1500,cls:"bg-gold"}
];
const MUSIC_SHOP=[
{id:"calm",name:"Calm Hero",price:0,desc:"Soft menu and puzzle theme."},
{id:"explore",name:"Adventure Walk",price:500,desc:"Calm exploration loop."},
{id:"premiumMusic",name:"Premium Music Pack",premium:true,desc:"COMING SOON"}
];
let shopMain="skins",shopRarity="basic";
document.querySelectorAll("[data-shop-main]").forEach(b=>b.onclick=()=>{shopMain=b.dataset.shopMain;document.querySelectorAll("[data-shop-main]").forEach(x=>x.classList.toggle("active",x===b));$("rarityTabs").style.display=(shopMain==="skins"||shopMain==="tiles"||shopMain==="cities")?"flex":"none";renderShop()});
document.querySelectorAll("[data-rarity]").forEach(b=>b.onclick=()=>{shopRarity=b.dataset.rarity;document.querySelectorAll("[data-rarity]").forEach(x=>x.classList.toggle("active",x===b));renderShop()});
function milestoneUnlocked(s){if(!s.milestone)return false;const [mode,lvl]=s.milestone;return mode==="maze"?S.mazeHighest>lvl:S.puzzleHighest>lvl}
function awardMilestones(){for(const s of SKINS){if(s.milestone&&milestoneUnlocked(s)&&!S.ownedSkins.includes(s.id))S.ownedSkins.push(s.id)}save()}
function renderShop(){
  awardMilestones();
  awardCityMilestones();
  hud();
  const l=$("shopList");
  l.innerHTML="";

  if(shopMain==="skins"){
    SKINS.filter(s=>s.rarity===shopRarity).forEach(s=>{
      const own=S.ownedSkins.includes(s.id),eq=S.equippedSkin===s.id,c=document.createElement("div");
      c.className="shop-card";
      let action=s.premium?"COMING SOON":own?(eq?"EQUIPPED":"EQUIP"):s.milestone?"LOCKED":`BUY ${s.price}`;
      c.innerHTML=`<div class="skin-preview ${s.cls}"></div><div><h3>${s.name}</h3><p>${s.desc}</p></div><button ${s.premium||(!own&&s.milestone)?"disabled":""}>${action}</button>`;
      c.querySelector("button").onclick=()=>{
        if(s.premium)return showToast("COMING SOON","Premium skins are not available yet.","assets/icons/shirt.svg");
        if(own){S.equippedSkin=s.id;showToast("SKIN EQUIPPED",s.name,"assets/icons/shirt.svg")}
        else if(!s.milestone&&S.coins>=s.price){S.coins-=s.price;S.ownedSkins.push(s.id);S.equippedSkin=s.id;showToast("SKIN UNLOCKED",s.name,"assets/icons/shirt.svg")}
        else if(!s.milestone)return showToast("NOT ENOUGH COINS","Complete more levels to earn coins.","assets/coin.svg");
        save();if(typeof applySkinPalette==="function")applySkinPalette();applyBackground();renderShop();
      };
      l.appendChild(c);
    });

  }else if(shopMain==="cities"){
    CITIES.filter(c=>c.rarity===shopRarity).forEach(city=>{
      const own=S.ownedCities.includes(city.id),eq=S.equippedCity===city.id,available=cityUnlocked(city),card=document.createElement("div");
      card.className="shop-card city-card";
      let action=city.premium?"COMING SOON":own?(eq?"EQUIPPED":"EQUIP"):available?(city.price?`BUY ${city.price}`:"UNLOCK"):`LEVEL ${city.unlockLevel}`;
      card.innerHTML=`<div class="city-thumb" style="background-image:url('${city.img}')"></div>
      <div><h3>${city.name}</h3><p>${city.desc}</p>${city.unlockLevel?`<div class="city-lock">Unlock milestone: Level ${city.unlockLevel}</div>`:""}</div>
      <button ${city.premium||(!own&&!available)?"disabled":""}>${action}</button>`;
      card.querySelector("button").onclick=()=>{
        if(city.premium)return showToast("COMING SOON","Premium cities are not available yet.","assets/icons/city.svg");
        if(own){S.equippedCity=city.id;showToast("CITY EQUIPPED",city.name,"assets/icons/city.svg")}
        else if(available && (!city.price || S.coins>=city.price)){
          if(city.price)S.coins-=city.price;
          S.ownedCities.push(city.id);S.equippedCity=city.id;
          showToast("CITY UNLOCKED",city.name,"assets/icons/city.svg");
        }else if(available){
          return showToast("NOT ENOUGH COINS","Earn more coins to unlock this city.","assets/coin.svg");
        }
        save();applyBackground();renderShop();
      };
      l.appendChild(card);
    });

  }else if(shopMain==="tiles"){
    TILE_SKINS.filter(t=>t.rarity===shopRarity).forEach(t=>{
      const own=S.ownedTiles.includes(t.id),eq=S.equippedTile===t.id,c=document.createElement("div");
      c.className="shop-card";
      const action=t.premium?"COMING SOON":eq?"EQUIPPED":own?"EQUIP":`BUY ${t.price}`;
      c.innerHTML=`<div class="tile-preview ${t.cls}"></div><div><h3>${t.name}</h3><p>${t.desc}</p></div><button ${t.premium?"disabled":""}>${action}</button>`;
      c.querySelector("button").onclick=()=>{
        if(t.premium)return showToast("COMING SOON","Premium tiles are not available yet.","assets/icons/tiles.svg");
        if(own){S.equippedTile=t.id;showToast("TILE EQUIPPED",t.name,"assets/icons/tiles.svg")}
        else if(S.coins>=t.price){S.coins-=t.price;S.ownedTiles.push(t.id);S.equippedTile=t.id;showToast("TILE UNLOCKED",t.name,"assets/icons/tiles.svg")}
        else return showToast("NOT ENOUGH COINS","Earn more coins to unlock this tile.","assets/coin.svg");
        save();applyTileTheme();renderShop();
      };
      l.appendChild(c);
    });

  }else if(shopMain==="music"){
    MUSIC_SHOP.forEach(m=>{
      const own=S.ownedMusic.includes(m.id),eq=S.equippedMusic===m.id,c=document.createElement("div");
      c.className="shop-card";
      c.innerHTML=`<div class="preview music-preview">♫</div><div><h3>${m.name}</h3><p>${m.desc||""}</p></div><button ${m.premium?"disabled":""}>${m.premium?"COMING SOON":eq?"EQUIPPED":own?"EQUIP":`BUY ${m.price}`}</button>`;
      c.querySelector("button").onclick=()=>{
        if(m.premium)return showToast("COMING SOON","Premium music is not available yet.","assets/icons/music.svg");
        if(own){S.equippedMusic=m.id;showToast("MUSIC EQUIPPED",m.name,"assets/icons/music.svg")}
        else if(S.coins>=m.price){S.coins-=m.price;S.ownedMusic.push(m.id);S.equippedMusic=m.id;showToast("MUSIC UNLOCKED",m.name,"assets/icons/music.svg")}
        else return showToast("NOT ENOUGH COINS","Earn more coins to unlock this music.","assets/coin.svg");
        save();playMusic(S.equippedMusic);renderShop();
      };
      l.appendChild(c);
    });
  }
}
function applyBackground(){
  if(typeof applySkinPalette==="function")applySkinPalette();
  const isMaze=$("mazeGameScreen").classList.contains("active");
  const isPuzzle=$("puzzleGameScreen").classList.contains("active");

  if(isMaze||isPuzzle){
    const city=currentCity();
    $("bgLayer").className="bg-layer city-game-bg";
    $("bgLayer").style.setProperty("--city-image",`url("${city.img}")`);
  }else{
    $("bgLayer").className=`bg-layer theme-${S.equippedBackground||"blue"}`;
    $("bgLayer").style.removeProperty("--city-image");
  }
}


const TILE_SKINS=[
{id:"classicTile",name:"Classic Web",rarity:"basic",price:0,cls:"tile-classic-preview",theme:"classic",desc:"Clean web tiles."},
{id:"neonTile",name:"Neon Web",rarity:"rare",price:350,cls:"tile-neon-preview",theme:"neon",desc:"Bright neon web lines."},
{id:"iceTile",name:"Ice Web",rarity:"rare",price:450,cls:"tile-ice-preview",theme:"ice",desc:"Cool icy web tiles."},
{id:"fireTile",name:"Fire Web",rarity:"epic",price:700,cls:"tile-fire-preview",theme:"fire",desc:"Hot orange web style."},
{id:"galaxyTile",name:"Galaxy Web",rarity:"legendary",price:1400,cls:"tile-galaxy-preview",theme:"galaxy",desc:"Cosmic web pattern."},
{id:"premiumTile",name:"Royal Web",rarity:"premium",premium:true,price:null,cls:"tile-galaxy-preview",theme:"galaxy",desc:"Premium — Coming Soon"}
];
function tileTheme(){
  const t=TILE_SKINS.find(x=>x.id===S.equippedTile);
  return t?t.theme:"classic";
}
function applyTileTheme(){
  document.body.classList.remove("tile-classic","tile-neon","tile-fire","tile-ice","tile-galaxy");
  document.body.classList.add("tile-"+tileTheme());
}

// ---------- ACHIEVEMENTS ----------
const ACH=[
["maze1","Maze Rookie","Complete your first maze.",()=>S.mazeHighest>=2],
["puzzle1","Puzzle Rookie","Complete your first puzzle.",()=>S.puzzleHighest>=2],
["boss","Boss Breaker","Complete a boss round.",()=>S.achievements.bossDone],
["memory","Memory Master","Complete a hidden puzzle without Reveal.",()=>S.achievements.noReveal],
["precision","Precision Master","Complete a Precision Maze.",()=>S.achievements.precisionDone],
["both10","Double Hero","Reach Level 10 in both games.",()=>S.mazeHighest>=10&&S.puzzleHighest>=10],
["coins","Coin Hunter","Hold 100 coins.",()=>S.coins>=100]
];
function checkAch(){ACH.forEach(([id,,,fn])=>{if(fn())S.achievements[id]=true});awardMilestones();save()}
function renderAchievements(){checkAch();const l=$("achievementList");l.innerHTML="";ACH.forEach(([id,n,d])=>{const on=S.achievements[id],r=document.createElement("div");r.className="achievement-row"+(on?"":" locked");r.innerHTML=`<div><h3>${n}</h3><p>${d}</p></div><div>${on?"DONE":"LOCKED"}</div>`;l.appendChild(r)})}

// ---------- SETTINGS ----------
function syncSettings(){$("soundToggle").textContent=S.sound?"ON":"OFF";$("musicToggle").textContent=S.music?"ON":"OFF";$("vibrationToggle").textContent=S.vibration?"ON":"OFF";$("controlsSelect").value=S.controls;$("difficultySelect").value=S.difficulty;$("backgroundModeSelect").value=S.backgroundMode||"auto";$("musicVolume").value=S.musicVolume;$("sfxVolume").value=S.sfxVolume}
$("soundToggle").onclick=()=>{S.sound=!S.sound;save();syncSettings()};$("musicToggle").onclick=()=>{S.music=!S.music;save();syncSettings();S.music?resumeMusicForScreen():stopMusic()};$("vibrationToggle").onclick=()=>{S.vibration=!S.vibration;save();syncSettings()};
$("musicVolume").oninput=e=>{S.musicVolume=+e.target.value;save();if(musicAudio)musicAudio.volume=(S.musicVolume/100)*(currentMusicKey==="boss"?.72:.46)};
$("sfxVolume").oninput=e=>{S.sfxVolume=+e.target.value;save()};
$("controlsSelect").onchange=e=>{S.controls=e.target.value;save();applyControls()};$("backgroundModeSelect").onchange=e=>{S.backgroundMode=e.target.value;save();applyBackground()};$("difficultySelect").onchange=e=>selectDifficulty(e.target.value);
$("resetProgressButton").onclick=()=>confirmAction("Reset all progress?","This deletes levels, coins, skins, backgrounds, music unlocks and achievements.","YES, RESET",()=>{localStorage.removeItem(SAVE_KEY);S=load();hud();show("homeScreen")});

// ---------- CONFIRM / GEAR ----------
let confirmCallback=null;
function confirmAction(title,text,yesLabel,cb){confirmCallback=cb;$("confirmTitle").textContent=title;$("confirmText").textContent=text;$("confirmYes").textContent=yesLabel;$("confirmOverlay").classList.add("show")}
$("confirmYes").onclick=()=>{$("confirmOverlay").classList.remove("show");const cb=confirmCallback;confirmCallback=null;if(cb)cb()};
$("confirmNo").onclick=()=>{$("confirmOverlay").classList.remove("show");confirmCallback=null};
function fillQuickChoices(){
  if($("gearTileChoice")){
    $("gearTileChoice").innerHTML=S.ownedTiles.map(id=>{
      const t=TILE_SKINS.find(x=>x.id===id);
      return `<option value="${id}" ${id===S.equippedTile?"selected":""}>${t?t.name:id}</option>`;
    }).join("");
  }$("gearMusicChoice").innerHTML=S.ownedMusic.filter(id=>MUSIC_TRACKS[id]).map(id=>`<option value="${id}" ${id===S.equippedMusic?"selected":""}>${id==="calm"?"Calm Hero":"Adventure Walk"}</option>`).join("");$("gearBackgroundChoice").innerHTML=S.ownedCities.map(id=>{const c=CITIES.find(x=>x.id===id);return `<option value="${id}" ${id===S.equippedCity?"selected":""}>${c?c.name:id}</option>`}).join("")}
function openGear(){fillQuickChoices();$("gearMusicToggle").textContent=S.music?"ON":"OFF";$("gearSoundToggle").textContent=S.sound?"ON":"OFF";$("gearMusicVolume").value=S.musicVolume;$("gearSfxVolume").value=S.sfxVolume;$("gearOverlay").classList.add("show")}
$("gearClose").onclick=()=>$("gearOverlay").classList.remove("show");$("gearMusicToggle").onclick=()=>{S.music=!S.music;save();$("gearMusicToggle").textContent=S.music?"ON":"OFF";S.music?resumeMusicForScreen():stopMusic()};$("gearSoundToggle").onclick=()=>{S.sound=!S.sound;save();$("gearSoundToggle").textContent=S.sound?"ON":"OFF"};
$("gearMusicVolume").oninput=e=>{S.musicVolume=+e.target.value;save();if(musicAudio)musicAudio.volume=(S.musicVolume/100)*(currentMusicKey==="boss"?.72:.46)};
$("gearSfxVolume").oninput=e=>{S.sfxVolume=+e.target.value;save()};
$("gearMusicChoice").onchange=e=>{S.equippedMusic=e.target.value;save();resumeMusicForScreen()};
$("gearBackgroundChoice").onchange=e=>{S.equippedCity=e.target.value;save();applyBackground()};$("gearTileChoice").onchange=e=>{S.equippedTile=e.target.value;save();applyTileTheme()};
$("mazeGearButton").onclick=openGear;$("puzzleGearButton").onclick=openGear;


function bonusHeartChance(){
  updateLives();
  if(S.lives>=MAX_LIVES)return 0;
  // Feels more generous when the player actually needs help.
  if(S.lives<=1)return .72;
  if(S.lives<=2)return .55;
  if(S.lives<=3)return .38;
  return .22;
}
function shouldSpawnBonusHeart(){
  return Math.random()<bonusHeartChance();
}
function collectBonusHeart(){
  updateLives();
  if(S.lives>=MAX_LIVES)return false;
  S.lives=Math.min(MAX_LIVES,Math.round((S.lives+1)*2)/2);
  if(S.lives>=MAX_LIVES)S.lifeTimerStarted=null;
  save();
  hud();
  showToast("BONUS HEART","+1 heart restored!","assets/heart-full.svg");
  objectiveSound();
  vibe([30,20,45]);
  return true;
}


function markRoundActive(mode,level){
  S.activeRound={mode,level,startedAt:Date.now()};
  save();
}
function clearActiveRound(){
  if(S.activeRound){
    S.activeRound=null;
    save();
  }
}
function chargeAbandonedRoundIfNeeded(){
  if(!S.activeRound)return;
  if(S.activeRound.mode==="flyer"){S.activeRound=null;save();return;}
  // A previous active round existed when the page was closed/refreshed.
  updateLives();
  if(S.lives>0){
    S.lives=Math.max(0,Math.round((S.lives-1)*2)/2);
    if(S.lives<MAX_LIVES&&!S.lifeTimerStarted)S.lifeTimerStarted=Date.now();
  }
  S.activeRound=null;
  save();
}

// ---------- MAZE ----------
const canvas=$("mazeCanvas"),ctx=canvas.getContext("2d");let maze=[],rows=6,cols=6,cellSize=50,player={row:0,col:0},exit={row:0,col:0},mazeMoves=0,mazeMax=0,mazeOptimal=0,mazeDone=false,mission="exit",key=null,hasKey=false,orbs=[],orbsGot=0,switches=[],switchOn=new Set(),traps=[],safeRouteCells=new Set(),bossMaze=false,precisionMaze=false,mazeBonusHeart=null,mazeBonusCollected=false,mazeRoundTemplate=null;

function cloneMazeRoundTemplate(){
  mazeRoundTemplate={
    level:selectedLevel,
    rows,cols,
    maze:JSON.parse(JSON.stringify(maze)),
    exit:{...exit},
    mission,
    key:key?{...key}:null,
    orbs:orbs.map(p=>p?{...p}:null),
    switches:switches.map(p=>({...p})),
    traps:traps.map(p=>({...p})),
    safeRouteCells:[...safeRouteCells],
    bossMaze,
    precisionMaze,
    mazeBonusHeart:mazeBonusHeart?{...mazeBonusHeart}:null,
    mazeMax,
    mazeOptimal
  };
}

function retrySameMaze(){
  if(!mazeRoundTemplate)return startMaze(selectedLevel);
  clearActiveRound();
  const t=mazeRoundTemplate;
  selectedMode="maze";
  selectedLevel=t.level;
  rows=t.rows;cols=t.cols;
  maze=JSON.parse(JSON.stringify(t.maze));
  player={row:0,col:0};
  exit={...t.exit};
  mission=t.mission;
  key=t.key?{...t.key}:null;
  hasKey=false;
  orbs=t.orbs.map(p=>p?{...p}:null);
  orbsGot=0;
  switches=t.switches.map(p=>({...p}));
  switchOn=new Set();
  traps=t.traps.map(p=>({...p}));
  safeRouteCells=new Set(t.safeRouteCells);
  bossMaze=t.bossMaze;
  precisionMaze=t.precisionMaze;
  mazeBonusHeart=t.mazeBonusHeart?{...t.mazeBonusHeart}:null;
  mazeBonusCollected=false;
  mazeMax=t.mazeMax;
  mazeOptimal=t.mazeOptimal;
  mazeMoves=0;
  mazeDone=false;

  $("mazeBossBanner").classList.toggle("show",bossMaze);
  $("precisionBanner").classList.toggle("show",precisionMaze);
  $("mazeLevelText").textContent=selectedLevel;
  $("mazeMovesText").textContent=`0 / ${mazeMax}`;
  $("mazeObjectiveText").textContent=missionText();
  progress();
  $("mazeMessage").textContent="TRY AGAIN — same maze, same item positions. Figure out the route.";
  applyControls();
  show("mazeGameScreen");
  markRoundActive("maze",selectedLevel);
  resizeMaze();
}

function msize(l){if(l<=3)return 5;if(l<=7)return 6;if(l<=12)return 7;if(l<=18)return 8;if(l<=25)return 9;return 10}
function mtype(l){if(l%10===0)return"boss";if(l<=2)return"exit";if(l<=4)return"key";if(l===5)return"trapintro";if(l<=7)return"orbs";if(l<=9)return"switch";return["key","orbs","switch","mixed"][l%4]}
function mkcell(r,c){return{row:r,col:c,seen:false,w:{t:1,r:1,b:1,l:1}}}
function genMaze(){maze=[];for(let r=0;r<rows;r++){maze[r]=[];for(let c=0;c<cols;c++)maze[r][c]=mkcell(r,c)}let st=[],cur=maze[0][0];cur.seen=true;while(1){let n=[];const r=cur.row,c=cur.col;if(r>0&&!maze[r-1][c].seen)n.push(maze[r-1][c]);if(c<cols-1&&!maze[r][c+1].seen)n.push(maze[r][c+1]);if(r<rows-1&&!maze[r+1][c].seen)n.push(maze[r+1][c]);if(c>0&&!maze[r][c-1].seen)n.push(maze[r][c-1]);if(n.length){const x=n[Math.floor(Math.random()*n.length)],dx=cur.col-x.col,dy=cur.row-x.row;if(dx===1){cur.w.l=0;x.w.r=0}else if(dx===-1){cur.w.r=0;x.w.l=0}if(dy===1){cur.w.t=0;x.w.b=0}else if(dy===-1){cur.w.b=0;x.w.t=0}st.push(cur);cur=x;cur.seen=true}else if(st.length)cur=st.pop();else break}}
function braidMaze(level){let base=level<=2?2:level<=5?3:level<=9?4:Math.min(10,4+Math.floor(level/5));if(S.difficulty==="easy")base=Math.max(2,base-1);if(S.difficulty==="hard")base++;if(S.difficulty==="veryhard")base+=2;const c=[];for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){const z=maze[r][col];if(col<cols-1&&z.w.r)c.push({r,col,d:"r"});if(r<rows-1&&z.w.b)c.push({r,col,d:"b"})}for(let i=0;i<base&&c.length;i++){const k=Math.floor(Math.random()*c.length),e=c.splice(k,1)[0],z=maze[e.r][e.col];if(e.d==="r"){z.w.r=0;maze[e.r][e.col+1].w.l=0}else{z.w.b=0;maze[e.r+1][e.col].w.t=0}}}
function neigh(p){const c=maze[p.row][p.col],a=[];if(!c.w.t)a.push({row:p.row-1,col:p.col});if(!c.w.r)a.push({row:p.row,col:p.col+1});if(!c.w.b)a.push({row:p.row+1,col:p.col});if(!c.w.l)a.push({row:p.row,col:p.col-1});return a}
function shortestPath(a,b){let q=[a],prev=new Map(),seen=new Set([`${a.row},${a.col}`]);while(q.length){const p=q.shift();if(p.row===b.row&&p.col===b.col){let out=[b],k=`${b.row},${b.col}`;while(prev.has(k)){const v=prev.get(k);out.push(v);k=`${v.row},${v.col}`}return out.reverse()}for(const n of neigh(p)){const k=`${n.row},${n.col}`;if(!seen.has(k)){seen.add(k);prev.set(k,p);q.push(n)}}}return[]}
function dist(a,b){const p=shortestPath(a,b);return p.length?p.length-1:999}
function rand(used=[]){let a=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const k=`${r},${c}`;if(k!=="0,0"&&k!==`${exit.row},${exit.col}`&&!used.some(p=>p.row===r&&p.col===c))a.push({row:r,col:c})}return a[Math.floor(Math.random()*a.length)]}
function setupMission(){mission=mtype(selectedLevel);bossMaze=mission==="boss";key=null;hasKey=false;orbs=[];orbsGot=0;switches=[];switchOn.clear();traps=[];let u=[];if(mission==="key"||mission==="mixed"||bossMaze){key=rand(u);u.push(key)}if(mission==="orbs"||mission==="mixed"||bossMaze){const count=bossMaze?3:(selectedLevel>=10?3:2);for(let i=0;i<count;i++){let p=rand(u);orbs.push(p);u.push(p)}}if(mission==="switch"||mission==="mixed"||bossMaze){const count=bossMaze?2:(selectedLevel>=15?2:1);for(let i=0;i<count;i++){let p=rand(u);switches.push(p);u.push(p)}}}
function required(){return [key,...orbs,...switches].filter(Boolean)}
function missionRouteExact(){let pts=required(),best=Infinity,bestSeq=[];const start={row:0,col:0};function rec(cur,left,cost,seq){if(cost>=best)return;if(!left.length){const total=cost+dist(cur,exit);if(total<best){best=total;bestSeq=[...seq,exit]}return}left.forEach((p,i)=>rec(p,left.filter((_,j)=>j!==i),cost+dist(cur,p),[...seq,p]))}rec(start,pts,0,[]);if(best===Infinity){best=dist(start,exit);bestSeq=[exit]}return{best,seq:bestSeq}}
function buildSafeRoute(seq){safeRouteCells.clear();let cur={row:0,col:0};for(const p of seq){for(const c of shortestPath(cur,p))safeRouteCells.add(`${c.row},${c.col}`);cur=p}}

function articulationCells(){
  const ids=new Map(),low=new Map(),parent=new Map(),cuts=new Set();
  let time=0;
  function keyOf(p){return `${p.row},${p.col}`}
  function dfs(p){
    const k=keyOf(p);
    ids.set(k,++time);low.set(k,ids.get(k));
    let children=0;
    for(const n of neigh(p)){
      const nk=keyOf(n);
      if(!ids.has(nk)){
        parent.set(nk,k);children++;dfs(n);
        low.set(k,Math.min(low.get(k),low.get(nk)));
        if(!parent.has(k)&&children>1)cuts.add(k);
        if(parent.has(k)&&low.get(nk)>=ids.get(k))cuts.add(k);
      }else if(parent.get(k)!==nk){
        low.set(k,Math.min(low.get(k),ids.get(nk)));
      }
    }
  }
  dfs({row:0,col:0});
  return cuts;
}

function buildProtectedMissionArea(){
  const protectedCells=new Set(safeRouteCells);
  const important=[{row:0,col:0},...required(),exit];

  // Protect one shortest route between every important pair.
  // This leaves several natural safe corridors instead of only one exact route.
  for(let i=0;i<important.length;i++){
    for(let j=i+1;j<important.length;j++){
      for(const c of shortestPath(important[i],important[j])){
        protectedCells.add(`${c.row},${c.col}`);
      }
    }
  }

  // Also protect articulation/cut cells. A trap on one of these can force
  // every possible route through the same hazard.
  for(const k of articulationCells())protectedCells.add(k);

  // Keep a small safety zone around start, objectives and exit.
  for(const p of important){
    protectedCells.add(`${p.row},${p.col}`);
    for(const n of neigh(p))protectedCells.add(`${n.row},${n.col}`);
  }
  return protectedCells;
}

function cellDegree(p){
  return neigh(p).length;
}

function nearImportant(p, important, distance=1){
  return important.some(x=>dist(p,x)<=distance);
}


function placeTraps(){
  traps=[];
  if(selectedLevel<=4)return;

  // Lower and cleaner trap counts so hazards feel like optional risk,
  // especially in boss rounds.
  let count;
  if(bossMaze){
    count = S.difficulty==="easy" ? 2 : S.difficulty==="normal" ? 3 : S.difficulty==="hard" ? 4 : 5;
  }else{
    count = selectedLevel===5 ? 1 : Math.min(4, 1 + Math.floor(selectedLevel/6) + (S.difficulty==="hard"?1:0) + (S.difficulty==="veryhard"?1:0));
  }

  const used=required();
  const important=[{row:0,col:0}, ...required(), exit];
  const protectedCells=buildProtectedMissionArea();

  // First-pass candidates: optional side-route cells only.
  let candidates=[];
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const p={row:r,col:c}, k=`${r},${c}`;
      if(k==="0,0"||k===`${exit.row},${exit.col}`)continue;
      if(used.some(x=>x&&x.row===r&&x.col===c))continue;
      if(protectedCells.has(k))continue;

      const degree=cellDegree(p);

      // Prefer cells that are not junctions and not close to important cells.
      if(degree>2)continue;
      if(nearImportant(p, important, 1))continue;

      candidates.push(p);
    }
  }

  // Fallback candidates if the map is too tight: still never allow protected cells.
  if(candidates.length < count){
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const p={row:r,col:c}, k=`${r},${c}`;
        if(k==="0,0"||k===`${exit.row},${exit.col}`)continue;
        if(used.some(x=>x&&x.row===r&&x.col===c))continue;
        if(protectedCells.has(k))continue;
        if(nearImportant(p, important, 1))continue;
        if(!candidates.some(x=>x.row===r&&x.col===c))candidates.push(p);
      }
    }
  }

  // Spread traps apart visually so the board does not feel cluttered.
  while(count>0 && candidates.length){
    const i=Math.floor(Math.random()*candidates.length);
    const chosen=candidates.splice(i,1)[0];
    traps.push(chosen);
    count--;

    candidates=candidates.filter(p=>Math.abs(p.row-chosen.row)+Math.abs(p.col-chosen.col) > 1);
  }
}

function placeMazeBonusHeart(){
  mazeBonusHeart=null;
  mazeBonusCollected=false;
  if(!shouldSpawnBonusHeart())return;

  const occupied=[key,...orbs.filter(Boolean),...switches,exit,{row:0,col:0}].filter(Boolean);
  const candidates=[];

  // Prefer protected/safe mission-route cells so the bonus never acts like a trap.
  for(const k of safeRouteCells){
    const [r,c]=k.split(",").map(Number);
    if((r===0&&c===0)||(r===exit.row&&c===exit.col))continue;
    if(occupied.some(p=>p.row===r&&p.col===c))continue;
    if(traps.some(p=>p.row===r&&p.col===c))continue;
    candidates.push({row:r,col:c});
  }

  if(!candidates.length)return;
  mazeBonusHeart=candidates[Math.floor(Math.random()*candidates.length)];
}

function precisionChance(){if(selectedLevel<11||selectedLevel%10===0)return false;const p=S.difficulty==="easy"?.04:S.difficulty==="normal"?.12:S.difficulty==="hard"?.22:.32;return Math.random()<p}
function missionComplete(){if(bossMaze)return hasKey&&orbsGot===orbs.length&&switchOn.size===switches.length;if(mission==="key")return hasKey;if(mission==="orbs")return orbsGot===orbs.length;if(mission==="switch")return switchOn.size===switches.length;if(mission==="mixed")return hasKey&&orbsGot===orbs.length&&switchOn.size===switches.length;return true}
function missionText(){if(bossMaze)return"Boss: key + 3 orbs + 2 switches, then escape.";if(mission==="key")return"Find the key, then escape.";if(mission==="trapintro")return"Reach the exit. Watch for the first trap.";if(mission==="orbs")return`Collect ${orbs.length} orbs, then escape.`;if(mission==="switch")return`Activate ${switches.length} switch${switches.length>1?"es":""}, then escape.`;if(mission==="mixed")return"Complete all objectives, then escape.";return"Reach the exit."}
function progress(){let p=[];if(key)p.push(`Key ${hasKey?"1/1":"0/1"}`);if(orbs.length)p.push(`Orbs ${orbsGot}/${orbs.length}`);if(switches.length)p.push(`Switches ${switchOn.size}/${switches.length}`);$("mazeMissionProgress").textContent=p.join(" • ")}
function startMaze(l){clearActiveRound();selectedMode="maze";selectedLevel=l;mazeDone=false;mazeMoves=0;rows=cols=msize(l);player={row:0,col:0};exit={row:rows-1,col:cols-1};genMaze();braidMaze(l);setupMission();const route=missionRouteExact();
mazeOptimal=route.best;
buildSafeRoute(route.seq);
placeTraps();
placeMazeBonusHeart();

const objectiveCount=required().length;
precisionMaze=precisionChance();

if(precisionMaze){
  // Precision rounds only begin later in the game. They still get enough room
  // to visit every required objective and make at least a small correction.
  const extra=S.difficulty==="easy"?8:S.difficulty==="normal"?6:S.difficulty==="hard"?4:3;
  mazeMax=mazeOptimal+extra;
}else{
  // Normal maze rounds are exploration puzzles, not exact-route tests.
  // Give enough moves for a player to inspect a wrong branch, backtrack,
  // collect every mission item, and still reach the exit.
  const multiplier=
    S.difficulty==="easy"?2.15:
    S.difficulty==="normal"?1.85:
    S.difficulty==="hard"?1.60:1.45;

  const explorationAllowance=
    Math.ceil((rows+cols)/2) +
    objectiveCount*3 +
    (traps.length?2:0);

  mazeMax=Math.max(
    mazeOptimal+12,
    Math.ceil(mazeOptimal*multiplier),
    mazeOptimal+explorationAllowance
  );
}$("mazeBossBanner").classList.toggle("show",bossMaze);$("precisionBanner").classList.toggle("show",precisionMaze);$("mazeLevelText").textContent=l;$("mazeMovesText").textContent=`0 / ${mazeMax}`;$("mazeObjectiveText").textContent=missionText();progress();$("mazeMessage").textContent=precisionMaze?"Think first — moves are tight.":"Explore, collect every objective, and escape. You have room to backtrack.";cloneMazeRoundTemplate();applyControls();show("mazeGameScreen");markRoundActive("maze",l);resizeMaze()}
function same(p){return p&&p.row===player.row&&p.col===player.col}
function special(){if(key&&same(key)&&!hasKey){hasKey=true;objectiveSound()}orbs.forEach((p,i)=>{if(p&&same(p)){orbs[i]=null;orbsGot++;objectiveSound()}});switches.forEach((p,i)=>{if(same(p)&&!switchOn.has(i)){switchOn.add(i);objectiveSound()}});if(mazeBonusHeart&&!mazeBonusCollected&&same(mazeBonusHeart)){
  mazeBonusCollected=true;
  collectBonusHeart();
}
const ti=traps.findIndex(same);if(ti>=0){
  mazeMoves+=S.difficulty==="veryhard"?3:S.difficulty==="hard"?2:1;
  traps.splice(ti,1);
  hitFeedback("OUCH! Trap hit — half a heart lost.");
}
progress()}
function moveMaze(d){if(mazeDone)return;if(S.lives<=0){noLives();return;}let c=maze[player.row][player.col],m=false;if(d==="up"&&!c.w.t){player.row--;m=1}else if(d==="right"&&!c.w.r){player.col++;m=1}else if(d==="down"&&!c.w.b){player.row++;m=1}else if(d==="left"&&!c.w.l){player.col--;m=1}if(!m){
  hitFeedback("OUCH! Wall hit — half a heart lost. You can still backtrack and continue.");
  if(S.lives<=0)return mazeFail(true);
  return;
}
mazeMoves++;moveSound();special();if(S.lives<=0)return mazeFail(true);$("mazeMovesText").textContent=`${mazeMoves} / ${mazeMax}`;drawMaze();if(player.row===exit.row&&player.col===exit.col){if(!missionComplete()){$("mazeMessage").textContent="Exit locked. Finish the mission.";return wallSound()}return mazeWin()}if(mazeMoves>=mazeMax)mazeFail()}
function mazeWin(){mazeDone=true;clearActiveRound();const st=mazeMoves<=mazeOptimal*1.08?3:mazeMoves<=mazeOptimal*1.22?2:1,old=S.mazeStars[selectedLevel]||0,best=Math.max(old,st);S.stars+=best-old;S.mazeStars[selectedLevel]=best;let coins=Math.round((28+selectedLevel*2+st*8)*cfg().coins);if(bossMaze){coins+=75;S.achievements.bossDone=true}if(precisionMaze)S.achievements.precisionDone=true;S.coins+=coins;if(selectedLevel>=S.mazeHighest)S.mazeHighest=selectedLevel+1;S.mazeCurrent=Math.max(S.mazeCurrent,selectedLevel+1);save();awardCityMilestones();checkAch();winSound();result(true,st,coins,"maze")}
function mazeFail(alreadyDamaged=false){if(mazeDone)return;mazeDone=true;clearActiveRound();if(!alreadyDamaged)damage(1);failSound();result(false,0,0,"maze")}
function resizeMaze(){const r=canvas.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.width*d;ctx.setTransform(d,0,0,d,0,0);cellSize=r.width/cols;drawMaze()}
function imgCell(img,p,s=.58){if(!p||!img.complete)return;ctx.drawImage(img,p.col*cellSize+(1-s)*cellSize/2,p.row*cellSize+(1-s)*cellSize/2,cellSize*s,cellSize*s)}

function playerFilter(){
  const p=currentSkinPalette();
  return {
    red:"none",
    blue:"hue-rotate(185deg) saturate(1.15)",
    green:"hue-rotate(95deg) saturate(1.25)",
    purple:"hue-rotate(250deg) saturate(1.2)",
    fire:"hue-rotate(-15deg) saturate(1.5) brightness(1.08)",
    ice:"hue-rotate(175deg) saturate(.75) brightness(1.35)",
    shadow:"grayscale(.45) hue-rotate(230deg) brightness(.72)",
    gold:"sepia(1) saturate(2.2) hue-rotate(345deg) brightness(1.12)",
    galaxy:"hue-rotate(250deg) saturate(1.55)"
  }[p]||"none";
}
function drawPlayer(p){
  if(!p||!I.spider.complete)return;
  const s=.72,x=p.col*cellSize+(1-s)*cellSize/2,y=p.row*cellSize+(1-s)*cellSize/2;
  ctx.save();
  ctx.filter=playerFilter();
  ctx.shadowBlur=Math.max(0,cellSize*.14);
  ctx.shadowColor=getComputedStyle(document.body).getPropertyValue("--skin-glow").trim()||"#fff";
  ctx.drawImage(I.spider,x,y,cellSize*s,cellSize*s);
  ctx.restore();
}

function drawMaze(){const w=canvas.getBoundingClientRect().width;ctx.clearRect(0,0,w,w);ctx.clearRect(0,0,w,w);ctx.strokeStyle="#17243a";ctx.lineWidth=Math.max(3,cellSize*.065);ctx.lineCap="round";for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=c*cellSize,y=r*cellSize,z=maze[r][c];ctx.beginPath();if(z.w.t){ctx.moveTo(x,y);ctx.lineTo(x+cellSize,y)}if(z.w.r){ctx.moveTo(x+cellSize,y);ctx.lineTo(x+cellSize,y+cellSize)}if(z.w.b){ctx.moveTo(x,y+cellSize);ctx.lineTo(x+cellSize,y+cellSize)}if(z.w.l){ctx.moveTo(x,y);ctx.lineTo(x,y+cellSize)}ctx.stroke()}traps.forEach(p=>imgCell(I.trap,p,.62));orbs.filter(Boolean).forEach(p=>imgCell(I.orb,p,.5));switches.forEach((p,i)=>imgCell(switchOn.has(i)?I.switchOn:I.switchOff,p,.55));if(key&&!hasKey)imgCell(I.key,key,.56);imgCell(missionComplete()?I.doorOpen:I.doorLocked,exit,.64);if(mazeBonusHeart&&!mazeBonusCollected)imgCell(I.heartFull,mazeBonusHeart,.50);drawPlayer(player)}
document.querySelectorAll(".control").forEach(b=>b.onpointerdown=e=>{e.preventDefault();if(S.controls!=="swipe")moveMaze(b.dataset.direction)});let sx=0,sy=0;canvas.onpointerdown=e=>{sx=e.clientX;sy=e.clientY};canvas.onpointerup=e=>{if(S.controls==="buttons")return;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)<20&&Math.abs(dy)<20)return;moveMaze(Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up")};function applyControls(){$("controlsWrapper").style.display=S.controls==="swipe"?"none":"grid"}
$("mazeRestartButton").onclick=()=>confirmAction("Restart this level?","Restarting costs 1 full heart. You will stay on the same level.","YES, RESTART (-1 HEART)",()=>{clearActiveRound();damage(1);if(S.lives<=0)return noLives();startMaze(selectedLevel)});
$("mazeHomeButton").onclick=()=>confirmAction("Leave this level?","Going Home costs 1 full heart and keeps this level unfinished.","YES, HOME (-1 HEART)",()=>{clearActiveRound();damage(1);show("homeScreen")});



function flyerTone(freq=440,duration=.08,type="sine",volume=.035){
  if(!S.sfx)return;
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!window.__flyerAudioCtx)window.__flyerAudioCtx=new Ctx();
    const ac=window.__flyerAudioCtx;
    if(ac.state==="suspended")ac.resume();
    const osc=ac.createOscillator();
    const gain=ac.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(freq,ac.currentTime);
    const sfxVol=Math.max(.15,(S.sfxVolume||70)/100);
    gain.gain.setValueAtTime(volume*sfxVol,ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+duration);
    osc.connect(gain);gain.connect(ac.destination);
    osc.start();osc.stop(ac.currentTime+duration);
  }catch(e){}
}
function flyerFlapSound(){flyerTone(520,.07,"triangle",.045)}
function flyerScoreSound(){flyerTone(760,.08,"sine",.045);setTimeout(()=>flyerTone(980,.07,"sine",.03),55)}
function flyerCrashSound(){flyerTone(150,.16,"sawtooth",.05);setTimeout(()=>flyerTone(95,.18,"square",.035),90)}
function flyerCompleteSound(){
  flyerTone(620,.08,"triangle",.04);
  setTimeout(()=>flyerTone(820,.09,"triangle",.04),90);
  setTimeout(()=>flyerTone(1040,.12,"triangle",.04),180);
}

// ---------- WEB FLYER ----------
const flyerCanvas=$("flyerCanvas"),fctx=flyerCanvas.getContext("2d");
let flyerRunning=false,flyerStarted=false,flyerRAF=null,flyerScore=0,flyerLevel=1;
let flyerHero={x:82,y:245,vy:0,r:15};
let flyerGates=[],flyerLastTime=0,flyerSpawnTimer=0;

function flyerTuning(){
  return {
    speed:2.15+Math.min(2.1,(flyerLevel-1)*.07),
    gap:Math.max(118,178-Math.min(50,(flyerLevel-1)*2))
  };
}
function renderFlyerLives(){}
function resetFlyer(){
  flyerRunning=false;flyerStarted=false;
  cancelAnimationFrame(flyerRAF);
  flyerScore=0;
  flyerHero={x:82,y:245,vy:0,r:15};
  flyerGates=[];flyerLastTime=0;flyerSpawnTimer=0;
  $("flyerScoreText").textContent="0";
  $("flyerMessage").textContent="Pass through gates to score.";
  $("flyerStartOverlay").classList.remove("hidden");
  const card=$("flyerStartOverlay");
  card.querySelector("b").textContent="TAP TO START";
  card.querySelector("small").textContent="Keep tapping to stay in the air";
  drawFlyer();
}
function startFlyer(l=1){
  clearActiveRound();
  selectedMode="flyer";selectedLevel=l;flyerLevel=l;
  $("flyerLevelText").textContent=l;
  $("flyerBestText").textContent=S.flyerBest||0;
  show("flyerGameScreen");
  resetFlyer();
  markRoundActive("flyer",l);
  renderFlyerLives();
}
function flyerFlap(){
  if(!flyerStarted){
    flyerStarted=true;flyerRunning=true;
    $("flyerStartOverlay").classList.add("hidden");
    flyerLastTime=performance.now();
    flyerRAF=requestAnimationFrame(flyerLoop);
  }
  flyerHero.vy=-5.45;
  flyerFlapSound();
}
function spawnFlyerGate(){
  const {gap}=flyerTuning();
  const margin=72;
  const center=margin+Math.random()*(flyerCanvas.height-margin*2);
  flyerGates.push({x:flyerCanvas.width+26,center,gap,w:50,scored:false});
}

function flyerCrash(){
  if(!flyerRunning)return;
  flyerRunning=false;
  cancelAnimationFrame(flyerRAF);
  clearActiveRound();
  save();
  $("flyerBestText").textContent=S.flyerBest||0;
  flyerCrashSound();

  $("flyerMessage").textContent=`CRASH! Score ${flyerScore} • Best ${S.flyerBest||0}`;
  $("flyerStartOverlay").classList.remove("hidden");
  const card=$("flyerStartOverlay");
  card.querySelector("b").textContent="TRY AGAIN";
  card.querySelector("small").textContent=`Score ${flyerScore} • Best ${S.flyerBest||0} • Tap to retry`;
}
function flyerLoop(t){
  if(!flyerRunning)return;
  const dt=Math.min(32,(t-flyerLastTime)||16);
  flyerLastTime=t;
  const d=dt/16.6667;
  const {speed}=flyerTuning();

  flyerHero.vy+=.34*d;
  flyerHero.y+=flyerHero.vy*d;

  flyerSpawnTimer+=dt;
  if(flyerSpawnTimer>=1450){flyerSpawnTimer=0;spawnFlyerGate()}

  flyerGates.forEach(g=>{
    g.x-=speed*d;
    if(!g.scored&&g.x+g.w<flyerHero.x){
      g.scored=true;
      flyerScore++;
      $("flyerScoreText").textContent=flyerScore;
      flyerScoreSound();

      // Update BEST instantly without stopping the game.
      if(flyerScore>(S.flyerBest||0)){
        S.flyerBest=flyerScore;
        $("flyerBestText").textContent=S.flyerBest;
        save();
        if(flyerScore>1)showToast("NEW HIGH SCORE!",`Best score: ${S.flyerBest}`);
      }

      if(flyerScore%10===0){
        S.coins+=10;save();hud();
        showToast("WEB FLYER","+10 coins for 10 gates!");
      }
    }
  });
  flyerGates=flyerGates.filter(g=>g.x+g.w>-20);

  if(flyerHero.y-flyerHero.r<=0||flyerHero.y+flyerHero.r>=flyerCanvas.height){
    drawFlyer();return flyerCrash();
  }

  for(const g of flyerGates){
    const hitX=flyerHero.x+flyerHero.r>g.x&&flyerHero.x-flyerHero.r<g.x+g.w;
    const top=g.center-g.gap/2,bottom=g.center+g.gap/2;
    if(hitX&&(flyerHero.y-flyerHero.r<top||flyerHero.y+flyerHero.r>bottom)){
      drawFlyer();return flyerCrash();
    }
  }

  drawFlyer();
  flyerRAF=requestAnimationFrame(flyerLoop);
}
function drawFlyer(){
  const w=flyerCanvas.width,h=flyerCanvas.height;
  const sky=fctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,"#315f9f");sky.addColorStop(.5,"#765c9b");sky.addColorStop(1,"#dc705d");
  fctx.fillStyle=sky;fctx.fillRect(0,0,w,h);

  fctx.fillStyle="rgba(12,20,48,.35)";
  for(let x=0;x<w;x+=25){
    const bh=45+((x*23)%120);
    fctx.fillRect(x,h-bh,20,bh);
  }

  flyerGates.forEach(g=>{
    const top=g.center-g.gap/2,bottom=g.center+g.gap/2;
    fctx.fillStyle="#1d2854";
    fctx.fillRect(g.x,0,g.w,top);
    fctx.fillRect(g.x,bottom,g.w,h-bottom);
    fctx.fillStyle="#467bc1";
    fctx.fillRect(g.x-5,top-13,g.w+10,13);
    fctx.fillRect(g.x-5,bottom,g.w+10,13);
  });

  fctx.strokeStyle="rgba(255,255,255,.55)";
  fctx.lineWidth=2;
  fctx.beginPath();
  fctx.moveTo(flyerHero.x-48,flyerHero.y+9);
  fctx.quadraticCurveTo(flyerHero.x-20,flyerHero.y-11,flyerHero.x,flyerHero.y);
  fctx.stroke();

  fctx.save();
  fctx.translate(flyerHero.x,flyerHero.y);
  fctx.rotate(Math.max(-.42,Math.min(.55,flyerHero.vy*.05)));
  fctx.strokeStyle="#111a38";fctx.lineWidth=3;
  for(const s of [-1,1]){
    for(let i=0;i<4;i++){
      fctx.beginPath();
      fctx.moveTo(s*7,-7+i*4);
      fctx.lineTo(s*(18+i*2),-13+i*8);
      fctx.stroke();
    }
  }
  fctx.fillStyle="#e31c2f";
  fctx.beginPath();fctx.ellipse(0,1,13,16,0,0,Math.PI*2);fctx.fill();
  fctx.fillStyle="#171c40";
  fctx.beginPath();fctx.arc(0,5,8,0,Math.PI*2);fctx.fill();
  fctx.fillStyle="#fff";
  fctx.beginPath();fctx.ellipse(-4,-5,3,5,-.35,0,Math.PI*2);fctx.fill();
  fctx.beginPath();fctx.ellipse(4,-5,3,5,.35,0,Math.PI*2);fctx.fill();
  fctx.restore();
}
flyerCanvas.addEventListener("pointerdown",e=>{e.preventDefault();flyerFlap()});
$("flyerStartOverlay").addEventListener("pointerdown",e=>{
  e.preventDefault();
  if(!flyerRunning&&flyerStarted){
    resetFlyer();
  }
  flyerFlap();
});
document.addEventListener("keydown",e=>{
  if(!$("flyerGameScreen").classList.contains("active"))return;
  if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();flyerFlap()}
});
$("flyerRestartButton").onclick=()=>confirmAction(
  "Restart Web Flyer?",
  "Your current score will reset. Your best score will stay saved.",
  "YES, RESTART",
  ()=>{
    clearActiveRound();
      startFlyer(flyerLevel);
  }
);
$("flyerHomeButton").onclick=()=>confirmAction(
  "Leave Web Flyer?",
  "Your current run will end. Your best score will stay saved.",
  "YES, HOME",
  ()=>{
    clearActiveRound();
    cancelAnimationFrame(flyerRAF);
      flyerRunning=false;
    show("homeScreen");
  }
);


// ---------- PUZZLE ----------
let puzzleLevel=1,puzzleMoves=0,puzzleMax=0,puzzleStep=1,puzzleSolution=[],puzzlePos=0,puzzleCells=[],puzzleDone=false,puzzleSize=5,puzzleHidden=false,revealsLeft=0,revealsUsed=0,studyTimer=null,bossPuzzle=false,puzzleStudyLocked=false,pulseTimers=[],dragging=false,lastDragCell=null,easyWarningUsed=false,puzzleBonusHeart=-1,puzzleBonusCollected=false,puzzlePassed=new Set(),puzzleRoundTemplate=null;

function clonePuzzleRoundTemplate(){
  puzzleRoundTemplate={
    level:puzzleLevel,
    size:puzzleSize,
    solution:[...puzzleSolution],
    cells:[...puzzleCells],
    max:puzzleMax,
    boss:bossPuzzle,
    bonusHeart:puzzleBonusHeart,
    reveals:cfg().reveals
  };
}

function retrySamePuzzle(){
  if(!puzzleRoundTemplate)return startPuzzle(selectedLevel);
  clearActiveRound();
  clearInterval(studyTimer);
  pulseTimers.forEach(clearTimeout);
  pulseTimers=[];

  const t=puzzleRoundTemplate;
  selectedMode="puzzle";
  selectedLevel=t.level;
  puzzleLevel=t.level;
  puzzleSize=t.size;
  puzzleSolution=[...t.solution];
  puzzleCells=[...t.cells];
  puzzleMax=t.max;
  bossPuzzle=t.boss;
  puzzleBonusHeart=t.bonusHeart;
  puzzleBonusCollected=false;

  puzzleDone=false;
  puzzleMoves=0;
  puzzleStep=1;
  puzzlePos=puzzleSolution[0];
  puzzlePassed=new Set([puzzleSolution[0]]);
  puzzleHidden=true;
  puzzleStudyLocked=false;
  revealsLeft=t.reveals;
  revealsUsed=0;
  easyWarningUsed=false;

  $("puzzleBossBanner").classList.toggle("show",bossPuzzle);
  $("puzzleLevelText").textContent=selectedLevel;
  $("puzzleMovesText").textContent=`0 / ${puzzleMax}`;
  $("revealCount").textContent=revealsLeft;
  $("revealButton").disabled=revealsLeft<=0;
  $("puzzleProgress").textContent=`Connected 0 / ${puzzleSolution.length-2}`;
  $("puzzleMessage").textContent="TRY AGAIN — same puzzle, same dot and danger positions.";
  show("puzzleGameScreen");
  markRoundActive("puzzle",selectedLevel);
  beginStudy();
  renderPuzzle();
}

function dotCount(l){let base=l<=3?4:l<=6?5:l<=9?6:Math.min(10,6+Math.floor((l-10)/6));if(S.difficulty==="easy")base=Math.max(3,base-1);if(S.difficulty==="hard")base++;if(S.difficulty==="veryhard")base+=2;if(l%10===0)base+=2;return Math.min(base,puzzleSize*puzzleSize-4)}
function startPuzzle(l){clearActiveRound();clearInterval(studyTimer);pulseTimers.forEach(clearTimeout);pulseTimers=[];selectedMode="puzzle";selectedLevel=l;puzzleLevel=l;puzzleDone=false;puzzleMoves=0;puzzleStep=1;puzzleSize=l>=20?6:5;bossPuzzle=l%10===0;puzzleStudyLocked=false;revealsLeft=cfg().reveals;revealsUsed=0;easyWarningUsed=false;generatePuzzle();puzzlePassed=new Set([puzzleSolution[0]]);placePuzzleBonusHeart();clonePuzzleRoundTemplate();$("puzzleBossBanner").classList.toggle("show",bossPuzzle);$("puzzleLevelText").textContent=l;$("puzzleMovesText").textContent=`0 / ${puzzleMax}`;$("revealCount").textContent=revealsLeft;$("revealButton").disabled=false;$("puzzleProgress").textContent=`Connected 0 / ${puzzleSolution.length-2}`;$("puzzleMessage").textContent="Watch the dots pulse in order.";show("puzzleGameScreen");markRoundActive("puzzle",l);beginStudy();renderPuzzle()}
function generatePuzzle(){const N=puzzleSize*puzzleSize,target=Math.max(4,dotCount(puzzleLevel)+2),path=[0],used=new Set([0]);let guard=0;while(path.length<target&&guard++<1000){const cur=path[path.length-1],r=Math.floor(cur/puzzleSize),c=cur%puzzleSize,opts=[];[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].forEach(([rr,cc])=>{const i=rr*puzzleSize+cc;if(rr>=0&&cc>=0&&rr<puzzleSize&&cc<puzzleSize&&!used.has(i))opts.push(i)});if(!opts.length)break;const n=opts[Math.floor(Math.random()*opts.length)];used.add(n);path.push(n)}if(path.length<Math.min(5,target))return generatePuzzle();puzzleSolution=path;puzzlePos=path[0];puzzleCells=Array(N).fill("empty");path.forEach((i,idx)=>puzzleCells[i]=idx===0?"start":idx===path.length-1?"goal":"dot");let extraTraps=Math.min(6,Math.floor(puzzleLevel/4)+cfg().haz+(bossPuzzle?2:0)),empties=puzzleCells.map((x,i)=>x==="empty"?i:-1).filter(i=>i>=0);for(let i=0;i<extraTraps&&empties.length;i++){const pick=Math.floor(Math.random()*empties.length),idx=empties.splice(pick,1)[0];puzzleCells[idx]="trap"}const optimal=path.length-1;puzzleMax=Math.max(optimal+2,Math.ceil(optimal*(1+cfg().buffer))+(bossPuzzle?2:0))}

function placePuzzleBonusHeart(){
  puzzleBonusHeart=-1;
  puzzleBonusCollected=false;
  if(!shouldSpawnBonusHeart())return;

  // Bonus heart must sit ON one of the real sequence dots.
  // Never use Start or Goal, and never place it on a trap/empty tile.
  const targetDots=puzzleSolution.slice(1,-1).filter(i=>puzzleCells[i]==="dot");
  if(!targetDots.length)return;

  puzzleBonusHeart=targetDots[Math.floor(Math.random()*targetDots.length)];

  // It is on the required route, so no detour is needed.
  // The heart remains a bonus only: touching that correct dot restores +1 heart.
}
function shouldHidePuzzle(){return true}
function pulseSequence(duration=9000){pulseTimers.forEach(clearTimeout);pulseTimers=[];const seq=puzzleSolution.slice(1,-1),gap=Math.max(350,Math.floor(duration/Math.max(1,seq.length)));seq.forEach((cell,idx)=>{pulseTimers.push(setTimeout(()=>{document.querySelector(`[data-cell="${cell}"]`)?.classList.add("pulse")},idx*gap));pulseTimers.push(setTimeout(()=>{document.querySelector(`[data-cell="${cell}"]`)?.classList.remove("pulse")},idx*gap+Math.min(500,gap-50)))})}
function beginStudy(){
  clearInterval(studyTimer);
  puzzleStudyLocked=true;
  puzzleHidden=true;
  $("puzzleStudy").classList.add("show");
  $("puzzleMessage").textContent="Watch the pulse order. Move when the countdown ends.";
  renderPuzzle();

  let n=6;
  $("studyCountdown").textContent=n;
  setTimeout(()=>pulseSequence(4800),250);

  studyTimer=setInterval(()=>{
    n--;
    $("studyCountdown").textContent=n;
    if(n<=0){
      clearInterval(studyTimer);
      puzzleStudyLocked=false;
      puzzleHidden=true;
      $("puzzleStudy").classList.remove("show");
      $("puzzleMessage").textContent="GO! The sequence is hidden — rely on memory.";
      renderPuzzle();
    }
  },1000);
}
function renderPuzzle(){const b=$("puzzleBoard");b.style.gridTemplateColumns=`repeat(${puzzleSize},1fr)`;b.innerHTML="";puzzleCells.forEach((type,i)=>{const c=document.createElement("button");c.dataset.cell=i;c.className="puzzle-cell "+type+(i===puzzlePos?" selected":"");if(i===puzzleBonusHeart&&!puzzleBonusCollected)c.classList.add("bonus-heart-cell");if(type==="start"){c.classList.add("spider");c.innerHTML=`<img src="${A.spider}">`}else if(type==="dot"){
  c.classList.add("dot");
  const idx=puzzleSolution.indexOf(i);
  if(puzzlePassed.has(i) && i!==puzzleSolution[0])c.classList.add("corrected");
  if(puzzleHidden)c.classList.add("hidden-dot");
}else if(type==="goal"){c.classList.add("goal")}else if(type==="trap"){c.innerHTML=`<span class="trap-x">X</span>`;if(puzzleHidden)c.classList.add("trap-hidden")}if(i===puzzleBonusHeart&&!puzzleBonusCollected)c.insertAdjacentHTML("beforeend",`<img class="bonus-heart-icon" src="${A.heartFull}" alt="">`);c.disabled=puzzleStudyLocked;c.onclick=()=>puzzleMove(i);b.appendChild(c)})}
function wrongPuzzleChoice(){if(S.difficulty==="easy"&&!easyWarningUsed){easyWarningUsed=true;$("puzzleMessage").textContent="Warning! That was not the next dot.";wallSound();return}damage(.5);sayOuch();vibe([35,25,55]);$("puzzleMessage").textContent="OUCH! Wrong dot — half a heart lost. You can move back and try again.";trapSound()}
function puzzleMove(i){
  if(puzzleDone)return;
  if(S.lives<=0){noLives();return;}
  if(puzzleStudyLocked){
    $("puzzleMessage").textContent="MEMORIZE ONLY — wait for the countdown.";
    return;
  }

  const r1=Math.floor(puzzlePos/puzzleSize),c1=puzzlePos%puzzleSize;
  const r2=Math.floor(i/puzzleSize),c2=i%puzzleSize;
  if(Math.abs(r1-r2)+Math.abs(c1-c2)!==1)return;

  const expected=puzzleSolution[puzzleStep];
  const type=puzzleCells[i];

  // Safe backtracking: revisiting a tile already successfully passed is allowed.
  if(puzzlePassed.has(i)){
    puzzlePos=i;
    moveSound();
    $("puzzleMessage").textContent="Safe backtrack — no penalty.";
    renderPuzzle();
    return;
  }

  // Hidden/red danger tile: penalty, but the player may still backtrack afterward.
  if(type==="trap"){
    puzzleMoves++;
    puzzlePos=i;
    damage(.5);
    sayOuch();
    vibe([35,25,55]);
    trapSound();
    $("puzzleMessage").textContent="OUCH! Danger tile — half a heart lost. Go back to a safe passed tile.";
    $("puzzleMovesText").textContent=`${puzzleMoves} / ${puzzleMax}`;
    renderPuzzle();
    if(S.lives<=0)return puzzleFail(true);
    if(puzzleMoves>=puzzleMax)return puzzleFail();
    return;
  }

  // Correct next tile.
  if(i===expected){
    puzzleMoves++;
    puzzlePos=i;
    puzzlePassed.add(i);
    puzzleStep++;
    objectiveSound();

    if(i===puzzleBonusHeart&&!puzzleBonusCollected){
      puzzleBonusCollected=true;
      collectBonusHeart();
    }

    $("puzzleProgress").textContent=`Connected ${Math.max(0,puzzleStep-1)} / ${puzzleSolution.length-2}`;
    $("puzzleMessage").textContent="Correct. Keep going.";
    $("puzzleMovesText").textContent=`${puzzleMoves} / ${puzzleMax}`;
    renderPuzzle();

    if(type==="goal" && puzzleStep>=puzzleSolution.length)return puzzleWin();
    if(puzzleMoves>=puzzleMax)return puzzleFail();
    return;
  }

  // Any new unvisited wrong tile is a mistake.
  puzzleMoves++;
  puzzlePos=i;
  wrongPuzzleChoice();
  if(S.difficulty==="hard")puzzleMoves++;
  if(S.difficulty==="veryhard")puzzleMoves+=2;
  $("puzzleMovesText").textContent=`${puzzleMoves} / ${puzzleMax}`;
  $("puzzleMessage").textContent="Wrong new tile — half a heart lost. Backtrack through tiles you already passed.";
  renderPuzzle();

  if(S.lives<=0)return puzzleFail(true);
  if(puzzleMoves>=puzzleMax)return puzzleFail();
}

function revealBoard(){
  if(puzzleStudyLocked||revealsLeft<=0||puzzleDone)return;
  revealsLeft--;
  revealsUsed++;
  $("revealCount").textContent=revealsLeft;
  $("revealButton").disabled=revealsLeft<=0;

  // Keep all target dots hidden; only pulse them one at a time.
  puzzleHidden=true;
  renderPuzzle();
  $("puzzleMessage").textContent="REVEAL ACTIVE — watch the pulse order!";
  document.body.classList.add("reveal-active");
  pulseSequence(1200);
  setTimeout(()=>{
    document.body.classList.remove("reveal-active");
    if(!puzzleDone){
      puzzleHidden=true;
      renderPuzzle();
      $("puzzleMessage").textContent="Hidden again — continue from memory.";
    }
  },1400);
}
$("revealButton").onclick=revealBoard;
function puzzleWin(){document.body.classList.remove("reveal-active");puzzleDone=true;clearActiveRound();clearInterval(studyTimer);const optimal=puzzleSolution.length-1,st=puzzleMoves<=optimal*1.08?3:puzzleMoves<=optimal*1.22?2:1,old=S.puzzleStars[selectedLevel]||0,best=Math.max(old,st);S.stars+=best-old;S.puzzleStars[selectedLevel]=best;let coins=Math.round((30+selectedLevel*2+st*8)*cfg().coins);if(bossPuzzle){coins+=75;S.achievements.bossDone=true}if(shouldHidePuzzle()&&revealsUsed===0)S.achievements.noReveal=true;S.coins+=coins;if(selectedLevel>=S.puzzleHighest)S.puzzleHighest=selectedLevel+1;S.puzzleCurrent=Math.max(S.puzzleCurrent,selectedLevel+1);save();awardCityMilestones();checkAch();winSound();result(true,st,coins,"puzzle")}
function puzzleFail(alreadyDamaged=false){document.body.classList.remove("reveal-active");if(puzzleDone)return;puzzleDone=true;clearActiveRound();clearInterval(studyTimer);if(!alreadyDamaged)damage(1);failSound();result(false,0,0,"puzzle")}
$("puzzleRestartButton").onclick=()=>confirmAction("Restart this puzzle?","Restarting costs 1 full heart. You will stay on the same level.","YES, RESTART (-1 HEART)",()=>{clearActiveRound();damage(1);if(S.lives<=0)return noLives();startPuzzle(selectedLevel)});
$("puzzleHomeButton").onclick=()=>confirmAction("Leave this puzzle?","Going Home costs 1 full heart and keeps this level unfinished.","YES, HOME (-1 HEART)",()=>{clearActiveRound();clearInterval(studyTimer);damage(1);show("homeScreen")});

// Mobile drag-to-activate puzzle tiles
const pboard=$("puzzleBoard");
function cellFromPoint(x,y){const el=document.elementFromPoint(x,y);return el?.closest?.(".puzzle-cell")}
pboard.addEventListener("pointerdown",e=>{if(puzzleStudyLocked)return;dragging=true;lastDragCell=null;pboard.setPointerCapture?.(e.pointerId);const c=cellFromPoint(e.clientX,e.clientY);if(c){lastDragCell=c.dataset.cell;puzzleMove(+c.dataset.cell)}});
pboard.addEventListener("pointermove",e=>{if(!dragging||puzzleStudyLocked)return;const c=cellFromPoint(e.clientX,e.clientY);if(c&&c.dataset.cell!==lastDragCell){lastDragCell=c.dataset.cell;puzzleMove(+c.dataset.cell)}});
["pointerup","pointercancel","pointerleave"].forEach(ev=>pboard.addEventListener(ev,()=>{dragging=false;lastDragCell=null}));

// ---------- RESULT / KEYBOARD ----------
function starHTML(n){let h="";for(let i=0;i<3;i++)h+=`<img src="${i<n?A.starFull:A.starEmpty}">`;return h}
function result(won,st,coins,mode){$("resultOverlay").classList.add("show");$("resultTag").textContent=won?"SUCCESS":"FAILED";$("resultTitle").textContent=won?(selectedLevel%10===0?"BOSS COMPLETE":"LEVEL COMPLETE"):"MISSION FAILED";$("resultStars").innerHTML=starHTML(st);$("resultText").textContent=won?`${mode==="maze"?"Maze mission":"Web puzzle"} complete.`:"You failed the round. One full heart was used.";$("rewardText").innerHTML=won?`<img src="${A.coin}" style="width:22px;vertical-align:middle"> +${coins}`:`${S.lives} / 5 LIVES`;$("resultMainButton").textContent=won?"NEXT LEVEL":"TRY AGAIN";$("resultMainButton").onclick=()=>{$("resultOverlay").classList.remove("show");if(S.lives<=0)return noLives();if(won){selectedLevel++;mode==="maze"?startMaze(selectedLevel):startPuzzle(selectedLevel)}else{mode==="maze"?retrySameMaze():retrySamePuzzle()}}}
$("resultHomeButton").onclick=()=>{$("resultOverlay").classList.remove("show");show("homeScreen")};function noLives(){$("noLivesOverlay").classList.add("show")}$("closeNoLivesButton").onclick=()=>$("noLivesOverlay").classList.remove("show");

window.addEventListener("keydown",e=>{const k=e.key.toLowerCase(),m={"arrowup":"up","w":"up","arrowdown":"down","s":"down","arrowleft":"left","a":"left","arrowright":"right","d":"right"},d=m[k];if(!d)return;if($("mazeGameScreen").classList.contains("active")){e.preventDefault();moveMaze(d);return}if($("puzzleGameScreen").classList.contains("active")){e.preventDefault();if(puzzleStudyLocked)return;const r=Math.floor(puzzlePos/puzzleSize),c=puzzlePos%puzzleSize;let nr=r,nc=c;if(d==="up")nr--;if(d==="down")nr++;if(d==="left")nc--;if(d==="right")nc++;if(nr<0||nc<0||nr>=puzzleSize||nc>=puzzleSize)return;puzzleMove(nr*puzzleSize+nc)}});
document.addEventListener("touchmove",e=>{if($("mazeGameScreen").classList.contains("active")||$("puzzleGameScreen").classList.contains("active"))e.preventDefault()},{passive:false});
window.addEventListener("resize",()=>{if($("mazeGameScreen").classList.contains("active"))resizeMaze()});

// ---------- AUDIO ----------
function sayOuch(){
  if(!S.sound)return;
  try{
    if("speechSynthesis" in window){
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance("Ouch!");
      u.rate=1.15;
      u.pitch=1.25;
      u.volume=Math.max(.15,S.sfxVolume/100);
      window.speechSynthesis.speak(u);
    }
  }catch(e){}
}
function hitFeedback(message){
  damage(.5);
  vibe([35,25,55]);
  sayOuch();
  trapSound();
  $("mazeMessage").textContent=message;
}

let AC=null;function initAudio(){if(!S.sound)return;if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}function tone(f,d,t="sine",v=.03){if(!S.sound)return;initAudio();const o=AC.createOscillator(),g=AC.createGain(),vol=(S.sfxVolume/100)*v;o.type=t;o.frequency.value=f;g.gain.setValueAtTime(Math.max(.001,vol),AC.currentTime);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}function moveSound(){tone(500,.04)}function wallSound(){tone(120,.12,"square",.04)}function buttonSound(){tone(340,.05)}function objectiveSound(){tone(650,.08);setTimeout(()=>tone(850,.12),80)}function trapSound(){tone(120,.12,"sawtooth",.05)}function failSound(){tone(200,.25,"sawtooth",.05)}function winSound(){[523,659,784,1046].forEach((n,i)=>setTimeout(()=>tone(n,.15),i*130))}

chargeAbandonedRoundIfNeeded();unlockStarterCities();awardCityMilestones();selectDifficulty(S.difficulty);syncSettings();applyTileTheme();applySkinPalette();hud();tick();