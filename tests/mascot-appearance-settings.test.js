const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const source=fs.readFileSync(path.resolve(__dirname,"../src/ui/mascot-companion.ts"),"utf8");
const javascript=stripTypeScriptTypes(source.replace(/^import[^\n]*\n/gm,""),{mode:"strip"}).replace(/^export /gm,"");

test("floating mascot yields only to the visible appearance settings panel",()=>{
  let category="appearance",visible=true,visibility="visible",panelExists=true;
  const panel={getClientRects:()=>visible?[{}]:[]};
  const context={document:{querySelector:selector=>{
    assert.equal(selector,'#yksModernSettings[data-category="appearance"]');
    return panelExists&&category==="appearance"?panel:null;
  }},getComputedStyle:()=>({visibility})};
  const isOpen=vm.runInNewContext(javascript+"\nappearanceSettingsOpen",context);
  assert.equal(isOpen(),true,"appearance controls remain accessible");
  visible=false;assert.equal(isOpen(),false,"home restores mascot even when settings remembers its category");
  visible=true;category="overview";assert.equal(isOpen(),false,"settings overview restores mascot");
  category="study";assert.equal(isOpen(),false,"other settings categories do not pause the mascot");
  category="appearance";visibility="hidden";assert.equal(isOpen(),false);
  visibility="visible";panelExists=false;assert.equal(isOpen(),false,"lazy settings initialization is safe");
});

test("appearance transitions reuse the hidden, inert and paused mascot path",()=>{
  assert.match(source,/obscured=overlayOpen\(\)\|\|keyboardOpen\(\)\|\|appearanceSettingsOpen\(\)/);
  assert.match(source,/strip\.inert=obscured/);
  assert.match(source,/focusObserver\.observe\(settings,\{subtree:true,attributes:true,attributeFilter:\["data-category","hidden","style"\]\}\)/);
  assert.match(source,/"yks:navigation-after",watchFocus/);
  assert.doesNotMatch(source,/companion-chat|companion-bubble/);
});
