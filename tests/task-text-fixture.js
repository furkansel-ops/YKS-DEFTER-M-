// Test yardımcısı (kendi başına test değildir): app.js'deki tek kaynaktan
// globalThis.YKSTaskText'in gerçek uygulamasını üretir; vm bağlamlarına eklenir.
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const app=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
const pick=(pattern,name)=>{const found=app.match(pattern);if(!found)throw new Error(name+" app.js içinde bulunamadı");return found[0];};

function loadTaskText(){
  const context=vm.createContext({});
  vm.runInContext([
    pick(/^const PLAN_COACH_PREFIX=[^\n]+$/m,"PLAN_COACH_PREFIX").replace(/^const /,"var "),
    pick(/^function planStripCoach\([^\n]+$/m,"planStripCoach"),
    pick(/function planSubjectTone\(name\)\{[\s\S]*?\r?\n}/,"planSubjectTone"),
    "var YKSTaskText=Object.freeze({stripCoachPrefix:planStripCoach,subjectTone:planSubjectTone});"
  ].join("\n"),context);
  return context.YKSTaskText;
}
module.exports={loadTaskText};
