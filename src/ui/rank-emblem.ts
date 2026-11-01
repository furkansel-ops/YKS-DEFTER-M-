/* v77 · Lig rozetleri (özgün çizim, SVG): fasetli sivri gövde, lige göre yan diken, defne dalı, kanat,
   ışıma ve taç. Kademe I/II/III büyük boyda yukarı bakan çentiklerle, 44 pikselden küçükte yazıyla. */

type League={n:string;hi:string;lt:string;md:string;dk:string;ed:string;gl:string;center:"arrow"|"star4"|"star5"|"gem"|"crystal"|"burst";spikes?:1;laurel?:1;wings?:1|2|3;glow?:1|2|3;halo?:1;crown?:1|2;shape?:"notch"|"tall"};
type Pt=[number,number];

export const LEAGUE_STYLE:readonly League[]=[
  {n:"Bronz",hi:"#ffd9b8",lt:"#e39a5e",md:"#b8662e",dk:"#6b3316",ed:"#331606",gl:"#ff9d5c",center:"arrow"},
  {n:"Gümüş",hi:"#ffffff",lt:"#dfe6f0",md:"#a9b5c6",dk:"#566377",ed:"#252c37",gl:"#cfe0ff",center:"star4",spikes:1,shape:"notch"},
  {n:"Altın",hi:"#fff6c4",lt:"#ffd84a",md:"#e0a20e",dk:"#8a5800",ed:"#3f2700",gl:"#ffd34d",center:"star5",spikes:1,laurel:1},
  {n:"Platin",hi:"#e6fffd",lt:"#7cf0ea",md:"#22b9c4",dk:"#0b6276",ed:"#032f3a",gl:"#4ff3ee",center:"gem",spikes:1,laurel:1,shape:"tall"},
  {n:"Elmas",hi:"#eef6ff",lt:"#8cc1ff",md:"#3b82f6",dk:"#1a3fae",ed:"#0a1a55",gl:"#5ea8ff",center:"crystal",spikes:1,wings:1,glow:1},
  {n:"Usta",hi:"#f6eeff",lt:"#c9a2ff",md:"#8b4dff",dk:"#4a17b0",ed:"#1f0657",gl:"#b98aff",center:"crystal",spikes:1,wings:2,glow:1,halo:1},
  {n:"Büyük Usta",hi:"#ffe9ef",lt:"#ff8fb0",md:"#f0386e",dk:"#97103f",ed:"#43041b",gl:"#ff5c8d",center:"crystal",spikes:1,wings:3,glow:2,crown:1},
  {n:"Efsane",hi:"#fffdf0",lt:"#ffe98a",md:"#ffbf1f",dk:"#c47400",ed:"#5a3300",gl:"#ffe066",center:"burst",spikes:1,wings:3,glow:3,crown:2}
];
const SHAPES:Record<string,Pt[]>={
  base:[[50,4],[83,17],[88,50],[50,96],[12,50],[17,17]],
  notch:[[50,4],[66,9],[71,4],[86,15],[88,50],[50,96],[12,50],[14,15],[29,4],[34,9]],
  tall:[[50,-1],[81,13],[91,46],[50,99],[9,46],[19,13]]
};
let uid=0;
const P=(pts:Pt[])=>pts.map(p=>p.map(v=>+v.toFixed(1)).join(",")).join(" ");
function starPts(cx:number,cy:number,R:number,r:number,n:number):Pt[]{const out:Pt[]=[];for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,rad=i%2?r:R;out.push([cx+rad*Math.cos(a),cy+rad*Math.sin(a)]);}return out;}
function laurel(L:League,g:(k:string)=>string):string{
  let s="";
  for(const dir of [-1,1]){
    const p0:Pt=[50+dir*6,95],p1:Pt=[50+dir*50,90],p2:Pt=[50+dir*44,30];
    const at=(t:number):Pt=>[(1-t)**2*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0],(1-t)**2*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1]];
    const tan=(t:number):Pt=>[2*(1-t)*(p1[0]-p0[0])+2*t*(p2[0]-p1[0]),2*(1-t)*(p1[1]-p0[1])+2*t*(p2[1]-p1[1])];
    s+=`<path d="M${p0} Q${p1} ${p2}" fill="none" stroke="${L.dk}" stroke-width="2.4" stroke-linecap="round"/>`;
    for(let k=0;k<7;k++){
      const t=.2+k*.12,[x,y]=at(t),[dx,dy]=tan(t),len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len,ang=Math.atan2(dy,dx)*180/Math.PI;
      for(const side of [-1,1]){
        const cx=x+nx*side*4.2,cy=y+ny*side*4.2,rot=ang-90+side*dir*-28,size=k===6?.8:1;
        s+=`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(2.7*size).toFixed(1)}" ry="${(6.2*size).toFixed(1)}" transform="rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${g(side>0?"lt":"md")}" stroke="${L.ed}" stroke-width="1"/>`;
      }
    }
    const [tx,ty]=at(1);s+=`<ellipse cx="${tx}" cy="${ty-4}" rx="2.4" ry="5.6" transform="rotate(${dir*-20} ${tx} ${ty-4})" fill="${g("lt")}" stroke="${L.ed}" stroke-width="1"/>`;
  }
  return s;
}

