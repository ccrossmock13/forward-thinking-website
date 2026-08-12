const intro=document.getElementById('intro');
const header=document.getElementById('header');
const toggle=document.getElementById('menuToggle');
const nav=document.getElementById('nav');

const HERO_FADE_MS=10000;
let heroFadeStartedAt=0;
let ambientStarted=false;

function createAmbientSwell(durationMs=HERO_FADE_MS){
  if(ambientStarted)return;
  ambientStarted=true;
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return;

  const ctx=new AudioCtx();
  const now=ctx.currentTime;
  const duration=Math.max(1,durationMs/1000);
  const master=ctx.createGain();
  const filter=ctx.createBiquadFilter();

  filter.type='lowpass';
  filter.frequency.setValueAtTime(700,now);
  filter.Q.setValueAtTime(.35,now);

  master.gain.setValueAtTime(.0001,now);
  master.gain.exponentialRampToValueAtTime(.035,now+duration);
  master.gain.setValueAtTime(.035,now+duration);
  master.gain.exponentialRampToValueAtTime(.0001,now+duration+.9);

  filter.connect(master);
  master.connect(ctx.destination);

  [130.81,196,261.63].forEach((freq,index)=>{
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type='sine';
    osc.frequency.setValueAtTime(freq,now);
    gain.gain.setValueAtTime(index===0?.55:index===1?.28:.13,now);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(now);
    osc.stop(now+duration+1);
  });

  setTimeout(()=>ctx.close().catch(()=>{}),(duration+1.25)*1000);
}

function startAmbientForCurrentFade(){
  const elapsed=heroFadeStartedAt?Date.now()-heroFadeStartedAt:0;
  const remaining=Math.max(0,HERO_FADE_MS-elapsed);
  if(remaining>1200)createAmbientSwell(remaining);
}

window.addEventListener('load',()=>{
  setTimeout(()=>intro.classList.add('hide'),1550);
  setTimeout(()=>{
    heroFadeStartedAt=Date.now();
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('show'));
    startAmbientForCurrentFade();
  },1650);
});

['pointerdown','touchstart','keydown'].forEach(eventName=>{
  window.addEventListener(eventName,()=>{
    if(!ambientStarted&&heroFadeStartedAt)startAmbientForCurrentFade();
  },{once:true,passive:true});
});

window.addEventListener('scroll',()=>{
  header.classList.toggle('scrolled',window.scrollY>40);
  const sections=document.querySelectorAll('main section[id]');
  let current='home';
  sections.forEach(s=>{if(window.scrollY>=s.offsetTop-180)current=s.id});
  document.querySelectorAll('.nav a:not(.nav-cta)').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));
});

toggle.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded',open);
});

document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
document.getElementById('year').textContent=new Date().getFullYear();
document.getElementById('contactForm').addEventListener('submit',e=>{
  e.preventDefault();
  document.getElementById('formNote').textContent='The form interface is ready. Connect this submit action to AWS Lambda/API before production.';
});