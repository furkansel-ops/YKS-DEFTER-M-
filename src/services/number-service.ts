export function round2(value:number):number{
  return Math.round(value*100)/100;
}

export function examNet(correct:number,wrong:number):number{
  return Math.round((correct-wrong/4)*100)/100;
}

export function sumNumericValues(values:Record<string,unknown>):number{
  return Object.keys(values).reduce((total,key)=>total+(Number(values[key])||0),0);
}

export const numberService={round2,examNet,sumNumericValues} as const;
