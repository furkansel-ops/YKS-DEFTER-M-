const DATE_KEY_PATTERN=/^(\d{4})-(\d{2})-(\d{2})$/;
const MILLISECONDS_PER_DAY=86_400_000;

export function dateKey(date:Date):string{
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

export function todayDateKey(now=new Date()):string{
  return dateKey(now);
}

export function isValidDateKey(value:unknown):value is string{
  if(typeof value!=="string")return false;
  const match=value.match(DATE_KEY_PATTERN);
  if(!match)return false;
  const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
  if(year<2000||year>2100||month<1||month>12||day<1||day>31)return false;
  const date=new Date(year,month-1,day);
  return date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day;
}

export function parseDateKey(key:string):Date{
  return new Date(`${key}T00:00:00`);
}

export function addDaysToKey(key:string,days:number):string{
  const date=parseDateKey(key);
  date.setDate(date.getDate()+days);
  return dateKey(date);
}

export function mondayFirstDayIndex(date:Date):number{
  return (date.getDay()+6)%7;
}

export function mondayFor(date:Date):Date{
  const monday=new Date(date);
  monday.setHours(0,0,0,0);
  monday.setDate(monday.getDate()-mondayFirstDayIndex(monday));
  return monday;
}

export function daysBetweenKeys(from:string,to:string):number{
  return Math.round((parseDateKey(to).getTime()-parseDateKey(from).getTime())/MILLISECONDS_PER_DAY);
}

export function daysUntilKey(key:string,now=new Date()):number{
  const end=parseDateKey(key),today=new Date(now);
  today.setHours(0,0,0,0);
  return Math.ceil((end.getTime()-today.getTime())/MILLISECONDS_PER_DAY);
}

export const dateService={
  dateKey,todayDateKey,isValidDateKey,parseDateKey,addDaysToKey,mondayFirstDayIndex,mondayFor,daysBetweenKeys,daysUntilKey
} as const;
