type ProfileState={
  wizardDone?:boolean;
  name?:string;
  examDate?:string;
  target?:number;
  targetNet?:number;
  targetNetTYT?:number;
  targetNetAYT?:number;
  targetUniversity?:string;
  targetDepartment?:string;
  puanTuru?:"SAY"|"EA"|"SOZ"|"DIL"|string;
  workdays?:number;
  denemeler?:unknown[];
  topics?:Record<string,unknown>;
  weeks?:Record<string,unknown>;
};

type LegacyStateBridge={
  readState?:()=>ProfileState;
  save?:()=>unknown;
};

type LegacyWindow=Window&{
  YKSLegacyState?:LegacyStateBridge;
  openWizard?:()=>unknown;
  wizNext?:()=>unknown;
  renderSettings?:()=>unknown;
  saveSettings?:()=>unknown;
};

const TYT_DATE="2027-06-19";
const TRACKS=["SAY","EA","SOZ","DIL"] as const;
const runtime=window as LegacyWindow;

function esc(value:unknown):string{
  return String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function num(value:unknown,max:number):number{
  const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(max,n)):0;
}
function state():ProfileState|null{
  try{return runtime.YKSLegacyState?.readState?.()||null;}catch{return null;}
}
function blankNewUser(s:ProfileState):boolean{
  return !s.wizardDone&&!String(s.name||"").trim()&&!(s.denemeler||[]).length&&Object.keys(s.topics||{}).length===0&&Object.keys(s.weeks||{}).length===0;
}
function normalizeProfile(s:ProfileState):boolean{
  let changed=false;
  if(s.examDate!==TYT_DATE){s.examDate=TYT_DATE;changed=true;}
  if(s.targetNetTYT==null){s.targetNetTYT=num(s.targetNet,120);changed=true;}else{s.targetNetTYT=num(s.targetNetTYT,120);}
  if(s.targetNetAYT==null){s.targetNetAYT=0;changed=true;}else{s.targetNetAYT=num(s.targetNetAYT,80);}
  if(typeof s.targetUniversity!=="string"){s.targetUniversity="";changed=true;}
  if(typeof s.targetDepartment!=="string"){s.targetDepartment="";changed=true;}
  if(!TRACKS.includes(s.puanTuru as typeof TRACKS[number])){s.puanTuru="SAY";changed=true;}
  if(blankNewUser(s)&&Number(s.target||0)===150){s.target=0;changed=true;}
  if(Number(s.targetNet||0)!==Number(s.targetNetTYT||0)){s.targetNet=s.targetNetTYT||0;changed=true;}
  return changed;
}
function examScheduleHtml():string{
  return `<div class="card" style="margin:14px 0 0;padding:13px;box-shadow:none;">
    <p class="eyebrow" style="margin:0 0 7px;">2027 YKS takvimi</p>
    <p class="hint" style="margin:0;"><b>TYT</b> · 19 Haziran 2027 Cumartesi 10:15<br><b>AYT</b> · 20 Haziran 2027 Pazar 10:15<br><b>YDT</b> · 20 Haziran 2027 Pazar 15:45</p>
  </div>`;
}
function trackOptions(selected:string):string{
  const rows:[[string,string],[string,string],[string,string],[string,string]]=[["SAY","Sayısal"],["EA","Eşit Ağırlık"],["SOZ","Sözel"],["DIL","Dil"]];
  return rows.map(([value,label])=>`<option value="${value}" ${selected===value?"selected":""}>${label}</option>`).join("");
}
function installWizardMarkup():void{
  const s=state();if(!s)return;
  const one=document.getElementById("wiz1"),two=document.getElementById("wiz2"),three=document.getElementById("wiz3"),four=document.getElementById("wiz4");
  if(!one||!two||!three||!four)return;
  one.innerHTML=`<p class="eyebrow">1 / 4</p><h3 class="wizt">Seni tanıyalım</h3><p class="wizp">Profilini ve hedeflerini bir kez ayarlayalım; sonra istediğin zaman değiştirebilirsin.</p><label>Ad Soyad</label><input type="text" id="wizName" maxlength="80" placeholder="Ad Soyad" autocomplete="name"><label>Alan / puan türü</label><select id="wizTrack">${trackOptions(String(s.puanTuru||"SAY"))}</select>`;
  two.innerHTML=`<p class="eyebrow">2 / 4</p><h3 class="wizt">Net hedeflerin</h3><p class="wizp">TYT ve AYT için ulaşmak istediğin netleri ayrı ayrı belirle.</p><div class="row2"><div><label>TYT hedef neti</label><input type="number" id="wizTytNet" min="0" max="120" step="0.25" placeholder="90"></div><div><label>AYT hedef neti</label><input type="number" id="wizAytNet" min="0" max="80" step="0.25" placeholder="60"></div></div>`;
  three.innerHTML=`<p class="eyebrow">3 / 4</p><h3 class="wizt">Hedef okul ve bölüm</h3><p class="wizp">Hedefini yazmak ilerleme ekranını daha anlamlı hale getirir.</p><label>Hedef üniversite / okul</label><input type="text" id="wizUniversity" maxlength="120" placeholder="Örn. İstanbul Teknik Üniversitesi"><label>Hedef bölüm</label><input type="text" id="wizDepartment" maxlength="120" placeholder="Örn. Bilgisayar Mühendisliği">`;
  four.innerHTML=`<p class="eyebrow">4 / 4</p><h3 class="wizt">Çalışma düzenin</h3><p class="wizp">Haftalık temponu seç. 2027 YKS tarihleri uygulamada hazır; sana tekrar sormuyoruz.</p><label>Haftada çalışma günü</label><input type="number" id="wizDays" min="1" max="7" value="6">${examScheduleHtml()}<input type="date" id="wizDate" value="${TYT_DATE}" hidden><input type="number" id="wizTarget" value="${Number(s.target||0)}" hidden><input type="number" id="wizNet" value="${Number(s.targetNetTYT||0)}" hidden>`;
}
function populateWizard():void{
  const s=state();if(!s)return;
  const set=(id:string,value:unknown)=>{const node=document.getElementById(id) as HTMLInputElement|HTMLSelectElement|null;if(node)node.value=String(value??"");};
  set("wizName",s.name||"");set("wizTrack",s.puanTuru||"SAY");set("wizTytNet",s.targetNetTYT||"");set("wizAytNet",s.targetNetAYT||"");set("wizUniversity",s.targetUniversity||"");set("wizDepartment",s.targetDepartment||"");set("wizDays",s.workdays||6);set("wizDate",TYT_DATE);set("wizTarget",s.target||0);set("wizNet",s.targetNetTYT||0);
}
function syncWizard():void{
  const s=state();if(!s)return;
  const value=(id:string)=>String((document.getElementById(id) as HTMLInputElement|HTMLSelectElement|null)?.value||"");
  s.name=value("wizName").trim().slice(0,80);s.puanTuru=TRACKS.includes(value("wizTrack") as typeof TRACKS[number])?value("wizTrack"):"SAY";s.targetNetTYT=num(value("wizTytNet"),120);s.targetNetAYT=num(value("wizAytNet"),80);s.targetNet=s.targetNetTYT;s.targetUniversity=value("wizUniversity").trim().slice(0,120);s.targetDepartment=value("wizDepartment").trim().slice(0,120);s.examDate=TYT_DATE;s.workdays=Math.max(1,Math.min(7,Number(value("wizDays"))||6));
  const legacyDate=document.getElementById("wizDate") as HTMLInputElement|null,legacyTarget=document.getElementById("wizTarget") as HTMLInputElement|null,legacyNet=document.getElementById("wizNet") as HTMLInputElement|null;
  if(legacyDate)legacyDate.value=TYT_DATE;if(legacyTarget)legacyTarget.value=String(s.target||0);if(legacyNet)legacyNet.value=String(s.targetNetTYT||0);
}
function installSettingsMarkup():void{
  const name=document.getElementById("nameInput");const card=name?.closest<HTMLElement>(".card");const s=state();if(!card||!s)return;
  card.innerHTML=`<label>Ad Soyad</label><input type="text" id="nameInput" placeholder="Ad Soyad" autocomplete="name"><label>Alan / puan türü</label><select id="puanTuruInput">${trackOptions(String(s.puanTuru||"SAY"))}</select><div class="row2"><div><label>TYT hedef neti</label><input type="number" id="targetNetTYTInput" min="0" max="120" step="0.25" placeholder="90"></div><div><label>AYT hedef neti</label><input type="number" id="targetNetAYTInput" min="0" max="80" step="0.25" placeholder="60"></div></div><label>Hedef üniversite / okul</label><input type="text" id="targetUniversityInput" maxlength="120" placeholder="Örn. İstanbul Teknik Üniversitesi"><label>Hedef bölüm</label><input type="text" id="targetDepartmentInput" maxlength="120" placeholder="Örn. Bilgisayar Mühendisliği">${examScheduleHtml()}<label>Günlük soru hedefi <span class="hint">(isteğe bağlı)</span></label><input type="number" id="targetInput" min="0" placeholder="0"><label>OBP (0–100)</label><input type="number" id="obpInput" min="0" max="100" step="0.01" placeholder="85"><label>Haftada çalışma günü</label><input type="number" id="workdaysInput" min="1" max="7" placeholder="6"><input type="date" id="examDateInput" value="${TYT_DATE}" hidden><input type="number" id="targetNetInput" value="${Number(s.targetNetTYT||0)}" hidden><button class="btn green" style="margin-top:20px;" onclick="saveSettings()">Kaydet</button>`;
}
function populateSettings():void{
  const s=state();if(!s)return;
  const set=(id:string,value:unknown)=>{const node=document.getElementById(id) as HTMLInputElement|HTMLSelectElement|null;if(node)node.value=String(value??"");};
  set("nameInput",s.name||"");set("puanTuruInput",s.puanTuru||"SAY");set("targetNetTYTInput",s.targetNetTYT||"");set("targetNetAYTInput",s.targetNetAYT||"");set("targetUniversityInput",s.targetUniversity||"");set("targetDepartmentInput",s.targetDepartment||"");set("targetInput",s.target||0);set("workdaysInput",s.workdays||6);set("examDateInput",TYT_DATE);set("targetNetInput",s.targetNetTYT||0);
}
function syncSettings():void{
  const s=state();if(!s)return;
  const value=(id:string)=>String((document.getElementById(id) as HTMLInputElement|HTMLSelectElement|null)?.value||"");
  const track=value("puanTuruInput");s.puanTuru=TRACKS.includes(track as typeof TRACKS[number])?track:"SAY";s.targetNetTYT=num(value("targetNetTYTInput"),120);s.targetNetAYT=num(value("targetNetAYTInput"),80);s.targetNet=s.targetNetTYT;s.targetUniversity=value("targetUniversityInput").trim().slice(0,120);s.targetDepartment=value("targetDepartmentInput").trim().slice(0,120);s.examDate=TYT_DATE;
  const date=document.getElementById("examDateInput") as HTMLInputElement|null,net=document.getElementById("targetNetInput") as HTMLInputElement|null;if(date)date.value=TYT_DATE;if(net)net.value=String(s.targetNetTYT||0);
}

export function installOnboardingProfileV45():{installed:boolean;examDate:string}{
  const s=state();if(!s)return {installed:false,examDate:TYT_DATE};
  const changed=normalizeProfile(s);installWizardMarkup();installSettingsMarkup();populateWizard();populateSettings();
  const oldOpen=runtime.openWizard,oldNext=runtime.wizNext,oldRenderSettings=runtime.renderSettings,oldSaveSettings=runtime.saveSettings;
  runtime.openWizard=()=>{const result=oldOpen?.();populateWizard();return result;};
  runtime.wizNext=()=>{const final=(document.getElementById("wiz4") as HTMLElement|null)?.style.display!=="none";if(final)syncWizard();return oldNext?.();};
  runtime.renderSettings=()=>{const result=oldRenderSettings?.();populateSettings();return result;};
  runtime.saveSettings=()=>{syncSettings();return oldSaveSettings?.();};
  if(changed)try{runtime.YKSLegacyState?.save?.();}catch{}
  document.documentElement.dataset.onboardingProfile="v4.5";
  return {installed:true,examDate:TYT_DATE};
}
