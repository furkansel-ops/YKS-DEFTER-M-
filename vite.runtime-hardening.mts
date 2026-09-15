import {defineConfig,type Plugin,type UserConfig} from "vite";
import baseConfig from "./vite.config.mts";

function replaceRequired(source:string,needle:string,replacement:string,label:string):string{
  if(!source.includes(needle))throw new Error(`Hoca medya on-demand yaması uygulanamadı: ${label}`);
  return source.replace(needle,replacement);
}

function hardenTeacherMediaOnDemand(source:string):string{
  let next=source;
  next=replaceRequired(
    next,
    'function enhanceOverlay(overlay:HTMLElement):void{',
    'function ownTeacher(name:string):boolean{try{const rows=(window as Window&{allTeachers?:()=>Array<{a?:string;own?:boolean}>}).allTeachers?.();return Array.isArray(rows)&&rows.some(item=>item?.a===name&&item.own===true);}catch{return false;}}\nfunction enhanceOverlay(overlay:HTMLElement):void{',
    "özel hoca tespiti"
  );
  next=replaceRequired(
    next,
    'renderMediaSection(overlay,heading);void refreshOverlayMedia(overlay,heading,false);',
    'renderMediaSection(overlay,heading);if(!ownTeacher(heading))void refreshOverlayMedia(overlay,heading,false);',
    "özel hocada otomatik arşivi kapatma"
  );
  next=replaceRequired(
    next,
    '  void loadFeed(false).then(()=>{decorateCards();scan();});observer=new MutationObserver(scan);',
    '  decorateCards();observer=new MutationObserver(scan);',
    "medya feedini başlangıçta indirmeme"
  );
  next=replaceRequired(
    next,
    '  await loadFeed(force);if(!document.contains(overlay)||activeTeacher!==name)return;renderMediaSection(overlay,name);',
    '  await loadFeed(force);decorateCards();if(!document.contains(overlay)||activeTeacher!==name)return;renderMediaSection(overlay,name);',
    "istek sonrası kartları güncelleme"
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
