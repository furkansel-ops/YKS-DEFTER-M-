import type {ExamRecord,SubjectResult,WrongLogRecord,YksStateCandidate} from "../data/contracts";

export type ExamAnalysisType="TYT"|"AYT"|"YDT"|"BRANS";
export type ExamAnalysisWindow=0|5|10;

export interface ExamTrendPoint{id:number;name:string;date:string;net:number;}
export interface ExamPeriodComparison{currentAverage:number|null;previousAverage:number|null;delta:number|null;currentCount:number;previousCount:number;}
export interface ExamSubjectAnalysis{name:string;averageNet:number;successPercent:number|null;periodDelta:number|null;latestDelta:number|null;samples:number;wrong:number;blank:number;}
export interface ExamWrongTopic{name:string;subject:string;wrong:number;examCount:number;sharePercent:number;lastDate:string;}
export interface ExamPairSubject{name:string;previousNet:number;latestNet:number;delta:number;}
export interface ExamPairComparison{
  available:boolean;
  previousName:string;
  latestName:string;
  netDelta:number|null;
  durationDelta:number|null;
  correctDelta:number|null;
  wrongDelta:number|null;
  blankDelta:number|null;
  subjects:ExamPairSubject[];
}
export interface ExamBalanceAnalysis{knownCount:number;correctAverage:number|null;wrongAverage:number|null;blankAverage:number|null;correctPercent:number|null;blankPercent:number|null;durationAverage:number|null;}
export interface ExamAnalysis{
  type:ExamAnalysisType;
  window:ExamAnalysisWindow;
  dataLevel:"empty"|"limited"|"ready";
  count:number;
  latest:ExamTrendPoint|null;
  average:number|null;
  best:ExamTrendPoint|null;
  lastDelta:number|null;
  period:ExamPeriodComparison;
  trend:{points:ExamTrendPoint[];slopePerExam:number|null;volatility:number|null;direction:"up"|"down"|"flat"|"unknown";};
  subjects:ExamSubjectAnalysis[];
  strongest:ExamSubjectAnalysis|null;
  needsAttention:ExamSubjectAnalysis|null;
  wrongTopics:ExamWrongTopic[];
  balance:ExamBalanceAnalysis;
  pair:ExamPairComparison;
  insights:string[];
}

interface SubjectAccumulator{name:string;nets:number[];caps:number[];wrong:number;blank:number;current:number[];previous:number[];}
interface ExamCounts{correct:number;wrong:number;blank:number;known:boolean;}

function finite(value:unknown):number{return Number.isFinite(Number(value))?Number(value):0;}
function round(value:number,digits=1):number{const power=10**digits;return Math.round(value*power)/power;}
function average(values:number[]):number|null{return values.length?round(values.reduce((sum,value)=>sum+value,0)/values.length,1):null;}
function canonicalSubject(value:unknown):string{const name=String(value??"").trim().replace(/ \(AYT\)$/u,"");return name==="Temel Matematik"?"Matematik":name;}
function sortedExams(state:YksStateCandidate,type:ExamAnalysisType):ExamRecord[]{return ((state.denemeler??[]) as ExamRecord[]).filter(exam=>exam?.type===type).slice().sort((a,b)=>String(a.date??"").localeCompare(String(b.date??""))||finite(a.id)-finite(b.id));}
function point(exam:ExamRecord):ExamTrendPoint{return {id:finite(exam.id),name:String(exam.name||"Deneme"),date:String(exam.date||""),net:round(finite(exam.totalNet),1)};}
function results(exam:ExamRecord|undefined):SubjectResult[]{return exam&&Array.isArray(exam.subjectResults)?exam.subjectResults:[];}
function counts(exam:ExamRecord|undefined):ExamCounts{let correct=0,wrong=0,blank=0;for(const row of results(exam)){correct+=finite(row.d);wrong+=finite(row.y);blank+=finite(row.b);}return {correct,wrong,blank,known:!!exam&&!exam.netOnly&&correct+wrong+blank>0};}

