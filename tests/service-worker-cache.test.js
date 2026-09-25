const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const source=fs.readFileSync(path.resolve(__dirname,"../sw.js"),"utf8");
const scope="https://example.test/YKS-DEFTER-M-/";
const cacheName="yks-core-v4.4.0-r3";
const oldHtml='<script src="./assets/index-old.js"></script>';
const newHtml='<script src="./assets/index-new.js"></script><link href="./assets/index-new.css">';

function harness({initial={},network=async()=>new Response("asset"),rejectBatch=false,manifest={version:1,entry:"./assets/index-new.js",assets:["./assets/index-new.js"]}}={}){
  const stores=new Map(),events={},operations=[];
  let skipped=0;
  const key=input=>new URL(typeof input==="string"?input:input.url,scope).href;
  const fetch=async input=>key(input).endsWith("/offline-startup-assets.json")&&manifest!==null
    ?new Response(JSON.stringify(manifest),{headers:{"Content-Type":"application/json"}}):network(key(input),input);
  const createCache=()=>{
    const entries=new Map();
    return {
      entries,
      async match(input){return entries.get(key(input))?.clone();},
      async put(input,response){operations.push(`put:${key(input)}`);entries.set(key(input),response.clone());},
      // Cache.addAll commits one batch only after all fetches succeed, per Cache API.
      async addAll(requests){
        const responses=await Promise.all(requests.map(async request=>{
          const response=await fetch(request);
          if(!response?.ok)throw new TypeError("Cache.addAll request failed");
          return response;
        }));
        if(rejectBatch)throw new DOMException("Quota full","QuotaExceededError");
        requests.forEach((request,index)=>entries.set(key(request),responses[index].clone()));
        operations.push("batch");
      }
    };
  };
  const cache=createCache();stores.set(cacheName,cache);
  for(const [url,body] of Object.entries(initial))cache.entries.set(key(url),new Response(body));
  const context=vm.createContext({
    URL,Request,Response,AbortController,setTimeout,clearTimeout,fetch,
    caches:{
      async open(name){if(!stores.has(name))stores.set(name,createCache());return stores.get(name);},
      async delete(name){operations.push(`delete:${name}`);return stores.delete(name);},
      async keys(){return [...stores.keys()];}
    },
    self:{
      registration:{scope},location:{href:new URL("sw.js",scope).href,origin:new URL(scope).origin},
      addEventListener:(name,callback)=>{events[name]=callback;},
      skipWaiting:async()=>{skipped++;operations.push("skipWaiting");},clients:{claim:async()=>{operations.push("claim");}}
    }
  });
  vm.runInContext(source,context);
  return {
    context,operations,stores,
    get skipped(){return skipped;},
    async body(url){return (await stores.get(cacheName)?.match(url))?.text();},
    async install(){let pending;events.install({waitUntil:value=>{pending=value;}});await pending;},
    async refresh(response){await context.cacheLatestShell(response);}
  };
}

const previous={"./":oldHtml,"./index.html":oldHtml,"./assets/index-old.js":"old bundle","./app.js?v=4.1.0-r20":"old app","./__offline_ready__":"4.4.0-r3"};
const shellNetwork=(url)=>Promise.resolve(new Response(url.endsWith("/index.html")?newHtml:"new asset"));

test("shell dependency discovery includes local legacy scripts and preserves query identities",()=>{
  const runtime=harness();
  const html=`${newHtml}
    <script src="./modules/study-intelligence-core.js?v=4.1.0-r1"></script>
    <script src="/YKS-DEFTER-M-/modules/study-intelligence-core.js?v=4.1.0-r1"></script>
    <script src="./modules/study-intelligence-v5.js?v=4.1.0-r1"></script>
    <link rel="manifest" href="./manifest.webmanifest?v=4.1.0-r20">
    <script src="https://cdn.example.test/remote.js"></script>
    <script src="../other-app/main.js"></script>
    <a href="./download.js">download</a>`;
  assert.deepEqual(Array.from(runtime.context.buildAssets(html)),[
    "./assets/index-new.js","./assets/index-new.css",
    "./modules/study-intelligence-core.js?v=4.1.0-r1",
    "./modules/study-intelligence-v5.js?v=4.1.0-r1",
    "./manifest.webmanifest?v=4.1.0-r20"
  ]);
});

