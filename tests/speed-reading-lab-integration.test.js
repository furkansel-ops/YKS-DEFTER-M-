const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

test("speed reading shares all lab tab visibility and suspends on exit",()=>{
  const names=["Periodic","Timeline","Science","Atlas","Speed"],nodes=new Map();
  let readingMounts=0,readingSuspends=0,atlasSuspends=0;
  for(const name of names){
    nodes.set("v320Panel"+name,{hidden:true});
    nodes.set("v320Tab"+name,{classList:{toggle(){}},attributes:{},setAttribute(key,value){this.attributes[key]=value;}});
  }
  nodes.set("v4TimelineUpgrade",{dataset:{timelineVersion:"3"}});
  const window={addEventListener(){},srInitLearn(){readingMounts++;},YKSSpeedReading:{suspend(){readingSuspends++;}},YKSBiologyAtlas:{mount(){},suspend(){atlasSuspends++;}},YKSScienceCards:{mount(){return true;}}};
  const document={readyState:"loading",addEventListener(){},getElementById:id=>nodes.get(id)||null};
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,"../modules/learning-lab-v3.js"),"utf8"),{window,document,setTimeout(){},requestAnimationFrame(){}});
  for(const active of ["Speed","Science","Atlas","Timeline","Periodic","Speed"]){
    window.YKSLearningLabV3.setTab(active.toLowerCase());
    for(const name of names){
      assert.equal(nodes.get("v320Panel"+name).hidden,name!==active,`${active}: ${name}`);
      assert.equal(nodes.get("v320Tab"+name).attributes["aria-selected"],String(name===active));
    }
  }
  assert.equal(readingMounts,2);assert.equal(readingSuspends,4);assert.equal(atlasSuspends,5);
});