function periodComparison(list:ExamRecord[]):{comparison:ExamPeriodComparison;current:ExamRecord[];previous:ExamRecord[]}{
  if(list.length<2)return {comparison:{currentAverage:list.length?finite(list[0]?.totalNet):null,previousAverage:null,delta:null,currentCount:list.length,previousCount:0},current:list,previous:[]};
  const size=Math.max(1,Math.min(5,Math.floor(list.length/2))),current=list.slice(-size),previous=list.slice(-(size*2),-size),currentAverage=average(current.map(exam=>finite(exam.totalNet))),previousAverage=average(previous.map(exam=>finite(exam.totalNet)));
  return {comparison:{currentAverage,previousAverage,delta:currentAverage!=null&&previousAverage!=null?round(currentAverage-previousAverage,1):null,currentCount:current.length,previousCount:previous.length},current,previous};
}
function trendAnalysis(list:ExamRecord[]):ExamAnalysis["trend"]{
  const points=list.map(point),values=points.map(item=>item.net);if(!values.length)return {points,slopePerExam:null,volatility:null,direction:"unknown"};
  const mean=values.reduce((sum,value)=>sum+value,0)/values.length,volatility=values.length>1?round(Math.sqrt(values.reduce((sum,value)=>sum+(value-mean)**2,0)/values.length),1):null;
  if(values.length<2)return {points,slopePerExam:null,volatility,direction:"unknown"};
  const xMean=(values.length-1)/2,numerator=values.reduce((sum,value,index)=>sum+(index-xMean)*(value-mean),0),denominator=values.reduce((sum,_value,index)=>sum+(index-xMean)**2,0),slopePerExam=round(denominator?numerator/denominator:0,2),direction=slopePerExam>.35?"up":slopePerExam<-.35?"down":"flat";
  return {points,slopePerExam,volatility,direction};
}
function subjectMap(list:ExamRecord[],current:ExamRecord[],previous:ExamRecord[]):Map<string,SubjectAccumulator>{
  const map=new Map<string,SubjectAccumulator>(),currentIds=new Set(current.map(exam=>exam.id)),previousIds=new Set(previous.map(exam=>exam.id));
  for(const exam of list)for(const row of results(exam)){const name=canonicalSubject(row.name);if(!name)continue;let item=map.get(name);if(!item){item={name,nets:[],caps:[],wrong:0,blank:0,current:[],previous:[]};map.set(name,item);}const net=finite(row.net),cap=finite(row.cap);item.nets.push(net);item.caps.push(cap);item.wrong+=finite(row.y);item.blank+=finite(row.b);if(currentIds.has(exam.id))item.current.push(net);if(previousIds.has(exam.id))item.previous.push(net);}
  return map;
}
function linkedWrongBySubject(state:YksStateCandidate,list:ExamRecord[]):Map<string,number>{
  const ids=new Set(list.map(exam=>String(exam.id))),map=new Map<string,number>();for(const wrong of (state.wrongLog??[]) as WrongLogRecord[]){const examId=String((wrong as WrongLogRecord&{deneme?:unknown}).deneme??"");if(!ids.has(examId))continue;const subject=canonicalSubject(wrong.subject);if(subject)map.set(subject,(map.get(subject)??0)+Math.max(1,finite(wrong.n)));}return map;
}
function subjectAnalysis(state:YksStateCandidate,list:ExamRecord[],current:ExamRecord[],previous:ExamRecord[]):ExamSubjectAnalysis[]{
  const map=subjectMap(list,current,previous),linked=linkedWrongBySubject(state,list),latest=list.at(-1),before=list.at(-2),latestMap=new Map(results(latest).map(row=>[canonicalSubject(row.name),row])),previousMap=new Map(results(before).map(row=>[canonicalSubject(row.name),row]));
  return [...map.values()].map(item=>{const averageNet=average(item.nets)??0,averageCap=average(item.caps),currentAverage=average(item.current),previousAverage=average(item.previous),latestRow=latestMap.get(item.name),previousRow=previousMap.get(item.name);return {name:item.name,averageNet,successPercent:averageCap&&averageCap>0?Math.round(averageNet/averageCap*100):null,periodDelta:currentAverage!=null&&previousAverage!=null?round(currentAverage-previousAverage,1):null,latestDelta:latestRow&&previousRow?round(finite(latestRow.net)-finite(previousRow.net),1):null,samples:item.nets.length,wrong:Math.round(linked.get(item.name)??item.wrong),blank:Math.round(item.blank)};}).sort((a,b)=>(b.successPercent??-1)-(a.successPercent??-1)||b.averageNet-a.averageNet);
}
function strongestSubject(rows:ExamSubjectAnalysis[]):ExamSubjectAnalysis|null{return rows.filter(row=>row.samples>=2&&row.successPercent!=null).sort((a,b)=>(b.successPercent??0)-(a.successPercent??0))[0]??null;}
function attentionSubject(rows:ExamSubjectAnalysis[]):ExamSubjectAnalysis|null{return rows.filter(row=>row.samples>=2).sort((a,b)=>{const aRisk=(100-(a.successPercent??100))+a.wrong*1.5+(a.periodDelta!=null&&a.periodDelta<0?Math.abs(a.periodDelta)*4:0),bRisk=(100-(b.successPercent??100))+b.wrong*1.5+(b.periodDelta!=null&&b.periodDelta<0?Math.abs(b.periodDelta)*4:0);return bRisk-aRisk;})[0]??null;}

