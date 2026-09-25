const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");

function fixture(){
  class Node{
    constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attributes=new Map();this.listeners=new Map();this.className="";this.textContent="";this.namespaceURI="http://www.w3.org/2000/svg";}
    get classList(){return {contains:value=>this.className.split(" ").includes(value),add:value=>{this.className+=" "+value;}};}
    setAttribute(name,value){this.attributes.set(name,String(value));}
    getAttribute(name){return this.attributes.get(name)||null;}
    append(...nodes){nodes.forEach(node=>{if(node.parentElement)node.parentElement.children=node.parentElement.children.filter(child=>child!==node);node.parentElement=this;this.children.push(node);});}
    prepend(node){this.append(node);this.children.unshift(this.children.pop());}
    querySelectorAll(selector){const nodes=[];const visit=node=>{for(const child of node.children){if(selector.startsWith(".")?child.classList.contains(selector.slice(1)):child.tagName===selector.toUpperCase())nodes.push(child);visit(child);}};visit(this);return nodes;}
    querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
    addEventListener(name,handler){const handlers=this.listeners.get(name)||[];handlers.push(handler);this.listeners.set(name,handlers);}
    dispatchEvent(event){this.onclick&&event.type==="click"&&this.onclick(event);for(const handler of this.listeners.get(event.type)||[])handler(event);if(event.bubbles&&!event.cancelBubble)this.parentElement?.dispatchEvent(event);return true;}
    click(){this.dispatchEvent(new Event("click",{bubbles:true,cancelable:true}));}
    focus(){this.focused=true;}
  }
  const document={createElement:tag=>new Node(tag),createElementNS:(_,tag)=>new Node(tag)};
  const source=fs.readFileSync(path.resolve(__dirname,"../src/ui/today-v43.ts"),"utf8").replace('import "./today-v43.css";','').replace(/\bexport /g,'');
  const context=vm.createContext({document,HTMLElement:Node,Event});
  vm.runInContext(stripTypeScriptTypes(source),context);
  const node=(tag,cls="",text="")=>{const item=new Node(tag);item.className=cls;item.textContent=text;return item;};
  return {node,enhanceRow:context.enhanceTodayTaskRow,enhanceNext:context.enhanceTodayNext};
}

test("daily task checkbox invokes the existing completion handler once and keeps its state",()=>{
  const {node,enhanceRow}=fixture();const row=node("div","plancell pd"),copy=node("span","pt","Biyoloji · Hücre");row.append(copy);
  let completed=0;row.onclick=()=>completed++;
  enhanceRow(row);enhanceRow(row);
  const checkbox=row.querySelector(".rb-task-toggle");
  assert.equal(row.querySelectorAll(".rb-task-toggle").length,1);
  assert.equal(checkbox.getAttribute("role"),"checkbox");
  assert.equal(checkbox.getAttribute("aria-checked"),"true");
  assert.match(checkbox.getAttribute("aria-label"),/Biyoloji · Hücre/);
  assert.equal(row.querySelector(".rb-task-title").textContent,"Biyoloji");
  assert.equal(row.querySelector(".rb-task-description").textContent,"Hücre");
  checkbox.click();assert.equal(completed,1);
});

test("moving row actions into the menu preserves their handlers without completing the row",()=>{
  const {node,enhanceRow}=fixture();const row=node("div","plancell"),tomorrow=node("button","plan-tomorrow","Yarına"),video=node("button","cvid","Video");
  let completed=0,moved=0,opened=0;row.onclick=()=>completed++;tomorrow.onclick=()=>moved++;video.onclick=()=>opened++;
  row.append(node("span","pt","Problem çöz"),tomorrow,video);enhanceRow(row);
  const menu=row.querySelector(".rb-task-menu");assert.ok(menu);
  assert.equal(menu.querySelector(".plan-tomorrow"),tomorrow);assert.equal(menu.querySelector(".cvid"),video);
  tomorrow.click();video.click();assert.equal(moved,1);assert.equal(opened,1);assert.equal(completed,0);
  menu.open=true;const escape=new Event("keydown");Object.defineProperty(escape,"key",{value:"Escape"});menu.dispatchEvent(escape);
  assert.equal(menu.open,false);assert.equal(menu.querySelector("summary").focused,true);
});

test("next-task Start preserves the real focus action and secondary actions after repeated decoration",()=>{
  const {node,enhanceNext}=fixture();const next=node("div"),actions=node("div","next-actions"),start=node("button","btn","Kronometreyi başlat"),done=node("button","btn","Tamamlandı"),tomorrow=node("button","btn","Yarına");
  let starts=0,completions=0;start.setAttribute("onclick","v25StartTask()");start.onclick=()=>starts++;done.onclick=()=>completions++;
  actions.append(start,done,tomorrow);next.append(node("div","next-eyebrow","Sıradaki görev"),actions);
  enhanceNext(next);enhanceNext(next);
  assert.equal(start.textContent,"Başla");assert.equal(actions.children[0],start);assert.equal(actions.querySelectorAll(".rb-task-menu").length,1);
  assert.equal(actions.querySelector(".rb-task-menu").querySelectorAll("button").length,2);
  start.click();done.click();assert.equal(starts,1);assert.equal(completions,1);
});

test("an empty plan keeps its original open-program action instead of inventing a task",()=>{
  const {node,enhanceNext}=fixture();const next=node("div"),actions=node("div","next-actions"),open=node("button","btn","Programı aç");
  open.setAttribute("onclick","go('program')");actions.append(open);next.append(actions);
  enhanceNext(next);assert.equal(open.textContent,"Programı aç");assert.equal(next.querySelector(".rb-task-menu"),null);
});
