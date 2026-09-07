const HEAD_RECTS=[
  [.1336,.1852,.2899,.5123],
  [.3094,.1728,.4723,.5309],
  [.4788,.1049,.6678,.5432],
  [.6775,.1481,.8730,.5617]
];

function buildHeadCovers(){
  const heroArt=document.querySelector('.hero-art');
  if(!heroArt||heroArt.querySelector('.head-cover'))return;

  HEAD_RECTS.forEach(([left,top,right,bottom],index)=>{
    const cover=document.createElement('span');
    cover.className=`head-cover head-cover-${index+1}`;
    cover.setAttribute('aria-hidden','true');
    cover.style.left=`${left*100}%`;
    cover.style.top=`${top*100}%`;
    cover.style.width=`${(right-left)*100}%`;
    cover.style.height=`${(bottom-top)*100}%`;
    heroArt.appendChild(cover);
  });

  const source=heroArt.querySelector('.head-source');
  const syncCoverColor=()=>{
    if(!source||!source.naturalWidth)return;
    try{
      const c=document.createElement('canvas');
      c.width=1;c.height=1;
      const ctx=c.getContext('2d');
      ctx.drawImage(source,0,0,Math.max(1,source.naturalWidth*.06),Math.max(1,source.naturalHeight*.06),0,0,1,1);
      const [r,g,b]=ctx.getImageData(0,0,1,1).data;
      heroArt.querySelectorAll('.head-cover').forEach(cover=>{
        cover.style.backgroundColor=`rgb(${r},${g},${b})`;
        cover.style.boxShadow=`0 0 10px 8px rgb(${r},${g},${b})`;
      });
    }catch(e){}
  };

  if(source?.complete)syncCoverColor();
  else source?.addEventListener('load',syncCoverColor,{once:true});

  setTimeout(()=>{
    heroArt.querySelectorAll('.head-cover').forEach(cover=>cover.remove());
    if(source)source.style.visibility='visible';
  },22500);
}

buildHeadCovers();