function wrongTopics(state:YksStateCandidate,list:ExamRecord[]):ExamWrongTopic[]{
  const byId=new Map(list.map(exam=>[String(exam.id),exam])),map=new Map<string,{name:string;subject:string;wrong:number;examIds:Set<string>;lastDate:string}>();let total=0;
  for(const wrong of (state.wrongLog??[]) as WrongLogRecord[]){const examId=String((wrong as WrongLogRecord&{deneme?:unknown}).deneme??""),exam=byId.get(examId);if(!exam)continue;const name=String(wrong.topic||"Konu"),subject=canonicalSubject(wrong.subject)||"Ders",key=`${subject}\u0000${name}`,amount=Math.max(1,finite(wrong.n));let item=map.get(key);if(!item){item={name,subject,wrong:0,examIds:new Set(),lastDate:""};map.set(key,item);}item.wrong+=amount;item.examIds.add(examId);item.lastDate=String(exam.date||wrong.date||item.lastDate);total+=amount;}
  return [...map.values()].map(item=>({name:item.name,subject:item.subject,wrong:Math.round(item.wrong),examCount:item.examIds.size,sharePercent:total?Math.round(item.wrong/total*100):0,lastDate:item.lastDate})).sort((a,b)=>b.wrong-a.wrong||b.examCount-a.examCount||a.name.localeCompare(b.name,"tr")).slice(0,5);
}
function balance(list:ExamRecord[]):ExamBalanceAnalysis{
  let correct=0,wrong=0,blank=0,knownCount=0,duration=0,durationCount=0;for(const exam of list){const item=counts(exam);if(item.known){correct+=item.correct;wrong+=item.wrong;blank+=item.blank;knownCount++;}if(finite(exam.dur)>0){duration+=finite(exam.dur);durationCount++;}}
  const questions=correct+wrong+blank;return {knownCount,correctAverage:knownCount?round(correct/knownCount,1):null,wrongAverage:knownCount?round(wrong/knownCount,1):null,blankAverage:knownCount?round(blank/knownCount,1):null,correctPercent:questions?Math.round(correct/questions*100):null,blankPercent:questions?Math.round(blank/questions*100):null,durationAverage:durationCount?round(duration/durationCount,1):null};
}
function pairComparison(list:ExamRecord[]):ExamPairComparison{
  const latest=list.at(-1),previous=list.at(-2);if(!latest||!previous)return {available:false,previousName:"",latestName:"",netDelta:null,durationDelta:null,correctDelta:null,wrongDelta:null,blankDelta:null,subjects:[]};
  const latestCounts=counts(latest),previousCounts=counts(previous),latestMap=new Map(results(latest).map(row=>[canonicalSubject(row.name),row])),previousMap=new Map(results(previous).map(row=>[canonicalSubject(row.name),row])),subjects=[...new Set([...latestMap.keys(),...previousMap.keys()])].map(name=>{const latestNet=finite(latestMap.get(name)?.net),previousNet=finite(previousMap.get(name)?.net);return {name,previousNet:round(previousNet,1),latestNet:round(latestNet,1),delta:round(latestNet-previousNet,1)};}).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));
  const known=latestCounts.known&&previousCounts.known;return {available:true,previousName:String(previous.name||"Önceki deneme"),latestName:String(latest.name||"Son deneme"),netDelta:round(finite(latest.totalNet)-finite(previous.totalNet),1),durationDelta:finite(latest.dur)>0&&finite(previous.dur)>0?round(finite(latest.dur)-finite(previous.dur),1):null,correctDelta:known?round(latestCounts.correct-previousCounts.correct,1):null,wrongDelta:known?round(latestCounts.wrong-previousCounts.wrong,1):null,blankDelta:known?round(latestCounts.blank-previousCounts.blank,1):null,subjects};
}
function insightLines(analysis:Omit<ExamAnalysis,"insights">):string[]{
  if(analysis.dataLevel==="empty")return ["İlk denemeni eklediğinde karşılaştırma ve yanlış yoğunluğu burada oluşacak."];
  const lines:string[]=[];if(analysis.period.delta!=null)lines.push(`Son ${analysis.period.currentCount} deneme ortalaman önceki ${analysis.period.previousCount} denemeye göre ${analysis.period.delta>0?"+":""}${analysis.period.delta} net değişti.`);
  if(analysis.needsAttention)lines.push(`${analysis.needsAttention.name} dikkat istiyor: %${analysis.needsAttention.successPercent??0} başarı${analysis.needsAttention.periodDelta!=null?`, dönem farkı ${analysis.needsAttention.periodDelta>0?"+":""}${analysis.needsAttention.periodDelta} net`:""}.`);
  if(analysis.wrongTopics[0])lines.push(`${analysis.wrongTopics[0].name}, bağlı yanlışların %${analysis.wrongTopics[0].sharePercent}'ini oluşturuyor ve ${analysis.wrongTopics[0].examCount} denemede görüldü.`);
  else if(analysis.strongest)lines.push(`${analysis.strongest.name} %${analysis.strongest.successPercent??0} ortalama başarıyla öne çıkıyor.`);
  return lines.slice(0,3);
}