/** Lig rozeti SVG'si. league: 0 (Bronz) … 7 (Efsane); tier: 0 (kademesiz) ya da 1–3. */
export function rankEmblemSvg(league:number,tier:number,size:number,label?:string):string{
  const L=LEAGUE_STYLE[Math.max(0,Math.min(LEAGUE_STYLE.length-1,league))]!,id="rk"+(uid++),g=(k:string)=>`url(#${id}${k})`,small=size<44;
  const body=SHAPES[L.shape||"base"]!,C:Pt=[50,47];
  const inset=body.map(([x,y]):Pt=>[C[0]+(x-C[0])*.78,C[1]+(y-C[1])*.8]);
  let s="";
  if(L.glow&&!small){s+=`<circle cx="50" cy="50" r="${44+L.glow*4}" fill="${g("glow")}"/>`;
    if(L.glow>=2)s+=`<g opacity=".7">${Array.from({length:16},(_,k)=>{const a=k*Math.PI/8+Math.PI/16,r1=46,r2=k%2?54:60+L.glow!*2;return `<polygon points="${P([[50+r1*Math.cos(a-.06),50+r1*Math.sin(a-.06)],[50+r2*Math.cos(a),50+r2*Math.sin(a)],[50+r1*Math.cos(a+.06),50+r1*Math.sin(a+.06)]])}" fill="${L.lt}"/>`;}).join("")}</g>`;}
  if(L.wings){const n=small?2:L.wings+2,span=L.wings>=3?40:L.wings===2?34:28;
    const side=(dir:number)=>Array.from({length:n},(_,k)=>{const y=30+k*9,len=span-k*5,x0=dir<0?18:82,tip=x0+dir*len,mid=x0+dir*len*.55;
      return `<polygon points="${P([[x0,y-3],[mid,y-9-k],[tip,y-6-k*2],[mid+dir*2,y+3],[x0,y+6]])}" fill="${g(k%2?"md":"lt")}" stroke="${L.ed}" stroke-width="${small?2.2:1.4}" stroke-linejoin="round"/>`;}).join("");
    s+=side(-1)+side(1);}
  if(L.laurel&&!small)s+=laurel(L,g);
  if(L.spikes){const [l,r]:[Pt,Pt]=L.shape==="notch"?[[14,15],[86,15]]:L.shape==="tall"?[[19,13],[81,13]]:[[17,17],[83,17]];
    s+=`<polygon points="${P([l,[l[0]-12,l[1]-11],[l[0]+8,l[1]-4]])}" fill="${g("md")}" stroke="${L.ed}" stroke-width="1.6" stroke-linejoin="round"/><polygon points="${P([r,[r[0]+12,r[1]-11],[r[0]-8,r[1]-4]])}" fill="${g("md")}" stroke="${L.ed}" stroke-width="1.6" stroke-linejoin="round"/>`;}
  s+=`<polygon points="${P(body)}" fill="${g("body")}" stroke="${L.ed}" stroke-width="${small?4:3}" stroke-linejoin="round"/>`;
  if(!small){
    s+=inset.map((a,k)=>{const b=inset[(k+1)%inset.length]!,mx=(a[0]+b[0])/2-C[0],my=(a[1]+b[1])/2-C[1],d=(-mx-my)/Math.hypot(mx,my)/Math.SQRT2,tone=d>.45?L.hi:d>-.05?L.lt:d>-.6?L.md:L.dk;
      return `<polygon points="${P([a,b,C])}" fill="${tone}" opacity=".93"/>`;}).join("");
    s+=`<polygon points="${P(inset)}" fill="none" stroke="${L.hi}" stroke-width="1.6" opacity=".9"/><polygon points="${P(body)}" fill="none" stroke="${L.ed}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  const cy=small?42:40,stroke=`stroke="${L.ed}" stroke-width="1.8" stroke-linejoin="round"`;
  if(L.center==="arrow")s+=`<polygon points="${P([[50,cy-14],[62,cy+2],[55,cy+2],[55,cy+10],[45,cy+10],[45,cy+2],[38,cy+2]])}" fill="${L.hi}" ${stroke}/>`;
  if(L.center==="star4")s+=`<polygon points="${P(starPts(50,cy,15,5,4))}" fill="${L.hi}" ${stroke}/>`;
  if(L.center==="star5")s+=`<polygon points="${P(starPts(50,cy+1,15,6.4,5))}" fill="${L.hi}" ${stroke}/>`;
  if(L.center==="gem")s+=`<polygon points="${P([[50,cy-14],[63,cy-2],[50,cy+16],[37,cy-2]])}" fill="${L.hi}" ${stroke}/><polygon points="${P([[50,cy-14],[63,cy-2],[50,cy+1]])}" fill="${L.lt}"/><polygon points="${P([[50,cy+1],[63,cy-2],[50,cy+16]])}" fill="${L.md}"/>`;
  if(L.center==="crystal"||L.center==="burst"){
    if(L.halo&&!small)s+=`<circle cx="50" cy="${cy}" r="17" fill="none" stroke="${L.hi}" stroke-width="2" opacity=".8"/>`;
    if(L.center==="burst")s+=`<polygon points="${P(starPts(50,cy,22,9,8))}" fill="${L.lt}" stroke="${L.ed}" stroke-width="1.4" stroke-linejoin="round"/>`;
    s+=`<polygon points="${P([[50,cy-17],[60,cy-4],[56,cy+14],[44,cy+14],[40,cy-4]])}" fill="${L.hi}" ${stroke}/><polygon points="${P([[50,cy-17],[60,cy-4],[50,cy-1]])}" fill="${L.lt}"/><polygon points="${P([[50,cy-1],[60,cy-4],[56,cy+14],[50,cy+14]])}" fill="${L.md}" opacity=".85"/><polygon points="${P([[50,cy-17],[40,cy-4],[50,cy-1]])}" fill="#fff" opacity=".8"/>`;}
  if(L.crown){const w=34,x=50-w/2,top=-9;
    s+=`<polygon points="${P([[x,13],[x-3,top+7],[x+w*.25,top+13],[50,top],[x+w*.75,top+13],[x+w+3,top+7],[x+w,13]])}" fill="${g("lt")}" stroke="${L.ed}" stroke-width="2" stroke-linejoin="round"/><rect x="${x}" y="11" width="${w}" height="5" rx="1.5" fill="${g("md")}" stroke="${L.ed}" stroke-width="1.4"/><circle cx="50" cy="${top+1}" r="3" fill="${L.hi}" stroke="${L.ed}" stroke-width="1.2"/><circle cx="${x-3}" cy="${top+7}" r="2.2" fill="${L.hi}" stroke="${L.ed}" stroke-width="1"/><circle cx="${x+w+3}" cy="${top+7}" r="2.2" fill="${L.hi}" stroke="${L.ed}" stroke-width="1"/>`+(L.crown===2?`<circle cx="${x+w*.25}" cy="${top+13.5}" r="1.8" fill="#fff"/><circle cx="${x+w*.75}" cy="${top+13.5}" r="1.8" fill="#fff"/><circle cx="50" cy="13.5" r="2" fill="${L.md}"/>`:"");}
  if(tier>0){
    if(small)s+=`<text x="50" y="85" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="25" font-weight="900" fill="#fff" stroke="${L.ed}" stroke-width="5" paint-order="stroke" stroke-linejoin="round">${["I","II","III"][tier-1]}</text>`;
    else for(let k=0;k<3;k++){const y=78-k*7,on=k<tier,pts=P([[39,y+4],[50,y-2],[61,y+4]]);s+=`<polyline points="${pts}" fill="none" stroke="${on?L.ed:"rgba(0,0,0,.25)"}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pts}" fill="none" stroke="${on?L.hi:"rgba(255,255,255,.35)"}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`;}
  }
  const defs=`<defs><linearGradient id="${id}body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${L.hi}"/><stop offset=".35" stop-color="${L.lt}"/><stop offset=".7" stop-color="${L.md}"/><stop offset="1" stop-color="${L.dk}"/></linearGradient><linearGradient id="${id}lt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.hi}"/><stop offset="1" stop-color="${L.md}"/></linearGradient><linearGradient id="${id}md" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.lt}"/><stop offset="1" stop-color="${L.dk}"/></linearGradient><radialGradient id="${id}glow"><stop offset=".45" stop-color="${L.gl}" stop-opacity=".55"/><stop offset="1" stop-color="${L.gl}" stop-opacity="0"/></radialGradient></defs>`;
  const name=label??L.n+(tier>0?" "+["I","II","III"][tier-1]:"");
  return `<svg class="rk-emblem" width="${size}" height="${size}" viewBox="${small?"-6 -12 112 112":"-12 -16 124 124"}" role="img" aria-label="${name}">${defs}${s}</svg>`;
}
export function leagueColor(league:number):string{return LEAGUE_STYLE[Math.max(0,Math.min(LEAGUE_STYLE.length-1,league))]!.md;}
