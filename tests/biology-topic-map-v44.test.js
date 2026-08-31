const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("v4.4 görsel konu haritası 24 Atlas konusunun bütün kavramlarını ve bağlantılarını kapsar",async()=>{
  const [{ATLAS_TOPICS},{buildAtlasTopicMap}]=await Promise.all([
    import(pathToFileURL(path.join(root,"src/data/biology-atlas.ts")).href),
    import(pathToFileURL(path.join(root,"src/domain/biology-topic-map-service.ts")).href)
  ]);
  assert.equal(ATLAS_TOPICS.length,24);
  for(const topic of ATLAS_TOPICS){
    const plan=buildAtlasTopicMap(topic);assert.equal(plan.topicId,topic.id);assert.equal(plan.nodes.length,topic.steps.length,topic.id);assert.ok(plan.anchor.length>8,topic.id);assert.ok(plan.trap.length>8,topic.id);
    for(const node of plan.nodes){assert.equal(node.id>=0&&node.id<topic.steps.length,true,topic.id);assert.ok(node.label.length>0,topic.id);assert.ok(node.detail.length>0,topic.id);}
    if(topic.steps.length>1)assert.ok(plan.edges.length>0,topic.id);
    for(const edge of plan.edges){assert.ok(edge.from>=0&&edge.from<topic.steps.length,topic.id);assert.ok(edge.to>=0&&edge.to<topic.steps.length,topic.id);assert.notEqual(edge.from,edge.to,topic.id);assert.ok(edge.label.length>0,topic.id);}
  }
});

test("v4.4 konu haritası yalnız Adım adım görünümünde açılır, mevcut durak seçimini kullanır ve quiz cevabını sızdırmaz",()=>{
  const lessons=read("src/ui/biology-atlas-lessons.ts"),ui=read("src/ui/biology-topic-map-v44.ts"),service=read("src/domain/biology-topic-map-service.ts"),css=read("src/ui/biology-topic-map-v44.css"),entry=read("src/main.ts");
  assert.match(lessons,/atlasTopicMapV44\(t,step\)/);assert.match(lessons,/focused=view==="steps"/);assert.match(ui,/data-atlas-map-step/);assert.doesNotMatch(ui,/class="atlas-topic-map-v44__node" data-atlas-step=/);assert.match(ui,/atlas-stage-roadmap \[data-atlas-step=/);assert.match(ui,/aria-current=["']step["']/);assert.match(ui,/AYT GÖRSEL KONU HARİTASI/);assert.match(ui,/YKS ANA FİKİR/);assert.match(ui,/KARIŞTIRMA NOKTASI/);assert.doesNotMatch(ui,/quiz\.answer|answerAtlas|picked/);assert.match(css,/pointer:coarse/);assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(ui,/typeof document !== "undefined"/);assert.match(ui,/import\("\.\/biology-topic-map-v44\.css"\)\.catch/);assert.doesNotMatch(`${ui}\n${service}`,/localStorage|indexedDB|Dexie|firebase|saveSoon|Program|program\.push|program\.splice/i);assert.doesNotMatch(entry,/biology-topic-map-v44/);
});
