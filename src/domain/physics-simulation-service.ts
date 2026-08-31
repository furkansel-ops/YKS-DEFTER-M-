export type PhysicsSimulationId = "motion" | "energy-momentum" | "circuits" | "fields" | "optics" | "waves" | "matter" | "photoelectric";

export interface PhysicsSimulationInput {
  key:string; label:string; min:number; max:number; step:number; unit:string; initial:number;
}
export interface PhysicsSimulationDefinition {
  id:PhysicsSimulationId; title:string; eyebrow:string; description:string; formula:string;
  cardIds:readonly string[]; inputs:readonly PhysicsSimulationInput[];
}
export interface PhysicsSimulationResult {
  id:PhysicsSimulationId; values:Readonly<Record<string,number>>; summary:string; cue:string; state:string;
}

const input=(key:string,label:string,min:number,max:number,step:number,unit:string,initial:number):PhysicsSimulationInput=>({key,label,min,max,step,unit,initial});
export const PHYSICS_SIMULATIONS:readonly PhysicsSimulationDefinition[]=[
  {id:"motion",title:"Hareket + Newton",eyebrow:"KİNEMATİK",description:"Başlangıç hızı, ivme ve zamanı değiştir; hız, yer değiştirme ve net kuvveti birlikte izle.",formula:"v = v₀ + a·t · Δx = v₀t + ½at² · Fnet = m·a",cardIds:["phy-motion","phy-newton"],inputs:[input("v0","Başlangıç hızı",-20,20,1,"m/s",4),input("a","İvme",-10,10,.5,"m/s²",2),input("t","Zaman",0,10,.5,"s",3),input("m","Kütle",.5,10,.5,"kg",2)]},
  {id:"energy-momentum",title:"Enerji + Momentum",eyebrow:"MEKANİK",description:"Aynı cismin hızını ve kütlesini değiştir; kinetik enerji ile momentumun hıza farklı bağlılığını gör.",formula:"K = ½m·v² · p = m·v · I = F·Δt",cardIds:["phy-energy","phy-momentum"],inputs:[input("m","Kütle",.5,12,.5,"kg",2),input("v","Hız",-20,20,1,"m/s",6),input("force","Kuvvet",0,30,1,"N",8),input("dt","Etki süresi",0,5,.25,"s",1.5)]},
  {id:"circuits",title:"Seri + Paralel Devre",eyebrow:"ELEKTRİK",description:"İki direnci ve kaynağı değiştir; seri ve paralel eşdeğerleri aynı anda karşılaştır.",formula:"V = I·R · Rseri = R₁ + R₂ · 1/Rpar = 1/R₁ + 1/R₂",cardIds:["phy-electricity","phy-series"],inputs:[input("voltage","Gerilim",1,24,1,"V",12),input("r1","R₁",1,30,1,"Ω",6),input("r2","R₂",1,30,1,"Ω",12)]},
  {id:"fields",title:"Elektrik + Manyetik Alan",eyebrow:"ALANLAR",description:"Yük, elektrik alan, hız, manyetik alan ve açıyı değiştir; iki kuvvetin yön ve büyüklük ilişkisini karşılaştır.",formula:"Fe = q·E · Fm = |q|·v·B·sinθ",cardIds:["phy-field","phy-magnetism"],inputs:[input("q","Yük",-5,5,.5,"μC",2),input("e","Elektrik alan",0,20,1,"kN/C",6),input("v","Hız",0,20,1,"km/s",8),input("b","Manyetik alan",0,2,.1,"T",.8),input("theta","v–B açısı",0,180,5,"°",90)]},
  {id:"optics",title:"Yansıma + Kırılma + Mercek",eyebrow:"OPTİK",description:"Gelme açısını ve ortam indislerini değiştir; yansıma, kırılma ve odak içi mercek görüntüsünü tek panelde gör.",formula:"i = r · n₁sin i = n₂sin r · 1/f = 1/do + 1/di",cardIds:["phy-optics","phy-lens"],inputs:[input("angle","Gelme açısı",0,80,2,"°",35),input("n1","n₁",1,2.2,.1,"",1),input("n2","n₂",1,2.2,.1,"",1.5),input("f","Odak uzaklığı",5,30,1,"cm",12),input("do","Cisim uzaklığı",3,45,1,"cm",8)]},
  {id:"waves",title:"Dalgalar + Girişim",eyebrow:"DALGALAR",description:"Dalga hızı, frekans ve yol farkını değiştir; dalga boyunu ve girişim türünü anında gör.",formula:"v = f·λ · yapıcı: Δx = k·λ",cardIds:["phy-waves","phy-interference"],inputs:[input("speed","Dalga hızı",1,20,.5,"m/s",10),input("frequency","Frekans",.5,10,.5,"Hz",2),input("path","Yol farkı",0,20,.25,"m",5)]},
  {id:"matter",title:"Isı + Basınç + Kaldırma",eyebrow:"MADDE VE ISI",description:"Isınma ile sıvı basıncı/kaldırmayı aynı deney masasından karşılaştır; hangi büyüklüğün hangi sonucu değiştirdiğini gör.",formula:"Q = m·c·ΔT · p = ρgh · Fk = ρgVbatan",cardIds:["phy-heat","phy-pressure","phy-buoyancy"],inputs:[input("m","Kütle",.5,10,.5,"kg",2),input("c","Öz ısı",100,4200,100,"J/kg°C",900),input("dT","Sıcaklık değişimi",0,100,5,"°C",30),input("rho","Sıvı yoğunluğu",500,1500,50,"kg/m³",1000),input("h","Derinlik",0,10,.5,"m",3),input("volume","Batan hacim",.001,.05,.001,"m³",.01)]},
  {id:"photoelectric",title:"Fotoelektrik Olay",eyebrow:"MODERN FİZİK",description:"Işığın frekansını, eşik frekansını ve şiddetini değiştir; elektron çıkışı için önce frekans koşulunu test et.",formula:"Emax ∝ f − f₀ (f ≥ f₀) · şiddet → elektron sayısı",cardIds:["phy-modern"],inputs:[input("frequency","Işık frekansı",1,12,.25,"×10¹⁴ Hz",7),input("threshold","Eşik frekansı",1,12,.25,"×10¹⁴ Hz",5),input("intensity","Bağıl şiddet",.1,2,.1,"×",1)]}
];

