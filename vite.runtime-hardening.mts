import {defineConfig,type Plugin,type UserConfig} from "vite";
import baseConfig from "./vite.config.mts";

function replaceRequired(source:string,needle:string,replacement:string,label:string):string{
  if(!source.includes(needle))throw new Error(`Hoca medya on-demand yaması uygulanamadı: ${label}`);
  return source.replace(needle,replacement);
}

function hardenTeacherMediaOnDemand(source:string):string{
  let next=source;

  /* Overlay açılınca yalnız küçük teachers-v2-feed.json önizlemesini indir.
     Tam arşiv indeksi ve sayfaları refresh / daha fazla eylemine kadar bekler. */
  next=replaceRequired(
    next,
    'async function refreshOverlayMedia(overlay:HTMLElement,name:string,force=false):Promise<void>{',
    'async function previewOverlayMedia(overlay:HTMLElement,name:string,force=false):Promise<void>{\n  const status=overlay.querySelector<HTMLElement>("#teachersV2MediaStatus");if(status&&!mediaFor(name))status.innerHTML=\'<span class="teachers-v2-media-dot pending"></span>Son videolar yükleniyor…\';\n  await loadFeed(force);decorateCards();if(!document.contains(overlay)||activeTeacher!==name)return;renderMediaSection(overlay,name);\n}\nasync function refreshOverlayMedia(overlay:HTMLElement,name:string,force=false):Promise<void>{',
    "hafif video önizleme katmanı"
  );

  next=replaceRequired(
    next,
    'renderMediaSection(overlay,heading);void refreshOverlayMedia(overlay,heading,false);',
    'renderMediaSection(overlay,heading);void previewOverlayMedia(overlay,heading,false);',
    "overlay açılışında yalnız önizleme"
  );

  next=replaceRequired(
    next,
    '  void loadFeed(false).then(()=>{decorateCards();scan();});observer=new MutationObserver(scan);',
    '  decorateCards();observer=new MutationObserver(scan);',
    "medya feedini uygulama başlangıcında indirmeme"
  );

  next=replaceRequired(
    next,
    '  await loadFeed(force);if(!document.contains(overlay)||activeTeacher!==name)return;renderMediaSection(overlay,name);',
    '  await loadFeed(force);decorateCards();if(!document.contains(overlay)||activeTeacher!==name)return;renderMediaSection(overlay,name);',
    "tam arşiv isteği sonrası kartları güncelleme"
  );

  next=replaceRequired(
    next,
    'loading=Boolean(manifest?.archiveIndex&&!stateFor(name));',
    'loading=false;',
    "bekleyen arşivi yanlışlıkla yükleniyor göstermeme"
  );

  next=replaceRequired(
    next,
    'window.addEventListener("online",()=>{void loadFeed(true).then(()=>{decorateCards();scan();});});window.addEventListener("storage",event=>{if(event.key==="yks")refreshWatchedUi();});',
    'window.addEventListener("online",()=>{if(lastOverlay&&activeTeacher&&document.contains(lastOverlay))void previewOverlayMedia(lastOverlay,activeTeacher,true);});window.addEventListener("storage",event=>{if(event.key==="yks")refreshWatchedUi();});',
    "ağ dönüşünde yalnız açık hoca önizlemesini yenileme"
  );

  return next;
}

function prepareTeacherMediaOnDemand():Plugin{
  return {
    name:"prepare-teacher-media-on-demand",
    enforce:"pre",
    transform(code,id){
      const clean=id.split("?")[0].replace(/\\/g,"/");
      if(!clean.endsWith("/src/ui/teachers-v2-media.ts"))return null;
      return {code:hardenTeacherMediaOnDemand(code),map:null};
    }
  };
}

const base=baseConfig as UserConfig;

export default defineConfig({
  ...base,
  plugins:[prepareTeacherMediaOnDemand(),...(base.plugins??[])]
});
