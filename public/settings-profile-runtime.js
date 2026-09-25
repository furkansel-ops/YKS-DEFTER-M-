const ROOT_ID="yksModernSettings",MODAL_ID="yksProfileEditModal";
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const txt=(v,n=120)=>String(v??"").trim().slice(0,n);
const num=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const st=()=>{try{return window.YKSLegacyState?.readState?.()||window.S||{}}catch{return window.S||{}}};
const save=()=>{try{if(typeof window.save==="function"){if(window.save()===false)return false}else if(window.YKSLegacyState?.save?.()===false)return false}catch{return false}try{window.dispatchEvent(new CustomEvent("yks:data-changed",{detail:{source:"settings-profile"}}))}catch{}return true};
const toast=m=>{try{window.toast?.(m)}catch{}};
const val=(v,f="—")=>txt(v)?txt(v):f;
const net=v=>Number(v)>0?String(Math.round(Number(v)*4)/4):"—";
const view={category:"",query:"",returnTo:"profile",overviewScroll:0,timeDirty:false};
const categories=[
  {id:"profile",title:"Profil ve hedefler",description:"Kişisel bilgilerin ve YKS hedeflerin",keywords:"ad soyad üniversite bölüm alan puan türü OBP net",icon:"user"},
  {id:"account",title:"Hesap ve senkron",description:"Hesabın ve cihazlar arası eşitleme",keywords:"giriş çıkış google bulut oturum güvenlik",icon:"user"},
  {id:"appearance",title:"Görünüm ve tema",description:"Renkler ve yazı boyutu",keywords:"mavi sistem koyu gece açık orman defter font görünüm",icon:"palette"},
  {id:"study",title:"Çalışma ve program",description:"Günlük hedefin ve ekran tercihlerin",keywords:"kişiselleştir sınav kapsamı tyt ayt ydt bugün kart soru hedef program",icon:"calendar"},
  {id:"notifications",title:"Bildirimler",description:"Odak, tekrar ve gün sonu hatırlatmaları",keywords:"izin pomodoro akşam saat hatırlatıcı bildirim",icon:"bell"},
  {id:"coach",title:"Koç bağlantısı",description:"Koç kodun ve program paylaşımı",keywords:"kod koçum bağlantı paylaş öğrenci",icon:"chat"},
  {id:"data",title:"Veri ve yedek",description:"Kayıtlarını yönet ve yedekle",keywords:"dışa aktar içe al yedek kurtar veri gizlilik sil",icon:"database"},
  {id:"application",title:"Uygulama bilgileri",description:"Sürüm, yardım ve uygulama araçları",keywords:"hakkında sistem sağlık destek örnek demo kurulum",icon:"info"}
];
const icons={
  user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3Z"/>',
  palette:'<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1.4-3.4 1.5 1.5 0 0 1 1.1-2.6H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z"/><circle cx="7.5" cy="10" r=".7"/><circle cx="11" cy="7" r=".7"/><circle cx="15.5" cy="8" r=".7"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  chat:'<path d="M21 11a8 8 0 0 1-8 8H9l-6 3 1.5-6A8 8 0 1 1 21 11Z"/>',
  database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  back:'<path d="m15 5-7 7 7 7"/>'
};
const icon=name=>`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.info}</svg>`;

