const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=pathName=>fs.readFileSync(path.join(root,pathName),"utf8");

test("the obsolete companion is not imported or initialized by the application shell",()=>{
  const shell=read("src/ui/refined-shell.ts");
  assert.doesNotMatch(shell,/mascot|maskot|companion/i);
  assert.match(shell,/installRefinedStudyScreens\(\)/);
});

test("settings keeps appearance and personalization without character controls",()=>{
  const settings=read("public/settings-profile-runtime.js"),prefs=read("src/ui/personalization-v43.ts");
  assert.match(settings,/data-yms-appearance-slot/);
  assert.match(settings,/title:"Görünüm"/);
  assert.doesNotMatch(settings,/mascot|maskot|__YKS_MASCOT__|yks:mascot-change/i);
  assert.doesNotMatch(prefs,/mascot|maskot/i);
});

test("legacy model, motion, scene, artwork and their own obsolete tests are removed",()=>{
  const retired=[
    "src/ui/mascot-companion.ts","src/ui/mascot-companion.css","src/ui/mascot-runtime.css",
    "src/ui/mascot-motion.ts","src/ui/mascot-models.ts","src/ui/mascot-scene.ts",
    "tests/mascot-motion.test.js","tests/mascot-models.test.js","tests/mascot-appearance-settings.test.js",
    "docs/mascot-focus-r26.md"
  ];
  for(const target of retired)assert.equal(fs.existsSync(path.join(root,target)),false,target);
  assert.equal(fs.existsSync(path.join(root,"public/mascots")),false);
  assert.equal(fs.existsSync(path.join(root,"docs/focus-notifications-r26.md")),true);
});

test("retained 3D biology and focus notifications remain intact",()=>{
  assert.match(read("src/ui/biology-atlas-model.ts"),/from "three"/);
  assert.match(read("modules/focus-notifications.js"),/focus/i);
  assert.match(read("docs/focus-notifications-r26.md"),/Bildirimden odak kontrolü/);
});
