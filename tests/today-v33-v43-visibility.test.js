const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const {stripTypeScriptTypes}=require("node:module");
const {indexWithStartupCss,TODAY_STARTUP_CSS_LINK}=require("./index-html-fixture");
const read=p=>p==="index.html"?indexWithStartupCss():fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");

function fixture(){
  class Node{
    constructor(tag="div",id="",className=""){
      this.tagName=tag.toUpperCase();this.id=id;this.className=className;
      this.children=[];this.dataset={};this.hidden=false;this.style={};
      this.textContent="";this.attributes=new Map();this.handlers={};
      this.namespaceURI="http://www.w3.org/2000/svg";
    }
    get classList(){
      return{
        contains:name=>this.className.split(/\s+/).includes(name),
        add:name=>{if(!this.className.split(/\s+/).includes(name))this.className+=" "+name}
      };
    }
    get firstElementChild(){return this.children[0]||null}
    get nextElementSibling(){
      const siblings=this.parentElement?.children||[];
      return siblings[siblings.indexOf(this)+1]||null;
    }
    setAttribute(k,v){this.attributes.set(k,String(v))}
    getAttribute(k){return this.attributes.get(k)||null}
    append(...nodes){for(const child of nodes){if(child.parentElement)child.parentElement.children=child.parentElement.children.filter(x=>x!==child);child.parentElement=this;this.children.push(child)}}
    prepend(...nodes){this.append(...nodes);for(const node of nodes){this.children=this.children.filter(x=>x!==node);this.children.unshift(node)}}
    insertBefore(node,reference){
      this.append(node);this.children=this.children.filter(x=>x!==node);
      const i=this.children.indexOf(reference);this.children.splice(Math.max(0,i),0,node);
    }
    insertAdjacentElement(where,node){
      if(where!=="afterend"||!this.parentElement)throw Error("unexpected adjacent");
      const parent=this.parentElement;parent.append(node);
      parent.children=parent.children.filter(x=>x!==node);
      parent.children.splice(parent.children.indexOf(this)+1,0,node);
      return node;
    }
    find(predicate){for(const child of this.children){if(predicate(child))return child;const found=child.find(predicate);if(found)return found}return null}
    findAll(predicate,out=[]){for(const child of this.children){if(predicate(child))out.push(child);child.findAll(predicate,out)}return out}
    matches(sel){
      if(sel.startsWith("."))return this.classList.contains(sel.slice(1));
      if(sel.startsWith("#"))return this.id===sel.slice(1);
      if(sel.startsWith("[data-")){
        const m=sel.match(/^\[data-([\w-]+)\]$/);
        if(!m)return false;
        const key=m[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
        return this.dataset[key]!==undefined;
      }
      return this.tagName===sel.toUpperCase();
    }
    contains(node){return node===this||!!this.find(child=>child===node)}
    querySelector(sel){return this.find(n=>n.matches(sel))}
    querySelectorAll(sel){return this.findAll(n=>n.matches(sel))}
    addEventListener(name,fn){(this.handlers[name]??=[]).push(fn)}
  }
  const root=new Node("section","home","screen active");
  const node=(id,cls="",tag="div")=>new Node(tag,id,cls);
  const screenHeading=node("","v33-screen-heading");root.append(screenHeading);
  const intro=node("","v33-home-intro"),head=node("","home-head"),headCopy=node(""),
    greeting=node("greeting"),overview=node("","home-overview v33-home-countdown"),
    hero=node("","hero"),count=node("countdown","count");
  headCopy.append(greeting);head.append(headCopy);hero.append(count);
  overview.append(hero);intro.append(head,overview);root.append(intro);
  const quote=node("sozBox","sozbox");root.append(quote);
  const progress=node("","v33-home-progress"),grid=node("","today-summary-grid v33-progress-metrics");
  const planCard=node("","today-summary"),reviewCard=node("","today-summary");
  planCard.append(node("todayHubPlan"));reviewCard.append(node("todayHubReview"));
  grid.append(planCard,reviewCard);progress.append(grid,node("","v33-legacy-stats"));root.append(progress);
  const actions=node("","home-actions");root.append(actions);
  const hub=node("todayHub","today-hub"),remaining=node("todayRemaining"),
    next=node("todayNext"),reviewWrap=node("todayReviewWrap","today-review-wrap"),
    detail=node("","today-detail-grid"),timeline=node("","today-timeline-panel"),close=node("todayClose");
  hub.append(remaining,next,reviewWrap,detail,timeline,close);root.append(hub);
  const title=node("todayPlanTitle"),plan=node("todayPlan");root.append(title,plan);
  const oldExtra=node("oldLongReport","old-report");root.append(oldExtra);
  const document={
    getElementById:id=>id==="home"?root:root.id===id?root:root.find(n=>n.id===id),
    createElement:tag=>new Node(tag),
    createElementNS:(_,tag)=>new Node(tag),
    addEventListener:()=>{}
  };
  const window={addEventListener:()=>{},dispatchEvent:()=>{}};
  class MutationObserver{constructor(callback){this.callback=callback}observe(){}disconnect(){}}
  const source=read("src/ui/today-v43.ts").replace('import "./today-v43.css";',"").replace(/\bexport /g,"");
  const context=vm.createContext({document,window,HTMLElement:Node,MutationObserver,console});
  vm.runInContext(stripTypeScriptTypes(source)+"\nwindow.__installTodayV43=installTodayV43;",context);
  return{root,intro,head,overview,hero,quote,progress,grid,planCard,reviewCard,hub,title,plan,oldExtra,window};
}

test("v43 startup keeps new Bugün heading, countdown, quote and live progress visible",()=>{
  const h=fixture(),result=h.window.__installTodayV43();
  assert.equal(result.installed,true);
  assert.equal(Array.from(result.validate()).length,0);
  assert.equal(h.root.firstElementChild.classList.contains("v33-screen-heading"),true);
  assert.equal(h.intro.parentElement,h.root);
  assert.equal(h.head.parentElement,h.intro,"welcome header must not be moved to the old shell");
  assert.equal(h.overview.parentElement,h.intro,"YKS countdown must not move");
  assert.equal(h.hero.parentElement,h.overview,"countdown content remains inside visible card");
  assert.equal(h.quote.parentElement,h.root,"daily quote stays as its own compact card");
  assert.equal(h.progress.parentElement,h.root,"daily progress stays visible, not archived");
  assert.equal(h.grid.parentElement,h.progress,"all progress metrics stay in blue card");
  assert.equal(h.planCard.parentElement,h.grid);
  assert.equal(h.reviewCard.parentElement,h.grid,"review count cannot be relocated by v43 details");
  assert.equal(h.progress.hidden,false);
  assert.equal(h.root.classList.contains("v33-today-stage1"),true);
  const archive=h.root.querySelector("[data-v43-secondary]");
  assert.equal(archive.hidden,true);
  assert.ok(archive.find(n=>n===h.oldExtra),"older secondary blocks stay preserved in archive");
  assert.ok(!archive.find(n=>n===h.progress),"new progress cannot be archived");
  assert.ok(!archive.find(n=>n===h.intro),"new header cannot be archived");
});

test("v33 styles remain readable and are not hidden by legacy white-metric v43 selectors",()=>{
  const v43=read("src/ui/today-v43.css");
  const v33=read("src/ui/today-top-v33.css");
  const ts=read("src/ui/today-v43.ts");
  const html=read("index.html");
  assert.match(ts,/classList\.contains\("v33-home-intro"\)/);
  assert.match(ts,/classList\.contains\("v33-home-progress"\)/);
  assert.match(ts,/if\(!v33Top\)refreshMetrics\(\)/);
  assert.doesNotMatch(v43,/#home\.v43-today \.today-summary-grid/);
  assert.doesNotMatch(v43,/#home\[data-rb-today="ready"\] \.today-summary-grid/);
  assert.match(v43,/#home\.v43-today:not\(\.v33-today-stage1\) \.today-summary-grid/);
  assert.match(v33,/#home\.v33-today-stage1 \.v33-home-progress \.today-summary-grid/);
  assert.match(v33,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(html,/class="v33-screen-heading"/);
  assert.equal((html.match(/id="v33HomeDate"/g)||[]).length,1);
});

test("v35 blank Today remains visible when legacy v43 bootstrap rebuilds the home DOM",()=>{
  const h=fixture();
  const fresh=new h.head.constructor("div","todayFreshStart","today-fresh-start");
  fresh.append(new h.head.constructor("h1"));
  h.root.prepend(fresh);
  const result=h.window.__installTodayV43();
  assert.equal(result.installed,true);
  assert.equal(Array.from(result.validate()).length,0,"no boot-time validation errors");
  assert.equal(fresh.parentElement,h.root,"new visible canvas must not be archived");
  assert.equal(h.root.querySelector("#todayFreshStart"),fresh);
  const archive=h.root.querySelector("[data-v43-secondary]");
  assert.ok(archive&&archive.hidden,"old secondary screens remain archived");
  assert.equal(archive.contains(fresh),false,"new canvas must not enter hidden v43 archive");
  assert.equal(h.root.dataset.v43Today,"ready","the legacy startup still finishes");
  assert.equal(h.progress.parentElement,h.root,"the original data nodes remain in the DOM");
});

test("v35 hides only the old Today visuals, not student data or other tabs",()=>{
  const html=read("index.html"),v43=read("src/ui/today-v43.ts");
  const style=html.match(/<style id="todayFreshStartStyles">([\s\S]*?)<\/style>/)?.[1];
  assert.ok(style,"Bugün açılış stilleri bulunamadı");
  // Açılış için kritik: <head> içinde app.css'ten önce, render'ı bekleten bağlantıyla yüklenir.
  const raw=fs.readFileSync(path.resolve(__dirname,"..","index.html"),"utf8"),at=raw.indexOf(TODAY_STARTUP_CSS_LINK);
  assert.ok(at>0&&at<raw.indexOf("</head>")&&at<raw.indexOf("href=\"./app.css\""),"açılış stili head içinde app.css'ten önce bağlanır");
  assert.doesNotMatch(raw.slice(at,at+200),/media=|disabled|rel="preload"/,"render'ı bekleten normal stil bağlantısıdır");
  assert.match(style,/#home\s*>\s*:not\(#todayFreshStart\)\s*\{\s*display:none!important\s*\}/);
  assert.match(style,/#home\s*>\s*#todayFreshStart\s*\{/);
  assert.doesNotMatch(style,/#program|#focus|#topics|#exams/);
  assert.match(v43,/node\.id==="todayFreshStart"/);
  const home=html.slice(html.indexOf('<section id="home"'),html.indexOf('<!-- ============================== PROGRAM'));
  assert.ok(home.indexOf('id="todayFreshStart"')<home.indexOf('id="greeting"'));
  assert.match(home,/<div id="todayFreshStart"[^>]*>\s*<header class="today-fresh-title">/);
  assert.match(home,/<h1>Bugün<\/h1>/);
  assert.match(home,/id="todayFreshGreeting"/);
  assert.match(home,/id="todayFreshDays"/);
  assert.match(home,/id="todayFreshExamDate"/);
  for(const id of ["home","greeting","todayHub","todayHubPlan","todayHubReview","todayPlan","todayClose","journalInput","countdown","sozBox"]){
    assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
  }
  assert.match(html,/<section id="program" class="screen">/);
  assert.match(html,/<section id="pomo" class="screen">/);
});