function styles(){
  if(document.getElementById("yksModernSettingsStyles"))return;
  const s=document.createElement("style");s.id="yksModernSettingsStyles";
  s.textContent=`
/* Refined settings: one overview, one detail, shared theme tokens. */
.yms-wrap,.yms-modal{--ys-surface:var(--rb-surface,var(--card,#fff));--ys-alt:var(--rb-surface-alt,var(--card-2,#f0f5fc));--ys-ink:var(--rb-ink,var(--label,#10203f));--ys-muted:var(--rb-muted,var(--label-2,#62718b));--ys-line:var(--rb-line,var(--line,#e4eaf3));--ys-accent:var(--rb-accent,var(--accent,#1266ee));--ys-soft:var(--rb-accent-soft,var(--accent-soft,#eaf2ff));color:var(--ys-ink)}
.yms-wrap{max-width:840px;margin:16px auto 28px}.yms-wrap [hidden],.yms-modal [hidden],[data-yms-hidden="true"]{display:none!important}
#mrp_ayar:has(.yms-wrap)>.v30-subhead{display:grid!important;gap:11px;margin:0 auto 18px!important;padding:0!important;max-width:840px;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important}#mrp_ayar:has(.yms-wrap)>.v30-subhead .v30-back{justify-self:start;padding:5px 0!important;background:transparent!important;border:0!important;color:var(--rb-accent,var(--accent))!important;font-size:14px!important;font-weight:500!important;min-height:32px!important}#mrp_ayar:has(.yms-wrap)>.v30-subhead h1{font-size:32px!important;line-height:1.15;font-weight:700;letter-spacing:-.04em}#mrp_ayar:has(.yms-wrap:not([data-category="overview"]))>.v30-subhead{display:none!important}
#mrp_ayar:has(.yms-wrap)>.v30-subhead p{display:none}.yms-search{position:relative;display:flex;align-items:center;gap:10px;margin-bottom:18px;padding:0 15px;border:1px solid transparent;border-radius:15px;background:var(--ys-alt);color:var(--ys-muted)}.yms-search:focus-within{border-color:var(--ys-accent)}.yms-search svg{flex:none;width:21px}.yms-search input{width:100%;min-width:0;border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;color:var(--ys-ink);padding:14px 0!important;margin:0!important;font:inherit;font-size:14px;outline:none!important}.yms-search input::placeholder{color:var(--ys-muted);opacity:1}
.yms-profile,.yms-category-list{background:var(--ys-surface);border:1px solid var(--ys-line);border-radius:20px;box-shadow:var(--rb-shadow,0 4px 18px #1d396504)}.yms-profile{display:flex;align-items:center;gap:15px;width:100%;margin:0 0 16px;padding:20px;text-align:left;font:inherit;color:inherit;cursor:pointer}.yms-avatar{width:58px;height:58px;display:grid;place-items:center;flex:none;border-radius:50%;background:var(--ys-soft);color:var(--ys-accent);font-size:20px;font-weight:700}.yms-profile-copy{display:grid;gap:5px;min-width:0;flex:1}.yms-profile-copy b{font-size:18px;font-weight:700;letter-spacing:-.025em;overflow-wrap:anywhere}.yms-profile-copy small{font-size:13px;color:var(--ys-muted)}.yms-chevron{flex:none;color:var(--ys-muted)}.yms-chevron svg{width:17px;height:17px}
.yms-category-list{overflow:hidden;padding:0 18px}.yms-category{position:relative;display:flex;align-items:center;gap:15px;width:100%;min-height:80px;padding:17px 0;border:0;border-bottom:1px solid var(--ys-line);border-radius:0;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer}.yms-category:last-child{border-bottom:0}.yms-category-icon{display:grid;place-items:center;width:30px;flex:none;color:var(--ys-ink)}.yms-category-icon svg{width:26px;height:26px}.yms-category-copy{display:grid;gap:5px;min-width:0;flex:1}.yms-category-copy b{font-size:14px;font-weight:650;letter-spacing:-.015em}.yms-category-copy small{font-size:12px;line-height:1.45;color:var(--ys-muted)}.yms-theme-value{color:var(--ys-accent);font-size:11px;text-align:right;max-width:75px}.yms-app-row{display:flex;align-items:center;gap:12px;width:100%;padding:15px 17px;margin-top:14px;border:0;border-radius:15px;background:var(--ys-alt);color:var(--ys-muted);font:inherit;font-size:12px;text-align:left;cursor:pointer}.yms-app-row>span:nth-child(2){flex:1}.yms-app-row svg{width:21px;height:21px}.yms-no-results{margin:18px 0;padding:24px;text-align:center;border-radius:18px;background:var(--ys-surface);color:var(--ys-muted);font-size:13px;line-height:1.6}
.yms-profile:hover,.yms-category:hover{background:color-mix(in srgb,var(--ys-soft) 28%,var(--ys-surface))}.yms-profile:focus-visible,.yms-category:focus-visible,.yms-app-row:focus-visible,.yms-wrap button:focus-visible,.yms-modal button:focus-visible{outline:2px solid var(--ys-accent);outline-offset:3px}
#mrp_ayar .yms-search input,#mrp_ayar .yms-search input:focus{border:0!important;outline:0!important;box-shadow:none!important;background:transparent!important;min-height:48px;font-weight:400!important}
.yms-wrap .yms-actions .primary,.yms-modal .yms-actions .primary{color:var(--rb-on-accent,#fff)}
.yms-detail-back{display:inline-flex;align-items:center;gap:4px;padding:8px 0;margin:0 0 10px;border:0;background:transparent;color:var(--ys-accent);font:inherit;font-size:14px;font-weight:600;cursor:pointer}.yms-detail-back svg{width:19px;height:19px}.yms-detail-heading{margin-bottom:21px}.yms-detail-heading h2{margin:0 0 7px;font-size:25px;font-weight:700;letter-spacing:-.035em;line-height:1.2}.yms-detail-heading p{margin:0;max-width:540px;color:var(--ys-muted);font-size:13px;line-height:1.6}.yms-detail-heading h2:focus{outline:none}.yms-section{display:grid;gap:16px;min-width:0}.yms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.yms-card{min-width:0;padding:19px;border:1px solid var(--ys-line);border-radius:20px;background:var(--ys-surface)}.yms-title{margin:0 0 8px;font-size:13px;font-weight:650;color:var(--ys-ink)}.yms-row{display:flex;justify-content:space-between;gap:15px;padding:12px 0;border-bottom:1px solid var(--ys-line);font-size:13px;line-height:1.5}.yms-row:last-child{border-bottom:0}.yms-row>span{color:var(--ys-muted)}.yms-row b{font-weight:600;text-align:right;max-width:64%;overflow-wrap:anywhere}.yms-note{margin:10px 0 0;color:var(--ys-muted);font-size:12px;line-height:1.6}.yms-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:16px}.yms-actions button,.yms-edit{min-height:44px;padding:10px 15px;border:1px solid var(--ys-line);border-radius:12px;background:var(--ys-alt);color:var(--ys-ink);font:inherit;font-size:13px;font-weight:600;cursor:pointer}.yms-actions .primary{background:var(--ys-accent);border-color:var(--ys-accent);color:#fff}.yms-actions .danger{color:var(--danger,var(--red,#b42318))}.yms-actions button:disabled{opacity:.5;cursor:not-allowed}.yms-exam{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.yms-exam div{padding:12px;border-radius:12px;background:var(--ys-alt);font-size:12px;line-height:1.7}.yms-exam b{display:block;font-size:13px}
.yms-notif-item{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:14px 0;border-bottom:1px solid var(--ys-line)}.yms-notif-item>span{display:grid;gap:5px}.yms-notif-item b{font-size:13px;font-weight:600}.yms-notif-item small{font-size:12px;line-height:1.5;color:var(--ys-muted)}.yms-toggle{position:relative;flex:none;width:46px;min-width:46px;height:28px;border:0;border-radius:99px;background:color-mix(in srgb,var(--ys-muted) 35%,var(--ys-surface));cursor:pointer}.yms-toggle::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 4px #0002;transition:transform .16s}.yms-toggle.is-on{background:var(--ys-accent)}.yms-toggle.is-on::after{transform:translateX(18px)}.yms-time-row{display:flex;gap:10px;align-items:center;margin-top:8px}.yms-time-row input{width:160px;max-width:100%;margin:0!important}.yms-status-pill{display:inline-block;padding:5px 9px;border-radius:8px;background:var(--ys-alt);color:var(--ys-muted);font-size:11px}.yms-status-pill.ok{color:var(--green-ink,#087443)}
.yms-action-grid{overflow:hidden;border:1px solid var(--ys-line);border-radius:20px;background:var(--ys-surface)}.yms-action-tile{display:flex;align-items:center;gap:12px;width:100%;padding:16px 18px;border:0;border-bottom:1px solid var(--ys-line);border-radius:0;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer}.yms-action-tile:last-child{border-bottom:0}.yms-action-tile>span:first-child{display:grid;gap:5px;flex:1}.yms-action-tile b{font-size:13px;font-weight:600}.yms-action-tile small{font-size:12px;color:var(--ys-muted);line-height:1.5}.yms-empty{padding:20px;border:1px solid var(--ys-line);border-radius:18px;background:var(--ys-surface);font-size:13px;color:var(--ys-muted);line-height:1.6}.yms-advanced{border:1px solid var(--ys-line);border-radius:18px;background:var(--ys-surface);padding:16px}.yms-advanced summary{cursor:pointer;font-size:13px;font-weight:600}.yms-advanced .yms-action-grid{border:0;border-radius:0;margin-top:10px}.yms-advanced .yms-action-tile{padding:14px 0}
.yms-theme-host>.card{margin:0!important;border-radius:20px!important;box-shadow:none!important;background:var(--ys-surface)!important;border:1px solid var(--ys-line)!important;padding:18px!important}.yms-theme-host>.card>.eyebrow:first-child{display:none}.yms-theme-host #themeGrid{margin:0!important;gap:10px!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}.yms-theme-host .theme-card{min-height:70px!important;box-shadow:none!important;border-radius:14px!important}.yms-personal-host>.v43-personalization{margin:0!important;border:0!important;border-radius:0!important;padding:0!important;background:transparent!important;box-shadow:none!important}.yms-personal-host .v43-personal-head>.eyebrow{display:none}.yms-coach-host .scl-settings{margin:0;padding:18px;border-radius:20px;background:var(--ys-surface);border:1px solid var(--ys-line);color:var(--ys-ink)}.yms-account-host #cloudSyncBox{margin:0!important}.yms-account-host #yksAccountSettingsCard{margin-top:12px}.yms-account-host:has(#cloudSyncBox) #yksAccountSettingsCard{display:none!important}.yms-field{display:grid;gap:7px}.yms-field label{font-size:12px;font-weight:600;color:var(--ys-muted)}.yms-field input,.yms-field select,.yms-time-row input{box-sizing:border-box;min-height:46px;width:100%;padding:11px 12px;border:1px solid var(--ys-line);border-radius:12px;background:var(--ys-alt);color:var(--ys-ink);font:inherit;font-size:14px}
.yms-modal{position:fixed;inset:0;z-index:14000;display:grid;place-items:center;padding:20px;background:#0b173e70;backdrop-filter:blur(6px)}.yms-dialog{width:min(580px,100%);max-height:90dvh;overflow:auto;overscroll-behavior:contain;box-sizing:border-box;padding:24px;border:1px solid var(--ys-line);border-radius:24px;background:var(--ys-surface);box-shadow:0 20px 60px #091b4826}.yms-dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:20px}.yms-dialog-head h2{margin:0;font-size:23px;letter-spacing:-.03em}.yms-dialog-head .yms-edit{display:grid;place-items:center;width:40px;min-height:40px;padding:0;font-size:24px;background:transparent;border:0}.yms-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.yms-field.full{grid-column:1/-1}.yms-editor-error{color:var(--danger,var(--red,#b42318));font-size:13px;line-height:1.5}
@media(max-width:620px){.yms-wrap{margin-top:10px}.yms-profile{padding:18px;gap:13px}.yms-avatar{width:56px;height:56px}.yms-category-list{padding:0 16px}.yms-category{gap:13px;min-height:77px}.yms-category-copy b{font-size:14px}.yms-category-copy small{font-size:11.5px}.yms-category-icon{width:26px}.yms-category-icon svg{width:25px}.yms-grid{grid-template-columns:1fr}.yms-detail-heading h2{font-size:24px}.yms-card{padding:17px}.yms-exam{grid-template-columns:1fr}.yms-exam div{display:flex;gap:12px;align-items:center}.yms-modal{align-items:end;padding:0}.yms-dialog{width:100%;max-height:92dvh;border-radius:24px 24px 0 0;padding:22px 20px calc(22px + env(safe-area-inset-bottom))}.yms-form{gap:13px}.yms-theme-value{display:none}}
@media(max-width:360px){.yms-form{grid-template-columns:1fr}.yms-profile-copy b{font-size:16px}.yms-profile{padding:16px}.yms-category-list{padding:0 14px}}
@media(pointer:coarse){.yms-toggle{height:44px;background:transparent!important}.yms-toggle::before{content:"";position:absolute;left:0;right:0;top:8px;height:28px;border-radius:99px;background:color-mix(in srgb,var(--ys-muted) 35%,var(--ys-surface))}.yms-toggle.is-on::before{background:var(--ys-accent)}.yms-toggle::after{top:11px}.yms-detail-back,.yms-dialog-head .yms-edit{min-height:44px}.yms-dialog-head .yms-edit{width:44px}}
@media(prefers-reduced-motion:reduce){.yms-toggle::after{transition:none}}
`;
  document.head.append(s);
}

