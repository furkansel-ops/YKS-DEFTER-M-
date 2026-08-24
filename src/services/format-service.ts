const HTML_ENTITIES:Readonly<Record<string,string>>={
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
};

export function formatHoursMinutes(minutes:number):string{
  const hours=Math.floor(minutes/60),remaining=minutes%60;
  return hours?`${hours} sa ${remaining} dk`:`${remaining} dk`;
}

export function escapeHtml(value:unknown):string{
  return String(value==null?"":value).replace(/[&<>"']/g,character=>HTML_ENTITIES[character]??character);
}

export function stableHue(value:string):number{
  let hue=0;
  for(let index=0;index<value.length;index++)hue=(hue*31+value.charCodeAt(index))%360;
  return hue;
}

export const formatService={formatHoursMinutes,escapeHtml,stableHue} as const;