const byId=new Map(PHYSICS_SIMULATIONS.map(sim=>[sim.id,sim] as const));
const finite=(value:unknown,fallback:number)=>typeof value==="number"&&Number.isFinite(value)?value:fallback;
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const read=(values:Readonly<Record<string,number>>,key:string)=>values[key]??0;
export function normalizePhysicsInputs(id:PhysicsSimulationId,raw:Readonly<Record<string,number>>={}):Readonly<Record<string,number>> {
  const sim=byId.get(id);if(!sim)return {};
  return Object.fromEntries(sim.inputs.map(spec=>[spec.key,clamp(finite(raw[spec.key],spec.initial),spec.min,spec.max)]));
}
const round=(value:number,digits=3)=>Number(value.toFixed(digits));
export function evaluatePhysicsSimulation(id:PhysicsSimulationId,raw:Readonly<Record<string,number>>={}):PhysicsSimulationResult|null {
  if(!byId.has(id))return null;
  const x=normalizePhysicsInputs(id,raw),n=(key:string)=>read(x,key);
  if(id==="motion"){
    const v0=n("v0"),a=n("a"),t=n("t"),m=n("m"),v=v0+a*t,dx=v0*t+.5*a*t*t,force=m*a;
    return {id,values:{v:round(v),dx:round(dx),force:round(force)},summary:`${t} s sonunda hız ${round(v)} m/s, yer değiştirme ${round(dx)} m.`,cue:"İvme sıfırsa hız sabit kalabilir; net kuvvet sıfır olması durmak demek değildir.",state:a===0?"constant":"accelerating"};
  }
  if(id==="energy-momentum"){
    const m=n("m"),v=n("v"),force=n("force"),dt=n("dt"),kinetic=.5*m*v*v,momentum=m*v,impulse=force*dt;
    return {id,values:{kinetic:round(kinetic),momentum:round(momentum),impulse:round(impulse)},summary:`K = ${round(kinetic)} J · p = ${round(momentum)} kg·m/s · I = ${round(impulse)} N·s`,cue:"Hız iki katına çıkınca momentum 2 kat, kinetik enerji 4 kat olur.",state:v===0?"rest":"moving"};
  }
  if(id==="circuits"){
    const voltage=n("voltage"),r1=n("r1"),r2=n("r2"),series=r1+r2,parallel=(r1*r2)/(r1+r2),iSeries=voltage/series,iParallel=voltage/parallel;
    return {id,values:{series:round(series),parallel:round(parallel),iSeries:round(iSeries),iParallel:round(iParallel)},summary:`Rseri ${round(series)} Ω · Rparalel ${round(parallel)} Ω`,cue:"Paralel eşdeğer direnç her zaman en küçük kol direncinden küçüktür.",state:"closed-circuit"};
  }
  if(id==="fields"){
    const q=n("q"),e=n("e"),v=n("v"),b=n("b"),theta=n("theta")*Math.PI/180,fe=q*e,fm=Math.abs(q)*v*b*Math.sin(theta);
    return {id,values:{electric:round(fe),magnetic:round(fm),sinTheta:round(Math.sin(theta))},summary:`Elektrik kuvveti işaretli ${round(fe)} bağıl birim · Manyetik kuvvet ${round(fm)} bağıl birim.`,cue:"Negatif yükte elektrik kuvveti alanın tersine; v ile B paralelse manyetik kuvvet sıfırdır.",state:q<0?"negative-charge":q>0?"positive-charge":"neutral"};
  }
  if(id==="optics"){
    const angle=n("angle"),n1=n("n1"),n2=n("n2"),f=n("f"),objectDistance=n("do"),incidence=angle*Math.PI/180,sinRefracted=n1*Math.sin(incidence)/n2,tir=Math.abs(sinRefracted)>1;
    const refracted=tir?NaN:Math.asin(sinRefracted)*180/Math.PI,denominator=1/f-1/objectDistance,di=Math.abs(denominator)<1e-9?Infinity:1/denominator,virtual=Number.isFinite(di)&&di<0;
    return {id,values:{reflection:round(angle),refraction:tir?-1:round(refracted),imageDistance:Number.isFinite(di)?round(di):9999},summary:tir?`Yansıma açısı ${angle}° · tam yansıma koşulu oluştu.`:`Yansıma ${angle}° · kırılma ${round(refracted)}° · görüntü uzaklığı ${Number.isFinite(di)?round(di):"∞"} cm.`,cue:"Açılar normale göre ölçülür. Cisim odak içindeyse ince kenarlı mercekte görüntü sanal, düz ve büyüktür.",state:tir?"total-internal-reflection":virtual?"virtual-image":"real-image"};
  }
  if(id==="waves"){
    const speed=n("speed"),frequency=n("frequency"),path=n("path"),wavelength=speed/frequency,ratio=path/wavelength,nearest=Math.round(ratio),nearestHalf=Math.round(ratio-.5)+.5,constructive=Math.abs(ratio-nearest)<.06,destructive=Math.abs(ratio-nearestHalf)<.06;
    return {id,values:{wavelength:round(wavelength),ratio:round(ratio)},summary:`λ = ${round(wavelength)} m · Δx/λ = ${round(ratio)} → ${constructive?"yapıcı":destructive?"söndürücü":"ara"} girişim.`,cue:"Ortam değişince hız ve dalga boyu değişebilir; kaynak değişmedikçe frekans değişmez.",state:constructive?"constructive":destructive?"destructive":"partial"};
  }
  if(id==="matter"){
    const m=n("m"),c=n("c"),dT=n("dT"),rho=n("rho"),h=n("h"),volume=n("volume"),heat=m*c*dT,pressure=rho*9.8*h,buoyancy=rho*9.8*volume;
    return {id,values:{heat:round(heat),pressure:round(pressure),buoyancy:round(buoyancy)},summary:`Q = ${round(heat)} J · p = ${round(pressure)} Pa · Fk = ${round(buoyancy)} N`,cue:"Basınçta derinlik; kaldırmada yalnız batan hacim; ısınmada hâl değişimi yoksa mcΔT kullanılır.",state:h===0?"surface":"submerged"};
  }
  const frequency=n("frequency"),threshold=n("threshold"),intensity=n("intensity"),emitted=frequency>=threshold,excess=Math.max(0,frequency-threshold),current=emitted?intensity:0;
  return {id,values:{excess:round(excess),current:round(current)},summary:emitted?`Elektron çıkar. Bağıl maksimum enerji ${round(excess)}, bağıl akım ${round(current)}.`:"f < f₀: şiddet artsa da elektron çıkmaz.",cue:"Önce eşik frekansını kontrol et; şiddet elektron enerjisini değil, uygun koşulda çıkan elektron sayısını etkiler.",state:emitted?"emission":"below-threshold"};
}

export function getPhysicsSimulation(id:string):PhysicsSimulationDefinition|undefined {
  return byId.get(id as PhysicsSimulationId);
}
export function physicsSimulationForCard(cardId:string):PhysicsSimulationDefinition|undefined {
  return PHYSICS_SIMULATIONS.find(sim=>sim.cardIds.includes(cardId));
}