function account(){const title=document.querySelector("[data-account-title]")?.textContent?.trim()||"",meta=document.querySelector("[data-account-meta]")?.textContent?.trim()||"";const email=(meta.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)||[])[0]||"";const signedIn=Boolean(email||(title&&title!=="Giriş yapılmadı"));return{title,email,meta,signedIn}}
function initials(name){return txt(name,80).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toLocaleUpperCase("tr-TR")).join("")||"YK"}
function syncText(){return ["cloudSyncText","cloudSyncMeta"].map(id=>document.getElementById(id)?.textContent?.trim()).filter(Boolean).join(" · ")||"Bulut durumu hazırlanıyor"}
function appVersion(){return document.documentElement.dataset.appVersion||document.getElementById("appVersionLabel")?.textContent?.trim()||"YKS Defterim"}
function enforceSettingsOnlyTheme(){document.getElementById("themeBtn")?.remove();document.documentElement.dataset.themeControl="settings-only"}
function hideCardFor(id,reason){const card=document.getElementById(id)?.closest?.(".card");if(card){card.hidden=true;card.dataset.ymsHidden="true";card.dataset.ymsHiddenReason=reason}}
function hideLegacySettings(){
  const panel=document.getElementById("mrp_ayar");if(!panel)return;
  enforceSettingsOnlyTheme();
  hideCardFor("nameInput","modern-profile");hideCardFor("sozToggle","legacy-appearance");hideCardFor("ytSrc","video-settings-private");hideCardFor("notifStatus","modern-notifications");
  const demoCard=panel.querySelector('button[onclick="loadDemo()"]')?.closest?.(".card");if(demoCard){demoCard.hidden=true;demoCard.dataset.ymsHidden="true";demoCard.dataset.ymsHiddenReason="modern-app-tools"}
  ["roleSeg","roleHint","simpleHint"].forEach(id=>{const node=document.getElementById(id);if(node){node.hidden=true;node.dataset.ymsHidden="true"}});
  const roleLabel=document.getElementById("roleSeg")?.previousElementSibling;if(roleLabel?.tagName==="LABEL")roleLabel.hidden=true;
  document.getElementById("themeGrid")?.closest(".card")?.querySelectorAll("label").forEach(label=>{if(["Kullanım modu","Bu cihazı kim kullanıyor"].includes(label.textContent?.trim())){label.hidden=true;label.dataset.ymsHidden="true"}});
  const simple=document.getElementById("simpleToggle")?.closest(".switch");if(simple)simple.hidden=true;
  const sub=panel.querySelector(".v30-subhead p");if(sub)sub.textContent="Uygulamanı kendine göre ayarla";
  panel.querySelectorAll(".note").forEach(note=>{if(note.textContent?.includes("YKS 2027 tarihi")){note.hidden=true;note.dataset.ymsHidden="true"}});
}
function polishPersonalization(){
  const panel=document.getElementById("v43Personalization");if(!panel)return;
  panel.dataset.ymsPersonalization="polished";
  const title=panel.querySelector(".v43-personal-head h2");if(title)title.textContent="Kendine göre ayarla";
  const hint=panel.querySelector(".v43-personal-head .hint");if(hint)hint.textContent="Sınav kapsamını ve Bugün ekranındaki yardımcı alanları buradan düzenle. Kayıtlı çalışma verilerin değişmez.";
  const reset=panel.querySelector(".v43-personal-head button");if(reset)reset.textContent="Ayarları sıfırla";
  const host=document.querySelector("[data-yms-personal-slot]");if(host&&!host.contains(panel))host.replaceChildren(panel);
}
function adoptPanels(root){
  const themeCard=document.getElementById("themeGrid")?.closest?.(".card"),themeSlot=root.querySelector("[data-yms-theme-slot]");
  if(themeCard&&themeSlot&&!themeSlot.contains(themeCard)){themeCard.hidden=false;delete themeCard.dataset.ymsHidden;themeSlot.replaceChildren(themeCard)}
  polishPersonalization();
  for(const [id,selector] of [["studentCoachCodeSettings","[data-yms-coach-slot]"],["cloudSyncBox","[data-yms-account-slot]"],["yksAccountSettingsCard","[data-yms-account-slot]"]]){
    const node=document.getElementById(id),host=root.querySelector(selector);if(node&&host&&!host.contains(node))host.append(node);
  }
  const coach=root.querySelector("[data-yms-coach-empty]");if(coach)coach.hidden=Boolean(document.getElementById("studentCoachCodeSettings"));
  const fallback=root.querySelector("[data-yms-account-empty]");if(fallback)fallback.hidden=Boolean(document.getElementById("cloudSyncBox")||document.getElementById("yksAccountSettingsCard"));
}
function notifEnabled(id){return Boolean(document.getElementById(id)?.classList.contains("on"))}
function notifPermission(){try{if(!("Notification" in window))return"unsupported";return Notification.permission||"default"}catch{return"unsupported"}}
function notifPermissionText(){return {granted:"İzin verildi",denied:"Tarayıcı ayarlarında kapalı",unsupported:"Bu cihazda desteklenmiyor",default:"İzin bekleniyor"}[notifPermission()]||"İzin bekleniyor"}
function notifTime(){return document.getElementById("notifTime")?.value||"21:00"}
function notifButton(kind,label,detail,id){return `<div class="yms-notif-item"><span><b>${esc(label)}</b><small>${esc(detail)}</small></span><button class="yms-toggle" type="button" role="switch" aria-checked="false" aria-label="${esc(label)}" data-yms-notif="${kind}" data-yms-notif-source="${id}"></button></div>`}
const binding=(key)=>`<b data-yms-value="${key}"></b>`;
const row=(label,key)=>`<div class="yms-row"><span>${label}</span>${binding(key)}</div>`;
const action=(key,title,detail)=>`<button class="yms-action-tile" type="button" data-yms-${key}><span><b>${title}</b><small>${detail}</small></span><span class="yms-chevron">${icon("chevron")}</span></button>`;
const section=(id,body)=>`<section class="yms-section" id="yms${id[0].toUpperCase()+id.slice(1)}" data-yms-section="${id}" hidden>${body}</section>`;
function categoryButton(item){return `<button class="yms-category" type="button" data-yms-category="${item.id}"><span class="yms-category-icon">${icon(item.icon)}</span><span class="yms-category-copy"><b>${item.title}</b><small>${item.description}</small></span>${item.id==="appearance"?'<span class="yms-theme-value" data-yms-value="theme"></span>':""}<span class="yms-chevron">${icon("chevron")}</span></button>`}
function markup(){return `
<div data-yms-overview>
  <label class="yms-search">${icon("search")}<input id="ymsSearch" type="search" placeholder="Ayarlarda ara" aria-label="Ayarlarda ara" autocomplete="off"></label>
  <button class="yms-profile" type="button" data-yms-category="profile"><span class="yms-avatar" data-yms-value="initials"></span><span class="yms-profile-copy">${binding("name")}<small>Profil ve hedefler</small></span><span class="yms-chevron">${icon("chevron")}</span></button>
  <div class="yms-category-list">${categories.filter(c=>c.id!=="profile"&&c.id!=="application").map(categoryButton).join("")}</div>
  <button class="yms-app-row" type="button" data-yms-category="application">${icon("info")}<span>Uygulama bilgileri</span><span data-yms-value="version"></span><span class="yms-chevron">${icon("chevron")}</span></button>
  <p class="yms-no-results" role="status" data-yms-no-results hidden>Bu aramayla eşleşen ayar yok.<br>“Tema”, “yedek” veya “hedef” arayabilirsin.</p>
</div>
<div data-yms-detail hidden>
  <button class="yms-detail-back" type="button" data-yms-back>${icon("back")}Ayarlar</button>
  <div class="yms-detail-heading"><h2 id="ymsDetailTitle" tabindex="-1"></h2><p id="ymsDetailDescription"></p></div>
  ${section("profile",`<div class="yms-grid"><section class="yms-card"><h3 class="yms-title">Kişisel bilgiler</h3>${row("Ad Soyad","name")}${row("E-posta","email")}${row("Alan / puan türü","track")}${row("OBP","obp")}${row("Haftalık çalışma","days")}</section><section class="yms-card"><h3 class="yms-title">YKS hedeflerim</h3>${row("TYT hedef net","tyt")}${row("AYT hedef net","ayt")}${row("Hedef üniversite","university")}${row("Hedef bölüm","department")}</section></div><div class="yms-actions"><button class="primary" type="button" data-yms-edit>Profil ve hedefleri düzenle</button></div><div class="yms-card"><h3 class="yms-title">2027 YKS tarihleri</h3><div class="yms-exam"><div><b>TYT</b>19 Haziran 2027 · 10:15</div><div><b>AYT</b>20 Haziran 2027 · 10:15</div><div><b>YDT</b>20 Haziran 2027 · 15:45</div></div><p class="yms-note">Sınav tarihleri bilgi amaçlı sabittir; profil ayarından değiştirilmez.</p></div>`)}
  ${section("account",`<div class="yms-account-host" data-yms-account-slot></div><div class="yms-empty" data-yms-account-empty>Hesap bağlantısı hazırlanıyor. İnternet bağlantını kontrol ederek tekrar deneyebilirsin.<div class="yms-actions"><button type="button" data-yms-account-refresh>Durumu yenile</button></div></div>`)}
  ${section("appearance",'<div class="yms-theme-host" data-yms-theme-slot></div>')}
  ${section("study",`<section class="yms-card"><h3 class="yms-title">Günlük çalışma hedefi</h3><label class="yms-field" for="ymsQuestionTarget"><span>Günlük soru sayısı</span><input id="ymsQuestionTarget" type="number" min="0" max="10000" step="1" inputmode="numeric"></label><div class="yms-actions"><button class="primary" type="button" data-yms-target-save>Hedefi kaydet</button><button type="button" data-yms-program>Programıma git</button></div><p class="yms-note" role="status" data-yms-target-status></p></section><div class="yms-personal-host" data-yms-personal-slot><div class="yms-empty">Ekran tercihlerin hazırlanıyor…</div></div>`)}
  ${section("notifications",`<div><span class="yms-status-pill" data-yms-notif-status></span></div><div class="yms-card"><div class="yms-notif-list">${notifButton("pomo","Pomodoro bitişi","Odak oturumu veya mola tamamlandığında haber ver","notifPomo")}${notifButton("review","Tekrar zamanı","Planlı konu tekrarlarını hatırlat","notifReview")}${notifButton("evening","Gün sonu hatırlatması","Günün kaydını tamamlamayı hatırlat","notifEvening")}</div><label class="yms-note" for="ymsNotifTime">Akşam hatırlatma saati</label><div class="yms-time-row"><input id="ymsNotifTime" type="time" aria-label="Akşam hatırlatma saati"><button class="yms-edit" type="button" data-yms-notif-time>Kaydet</button></div><p class="yms-note" role="status" data-yms-time-status></p><div class="yms-actions"><button type="button" data-yms-notif-permission>Bildirim izni ver</button><button type="button" data-yms-notif-test>Deneme bildirimi</button><button type="button" data-yms-notif-refresh>Durumu yenile</button></div></div>`)}
  ${section("coach",'<div class="yms-coach-host" data-yms-coach-slot></div><div class="yms-empty" data-yms-coach-empty>Koç kodunu oluşturmak ve çalışma bilgilerini paylaşmak için öğrenci hesabınla giriş yap.<div class="yms-actions"><button class="primary" type="button" data-yms-open-account>Hesabıma git</button></div></div>')}
  ${section("data",`<div class="yms-card"><h3 class="yms-title">Çalışmaların sende kalsın</h3><p class="yms-note">Veri merkezinde yedek oluşturabilir, dosyadan geri yükleyebilir ve cihazdaki kayıtlarını yönetebilirsin.</p><div class="yms-actions"><button class="primary" type="button" data-yms-data>Veri ve yedek merkezini aç</button></div></div>`)}
  ${section("application",`<div class="yms-card">${row("YKS Defterim","version")}</div><div class="yms-action-grid">${action("about","Hakkında","Sürüm ve uygulama bilgileri")}${action("system","Sistem durumu","Bağlantı ve uygulama sağlığı")}</div><details class="yms-advanced"><summary>Kurulum ve deneme araçları</summary><p class="yms-note">Örnek veriler gerçek çalışma kayıtlarının yerine kullanılmamalı.</p><div class="yms-action-grid">${action("wizard","Kurulumu tekrar aç","İlk kurulum adımlarını gözden geçir")}${action("demo-load","Örnek veri yükle","Uygulamayı örnek çalışmalarla dene")}${action("demo-clear","Örnek veriyi temizle","Yüklediğin deneme verilerini kaldır")}</div></details>`)}
</div>`}

