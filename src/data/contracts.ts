export const DATA_SCHEMA_VERSION=21 as const;
export type DataSchemaVersion=typeof DATA_SCHEMA_VERSION;
export type IsoDateKey=`${number}-${number}-${number}`;
export type UnknownRecord=Record<string,unknown>;
export type NumberMap=Record<string,number>;
export type NestedNumberMap=Record<string,NumberMap>;

export interface LegacyEntity extends UnknownRecord{
  id?:number;
  at?:number;
  updatedAt?:number;
}

export interface TopicProgress extends UnknownRecord{
  st:number;
  conf:number;
  ts?:IsoDateKey|null;
  rev:number[];
  revDone:Record<string,IsoDateKey>;
  dl?:IsoDateKey;
  res?:string;
}

export interface SubjectResult extends UnknownRecord{
  name:string;
  d:number;
  y:number;
  b:number;
  net:number;
  cap:number;
}

export interface ExamRecord extends LegacyEntity{
  type:"TYT"|"AYT"|"YDT"|"BRANS";
  name:string;
  pub?:string;
  date:IsoDateKey;
  difficulty?:"kolay"|"normal"|"zor";
  note?:string;
  netOnly?:boolean;
  totalNet:number;
  dur:number;
  subjectResults:SubjectResult[];
}

export interface WrongLogRecord extends LegacyEntity{
  date?:IsoDateKey;
  subject?:string;
  topic?:string;
  n?:number;
  kind?:"bilmiyordum"|"dikkat"|"sure";
}

export interface FocusReasons extends UnknownRecord{
  phone?:number;
  attention?:number;
  need?:number;
  other?:number;
  break?:number;
}

export interface FocusSession extends UnknownRecord{
  t:number;
  end?:number;
  m:number;
  subj:string;
  topic:string;
  task:string;
  type:"work"|"break";
  done:boolean;
  note:string;
  goal:string;
  goalQ:number;
  actualQ:number;
  quality:number;
  interruptions:number;
  reasons:FocusReasons;
  focusScore:number;
  source:""|"sw"|"pomo";
  plannedMin:number;
  qCredited:boolean;
}

export interface StopwatchEntry extends UnknownRecord{
  id:number;
  at:number;
  end:number;
  ms:number;
  subj:string;
  topic:string;
}

export interface QuestionBankEntry extends LegacyEntity{
  img:string;
  subject:string;
  topic:string;
  note:string;
  date:IsoDateKey;
  done:boolean;
}

export interface DayReview extends UnknownRecord{
  mood:""|"good"|"mid"|"hard";
  note:string;
  at:number;
}

export interface WeekPlan extends UnknownRecord{
  r:string[][];
  s:string[][];
  done?:boolean[];
  dn?:UnknownRecord;
  mv?:UnknownRecord;
}

export interface LearningCard extends LegacyEntity{
  subject:string;
  q:string;
  a:string;
  due:IsoDateKey;
  interval:number;
  ease:number;
  reps:number;
  lapses:number;
  createdAt:number;
  updatedAt:number;
}

export interface LearningReview extends LegacyEntity{
  cardId:number;
  grade:number;
  subject:string;
}

export interface LearningState extends UnknownRecord{
  cards:LearningCard[];
  formulaFav:string[];
  reviewLog:LearningReview[];
}

export interface ParagraphLog extends LegacyEntity{
  words:number;
  seconds:number;
  wpm:number;
  score:number;
  title:string;
}

export interface LearningLabState extends UnknownRecord{
  paragraphLog:ParagraphLog[];
  elementFav:number[];
  timelineFav:string[];
}

export interface FocusState extends UnknownRecord{
  goalMin:number;
  longBreak:number;
  cycles:number;
  autoNext:boolean;
  keepAwake:boolean;
  mode:"pomo"|"sw";
  sessionGoal?:string;
  sessionGoalQ?:number;
  sw:{run:boolean;start:number;acc:number;cr:number};
  swLaps:Array<{t:number;subj:string}>;
}

export interface NotificationState extends UnknownRecord{
  on:boolean;
  pomo:boolean;
  review:boolean;
  evening:boolean;
  eveningAt:string;
  lastEvening:string;
  lastReview:string;
}

export interface YksState extends UnknownRecord{
  v:DataSchemaVersion;
  name:string;
  examDate:IsoDateKey|string;
  target:number;
  targetNet:number;
  obp:number;
  solved:NumberMap;
  solvedTopic:NestedNumberMap;
  topics:Record<string,TopicProgress>;
  denemeler:ExamRecord[];
  wrongLog:WrongLogRecord[];
  pomoMin:NumberMap;
  pomoSubj:NestedNumberMap;
  pauses:NumberMap;
  journal:Record<string,unknown>;
  dayReview:Record<string,DayReview>;
  books:LegacyEntity[];
  workMin:number;
  breakMin:number;
  weeks:Record<string,WeekPlan>;
  rows:{r:number;s:number};
  rowLabels:{r:string[];s:string[]};
  theme:"auto"|"paper"|"night"|"forest"|"ocean"|"lavender"|"sunset"|"graphite";
  sound:boolean;
  focusSound:"none"|"white"|"brown";
  lastBackup:string|null;
  badges:string[];
  badgeAt:NumberMap;
  swHistory:Record<string,StopwatchEntry[]>;
  fontScale:number;
  simulMin:number;
  qbank:QuestionBankEntry[];
  sessions:Record<string,FocusSession[]>;
  restSnooze:string;
  pauseReasons:Record<string,FocusReasons>;
  wizardDone:boolean;
  simple:boolean;
  demo:boolean;
  demoBackup:string|null;
  workdays:number;
  calib:LegacyEntity[];
  rev?:number;
  revAt?:number;
  device:string;
  teachers:LegacyEntity[];
  favTeachers:string[];
  role:"ogrenci"|"koc";
  coachNotes:LegacyEntity[];
  watched:Record<string,LegacyEntity>;
  lastExport:number;
  briefDay:string;
  sozKapali:boolean;
  sozOfs:number;
  sozGun:string;
  puanTuru:"SAY"|"EA"|"SOZ"|"DIL";
  hedefSira:number;
  morning:{day:string;done:string[];hidden:boolean};
  contracts:LegacyEntity[];
  denemeGun:number;
  log:LegacyEntity[];
  targets:LegacyEntity[];
  templates:LegacyEntity[];
  topicRes:Record<string,LegacyEntity[]>;
  camp:LegacyEntity|null;
  smartPlan:UnknownRecord;
  examTasks:LegacyEntity[];
  studyPrefs:{autoPlan:boolean;[key:string]:unknown};
  learning:LearningState;
  lab:LearningLabState;
  notif:NotificationState;
  yt:{key:string;src:"auto"|"key"|"gas"|"link";err:string};
  chCache:Record<string,LegacyEntity>;
  focus:FocusState;
  coef:{tytBase:number;tytK:number;ayBase:number;ayTyt:number;ayAyt:number;obpK:number};
}

export type YksStateCandidate=Partial<YksState>&UnknownRecord;
