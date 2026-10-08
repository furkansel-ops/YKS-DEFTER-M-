import{defaultReminderSettings,isQuiet,recommendReminder,recordReminder}from"../domain/smart-reminders.ts";
import type{ReminderSettings}from"../domain/smart-reminders.ts";
import type{StudyGamificationState,GamificationProfile}from"../domain/study-gamification.ts";
import"./smart-reminders.css";

type UserState=StudyGamificationState&{gamification?:GamificationProfile&{smartReminders?:ReminderSettings}};
type Bridge={readState:()=>StudyGamificationState|null;saveState:()=>boolean;toast?:(message:string)=>void};
type PushBridge={enable:()=>Promise<string>;disable:()=>Promise<string>;localTest:()=>Promise<string>;status:()=>string};
type SmartWindow=Window&{YKSSmartPush?:PushBridge};
let installed=false,queued=false;
const node=<K extends keyof HTMLElementTagNameMap>(tag:K,cls="",value=""):HTMLElementTagNameMap[K]=>{
  const el=document.createElement(tag);if(cls)el.className=cls;if(value)el.textContent=value;return el;
};
function settingsOf(state:UserState):ReminderSettings{
  const user=state.gamification?.smartReminders;
  return user&&typeof user.enabled==="boolean"?
    {...defaultReminderSettings(),...user,lastShown:{...(user.lastShown??{})}}:defaultReminderSettings();
}
function rootNode(){
  let root=document.getElementById("smartReminderPanel");
  if(root)return root;
  const sibling=document.getElementById("studyInsightsPanel")??document.getElementById("studyGamification");
  if(!sibling)return null;
  root=node("section","sn-panel");root.id="smartReminderPanel";
  root.setAttribute("aria-label","Akıllı hatırlatma ve push ayarları");
  sibling.insertAdjacentElement("afterend",root);return root;
}
function saveSettings(port:Bridge,next:ReminderSettings):boolean{
  const state=port.readState() as UserState|null,profile=state?.gamification;
  if(!profile)return false;
  const old=profile.smartReminders;
  profile.smartReminders=next;
  if(!port.saveState()){profile.smartReminders=old;port.toast?.("Hatırlatma tercihi kaydedilemedi.");return false;}
  window.dispatchEvent(new Event("yks:smart-reminders-settings"));
  return true;
}
function render(port:Bridge,refresh:()=>void){
  const root=rootNode(),state=port.readState() as UserState|null;
  if(!root||!state?.gamification)return;
  const data=settingsOf(state);
  root.replaceChildren(node("h2","","🔔 Akıllı Hatırlatmalar"),
    node("p","sn-description","Günlük süre ve soru hedeflerin için kişisel hatırlatmalar. Dinlenme gününde uyarı gönderilmez."));
  const line=node("div","sn-line");
  const toggle=node("button","sn-toggle",data.enabled?"Hatırlatmalar açık ✓":"Hatırlatmaları aç");
  toggle.type="button";toggle.setAttribute("aria-pressed",String(data.enabled));
  toggle.addEventListener("click",()=>{
    if(saveSettings(port,{...data,enabled:!data.enabled})){port.toast?.(data.enabled?
      "Akıllı hatırlatmalar kapatıldı.":"Akıllı hatırlatmalar açıldı.");refresh();}
  });
  line.appendChild(toggle);
  const quiet=node("span","sn-hint",
    "Sessiz saatler: "+String(data.quietStart).padStart(2,"0")+":00–"+
    String(data.quietEnd).padStart(2,"0")+":00");
  line.appendChild(quiet);
  root.appendChild(line);
  const pushRow=node("div","sn-push-row"),push=node("button","sn-push","Telefon bildirimini etkinleştir");
  push.type="button";push.disabled=!data.enabled;
  const status=node("small","sn-status",(window as SmartWindow).YKSSmartPush?.status()??
    "Telefon bildirimi için hesap ve sunucu bağlantısı gerekli.");
  push.addEventListener("click",async()=>{
    const api=(window as SmartWindow).YKSSmartPush;
    if(!api){status.textContent="Önce öğrenci hesabınla giriş yapıp bildirim bağlantısını kur.";return;}
    push.disabled=true;
    try{status.textContent=await api.enable();}
    catch(error){status.textContent=error instanceof Error?error.message:"Bildirim bağlantısı kurulamadı.";}
    finally{push.disabled=false;}
  });
  const disconnect=node("button","sn-push-secondary","Telefon bildirimini kapat");
  disconnect.type="button";disconnect.setAttribute("aria-label","Bu cihazın Web Push aboneliğini kaldır");
  disconnect.addEventListener("click",async()=>{
    const api=(window as SmartWindow).YKSSmartPush;
    if(!api){status.textContent="Bu cihazda bağlı bildirim oturumu bulunamadı.";return;}
    disconnect.disabled=true;
    try{status.textContent=await api.disable();}
    catch(error){status.textContent=error instanceof Error?error.message:"Abonelik kaldırılamadı.";}
    finally{disconnect.disabled=false;}
  });
  const test=node("button","sn-push-secondary","Yerel bildirimi dene");
  test.type="button";test.disabled=!data.enabled;
  test.addEventListener("click",async()=>{
    const api=(window as SmartWindow).YKSSmartPush;
    if(!api){status.textContent="Önce bildirim bağlantısı kurulmalı.";return;}
    test.disabled=true;
    try{status.textContent=await api.localTest();}
    catch(error){status.textContent=error instanceof Error?error.message:"Yerel bildirim gösterilemedi.";}
    finally{test.disabled=false;}
  });
  const actions=node("div","sn-actions");
  actions.append(push,disconnect,test);
  pushRow.append(actions,status);root.appendChild(pushRow);
  root.appendChild(node("small","sn-foot",
    "Yerel test yalnız cihazın bildirim iznini ve görünümünü sınar; gerçek sunucu Push teslimini doğrulamaz. iPad'de iPadOS 16.4+ ve Ana Ekran'a eklenmiş uygulama gerekir."));
}
export function installSmartReminders(port:Bridge):void{
  if(installed)return;installed=true;
  const refresh=()=>{
    if(queued)return;queued=true;
    window.requestAnimationFrame(()=>{
      queued=false;
      const state=port.readState() as UserState|null;
      if(!state?.gamification)return;
      const settings=settingsOf(state);
      render(port,refresh);
      if(document.hidden)return;
      const now=new Date();
      if(isQuiet(now.getHours(),settings.quietStart,settings.quietEnd))return;
      const reminder=recommendReminder(state,now,settings);
      if(reminder&&saveSettings(port,recordReminder(settings,reminder,now))){
        port.toast?.(reminder.title+" — "+reminder.body);
      }
    });
  };
  for(const key of ["yks:data-changed","yks:auth-state","yks:navigation","yks:smart-push-status"])
    window.addEventListener(key,refresh);
  window.addEventListener("pageshow",refresh);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();});
  window.setInterval(()=>{if(!document.hidden)refresh();},60000);
  refresh();
}
