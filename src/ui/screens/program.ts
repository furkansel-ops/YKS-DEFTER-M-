import type {ScreenModule} from "./contracts";
import {programLegacyAdapter} from "./legacy-adapters";

let flexPromise:Promise<void>|null=null;
function loadProgramFlex():void{
  if(!flexPromise){
    flexPromise=import("../program-flex-v45")
      .then(mod=>{mod.installProgramFlexV45();})
      .catch(error=>{console.error("Esnek Programım arayüzü yüklenemedi",error);flexPromise=null;});
  }else{
    void flexPromise.then(()=>import("../program-flex-v45").then(mod=>mod.installProgramFlexV45()));
  }
}

export const programScreen:ScreenModule={
  id:"program",
  required:programLegacyAdapter.required,
  render(environment){
    programLegacyAdapter.render(environment);
    environment.afterPaint("program-flex-v45",loadProgramFlex);
  }
};
