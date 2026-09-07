const HEAD_SEQUENCE_TOTAL_DELAY_MS=12150;
const HEAD_FADE_STAGGER_MS=2400;
const HEAD_RECTS=[
  [.1336,.1852,.2899,.5123],
  [.3094,.1728,.4723,.5309],
  [.4788,.1049,.6678,.5432],
  [.6775,.1481,.8730,.5617]
];

let headLayersReady=false;
let pageLoadedAt=null;
let headSequenceStarted=false;

function scheduleHeadSequence(){
  if(!headLayersReady||pageLoadedAt===null||headSequenceStarted)return;
  headSequenceStarted=true;
  const elapsed=performance.now()-pageLoadedAt;
  const delay=Math.max(0,HEAD_SEQUENCE_TOTAL_DELAY_MS-elapsed);
  document.querySelectorAll('.hero-art .head-layer').forEach((layer,index)=>{
    setTimeout(()=>layer.classList.add('visible'),delay+index*HEAD_FADE_STAGGER_MS);
  });
}

function buildHeadLayers(){
  const heroArt=document.querySelector('.hero-art');
  const source=heroArt?.querySelector('.head-source');
  if(!heroArt||!source||!source.naturalWidth||headLayersReady)return;

  const width=source.naturalWidth;
  const height=source.naturalHeight;
  const sourceCanvas=document.createElement('canvas');
  sourceCanvas.width=width;
  sourceCanvas.height=height;
  const sourceCtx=sourceCanvas.getContext('2d',{willReadFrequently:true});
  sourceCtx.drawImage(source,0,0,width,height);
  const original=sourceCtx.getImageData(0,0,width,height);

  const base=document.createElement('canvas');
  base.width=width;
  base.height=height;
  base.className='head-base';
  base.setAttribute('aria-hidden','true');
  const baseCtx=base.getContext('2d',{willReadFrequently:true});
  baseCtx.putImageData(original,0,0);
  const baseData=baseCtx.getImageData(0,0,width,height);
  const src=original.data;
  const dst=baseData.data;

  function averageBand(x0,x1,y){
    const yy0=Math.max(0,y-2),yy1=Math.min(height-1,y+2);
    let r=0,g=0,b=0,count=0;
    for(let yy=yy0;yy<=yy1;yy++){
      for(let xx=Math.max(0,x0);xx<Math.min(width,x1);xx++){
        const i=(yy*width+xx)*4;
        r+=src[i];g+=src[i+1];b+=src[i+2];count++;
      }
    }
    return count?[r/count,g/count,b/count]:[240,235,230];
  }

  const pixelRects=HEAD_RECTS.map(([lx,ty,rx,by])=>[
    Math.round(lx*width),Math.round(ty*height),Math.round(rx*width),Math.round(by*height)
  ]);

  pixelRects.forEach(([x0,y0,x1,y1])=>{
    const band=Math.max(4,Math.round(width*.01));
    for(let y=y0;y<y1;y++){
      const left=averageBand(x0-band,x0-2,y);
      const right=averageBand(x1+2,x1+band,y);
      const span=Math.max(1,x1-x0-1);
      for(let x=x0;x<x1;x++){
        const t=(x-x0)/span;
        const i=(y*width+x)*4;
        dst[i]=Math.round(left[0]*(1-t)+right[0]*t);
        dst[i+1]=Math.round(left[1]*(1-t)+right[1]*t);
        dst[i+2]=Math.round(left[2]*(1-t)+right[2]*t);
        dst[i+3]=255;
      }
    }
  });
  baseCtx.putImageData(baseData,0,0);
  heroArt.insertBefore(base,source);

  pixelRects.forEach(([x0,y0,x1,y1],index)=>{
    const layer=document.createElement('canvas');
    layer.width=width;
    layer.height=height;
    layer.className=`head-layer head-layer-${index+1}`;
    layer.setAttribute('aria-hidden','true');
    const ctx=layer.getContext('2d');
    ctx.clearRect(0,0,width,height);
    ctx.drawImage(source,x0,y0,x1-x0,y1-y0,x0,y0,x1-x0,y1-y0);
    heroArt.insertBefore(layer,source);
  });

  headLayersReady=true;
  heroArt.classList.add('head-sequence-ready');
  scheduleHeadSequence();
}

window.addEventListener('load',()=>{
  pageLoadedAt=performance.now();
  scheduleHeadSequence();
});

const headSource=document.querySelector('.hero-art .head-source');
if(headSource){
  if(headSource.complete&&headSource.naturalWidth){
    buildHeadLayers();
  }else{
    headSource.addEventListener('load',buildHeadLayers,{once:true});
    headSource.addEventListener('error',()=>{headSource.style.visibility='visible'},{once:true});
  }
}
