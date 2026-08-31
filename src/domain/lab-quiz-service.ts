export interface QuizStructure {
  id:string;
  label:string;
  priority?:boolean;
}

export interface QuizQuestion extends QuizStructure {
  number:number;
}

export interface QuizAnswer {
  expectedId:string;
  pickedId:string;
  correct:boolean;
}

const clean=(value:unknown)=>String(value??"").trim();

export function normalizeQuizStructures(values:readonly QuizStructure[]):QuizStructure[] {
  const seen=new Set<string>(),out:QuizStructure[]=[];
  for(const value of values){
    const id=clean(value?.id).slice(0,100),label=clean(value?.label).slice(0,160);
    if(!id||!label||seen.has(id))continue;
    seen.add(id);out.push({id,label,priority:!!value.priority});
  }
  return out;
}

function shuffled<T>(values:readonly T[],random:()=>number):T[]{
  const out=[...values];
  for(let i=out.length-1;i>0;i--){
    const raw=Number(random()),safe=Number.isFinite(raw)?Math.max(0,Math.min(.999999,raw)):0;
    const j=Math.floor(safe*(i+1));[out[i],out[j]]=[out[j]!,out[i]!];
  }
  return out;
}

export function buildStructureQuiz(values:readonly QuizStructure[],limit=6,random:()=>number=Math.random):QuizQuestion[]{
  const cleanValues=normalizeQuizStructures(values),max=Math.max(1,Math.min(12,Math.trunc(Number(limit)||6)));
  const priority=shuffled(cleanValues.filter(value=>value.priority),random),other=shuffled(cleanValues.filter(value=>!value.priority),random);
  return [...priority,...other].slice(0,max).map((value,index)=>({...value,number:index+1}));
}

export function gradeStructureAnswer(question:QuizQuestion|undefined,pickedId:unknown):QuizAnswer|null {
  if(!question)return null;
  const picked=clean(pickedId);if(!picked)return null;
  return {expectedId:question.id,pickedId:picked,correct:picked===question.id};
}

export function summarizeStructureQuiz(questions:readonly QuizQuestion[],answers:readonly QuizAnswer[]){
  const answered=answers.length,correct=answers.filter(value=>value.correct).length,total=questions.length;
  return {total,answered,correct,wrong:Math.max(0,answered-correct),percent:total?Math.round(correct/total*100):0,finished:total>0&&answered>=total};
}
