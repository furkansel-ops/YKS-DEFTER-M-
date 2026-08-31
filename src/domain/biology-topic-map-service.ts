import {ATLAS_GUIDES} from "../data/biology-atlas-guides.ts";
import type {AtlasTopic} from "../data/biology-atlas.ts";

export interface AtlasTopicMapNode {
  id:number;
  label:string;
  detail:string;
}
export interface AtlasTopicMapEdge {
  from:number;
  to:number;
  label:string;
  explicit:boolean;
}
export interface AtlasTopicMapPlan {
  topicId:string;
  title:string;
  nodes:readonly AtlasTopicMapNode[];
  edges:readonly AtlasTopicMapEdge[];
  anchor:string;
  trap:string;
}

const compact=(value:string,limit=118)=>{
  const text=value.replace(/\s+/g," ").trim();
  return text.length<=limit?text:text.slice(0,limit-1).trimEnd()+"…";
};

export function buildAtlasTopicMap(topic:AtlasTopic):AtlasTopicMapPlan {
  const guide=ATLAS_GUIDES[topic.id];
  const nodes=topic.steps.map(([label,detail],id)=>({id,label,detail:compact(detail)}));
  const valid=topic.links.filter(([from,to])=>Number.isInteger(from)&&Number.isInteger(to)&&from>=0&&to>=0&&from<nodes.length&&to<nodes.length&&from!==to);
  const edges:AtlasTopicMapEdge[]=valid.length
    ? valid.map(([from,to,label])=>({from,to,label:compact(label||"bağlantı",48),explicit:true}))
    : nodes.slice(0,-1).map((_,from)=>({from,to:from+1,label:"ilişkilendir",explicit:false}));
  return {
    topicId:topic.id,
    title:topic.title,
    nodes,
    edges,
    anchor:compact(guide?.takeaway||topic.intro,180),
    trap:compact(topic.trap,180)
  };
}