export function analyzeExams(state:YksStateCandidate,type:ExamAnalysisType="TYT",window:ExamAnalysisWindow=10):ExamAnalysis{
  const all=sortedExams(state,type),list=window>0?all.slice(-window):all,latest=list.at(-1)??null,previous=list.at(-2)??null,periodParts=periodComparison(list),trend=trendAnalysis(list),subjects=subjectAnalysis(state,list,periodParts.current,periodParts.previous),wrong=wrongTopics(state,list),dataLevel:ExamAnalysis["dataLevel"]=list.length===0?"empty":list.length<4?"limited":"ready";
  const base:Omit<ExamAnalysis,"insights">={type,window,dataLevel,count:list.length,latest:latest?point(latest):null,average:average(list.map(exam=>finite(exam.totalNet))),best:list.length?point(list.reduce((bestExam,exam)=>finite(exam.totalNet)>finite(bestExam.totalNet)?exam:bestExam)):null,lastDelta:latest&&previous?round(finite(latest.totalNet)-finite(previous.totalNet),1):null,period:periodParts.comparison,trend,subjects,strongest:strongestSubject(subjects),needsAttention:attentionSubject(subjects),wrongTopics:wrong,balance:balance(list),pair:pairComparison(list)};
  return {...base,insights:insightLines(base)};
}

export const examAnalysisService={analyze:analyzeExams} as const;