function normalizedSearch(value){return String(value||"").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ı/g,"i").trim()}
function matchingCategories(query){const words=normalizedSearch(query).split(/\s+/).filter(Boolean);return categories.filter(item=>{const text=normalizedSearch(`${item.title} ${item.description} ${item.keywords}`);return words.every(word=>text.includes(word))}).map(item=>item.id)}
function filterCategories(root){
  const matches=new Set(matchingCategories(view.query));
  root.querySelectorAll("[data-yms-category]").forEach(button=>{button.hidden=!matches.has(button.dataset.ymsCategory)});
  const list=root.querySelector(".yms-category-list");if(list)list.hidden=!categories.some(c=>c.id!=="profile"&&c.id!=="application"&&matches.has(c.id));
  const empty=root.querySelector("[data-yms-no-results]");if(empty)empty.hidden=matches.size>0;
}
function showCategory(category="",focus=true){
  const root=document.getElementById(ROOT_ID);if(!root)return false;
  const item=categories.find(c=>c.id===category);if(category&&!item)return false;
  refresh(root);
  if(category&&!view.category){view.overviewScroll=window.scrollY||0;view.returnTo=category}
  view.category=category;root.dataset.category=category||"overview";
  root.querySelector("[data-yms-overview]").hidden=Boolean(category);
  root.querySelector("[data-yms-detail]").hidden=!category;
  root.querySelectorAll("[data-yms-section]").forEach(node=>{node.hidden=node.dataset.ymsSection!==category});
  if(item){
    root.querySelector("#ymsDetailTitle").textContent=item.title;
    root.querySelector("#ymsDetailDescription").textContent=item.description;
    if(focus){root.scrollIntoView?.({block:"start",behavior:"auto"});root.querySelector("#ymsDetailTitle").focus?.({preventScroll:true})}
  }else if(focus){
    const target=root.querySelector(`[data-yms-category="${view.returnTo}"]:not([hidden])`)||root.querySelector("#ymsSearch");
    target?.focus?.({preventScroll:true});window.scrollTo?.({top:view.overviewScroll,behavior:"auto"});
  }
  return true;
}
function setText(node,value){const next=String(value??"");if(node&&node.textContent!==next)node.textContent=next}
function refresh(root){
  const s=st(),a=account(),name=val(s.name||(a.signedIn?a.title:""),"YKS öğrencisi");
  const values={name,initials:initials(name),email:a.email||"—",track:val(s.puanTuru),obp:Number(s.obp)>0?s.obp:"—",days:`${s.workdays||6} gün`,tyt:net(s.targetNetTYT??s.targetNet),ayt:net(s.targetNetAYT),university:val(s.targetUniversity),department:val(s.targetDepartment),version:appVersion(),theme:document.querySelector("#themeGrid .theme-card.on b")?.textContent||({auto:"Sistem",paper:"Defter",night:"Gece",forest:"Orman",ocean:"Okyanus",lavender:"Lavanta",sunset:"Günbatımı",graphite:"Grafit"}[s.theme]||"Sistem")};
  root.querySelectorAll("[data-yms-value]").forEach(node=>setText(node,values[node.dataset.ymsValue]));
  root.querySelectorAll("[data-yms-notif]").forEach(button=>{const on=notifEnabled(button.dataset.ymsNotifSource);button.classList.toggle("is-on",on);button.setAttribute("aria-checked",String(on))});
  const permission=notifPermission(),status=root.querySelector("[data-yms-notif-status]");setText(status,notifPermissionText());status?.classList.toggle("ok",permission==="granted");
  const permit=root.querySelector("[data-yms-notif-permission]");if(permit){permit.disabled=permission==="granted"||permission==="unsupported";setText(permit,permission==="granted"?"Bildirim izni açık":"Bildirim izni ver")}
  const time=root.querySelector("#ymsNotifTime");if(time&&!view.timeDirty&&document.activeElement!==time)time.value=notifTime();
  const target=root.querySelector("#ymsQuestionTarget");if(target&&target.dataset.dirty!=="true"&&document.activeElement!==target)target.value=String(s.target||0);
}
function bind(root){
  const on=(selector,callback)=>root.querySelectorAll(selector).forEach(button=>button.addEventListener("click",callback));
  on("[data-yms-category]",event=>showCategory(event.currentTarget.dataset.ymsCategory));
  on("[data-yms-back]",()=>showCategory(""));
  root.querySelector("#ymsSearch").addEventListener("input",event=>{view.query=event.target.value;filterCategories(root)});
  on("[data-yms-edit]",openEditor);
  on("[data-yms-open-account]",()=>showCategory("account"));
  on("[data-yms-account-refresh]",()=>render());
  on("[data-yms-notif]",event=>{window.toggleNotif?.(event.currentTarget.dataset.ymsNotif);refresh(root)});
  on("[data-yms-notif-permission]",()=>{try{Promise.resolve(window.askNotif?.()).then(()=>refresh(root),()=>refresh(root))}catch{refresh(root)}});
  root.querySelector("#ymsNotifTime").addEventListener("input",()=>{view.timeDirty=true});
  on("[data-yms-notif-time]",()=>{const input=root.querySelector("#ymsNotifTime"),legacy=document.getElementById("notifTime");if(!input.value){setText(root.querySelector("[data-yms-time-status]"),"Bir saat seç.");return}if(legacy)legacy.value=input.value;window.saveEveningAt?.();view.timeDirty=false;setText(root.querySelector("[data-yms-time-status]"),"Hatırlatma saati kaydedildi.");refresh(root)});
  on("[data-yms-notif-test]",()=>window.testNotif?.());
  on("[data-yms-notif-refresh]",()=>{window.notifDiag?.();window.renderNotifSettings?.();refresh(root)});
  const target=root.querySelector("#ymsQuestionTarget");target.addEventListener("input",()=>{target.dataset.dirty="true"});
  on("[data-yms-target-save]",()=>{const status=root.querySelector("[data-yms-target-status]");if(!target.checkValidity()||target.value===""){setText(status,"0 ile 10.000 arasında bir soru hedefi gir.");target.reportValidity();return}const s=st(),previous=s.target;s.target=Math.round(num(target.value,0,10000));if(!save()){s.target=previous;setText(status,"Hedef kaydedilemedi. Tekrar dene.");return}target.dataset.dirty="false";const legacy=document.getElementById("targetInput");if(legacy)legacy.value=String(s.target);window.renderHome?.();setText(status,"Günlük soru hedefin kaydedildi.");refresh(root)});
  on("[data-yms-program]",()=>window.go?.("program"));
  on("[data-yms-data]",()=>{if(typeof window.v30Action==="function")window.v30Action("data");else window.setMoreTab?.("veri")});
  on("[data-yms-system]",()=>window.v30Action?.("system"));on("[data-yms-about]",()=>window.v30Action?.("about"));
  on("[data-yms-demo-load]",()=>window.loadDemo?.());on("[data-yms-demo-clear]",()=>window.clearDemo?.());on("[data-yms-wizard]",()=>window.openWizard?.());
  root.addEventListener("change",()=>{refresh(root)});
}
let observedPanel=null,observer=null,refreshQueued=false;
function queueRefresh(){if(refreshQueued)return;refreshQueued=true;queueMicrotask(()=>{refreshQueued=false;render()})}
function observePanels(panel){
  if(observedPanel===panel||typeof MutationObserver==="undefined")return;
  observer?.disconnect();observedPanel=panel;
  observer=new MutationObserver(records=>{
    if(records.some(record=>Array.from(record.addedNodes).some(node=>node.nodeType===1&&["v43Personalization","studentCoachCodeSettings","cloudSyncBox","yksAccountSettingsCard"].some(id=>node.id===id||node.querySelector?.(`#${id}`)))))queueRefresh();
  });
  observer.observe(document.getElementById("more")||panel,{childList:true,subtree:true});
}
function render(){
  styles();const panel=document.getElementById("mrp_ayar");if(!panel)return false;
  hideLegacySettings();let root=document.getElementById(ROOT_ID);
  if(!root){
    root=document.createElement("div");root.id=ROOT_ID;root.className="yms-wrap";root.innerHTML=markup();
    const head=panel.querySelector(".v30-subhead");if(head)head.after(root);else panel.prepend(root);
    bind(root);root.querySelector("#ymsSearch").value=view.query;filterCategories(root);showCategory(view.category,false);
  }
  adoptPanels(root);refresh(root);observePanels(panel);return true;
}