test("teacher video preload uses the same query identity as its dynamic runtime loader",async()=>{
  const main=fs.readFileSync(path.resolve(__dirname,"../src/main.ts"),"utf8");
  const runtimeUrl=main.match(/new URL\("(\.\/teacher-videos\.js[^"']*)"/)?.[1];
  assert.ok(runtimeUrl);
  const runtime=harness({network:shellNetwork});
  await runtime.install();
  assert.equal(await runtime.body(runtimeUrl),"new asset");
});

test("independent settings runtime is cached before the first offline launch",async()=>{
  const loader=fs.readFileSync(path.resolve(__dirname,"../src/ui/student-account-loader.ts"),"utf8");
  const runtimeUrl=loader.match(/loadModuleScript\(SETTINGS_SCRIPT_ID,"([^"]+)"/)?.[1];
  assert.ok(runtimeUrl);
  const runtime=harness({network:shellNetwork});
  await runtime.install();
  assert.equal(await runtime.body(runtimeUrl),"new asset");
});

test("failed same-build worker update preserves the working shell and all old assets",async()=>{
  let releaseSlow;
  const slow=new Promise(resolve=>{releaseSlow=resolve;});
  const runtime=harness({initial:previous,network:async url=>{
    if(url.endsWith("/assets/index-new.css"))return new Response("missing",{status:404});
    if(url.endsWith("/assets/index-new.js"))await slow;
    return shellNetwork(url);
  }});
  const installed=runtime.install();
  await assert.rejects(installed);
  releaseSlow();
  await new Promise(resolve=>setImmediate(resolve));
  for(const [url,body] of Object.entries(previous))assert.equal(await runtime.body(url),body,url);
  assert.equal(await runtime.body("./assets/index-new.js"),undefined);
  assert.equal(runtime.skipped,0);
  assert.ok(!runtime.operations.some(value=>value.startsWith("delete:")));
});

test("cache quota failure preserves old offline readiness and shell",async()=>{
  const runtime=harness({initial:previous,network:shellNetwork,rejectBatch:true});
  await assert.rejects(runtime.install(),/Quota/);
  for(const [url,body] of Object.entries(previous))assert.equal(await runtime.body(url),body,url);
  assert.equal(runtime.skipped,0);
});

test("first install failing an asset never marks offline ready or activates early",async()=>{
  const runtime=harness({network:async url=>url.endsWith(".css")?new Response("missing",{status:404}):shellNetwork(url)});
  await assert.rejects(runtime.install());
  assert.equal(await runtime.body("./__offline_ready__"),undefined);
  assert.equal(await runtime.body("./index.html"),undefined);
  assert.equal(runtime.skipped,0);
});

test("successful install stores exact checked shell after assets and activates last",async()=>{
  const runtime=harness({initial:previous,network:shellNetwork});
  await runtime.install();
  assert.equal(await runtime.body("./index.html"),newHtml);
  assert.equal(await runtime.body("./"),newHtml);
  assert.equal(await runtime.body("./assets/index-new.js"),"new asset");
  assert.equal(await runtime.body("./__offline_ready__"),"4.4.0-r3");
  assert.equal(runtime.operations[0],"batch");
  assert.equal(runtime.operations.at(-1),"skipWaiting");
  assert.equal(runtime.skipped,1);
});

test("online HTML never replaces offline shell until newly hashed assets are available",async()=>{
  const runtime=harness({initial:previous,network:async()=>new Response("missing",{status:404})});
  await runtime.refresh(new Response(newHtml));
  assert.equal(await runtime.body("./index.html"),oldHtml);
  assert.equal(await runtime.body("./"),oldHtml);
  assert.equal(await runtime.body("./assets/index-old.js"),"old bundle");
});

test("online shell refresh saves its assets first and reuses already cached hashes",async()=>{
  let requests=0;
  const runtime=harness({initial:previous,network:async()=>{requests++;return new Response("new asset");}});
  await runtime.refresh(new Response(newHtml));
  assert.equal(await runtime.body("./index.html"),newHtml);
  assert.equal(await runtime.body("./assets/index-new.js"),"new asset");
  assert.equal(runtime.operations[0],"batch");
  assert.equal(requests,2);
  await runtime.refresh(new Response(newHtml));
  assert.equal(requests,2);
});

test("first install precaches startup dynamic JS and CSS before marking offline ready",async()=>{
  const manifest={version:1,entry:"./assets/index-new.js",assets:["./assets/index-new.js","./assets/theme-startup.js","./assets/today-startup.css"]};
  const runtime=harness({manifest,network:shellNetwork});await runtime.install();
  assert.equal(await runtime.body("./assets/theme-startup.js"),"new asset");
  assert.equal(await runtime.body("./assets/today-startup.css"),"new asset");
  assert.equal(await runtime.body("./__offline_ready__"),"4.4.0-r3");
  assert.equal(runtime.operations[0],"batch");
});

test("failed dynamic startup dependency leaves the previous offline shell and readiness intact",async()=>{
  const manifest={version:1,entry:"./assets/index-new.js",assets:["./assets/index-new.js","./assets/today-missing.css"]};
  const runtime=harness({initial:previous,manifest,network:async url=>url.endsWith("/today-missing.css")?new Response("missing",{status:404}):shellNetwork(url)});
  await assert.rejects(runtime.install());
  for(const [url,body] of Object.entries(previous))assert.equal(await runtime.body(url),body,url);
  assert.equal(await runtime.body("./assets/index-new.js"),undefined);assert.equal(runtime.skipped,0);
});

test("manifest must match the shell entry and contain only scoped startup JS/CSS",async()=>{
  const invalid=[null,
    {version:1,entry:"./assets/other-build.js",assets:["./assets/other-build.js"]},
    ...["https://evil.test/code.js","../outside.js","./assets/../../outside.js","./assets/%2e%2e/outside.js","./anatomy/models/heart.glb"].map(asset=>({version:1,entry:"./assets/index-new.js",assets:["./assets/index-new.js",asset]}))
  ];
  for(const manifest of invalid){
    const runtime=harness({initial:previous,manifest,network:shellNetwork});
    await assert.rejects(runtime.install());
    await runtime.refresh(new Response(newHtml));
    assert.equal(await runtime.body("./index.html"),oldHtml);assert.equal(runtime.skipped,0);
    assert.equal(runtime.operations.length,0,"Manifest doğrulanmadan cache değişmemeli");
  }
});

test("same-worker online shell refresh also prepares its new startup hashes",async()=>{
  const manifest={version:1,entry:"./assets/index-new.js",assets:["./assets/index-new.js","./assets/theme-next.js","./assets/today-next.css"]};
  const runtime=harness({initial:previous,manifest,network:shellNetwork});await runtime.refresh(new Response(newHtml));
  assert.equal(await runtime.body("./assets/theme-next.js"),"new asset");
  assert.equal(await runtime.body("./assets/today-next.css"),"new asset");
  assert.equal(await runtime.body("./index.html"),newHtml);assert.equal(runtime.operations[0],"batch");
});
