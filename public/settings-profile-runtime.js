const ROOT_ID="yksModernSettings",MODAL_ID="yksProfileEditModal";
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const txt=(v,n=120)=>String(v??"").trim().slice(0,n);
const num=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
const st=()=>{try{return window.YKSLegacyState?.readState?.()||window.S||{}}catch{return window.S||{}}};
const save=()=>{try{if(typeof window.save==="function")window.save();else window.YKSLegacyState?.save?.()}catch{}try{window.dispatchEvent(new CustomEvent("yks:data-changed",{detail:{source:"settings-profile"}}))}catch{}};
const toast=m=>{try{window.toast?.(m)}catch{}};
const val=(v,f="—")=>txt(v)?txt(v):f;
const net=v=>Number(v)>0?String(Math.round(Number(v)*4)/4):"—";

function styles(){if(document.getElementById("yksModernSettingsStyles"))return;const s=document.createElement("style");s.id="yksModernSettingsStyles";s.textContent=\`
#mrp_ayar{--yms-radius:20px}
.yms-wrap{margin:14px 0 18px}.yms-shell{display:grid;grid-template-columns:210px minmax(0,1fr);gap:16px;align-items:start}.yms-side{position:sticky;top:84px;display:grid;gap:10px;padding:11px;border:1px solid var(--line,#dde3ea);border-radius:20px;background:color-mix(in srgb,var(--surface,#fff) 94%,transparent);box-shadow:0 12px 32px color-mix(in srgb,#000 6%,transparent);backdrop-filter:blur(14px);z-index:6}.yms-side-head{padding:7px 8px 5px}.yms-side-kicker{font-size:10.5px;font-weight:900;letter-spacing:.11em;text-transform:uppercase;color:var(--accent,#2563eb)}.yms-side-title{display:block;margin-top:3px;font-size:17px;font-weight:900;letter-spacing:-.02em}.yms-nav{display:grid;gap:4px}.yms-nav-btn{display:flex;align-items:center;gap:9px;width:100%;border:0;background:transparent;color:var(--label-2,#667085);border-radius:12px;padding:10px 9px;font:inherit;font-size:13px;font-weight:800;text-align:left;cursor:pointer}.yms-nav-btn:hover,.yms-nav-btn.is-active{background:color-mix(in srgb,var(--accent,#2563eb) 9%,transparent);color:var(--label,var(--ink,#111827))}.yms-nav-ic{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;flex:0 0 auto;background:color-mix(in srgb,var(--accent,#2563eb) 8%,var(--surface,#fff));font-size:13px}.yms-side-foot{padding:9px 8px 5px;border-top:1px solid color-mix(in srgb,var(--line,#dde3ea) 75%,transparent);font-size:10.5px;line-height:1.4;color:var(--label-2,#667085)}
.yms-content{display:grid;gap:14px;min-width:0}.yms-hero{position:relative;overflow:hidden;padding:21px;border:1px solid color-mix(in srgb,var(--accent,#2563eb) 20%,var(--line,#dde3ea));border-radius:24px;background:linear-gradient(140deg,var(--surface,#fff),color-mix(in srgb,var(--accent,#2563eb) 10%,var(--surface,#fff)));display:flex;align-items:center;gap:15px;box-shadow:0 14px 38px color-mix(in srgb,#000 7%,transparent)}.yms-hero::after{content:"";position:absolute;width:170px;height:170px;border-radius:50%;right:-76px;top:-92px;background:color-mix(in srgb,var(--accent,#2563eb) 10%,transparent);pointer-events:none}.yms-avatar{width:62px;height:62px;border-radius:20px;display:grid;place-items:center;background:linear-gradient(145deg,var(--accent,#2563eb),color-mix(in srgb,var(--accent,#2563eb) 72%,#111827));color:#fff;font-size:22px;font-weight:900;flex:0 0 auto;box-shadow:0 10px 24px color-mix(in srgb,var(--accent,#2563eb) 22%,transparent)}.yms-hero-main{min-width:0;flex:1;position:relative;z-index:1}.yms-hero-main h2{margin:0 0 3px;font-size:22px;letter-spacing:-.025em}.yms-hero-main p{margin:0;color:var(--label-2,#667085);font-size:13px}.yms-chiprow{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.yms-chip{padding:5px 9px;border:1px solid color-mix(in srgb,var(--accent,#2563eb) 16%,transparent);border-radius:999px;background:color-mix(in srgb,var(--accent,#2563eb) 8%,transparent);font-size:11.5px;font-weight:800}.yms-edit{position:relative;z-index:1;border:1px solid var(--line,#dbe2ea);background:var(--surface,#fff);color:inherit;border-radius:12px;padding:10px 12px;font:inherit;font-weight:800;cursor:pointer}.yms-edit:hover{border-color:color-mix(in srgb,var(--accent,#2563eb) 40%,var(--line,#dbe2ea));background:color-mix(in srgb,var(--accent,#2563eb) 5%,var(--surface,#fff))}
.yms-section{scroll-margin-top:92px;border:1px solid var(--line,#dde3ea);border-radius:22px;padding:17px;background:var(--surface,#fff);box-shadow:0 8px 24px color-mix(in srgb,#000 4%,transparent)}.yms-section-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:13px;padding-bottom:12px;border-bottom:1px solid color-mix(in srgb,var(--line,#dde3ea) 76%,transparent)}.yms-section-title{display:flex;align-items:flex-start;gap:11px}.yms-section-icon{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;flex:0 0 auto;background:color-mix(in srgb,var(--accent,#2563eb) 9%,var(--surface,#fff));color:var(--accent,#2563eb);font-weight:900}.yms-section-head h3{margin:0 0 3px;font-size:17px;letter-spacing:-.015em}.yms-section-head p{margin:0;color:var(--label-2,#667085);font-size:12.5px;line-height:1.45}.yms-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.yms-card{border:1px solid color-mix(in srgb,var(--line,#dde3ea) 88%,transparent);border-radius:16px;padding:14px;background:color-mix(in srgb,var(--card-2,var(--surface,#fff)) 90%,var(--surface,#fff))}.yms-title{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:var(--label-2,#667085);margin-bottom:8px}.yms-row{display:flex;justify-content:space-between;gap:14px;padding:9px 0;border-bottom:1px solid color-mix(in srgb,var(--line,#dde3ea) 70%,transparent);font-size:13px}.yms-row:last-child{border-bottom:0}.yms-row span{color:var(--label-2,#667085)}.yms-row b{text-align:right;max-width:64%;overflow-wrap:anywhere}.yms-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.yms-actions button,.yms-action-tile{border:1px solid var(--line,#dbe2ea);background:transparent;color:inherit;border-radius:11px;padding:10px 12px;font:inherit;font-weight:750;cursor:pointer}.yms-actions button:hover,.yms-action-tile:hover{border-color:color-mix(in srgb,var(--accent,#2563eb) 36%,var(--line,#dbe2ea));background:color-mix(in srgb,var(--accent,#2563eb) 4%,transparent)}.yms-actions button.primary{background:var(--accent,#2563eb);color:#fff;border-color:transparent}.yms-actions button.danger{color:#b42318}.yms-actions button:disabled{opacity:.58;cursor:not-allowed}.yms-action-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.yms-action-tile{display:grid;gap:3px;text-align:left;min-height:72px}.yms-action-tile b{font-size:13px}.yms-action-tile small{font-size:11.5px;line-height:1.35;color:var(--label-2,#667085)}.yms-exam{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.yms-exam div{padding:11px;border:1px solid color-mix(in srgb,var(--line,#dde3ea) 72%,transparent);border-radius:12px;background:color-mix(in srgb,var(--accent,#2563eb) 5%,var(--surface,#fff));font-size:12px;line-height:1.45}.yms-exam b{display:block;font-size:13px;margin-bottom:3px}.yms-account-status{display:flex;align-items:center;gap:7px;font-weight:800}.yms-account-dot{width:8px;height:8px;border-radius:999px;background:#98a2b3}.yms-account-dot.on{background:#12b76a}
.yms-notif-card{background:linear-gradient(160deg,var(--surface,#fff),color-mix(in srgb,var(--accent,#2563eb) 4%,var(--surface,#fff)))}.yms-status-pill{white-space:nowrap;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;background:color-mix(in srgb,#667085 10%,transparent)}.yms-status-pill.ok{background:color-mix(in srgb,#12b76a 13%,transparent);color:#087443}.yms-notif-list{display:grid;gap:8px}.yms-notif-item{display:flex;justify-content:space-between;align-items:center;gap:12px;border:1px solid color-mix(in srgb,var(--line,#dde3ea) 82%,transparent);border-radius:13px;padding:11px 12px;background:color-mix(in srgb,var(--surface,#fff) 82%,transparent)}.yms-notif-item span{display:grid;gap:2px}.yms-notif-item small{color:var(--label-2,#667085);font-size:11.5px}.yms-toggle{width:46px;height:26px;border:0;border-radius:999px;padding:3px;background:#cfd5dd;position:relative;flex:0 0 auto}.yms-toggle::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 4px #0003;transition:transform .16s ease}.yms-toggle.is-on{background:var(--accent,#2563eb)}.yms-toggle.is-on::after{transform:translateX(20px)}.yms-time-row{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:10px}.yms-time-row input{width:100%;box-sizing:border-box;padding:10px 11px;border:1px solid var(--line,#dbe2ea);border-radius:10px;background:var(--surface,#fff);color:inherit;font:inherit}
.yms-theme-host>.card{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}.yms-theme-host>.card>.eyebrow:first-child{display:none}.yms-theme-host #themeGrid{margin-top:0!important}.yms-personal-host>.v43-personalization{margin:0!important;border:0!important;border-radius:0!important;padding:0!important;background:transparent!important;box-shadow:none!important}.yms-personal-host>.v43-personalization>.v43-personal-head{padding-top:0}.yms-empty{padding:14px;border:1px dashed var(--line,#dde3ea);border-radius:14px;color:var(--label-2,#667085);font-size:12.5px}
.yms-modal{position:fixed;inset:0;z-index:14000;display:grid;place-items:center;padding:18px;background:#08101dc4;backdrop-filter:blur(10px)}.yms-dialog{width:min(620px,100%);max-height:88vh;overflow:auto;background:var(--surface,#fff);color:var(--ink,#111827);border:1px solid var(--line,#dbe2ea);border-radius:22px;padding:18px;box-shadow:0 24px 80px #0005}.yms-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.yms-field{display:grid;gap:5px}.yms-field.full{grid-column:1/-1}.yms-field label{font-size:12px;font-weight:750;color:var(--label-2,#667085)}.yms-field input,.yms-field select{width:100%;box-sizing:border-box;padding:10px 11px;border:1px solid var(--line,#dbe2ea);border-radius:10px;background:var(--surface,#fff);color:inherit;font:inherit}.yms-note{font-size:12px;color:var(--label-2,#667085);line-height:1.45;margin-top:8px}[data-yms-hidden="true"]{display:none!important}
@media(max-width:900px){.yms-shell{grid-template-columns:1fr}.yms-side{position:sticky;top:8px;display:block;padding:7px;overflow:hidden}.yms-side-head,.yms-side-foot{display:none}.yms-nav{display:flex;gap:5px;overflow:auto;scrollbar-width:none}.yms-nav::-webkit-scrollbar{display:none}.yms-nav-btn{width:auto;white-space:nowrap;padding:7px 9px;flex:0 0 auto}.yms-nav-ic{width:25px;height:25px}.yms-section{scroll-margin-top:72px}.yms-action-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:680px){.yms-grid,.yms-form,.yms-exam{grid-template-columns:1fr}.yms-hero{align-items:flex-start;flex-wrap:wrap;padding:17px}.yms-avatar{width:54px;height:54px;border-radius:17px}.yms-edit{margin-left:auto}.yms-section{padding:14px;border-radius:18px}.yms-section-head{margin-bottom:11px}.yms-action-grid{grid-template-columns:1fr}.yms-action-tile{min-height:60px}}
@media(pointer:coarse){.yms-nav-btn,.yms-actions button,.yms-edit,.yms-action-tile{min-height:44px}}

/* mobile-premium-settings-v1 */
#mrp_ayar .v30-subhead{margin-bottom:4px}
.yms-shell{grid-template-columns:190px minmax(0,1fr);gap:22px}
.yms-side{top:76px;padding:8px;border:0;border-radius:14px;background:transparent;box-shadow:none;backdrop-filter:none}
.yms-side-head{padding:5px 8px 10px}
.yms-side-kicker{display:none}
.yms-side-title{font-size:15px;font-weight:780;letter-spacing:-.01em;color:var(--label-2,#667085)}
.yms-nav{gap:2px}
.yms-nav-btn{position:relative;gap:9px;padding:9px 10px;border-radius:10px;font-size:13px;font-weight:680;color:var(--label-2,#667085)}
.yms-nav-btn:hover{background:color-mix(in srgb,var(--label,#111827) 4%,transparent)}
.yms-nav-btn.is-active{background:color-mix(in srgb,var(--label,#111827) 6%,transparent);color:var(--label,var(--ink,#111827))}
.yms-nav-dot{width:6px;height:6px;border-radius:999px;background:color-mix(in srgb,var(--label-2,#667085) 45%,transparent);flex:0 0 auto}
.yms-nav-btn.is-active .yms-nav-dot{background:var(--accent,#2563eb)}
.yms-nav-ic{display:none!important}
.yms-side-foot{display:none}
.yms-content{gap:24px}
.yms-hero{padding:6px 2px 18px;border:0;border-bottom:1px solid color-mix(in srgb,var(--line,#dde3ea) 80%,transparent);border-radius:0;background:transparent;box-shadow:none;overflow:visible}
.yms-hero::after{display:none}
.yms-avatar{width:52px;height:52px;border-radius:50%;background:color-mix(in srgb,var(--accent,#2563eb) 11%,var(--surface,#fff));color:var(--accent,#2563eb);font-size:17px;font-weight:780;box-shadow:none;border:1px solid color-mix(in srgb,var(--accent,#2563eb) 14%,var(--line,#dde3ea))}
.yms-hero-main h2{font-size:20px;font-weight:780;letter-spacing:-.022em}
.yms-hero-main p{font-size:12.5px}
.yms-chiprow{margin-top:7px;gap:5px}
.yms-chip{padding:3px 7px;border:0;background:color-mix(in srgb,var(--label,#111827) 5%,transparent);font-size:10.5px;font-weight:650;color:var(--label-2,#667085)}
.yms-edit{border:0;background:color-mix(in srgb,var(--label,#111827) 5%,transparent);border-radius:10px;padding:9px 11px;font-size:12.5px;font-weight:700;box-shadow:none}
.yms-edit:hover{border:0;background:color-mix(in srgb,var(--label,#111827) 8%,transparent)}
.yms-section{padding:0;border:0;border-radius:0;background:transparent;box-shadow:none;scroll-margin-top:82px}
.yms-section-head{margin:0 0 9px;padding:0 2px 8px;border-bottom:0}
.yms-section-title{gap:0}
.yms-section-icon{display:none}
.yms-section-head h3{font-size:13px;font-weight:760;letter-spacing:.005em;color:var(--label-2,#667085)}
.yms-section-head p{margin-top:2px;font-size:11.5px;color:color-mix(in srgb,var(--label-2,#667085) 84%,transparent)}
.yms-grid{gap:1px;background:color-mix(in srgb,var(--line,#dde3ea) 72%,transparent);border:1px solid color-mix(in srgb,var(--line,#dde3ea) 84%,transparent);border-radius:16px;overflow:hidden}
.yms-grid[style]{margin-top:10px!important}
.yms-card{padding:14px 15px;border:0;border-radius:0;background:var(--surface,#fff)}
.yms-title{margin-bottom:5px;font-size:10.5px;font-weight:760;letter-spacing:.03em;text-transform:none;color:var(--label-2,#667085)}
.yms-row{padding:10px 0;font-size:13px;border-bottom:1px solid color-mix(in srgb,var(--line,#dde3ea) 66%,transparent)}
.yms-row b{font-weight:650}
.yms-actions{margin-top:10px}
.yms-actions button{border:0;border-radius:9px;background:color-mix(in srgb,var(--label,#111827) 5%,transparent);padding:9px 11px;font-size:12px;font-weight:680}
.yms-actions button.primary{background:var(--accent,#2563eb);color:#fff}
.yms-actions button.danger{background:transparent;color:var(--danger,#b42318);padding-left:0}
.yms-exam{gap:6px}
.yms-exam div{padding:9px 10px;border:0;border-radius:10px;background:color-mix(in srgb,var(--label,#111827) 4%,transparent)}
.yms-notif-card{padding:0;border:1px solid color-mix(in srgb,var(--line,#dde3ea) 84%,transparent);border-radius:16px;overflow:hidden;background:var(--surface,#fff)}
.yms-notif-list{gap:0}
.yms-notif-item{padding:13px 15px;border:0;border-bottom:1px solid color-mix(in srgb,var(--line,#dde3ea) 66%,transparent);border-radius:0;background:transparent}
.yms-notif-item:last-child{border-bottom:0}
.yms-notif-item b{font-size:13px;font-weight:680}
.yms-notif-item small{font-size:11.5px}
.yms-status-pill{padding:4px 7px;border-radius:8px;font-size:10.5px;font-weight:680;background:color-mix(in srgb,var(--label,#111827) 5%,transparent)}
.yms-toggle{width:44px;height:26px;background:color-mix(in srgb,var(--label-2,#667085) 28%,transparent)}
.yms-toggle.is-on{background:var(--accent,#2563eb)}
.yms-time-row{padding:0 15px 13px;margin-top:12px}
.yms-notif-card>.yms-note{display:block;padding:11px 15px 0;margin:0}
.yms-notif-card>.yms-actions{padding:0 15px 15px;margin-top:0}
.yms-action-grid{grid-template-columns:1fr;border:1px solid color-mix(in srgb,var(--line,#dde3ea) 84%,transparent);border-radius:16px;overflow:hidden;gap:0;background:var(--surface,#fff)}
.yms-action-tile{position:relative;min-height:0;padding:13px 38px 13px 15px;border:0;border-bottom:1px solid color-mix(in srgb,var(--line,#dde3ea) 66%,transparent);border-radius:0;background:transparent}
.yms-action-tile:last-child{border-bottom:0}
.yms-action-tile::after{content:"›";position:absolute;right:15px;top:50%;transform:translateY(-50%);font-size:20px;font-weight:350;color:var(--label-2,#667085)}
.yms-action-tile b{font-size:13px;font-weight:680}
.yms-action-tile small{font-size:11.5px}
.yms-theme-host>.card{background:transparent!important}
.yms-theme-host #themeGrid{gap:8px!important}
.yms-theme-host .theme-card{min-height:64px!important;border-radius:13px!important;box-shadow:none!important;background:var(--surface,#fff)!important}
.yms-theme-host .theme-card.on{box-shadow:inset 0 0 0 1px var(--accent)!important}
.yms-theme-host .theme-card::after{width:20px!important;height:20px!important;font-size:11px!important}
.yms-personal-host .v43-personal-head{border-bottom:0!important;padding-bottom:8px!important}
.yms-personal-host .v43-personal-head .eyebrow{display:none!important}
.yms-personal-host .v43-personal-head h2{font-size:15px!important;margin:0 0 3px!important}
.yms-personal-host .v43-personal-summary{gap:6px!important}
.yms-personal-host .v43-summary-item{padding:9px 10px!important;border-radius:11px!important;background:color-mix(in srgb,var(--label,#111827) 4%,transparent)!important}
.yms-personal-host .v43-personal-group{padding:0!important;border:1px solid color-mix(in srgb,var(--line,#dde3ea) 84%,transparent)!important;border-radius:16px!important;overflow:hidden!important;background:var(--surface,#fff)!important}
.yms-personal-host .v43-personal-group legend{padding:12px 14px 4px!important;font-size:12px!important}
.yms-personal-host .v43-personal-group>.hint{padding:0 14px 10px!important;margin:0!important;font-size:11.5px!important}
.yms-personal-host .v43-personal-grid,.yms-personal-host .v43-personal-grid.exam-grid{gap:0!important}
.yms-personal-host .v43-personal-choice{min-height:58px!important;padding:11px 14px!important;border:0!important;border-top:1px solid color-mix(in srgb,var(--line,#dde3ea) 62%,transparent)!important;border-radius:0!important;background:transparent!important;transform:none!important}
.yms-personal-host .v43-personal-choice:has(input:checked){background:color-mix(in srgb,var(--accent,#2563eb) 4%,transparent)!important}
.yms-personal-host .v43-personal-choice input{width:18px!important;height:18px!important;min-width:18px!important}
.yms-modal{padding:0;align-items:end;background:#08101d73;backdrop-filter:blur(6px)}
.yms-dialog{width:100%;max-width:680px;max-height:92vh;border:0;border-radius:24px 24px 0 0;padding:20px 18px calc(20px + env(safe-area-inset-bottom));box-shadow:0 -18px 60px #0003}
.yms-field input,.yms-field select{min-height:46px;border-radius:12px;background:color-mix(in srgb,var(--label,#111827) 4%,var(--surface,#fff))}
@media(max-width:900px){
  .yms-shell{display:block}
  .yms-side{position:sticky;top:0;z-index:18;margin:0 -2px 18px;padding:4px 0 7px;background:color-mix(in srgb,var(--bg,var(--surface,#fff)) 90%,transparent);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
  .yms-nav{display:flex;gap:2px;overflow:auto;padding:0 2px;scrollbar-width:none}
  .yms-nav-btn{padding:8px 10px;border-radius:10px;font-size:12px}
  .yms-nav-dot{display:none}
}
@media(max-width:680px){
  #mrp_ayar .v30-subhead{padding-bottom:6px}
  .yms-wrap{margin-top:6px}
  .yms-content{gap:22px}
  .yms-hero{padding:8px 2px 16px;gap:12px;align-items:center;flex-wrap:nowrap}
  .yms-avatar{width:48px;height:48px}
  .yms-hero-main h2{font-size:19px}
  .yms-chiprow .yms-chip:nth-child(3){display:none}
  .yms-edit{margin-left:auto;white-space:nowrap;padding:8px 9px}
  .yms-section-head p{max-width:92%}
  .yms-grid,.yms-form,.yms-exam{grid-template-columns:1fr}
  .yms-grid{gap:1px}
  .yms-card{padding:13px 14px}
  .yms-row{padding:9px 0}
  .yms-action-grid{grid-template-columns:1fr}
  .yms-dialog{border-radius:22px 22px 0 0}
  .yms-form{gap:11px}
}

/* mobile-premium-settings-v2: structural mobile redesign */
@media(max-width:900px){
  #mrp_ayar{padding-bottom:calc(28px + env(safe-area-inset-bottom))}
  #mrp_ayar>.v30-subhead{display:none!important}
  .yms-wrap{margin:0!important;padding:0 2px}
  .yms-shell{display:block!important}
  .yms-side{display:none!important}
  .yms-content{gap:30px!important}
  .yms-hero{
    display:grid!important;
    grid-template-columns:52px minmax(0,1fr) auto;
    gap:12px!important;
    align-items:center!important;
    margin:2px 0 0!important;
    padding:18px 16px!important;
    border:1px solid color-mix(in srgb,var(--line,#dde3ea) 82%,transparent)!important;
    border-radius:20px!important;
    background:var(--surface,#fff)!important;
    box-shadow:0 1px 2px color-mix(in srgb,#000 5%,transparent)!important;
  }
  .yms-avatar{width:52px!important;height:52px!important}
  .yms-hero-main h2{font-size:18px!important;line-height:1.15}
  .yms-hero-main p{margin-top:3px!important;font-size:12px!important}
  .yms-chiprow{margin-top:6px!important}
  .yms-chip{display:none!important}
  .yms-chip:first-child{display:inline-flex!important;background:transparent!important;padding:0!important;color:var(--label-2,#667085)!important;font-size:11px!important}
  .yms-edit{
    min-height:36px!important;
    padding:8px 10px!important;
    border:0!important;
    border-radius:10px!important;
    background:color-mix(in srgb,var(--accent,#2563eb) 9%,transparent)!important;
    color:var(--accent,#2563eb)!important;
    font-size:12px!important;
    font-weight:720!important
  }

  .yms-section{display:block!important}
  .yms-section-head{
    display:block!important;
    margin:0 0 8px!important;
    padding:0 4px!important;
  }
  .yms-section-head h3{
    margin:0!important;
    font-size:12px!important;
    line-height:1.2!important;
    font-weight:760!important;
    letter-spacing:.06em!important;
    text-transform:uppercase!important;
    color:var(--label-2,#667085)!important
  }
  .yms-section-head p{display:none!important}
  .yms-section-head>.yms-status-pill{display:inline-flex!important;margin-top:6px!important}

  .yms-grid{
    display:block!important;
    overflow:hidden!important;
    border:1px solid color-mix(in srgb,var(--line,#dde3ea) 84%,transparent)!important;
    border-radius:18px!important;
    background:var(--surface,#fff)!important;
    box-shadow:0 1px 2px color-mix(in srgb,#000 4%,transparent)!important
  }
  .yms-grid[style]{margin-top:10px!important}
  .yms-grid .yms-card{
    border:0!important;
    border-radius:0!important;
    background:transparent!important;
    padding:0 15px!important
  }
  .yms-grid .yms-card+.yms-card{
    border-top:8px solid color-mix(in srgb,var(--bg,var(--surface,#fff)) 96%,var(--line,#dde3ea))!important
  }
  .yms-title{
    margin:0!important;
    padding:13px 0 6px!important;
    font-size:11px!important;
    font-weight:730!important;
    color:var(--label-2,#667085)!important
  }
  .yms-row{
    min-height:44px!important;
    padding:11px 0!important;
    align-items:center!important;
    font-size:13px!important
  }
  .yms-row span{font-size:13px!important}
  .yms-row b{font-size:13px!important;font-weight:620!important}
  .yms-actions{padding-bottom:12px!important;margin-top:6px!important}
  .yms-actions button{
    min-height:38px!important;
    border-radius:10px!important;
    padding:8px 10px!important
  }
  .yms-exam{
    grid-template-columns:repeat(3,minmax(0,1fr))!important;
    padding-bottom:12px!important
  }
  .yms-exam div{
    text-align:center!important;
    padding:10px 5px!important;
    border-radius:10px!important;
    font-size:10.5px!important
  }
  .yms-exam b{font-size:12px!important}

  #ymsAppearance .yms-theme-host{
    border:1px solid color-mix(in srgb,var(--line,#dde3ea) 84%,transparent)!important;
    border-radius:18px!important;
    padding:10px!important;
    overflow:hidden!important;
    background:var(--surface,#fff)!important;
    box-shadow:0 1px 2px color-mix(in srgb,#000 4%,transparent)!important
  }
  #ymsAppearance #themeGrid{
    display:grid!important;
    grid-template-columns:repeat(2,minmax(0,1fr))!important;
    gap:8px!important
  }
  #ymsAppearance .theme-card{
    min-height:70px!important;
    padding:10px!important;
    border:1px solid color-mix(in srgb,var(--line,#dde3ea) 82%,transparent)!important;
    border-radius:14px!important;
    background:color-mix(in srgb,var(--label,#111827) 2%,var(--surface,#fff))!important
  }
  #ymsAppearance .theme-card.on{
    border-color:var(--accent,#2563eb)!important;
    background:color-mix(in srgb,var(--accent,#2563eb) 5%,var(--surface,#fff))!important
  }

  #ymsPersonal .yms-personal-host{
    border:1px solid color-mix(in srgb,var(--line,#dde3ea) 84%,transparent)!important;
    border-radius:18px!important;
    overflow:hidden!important;
    background:var(--surface,#fff)!important;
    box-shadow:0 1px 2px color-mix(in srgb,#000 4%,transparent)!important
  }
  #ymsPersonal .v43-personalization{padding:0!important;gap:0!important}
  #ymsPersonal .v43-personal-head{padding:14px 15px 10px!important}
  #ymsPersonal .v43-personal-summary{padding:0 15px 12px!important}
  #ymsPersonal .v43-personal-body{gap:10px!important;padding:0 10px 10px!important}
  #ymsPersonal .v43-personal-status{padding:0 14px 12px!important}

  #ymsNotifications .yms-notif-card{
    border-radius:18px!important;
    box-shadow:0 1px 2px color-mix(in srgb,#000 4%,transparent)!important
  }
  .yms-notif-item{min-height:54px!important}
  .yms-notif-item span{gap:3px!important}
  .yms-notif-item small{max-width:240px!important}
  .yms-time-row input{min-height:42px!important;border:0!important;background:color-mix(in srgb,var(--label,#111827) 4%,transparent)!important}

  #ymsApplication .yms-action-grid{
    border-radius:18px!important;
    box-shadow:0 1px 2px color-mix(in srgb,#000 4%,transparent)!important
  }
  .yms-action-tile{
    min-height:58px!important;
    padding:12px 42px 12px 15px!important
  }
  .yms-action-tile b{font-size:13px!important}
  .yms-action-tile small{margin-top:2px!important}

  .yms-modal{align-items:end!important}
  .yms-dialog{
    max-width:none!important;
    border-radius:24px 24px 0 0!important;
    padding:18px 16px calc(18px + env(safe-area-inset-bottom))!important
  }
}
/* native-settings-v3: calm, production-app settings language */
#mrp_ayar{
  --yms-group-radius:18px;
  --yms-divider:color-mix(in srgb,var(--line,#dde3ea) 76%,transparent);
}
#mrp_ayar .yms-wrap{max-width:1080px;margin:12px auto 28px}
#mrp_ayar .yms-shell{grid-template-columns:206px minmax(0,760px);justify-content:center;gap:34px}
#mrp_ayar .yms-side{
  top:74px;padding:4px 0;border:0;border-radius:0;background:transparent;
  box-shadow:none;backdrop-filter:none
}
#mrp_ayar .yms-side-head{padding:4px 10px 12px}
#mrp_ayar .yms-side-title{font-size:14px;font-weight:720;color:var(--label-2,#667085)}
#mrp_ayar .yms-nav{gap:3px}
#mrp_ayar .yms-nav-btn{
  min-height:42px;padding:10px 12px;border-radius:11px;font-size:13px;font-weight:650
}
#mrp_ayar .yms-nav-btn:hover{background:color-mix(in srgb,var(--label,#111827) 5%,transparent)}
#mrp_ayar .yms-nav-btn.is-active{
  background:color-mix(in srgb,var(--accent,#2563eb) 9%,transparent);
  color:var(--label,var(--ink,#111827));font-weight:720
}
#mrp_ayar .yms-nav-dot{width:5px;height:5px}
#mrp_ayar .yms-content{gap:28px}
#mrp_ayar .yms-hero{
  padding:17px 18px;border:1px solid var(--yms-divider);border-radius:var(--yms-group-radius);
  background:var(--surface,#fff);box-shadow:none;overflow:hidden
}
#mrp_ayar .yms-hero::after{display:none}
#mrp_ayar .yms-avatar{
  width:50px;height:50px;border-radius:50%;background:color-mix(in srgb,var(--accent,#2563eb) 11%,var(--surface,#fff));
  color:var(--accent,#2563eb);border:1px solid color-mix(in srgb,var(--accent,#2563eb) 17%,var(--line,#dde3ea));
  box-shadow:none;font-size:16px;font-weight:760
}
#mrp_ayar .yms-hero-main h2{font-size:18px;font-weight:760}
#mrp_ayar .yms-hero-main p{font-size:12px}
#mrp_ayar .yms-chiprow{margin-top:5px}
#mrp_ayar .yms-chip{
  padding:0;border:0;background:transparent;color:var(--label-2,#667085);
  font-size:11px;font-weight:620
}
#mrp_ayar .yms-chip+.yms-chip::before{content:"·";margin-right:6px;color:var(--label-2,#667085)}
#mrp_ayar .yms-edit{
  border:0;border-radius:10px;padding:9px 11px;background:color-mix(in srgb,var(--accent,#2563eb) 9%,transparent);
  color:var(--accent,#2563eb);font-size:12px;font-weight:720;box-shadow:none
}
#mrp_ayar .yms-edit:hover{border:0;background:color-mix(in srgb,var(--accent,#2563eb) 13%,transparent)}
#mrp_ayar .yms-section{padding:0;border:0;border-radius:0;background:transparent;box-shadow:none}
#mrp_ayar .yms-section-head{margin:0 0 8px;padding:0 3px;border:0;align-items:center}
#mrp_ayar .yms-section-head h3{
  margin:0;font-size:12px;line-height:1.2;font-weight:740;letter-spacing:.055em;text-transform:uppercase;
  color:var(--label-2,#667085)
}
#mrp_ayar .yms-section-head p{display:none}
#mrp_ayar .yms-grid{
  gap:12px;background:transparent;border:0;border-radius:0;overflow:visible
}
#mrp_ayar .yms-grid[style]{margin-top:12px!important}
#mrp_ayar .yms-card{
  padding:0 15px;border:1px solid var(--yms-divider);border-radius:var(--yms-group-radius);
  background:var(--surface,#fff);box-shadow:none
}
#mrp_ayar .yms-title{
  margin:0;padding:13px 0 6px;font-size:11px;font-weight:680;letter-spacing:0;text-transform:none;
  color:var(--label-2,#667085)
}
#mrp_ayar .yms-row{min-height:46px;padding:11px 0;align-items:center;border-bottom:1px solid var(--yms-divider)}
#mrp_ayar .yms-row span{font-size:13px;color:var(--label,var(--ink,#111827))}
#mrp_ayar .yms-row b{font-size:12.5px;font-weight:620;color:var(--label-2,#667085)}
#mrp_ayar .yms-account-status{font-weight:620}
#mrp_ayar .yms-actions{margin:6px 0 0;padding:0 0 12px}
#mrp_ayar .yms-actions button{
  min-height:38px;border:0;border-radius:10px;padding:8px 11px;background:color-mix(in srgb,var(--label,#111827) 5%,transparent);
  font-size:12px;font-weight:670
}
#mrp_ayar .yms-actions button.primary{background:var(--accent,#2563eb);color:#fff}
#mrp_ayar .yms-actions button.danger{background:transparent;color:var(--danger,#b42318);padding-left:0}
#mrp_ayar .yms-exam{gap:6px;padding-bottom:12px}
#mrp_ayar .yms-exam div{
  padding:10px;border:0;border-radius:10px;background:color-mix(in srgb,var(--label,#111827) 4%,transparent)
}
#mrp_ayar .yms-theme-host,
#mrp_ayar .yms-personal-host,
#mrp_ayar .yms-notif-card,
#mrp_ayar .yms-action-grid{
  border:1px solid var(--yms-divider);border-radius:var(--yms-group-radius);
  background:var(--surface,#fff);box-shadow:none;overflow:hidden
}
#mrp_ayar .yms-theme-host{padding:12px}
#mrp_ayar .yms-theme-host #themeGrid{gap:8px!important}
#mrp_ayar .yms-theme-host .theme-card{
  min-height:66px!important;border-radius:12px!important;box-shadow:none!important;
  border:1px solid var(--yms-divider)!important
}
#mrp_ayar .yms-theme-host .theme-card.on{border-color:var(--accent,#2563eb)!important}
#mrp_ayar .yms-notif-card{padding:0}
#mrp_ayar .yms-notif-list{gap:0}
#mrp_ayar .yms-notif-item{
  min-height:56px;padding:12px 15px;border:0;border-bottom:1px solid var(--yms-divider);
  border-radius:0;background:transparent
}
#mrp_ayar .yms-notif-item:last-child{border-bottom:0}
#mrp_ayar .yms-notif-item b{font-size:13px;font-weight:650}
#mrp_ayar .yms-notif-item small{font-size:11.5px}
#mrp_ayar .yms-toggle{width:44px;height:26px;cursor:pointer}
#mrp_ayar .yms-toggle:focus-visible,
#mrp_ayar .yms-edit:focus-visible,
#mrp_ayar .yms-nav-btn:focus-visible,
#mrp_ayar .yms-action-tile:focus-visible{
  outline:2px solid var(--accent,#2563eb);outline-offset:2px
}
#mrp_ayar .yms-notif-card>.yms-note{display:block;margin:0;padding:12px 15px 0}
#mrp_ayar .yms-time-row{margin:8px 0 0;padding:0 15px 12px}
#mrp_ayar .yms-time-row input{
  min-height:42px;border:1px solid var(--yms-divider);border-radius:10px;background:color-mix(in srgb,var(--label,#111827) 3%,var(--surface,#fff))
}
#mrp_ayar .yms-notif-card>.yms-actions{padding:0 15px 14px;margin:0}
#mrp_ayar .yms-action-grid{grid-template-columns:1fr;gap:0}
#mrp_ayar .yms-action-tile{
  position:relative;min-height:62px;padding:13px 42px 13px 15px;border:0;border-bottom:1px solid var(--yms-divider);
  border-radius:0;background:transparent
}
#mrp_ayar .yms-action-tile:last-child{border-bottom:0}
#mrp_ayar .yms-action-tile:hover{background:color-mix(in srgb,var(--label,#111827) 3%,transparent);border-color:var(--yms-divider)}
#mrp_ayar .yms-action-tile::after{
  content:"›";position:absolute;right:15px;top:50%;transform:translateY(-50%);
  font-size:20px;font-weight:350;color:var(--label-2,#667085)
}
#mrp_ayar .yms-action-tile b{font-size:13px;font-weight:650}
#mrp_ayar .yms-action-tile small{font-size:11.5px}
#mrp_ayar .yms-status-pill{
  border-radius:8px;padding:4px 7px;background:color-mix(in srgb,var(--label,#111827) 5%,transparent);
  font-size:10.5px;font-weight:650
}
#mrp_ayar .yms-modal{background:#08101d78;backdrop-filter:blur(6px)}
#mrp_ayar .yms-dialog{border-radius:20px;box-shadow:0 22px 70px #0004}
#mrp_ayar .yms-field label{font-size:11.5px;font-weight:650}
#mrp_ayar .yms-field input,#mrp_ayar .yms-field select{min-height:44px;border-radius:10px}

@media(max-width:900px){
  #mrp_ayar .yms-wrap{max-width:720px!important;margin:0 auto 24px!important;padding:0 10px!important}
  #mrp_ayar .yms-content{gap:24px!important}
  #mrp_ayar .yms-hero{
    margin:0!important;padding:15px!important;border-radius:16px!important;
    grid-template-columns:48px minmax(0,1fr) auto!important
  }
  #mrp_ayar .yms-avatar{width:48px!important;height:48px!important}
  #mrp_ayar .yms-hero-main h2{font-size:17px!important}
  #mrp_ayar .yms-section-head{margin:0 0 7px!important;padding:0 3px!important}
  #mrp_ayar .yms-section-head h3{font-size:11.5px!important;letter-spacing:.06em!important}
  #mrp_ayar .yms-grid{
    display:grid!important;grid-template-columns:1fr!important;gap:10px!important;
    border:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important
  }
  #mrp_ayar .yms-grid .yms-card{
    padding:0 14px!important;border:1px solid var(--yms-divider)!important;
    border-radius:16px!important;background:var(--surface,#fff)!important
  }
  #mrp_ayar .yms-grid .yms-card+.yms-card{border-top:1px solid var(--yms-divider)!important}
  #mrp_ayar #ymsAppearance .yms-theme-host,
  #mrp_ayar #ymsPersonal .yms-personal-host,
  #mrp_ayar #ymsNotifications .yms-notif-card,
  #mrp_ayar #ymsApplication .yms-action-grid{border-radius:16px!important}
  #mrp_ayar #ymsAppearance .yms-theme-host{padding:9px!important}
  #mrp_ayar .yms-action-tile{min-height:60px!important}
}
@media(max-width:520px){
  #mrp_ayar .yms-wrap{padding:0 6px!important}
  #mrp_ayar .yms-content{gap:22px!important}
  #mrp_ayar .yms-hero{grid-template-columns:44px minmax(0,1fr) auto!important;padding:13px!important}
  #mrp_ayar .yms-avatar{width:44px!important;height:44px!important;font-size:14px!important}
  #mrp_ayar .yms-hero-main p{max-width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #mrp_ayar .yms-edit{min-height:34px!important;padding:7px 9px!important}
  #mrp_ayar .yms-row{min-height:44px!important}
  #mrp_ayar .yms-row b{max-width:56%!important}
  #mrp_ayar #ymsAppearance #themeGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  #mrp_ayar .yms-notif-item{padding:12px 14px!important}
  #mrp_ayar .yms-notif-item small{max-width:205px!important}
}

@media(prefers-reduced-motion:reduce){.yms-toggle::after{transition:none}}
\`;document.head.append(s)}

function account(){const title=document.querySelector("[data-account-title]")?.textContent?.trim()||"",meta=document.querySelector("[data-account-meta]")?.textContent?.trim()||"";const email=(meta.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)||[])[0]||"";const signedIn=Boolean(email||(title&&title!=="Giriş yapılmadı"));return{title,email,meta,signedIn}}
function initials(name){const p=txt(name,80).split(/\s+/).filter(Boolean).slice(0,2);return(p.map(x=>x[0]?.toUpperCase()).join("")||"YK")}
function syncText(){const a=document.getElementById("cloudSyncText")?.textContent?.trim(),b=document.getElementById("cloudSyncMeta")?.textContent?.trim();return[a,b].filter(Boolean).join(" · ")||"Bulut durumu hazırlanıyor"}
function appVersion(){return document.getElementById("appVersionLabel")?.textContent?.trim()||"YKS Defterim"}
function enforceSettingsOnlyTheme(){document.getElementById("themeBtn")?.remove();document.documentElement.dataset.themeControl="settings-only"}
function hideCardFor(id,reason){const node=document.getElementById(id);const card=node?.closest?.(".card");if(card){card.hidden=true;card.dataset.ymsHidden="true";card.dataset.ymsHiddenReason=reason}}
function hideLegacySettings(){
  const panel=document.getElementById("mrp_ayar");if(!panel)return;
  enforceSettingsOnlyTheme();
  const old=document.getElementById("nameInput")?.closest(".card");if(old){old.hidden=true;old.dataset.ymsHidden="true"}
  const themeGrid=document.getElementById("themeGrid"),themeCard=themeGrid?.closest?.(".card");if(themeCard){themeCard.hidden=false;delete themeCard.dataset.ymsHidden;delete themeCard.dataset.ymsHiddenReason}
  hideCardFor("sozToggle","legacy-appearance");
  hideCardFor("ytSrc","video-settings-private");
  hideCardFor("notifStatus","modern-notifications");
  const demoButton=panel.querySelector('button[onclick="loadDemo()"]'),demoCard=demoButton?.closest?.(".card");if(demoCard){demoCard.hidden=true;demoCard.dataset.ymsHidden="true";demoCard.dataset.ymsHiddenReason="modern-app-tools"}
  ["roleSeg","roleHint","simpleToggle","simpleHint"].forEach(id=>{const node=document.getElementById(id);if(node){node.hidden=true;node.dataset.ymsHidden="true"}});
  const sub=panel.querySelector(".v30-subhead p");if(sub)sub.textContent="Profil, görünüm, kişiselleştirme, bildirimler ve uygulama";
  document.querySelectorAll(".v30-menu-card").forEach(card=>{if(card.getAttribute("onclick")?.includes("settings")){const small=card.querySelector("small");if(small)small.textContent="Profil, görünüm, bildirimler ve uygulama tercihleri"}});
  panel.querySelectorAll(".note").forEach(note=>{if(note.textContent?.includes("YKS 2027 tarihi")){note.hidden=true;note.dataset.ymsHidden="true"}});
  polishPersonalization();
}

function polishPersonalization(){
  const panel=document.getElementById("v43Personalization");if(!panel)return;
  panel.dataset.ymsPersonalization="polished";
  const title=panel.querySelector(".v43-personal-head h2");if(title)title.textContent="Kendine göre ayarla";
  const hint=panel.querySelector(".v43-personal-head .hint");if(hint)hint.textContent="Sınav kapsamını ve Bugün ekranındaki yardımcı alanları buradan düzenle. Kayıtlı çalışma verilerin değişmez.";
  const reset=panel.querySelector(".v43-personal-head button");if(reset)reset.textContent="Ayarları sıfırla";
  const host=document.querySelector("[data-yms-personal-slot]");if(host&&!host.contains(panel)){host.replaceChildren(panel)}
}

function notifEnabled(id){return Boolean(document.getElementById(id)?.classList.contains("on"))}
function notifPermission(){try{if(!("Notification" in window))return"unsupported";return Notification.permission||"default"}catch{return"unsupported"}}
function notifPermissionText(){const p=notifPermission();if(p==="granted")return"İzin verildi";if(p==="denied")return"İzin engellendi";if(p==="unsupported")return"Desteklenmiyor";return"İzin bekleniyor"}
function notifTime(){return document.getElementById("notifTime")?.value||"21:00"}
function notifButton(kind,label,detail,id){const on=notifEnabled(id);return`<div class="yms-notif-item"><span><b>${esc(label)}</b><small>${esc(detail)}</small></span><button class="yms-toggle${on?" is-on":""}" type="button" role="switch" aria-checked="${on?"true":"false"}" aria-label="${esc(label)}" data-yms-notif="${kind}"></button></div>`}

function render(){styles();const panel=document.getElementById("mrp_ayar");if(!panel)return false;hideLegacySettings();const s=st(),a=account();let root=document.getElementById(ROOT_ID);const themeCard=document.getElementById("themeGrid")?.closest?.(".card"),personalPanel=document.getElementById("v43Personalization");if(root&&themeCard&&root.contains(themeCard))panel.append(themeCard);if(root&&personalPanel&&root.contains(personalPanel))panel.append(personalPanel);if(!root){root=document.createElement("div");root.id=ROOT_ID;root.className="yms-wrap";const head=panel.querySelector(".v30-subhead");head?.after(root)}
const name=val(s.name||a.title,"YKS öğrencisi"),track=val(s.puanTuru,"Belirlenmedi"),permission=notifPermission(),permissionText=notifPermissionText();root.innerHTML=\`
<div class="yms-shell">
  <aside class="yms-side" aria-label="Ayar kategorileri">
    <div class="yms-side-head"><span class="yms-side-kicker">YKS Defterim</span><b class="yms-side-title">Ayarlar</b></div>
    <nav class="yms-nav">
      <button class="yms-nav-btn is-active" type="button" data-yms-jump="ymsProfile"><span class="yms-nav-dot" aria-hidden="true"></span>Profil</button>
      <button class="yms-nav-btn" type="button" data-yms-jump="ymsAppearance"><span class="yms-nav-dot" aria-hidden="true"></span>Görünüm</button>
      <button class="yms-nav-btn" type="button" data-yms-jump="ymsPersonal"><span class="yms-nav-dot" aria-hidden="true"></span>Kişiselleştir</button>
      <button class="yms-nav-btn" type="button" data-yms-jump="ymsNotifications"><span class="yms-nav-dot" aria-hidden="true"></span>Bildirimler</button>
      <button class="yms-nav-btn" type="button" data-yms-jump="ymsApplication"><span class="yms-nav-dot" aria-hidden="true"></span>Uygulama</button>
    </nav>
    <div class="yms-side-foot">Ayarların bu cihazda saklanır. Bulut hesabın bağlıysa desteklenen hesap bilgileri eşitlenebilir.</div>
  </aside>
  <main class="yms-content">
    <section class="yms-hero" id="ymsProfile">
      <div class="yms-avatar">${esc(initials(name))}</div>
      <div class="yms-hero-main"><h2>${esc(name)}</h2><p>${esc(a.email||(a.signedIn?"Hesap bağlı":"Hesap ile giriş yapılmadı"))}</p><div class="yms-chiprow"><span class="yms-chip">${esc(track)}</span><span class="yms-chip">2027 YKS</span><span class="yms-chip">${esc(String(s.workdays||6))} gün / hafta</span></div></div>
      <button class="yms-edit" type="button" data-yms-edit>Profili düzenle</button>
    </section>
    <section class="yms-section" aria-labelledby="ymsProfileTitle">
      <div class="yms-section-head"><div class="yms-section-title"><div><h3 id="ymsProfileTitle">Profil ve hedefler</h3><p>Temel bilgilerin, YKS hedeflerin ve hesap durumun tek yerde.</p></div></div></div>
      <div class="yms-grid"><section class="yms-card"><div class="yms-title">Kişisel bilgiler</div><div class="yms-row"><span>Ad Soyad</span><b>${esc(name)}</b></div><div class="yms-row"><span>E-posta</span><b>${esc(a.email||"—")}</b></div><div class="yms-row"><span>Alan / puan türü</span><b>${esc(track)}</b></div><div class="yms-row"><span>OBP</span><b>${Number(s.obp)>0?esc(String(s.obp)):"—"}</b></div><div class="yms-row"><span>Haftalık çalışma</span><b>${esc(String(s.workdays||6))} gün</b></div></section>
      <section class="yms-card"><div class="yms-title">YKS hedeflerim</div><div class="yms-row"><span>TYT hedef net</span><b>${esc(net(s.targetNetTYT??s.targetNet))}</b></div><div class="yms-row"><span>AYT hedef net</span><b>${esc(net(s.targetNetAYT))}</b></div><div class="yms-row"><span>Hedef üniversite</span><b>${esc(val(s.targetUniversity))}</b></div><div class="yms-row"><span>Hedef bölüm</span><b>${esc(val(s.targetDepartment))}</b></div><div class="yms-actions"><button class="primary" type="button" data-yms-edit>Hedefleri düzenle</button></div></section></div>
      <div class="yms-grid" style="margin-top:11px"><section class="yms-card"><div class="yms-title">Hesap & güvenlik</div><div class="yms-row"><span>Oturum</span><b class="yms-account-status"><i class="yms-account-dot${a.signedIn?" on":""}"></i>${esc(a.signedIn?"Giriş yapıldı":"Giriş yapılmadı")}</b></div><div class="yms-row"><span>Bulut</span><b>${esc(syncText())}</b></div><div class="yms-actions">${a.signedIn?'<button class="danger" type="button" data-yms-logout>Çıkış yap</button>':'<button class="primary" type="button" data-yms-login>Google ile giriş yap</button>'}</div></section>
      <section class="yms-card"><div class="yms-title">2027 YKS tarihleri</div><div class="yms-exam"><div><b>TYT</b>19 Haziran 2027<br>10:15</div><div><b>AYT</b>20 Haziran 2027<br>10:15</div><div><b>YDT</b>20 Haziran 2027<br>15:45</div></div><p class="yms-note">Sınav tarihleri bilgi amaçlı sabittir; profil ayarından değiştirilmez.</p></section></div>
    </section>
    <section class="yms-section" id="ymsAppearance"><div class="yms-section-head"><div class="yms-section-title"><div><h3>Görünüm</h3><p>Tema ve yazı boyutunu seç. Tema değişimi yalnız bu Ayarlar ekranından yapılır.</p></div></div></div><div class="yms-theme-host" data-yms-theme-slot></div></section>
    <section class="yms-section" id="ymsPersonal"><div class="yms-section-head"><div class="yms-section-title"><div><h3>Kişiselleştirme</h3><p>Hangi sınavların ve Bugün kartlarının görüneceğini belirle.</p></div></div></div><div class="yms-personal-host" data-yms-personal-slot><div class="yms-empty">Kişiselleştirme seçenekleri hazırlanıyor…</div></div></section>
    <section class="yms-section" id="ymsNotifications"><div class="yms-section-head"><div class="yms-section-title"><div><h3>Bildirimler</h3><p>Yalnız gerçekten işine yarayan hatırlatmaları açık bırak.</p></div></div><span class="yms-status-pill${permission==="granted"?" ok":""}">${esc(permissionText)}</span></div><div class="yms-card yms-notif-card"><div class="yms-notif-list">${notifButton("pomo","Pomodoro bitişi","Odak oturumu veya mola tamamlandığında haber ver","notifPomo")}${notifButton("review","Tekrar zamanı","Planlı konu tekrarlarını hatırlat","notifReview")}${notifButton("evening","Gün sonu hatırlatması","Günü kapatmayı ve kaydı tamamlamayı hatırlat","notifEvening")}</div><label class="yms-note" for="ymsNotifTime">Akşam hatırlatma saati</label><div class="yms-time-row"><input id="ymsNotifTime" type="time" value="${esc(notifTime())}" aria-label="Akşam hatırlatma saati"><button class="yms-edit" type="button" data-yms-notif-time>Kaydet</button></div><div class="yms-actions"><button type="button" data-yms-notif-permission ${permission==="granted"?"disabled":""}>${permission==="granted"?"Bildirim izni açık":"Bildirim izni ver"}</button><button type="button" data-yms-notif-test>Deneme bildirimi</button><button type="button" data-yms-notif-refresh>Durumu yenile</button></div></div></section>
    <section class="yms-section" id="ymsApplication"><div class="yms-section-head"><div class="yms-section-title"><div><h3>Uygulama</h3><p>Veri, yedek, sistem kontrolleri ve deneme araçları.</p></div></div><span class="yms-status-pill">${esc(appVersion())}</span></div>
      <div class="yms-action-grid"><button class="yms-action-tile" type="button" data-yms-data><b>Veri & yedek</b><small>Dışa aktar, içe al ve yedeklerini yönet.</small></button><button class="yms-action-tile" type="button" data-yms-system><b>Sistem durumu</b><small>Uygulama sağlığı ve bağlantı durumunu kontrol et.</small></button><button class="yms-action-tile" type="button" data-yms-about><b>Hakkında</b><small>Sürüm ve uygulama bilgilerini gör.</small></button><button class="yms-action-tile" type="button" data-yms-demo-load><b>Örnek veri</b><small>Uygulamayı dolu veriyle hızlıca dene.</small></button><button class="yms-action-tile" type="button" data-yms-demo-clear><b>Örnek veriyi temizle</b><small>Deneme verilerini tek dokunuşla kaldır.</small></button><button class="yms-action-tile" type="button" data-yms-wizard><b>Kurulumu tekrar aç</b><small>İlk kurulum adımlarını yeniden çalıştır.</small></button></div>
    </section>
  </main>
</div>\`;
const themeSlot=root.querySelector("[data-yms-theme-slot]");if(themeCard&&themeSlot){themeCard.hidden=false;themeCard.classList.add("yms-adopted-card");themeSlot.append(themeCard)}
const personalSlot=root.querySelector("[data-yms-personal-slot]");if(personalPanel&&personalSlot){personalSlot.replaceChildren(personalPanel);polishPersonalization()}
root.querySelectorAll("[data-yms-jump]").forEach(b=>b.addEventListener("click",()=>{root.querySelectorAll("[data-yms-jump]").forEach(x=>x.classList.remove("is-active"));b.classList.add("is-active");const target=document.getElementById(b.dataset.ymsJump);target?.scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?"auto":"smooth",block:"start"})}));
root.querySelectorAll("[data-yms-edit]").forEach(b=>b.addEventListener("click",openEditor));
root.querySelector("[data-yms-login]")?.addEventListener("click",()=>document.getElementById("cloudLoginBtn")?.click());
root.querySelector("[data-yms-logout]")?.addEventListener("click",()=>document.getElementById("cloudLogoutBtn")?.click());
root.querySelectorAll("[data-yms-notif]").forEach(b=>b.addEventListener("click",()=>{const kind=b.dataset.ymsNotif;if(kind&&typeof window.toggleNotif==="function")window.toggleNotif(kind);setTimeout(render,0)}));
root.querySelector("[data-yms-notif-permission]")?.addEventListener("click",()=>{try{Promise.resolve(window.askNotif?.()).finally(()=>setTimeout(render,250))}catch{setTimeout(render,250)}});
root.querySelector("[data-yms-notif-time]")?.addEventListener("click",()=>{const next=root.querySelector("#ymsNotifTime")?.value||"21:00",legacy=document.getElementById("notifTime");if(legacy)legacy.value=next;window.saveEveningAt?.();setTimeout(render,0)});
root.querySelector("[data-yms-notif-test]")?.addEventListener("click",()=>window.testNotif?.());
root.querySelector("[data-yms-notif-refresh]")?.addEventListener("click",()=>{window.notifDiag?.();window.renderNotifSettings?.();setTimeout(render,0)});
root.querySelector("[data-yms-data]")?.addEventListener("click",()=>{if(typeof window.v30Action==="function")window.v30Action("data");else window.setMoreTab?.("veri")});root.querySelector("[data-yms-system]")?.addEventListener("click",()=>window.v30Action?.("system"));root.querySelector("[data-yms-about]")?.addEventListener("click",()=>window.v30Action?.("about"));
root.querySelector("[data-yms-demo-load]")?.addEventListener("click",()=>window.loadDemo?.());root.querySelector("[data-yms-demo-clear]")?.addEventListener("click",()=>window.clearDemo?.());root.querySelector("[data-yms-wizard]")?.addEventListener("click",()=>window.openWizard?.());
return true}

function openEditor(){styles();document.getElementById(MODAL_ID)?.remove();const s=st(),w=document.createElement("div");w.id=MODAL_ID;w.className="yms-modal";w.innerHTML=`<div class="yms-dialog"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><p class="eyebrow">Profilim</p><h2 style="margin:2px 0 12px">Bilgileri düzenle</h2></div><button class="yms-edit" type="button" data-close>×</button></div><div class="yms-form"><div class="yms-field full"><label>Ad Soyad</label><input name="name" maxlength="80" value="${esc(s.name||"")}" autocomplete="name"></div><div class="yms-field"><label>Alan / puan türü</label><select name="track"><option value="SAY">SAY</option><option value="EA">EA</option><option value="SÖZ">SÖZ</option><option value="DİL">DİL</option></select></div><div class="yms-field"><label>Haftada çalışma günü</label><input name="days" type="number" min="1" max="7" value="${esc(String(s.workdays||6))}"></div><div class="yms-field"><label>TYT hedef net</label><input name="tyt" type="number" min="0" max="120" step="0.25" value="${esc(String(s.targetNetTYT??s.targetNet??""))}"></div><div class="yms-field"><label>AYT hedef net</label><input name="ayt" type="number" min="0" max="80" step="0.25" value="${esc(String(s.targetNetAYT??""))}"></div><div class="yms-field full"><label>Hedef üniversite / okul</label><input name="uni" maxlength="120" value="${esc(s.targetUniversity||"")}" placeholder="Örn. İstanbul Teknik Üniversitesi"></div><div class="yms-field full"><label>Hedef bölüm</label><input name="dept" maxlength="120" value="${esc(s.targetDepartment||"")}" placeholder="Örn. Bilgisayar Mühendisliği"></div><div class="yms-field"><label>OBP (0–100)</label><input name="obp" type="number" min="0" max="100" step="0.01" value="${esc(String(s.obp||""))}"></div></div><p class="yms-note">Sınav tarihleri buradan değiştirilemez.</p><div class="yms-actions" style="justify-content:flex-end"><button type="button" data-close>Vazgeç</button><button class="primary" type="button" data-save>Kaydet</button></div></div>`;w.querySelector('select[name="track"]').value=["SAY","EA","SÖZ","DİL"].includes(s.puanTuru)?s.puanTuru:"SAY";w.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>w.remove()));w.querySelector("[data-save]").addEventListener("click",()=>{const q=n=>w.querySelector(`[name="${n}"]`);s.name=txt(q("name").value,80);s.puanTuru=q("track").value;s.workdays=Math.round(num(q("days").value,1,7))||6;s.targetNetTYT=num(q("tyt").value,0,120);s.targetNetAYT=num(q("ayt").value,0,80);s.targetNet=s.targetNetTYT;s.targetUniversity=txt(q("uni").value,120);s.targetDepartment=txt(q("dept").value,120);s.obp=num(q("obp").value,0,100);const legacyName=document.getElementById("nameInput");if(legacyName)legacyName.value=s.name;const legacyNet=document.getElementById("targetNetInput");if(legacyNet)legacyNet.value=s.targetNetTYT||"";const wd=document.getElementById("workdaysInput");if(wd)wd.value=s.workdays;save();try{window.renderEffective?.();window.renderHome?.();window.renderScore?.()}catch{}w.remove();render();toast("Profil ve hedefler güncellendi")});document.body.append(w)}

function install(){if(render())return;let n=0;const t=setInterval(()=>{n++;if(render()||n>40)clearInterval(t)},250)}
window.addEventListener("yks:v4-bootstrap",()=>setTimeout(render,0));
window.addEventListener("yks:auth-state",()=>setTimeout(render,0));
window.addEventListener("yks:v43-personalization",()=>setTimeout(()=>{polishPersonalization()},0));
window.addEventListener("yks:data-changed",event=>{if(event?.detail?.source!=="settings-profile")setTimeout(render,0)});
[600,1500,3500,7000].forEach(ms=>setTimeout(render,ms));
enforceSettingsOnlyTheme();install();document.documentElement.dataset.modernSettings="ready";