function openEditor(){
  styles();document.getElementById(MODAL_ID)?.remove();const s=st(),opener=document.activeElement,w=document.createElement("div");w.id=MODAL_ID;w.className="yms-modal";
  w.innerHTML=`<div class="yms-dialog" role="dialog" aria-modal="true" aria-labelledby="ymsEditorTitle"><div class="yms-dialog-head"><h2 id="ymsEditorTitle">Profil ve hedefler</h2><button class="yms-edit" type="button" data-close aria-label="Düzenlemeyi kapat">×</button></div><form class="yms-editor-form"><div class="yms-form">
  <div class="yms-field full"><label for="ymsName">Ad Soyad</label><input id="ymsName" name="name" maxlength="80" value="${esc(s.name||"")}" autocomplete="name"></div>
  <div class="yms-field"><label for="ymsTrack">Alan / puan türü</label><select id="ymsTrack" name="track"><option value="SAY">SAY</option><option value="EA">EA</option><option value="SÖZ">SÖZ</option><option value="DİL">DİL</option></select></div>
  <div class="yms-field"><label for="ymsDays">Haftada çalışma günü</label><input id="ymsDays" name="days" type="number" min="1" max="7" required value="${esc(String(s.workdays||6))}"></div>
  <div class="yms-field"><label for="ymsTyt">TYT hedef net</label><input id="ymsTyt" name="tyt" type="number" min="0" max="120" step="0.25" value="${esc(String(s.targetNetTYT??s.targetNet??""))}"></div>
  <div class="yms-field"><label for="ymsAyt">AYT hedef net</label><input id="ymsAyt" name="ayt" type="number" min="0" max="80" step="0.25" value="${esc(String(s.targetNetAYT??""))}"></div>
  <div class="yms-field full"><label for="ymsUni">Hedef üniversite / okul</label><input id="ymsUni" name="uni" maxlength="120" value="${esc(s.targetUniversity||"")}" placeholder="Örn. İstanbul Teknik Üniversitesi"></div>
  <div class="yms-field full"><label for="ymsDept">Hedef bölüm</label><input id="ymsDept" name="dept" maxlength="120" value="${esc(s.targetDepartment||"")}" placeholder="Örn. Bilgisayar Mühendisliği"></div>
  <div class="yms-field"><label for="ymsObp">OBP (0–100)</label><input id="ymsObp" name="obp" type="number" min="0" max="100" step="0.01" value="${esc(String(s.obp||""))}"></div></div>
  <p class="yms-editor-error" role="alert" hidden></p><div class="yms-actions"><button type="button" data-close>Vazgeç</button><button class="primary" type="submit">Değişiklikleri kaydet</button></div></form></div>`;
  w.querySelector('select[name="track"]').value=["SAY","EA","SÖZ","DİL"].includes(s.puanTuru)?s.puanTuru:"SAY";
  const close=()=>{w.remove();opener?.focus?.({preventScroll:true})};
  w.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",close));
  w.addEventListener("click",event=>{if(event.target===w)close()});
  w.addEventListener("keydown",event=>{
    if(event.key==="Escape"){event.preventDefault();close();return}
    if(event.key!=="Tab")return;
    const focusable=Array.from(w.querySelectorAll("button,input,select")),first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  });
  w.querySelector("form").addEventListener("submit",event=>{
    event.preventDefault();const q=n=>w.querySelector(`[name="${n}"]`),s=st(),previous={};
    for(const key of ["name","puanTuru","workdays","targetNetTYT","targetNetAYT","targetNet","targetUniversity","targetDepartment","obp"])previous[key]=s[key];
    s.name=txt(q("name").value,80);s.puanTuru=q("track").value;s.workdays=Math.round(num(q("days").value,1,7))||6;s.targetNetTYT=num(q("tyt").value,0,120);s.targetNetAYT=num(q("ayt").value,0,80);s.targetNet=s.targetNetTYT;s.targetUniversity=txt(q("uni").value,120);s.targetDepartment=txt(q("dept").value,120);s.obp=num(q("obp").value,0,100);
    if(!save()){Object.assign(s,previous);const error=w.querySelector(".yms-editor-error");error.hidden=false;error.textContent="Değişikliklerin kaydedilemedi. Bilgilerin burada duruyor; tekrar deneyebilirsin.";return}
    for(const [id,value] of [["nameInput",s.name],["targetNetInput",s.targetNetTYT||""],["workdaysInput",s.workdays],["obpInput",s.obp]]){const input=document.getElementById(id);if(input)input.value=value}
    try{window.renderEffective?.();window.renderHome?.();window.renderScore?.()}catch{}
    close();render();toast("Profil ve hedefler güncellendi");
  });
  document.body.append(w);w.querySelector('[name="name"]').focus();
}

function install(){if(render())return;let n=0;const timer=setInterval(()=>{if(render()||++n>40)clearInterval(timer)},250)}
window.__YKS_SETTINGS__={version:"3.0.0",open:category=>{render();return showCategory(category)},back:()=>showCategory(""),refresh:render};
for(const name of ["yks:v4-bootstrap","yks:auth-state","yks:v43-personalization","yks:data-changed"])window.addEventListener(name,queueRefresh);
window.addEventListener("yks:open-settings",event=>{render();showCategory(event.detail?.category||"")});
enforceSettingsOnlyTheme();install();document.documentElement.dataset.modernSettings="ready";
