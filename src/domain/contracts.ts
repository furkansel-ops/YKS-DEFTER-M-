import type {FocusSession,IsoDateKey,NumberMap,UnknownRecord,YksState} from "../data/contracts";

export type TopicStatus=0|1|2|3;
export type TopicConfidence=0|1|2|3|4|5;

export interface TopicRecord extends UnknownRecord{
  st:number;
  conf:number;
  ts?:IsoDateKey|null;
  rev:number[];
  revDone?:Record<string,IsoDateKey>;
  dl?:IsoDateKey;
  res?:string;
}

export interface TopicStateSlice{
  topics:Record<string,TopicRecord>;
}

export interface ActivityStateSlice{
  solved:NumberMap;
  pomoMin:NumberMap;
  topics:Record<string,TopicRecord>;
  sessions:Record<string,FocusSession[]>;
  focus:YksState["focus"];
}

export interface SubjectDefinition{
  exam:string;
  name:string;
  topics:string[];
}

export interface SubjectProgressSummary{
  pct:number;
  full:number;
  total:number;
}

export interface ReviewQueueEntry{
  key:string;
  gi:number;
  gap:number;
  due:IsoDateKey|string;
  exam:string;
  subj:string;
  topic:string;
  late:number;
}
