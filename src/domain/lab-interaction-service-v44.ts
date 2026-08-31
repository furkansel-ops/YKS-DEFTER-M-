export interface PeriodicElementLite {n:number;symbol:string;name:string;period:number;type:string;}
export interface TimelineEventLite {id:string;year:string;title:string;detail:string;era:string;}
export interface PeriodicComparison {left:PeriodicElementLite;right:PeriodicElementLite;leftGroup:string;rightGroup:string;leftBlock:string;rightBlock:string;cue:string;}

const GROUPS:Readonly<Record<number,readonly number[]>>={
  1:[1,3,11,19,37,55,87],2:[4,12,20,38,56,88],3:[21,39,57,89],4:[22,40,72,104],5:[23,41,73,105],6:[24,42,74,106],7:[25,43,75,107],8:[26,44,76,108],9:[27,45,77,109],10:[28,46,78,110],11:[29,47,79,111],12:[30,48,80,112],13:[5,13,31,49,81,113],14:[6,14,32,50,82,114],15:[7,15,33,51,83,115],16:[8,16,34,52,84,116],17:[9,17,35,53,85,117],18:[2,10,18,36,54,86,118]
};

export function periodicGroup(atomicNumber:number):string {
  if(!Number.isInteger(atomicNumber)||atomicNumber<1||atomicNumber>118)return "—";
  if(atomicNumber>=58&&atomicNumber<=71)return "Lantanit";
  if(atomicNumber>=90&&atomicNumber<=103)return "Aktinit";
  for(const [group,numbers] of Object.entries(GROUPS))if(numbers.includes(atomicNumber))return group;
  return "—";
}

export function periodicBlock(atomicNumber:number):string {
  const group=periodicGroup(atomicNumber);if(group==="Lantanit"||group==="Aktinit")return "f";
  const numeric=Number(group);if(!Number.isFinite(numeric))return "—";return numeric<=2?"s":numeric>=13?"p":"d";
}

export function comparePeriodicElements(left:PeriodicElementLite,right:PeriodicElementLite):PeriodicComparison {
  const leftGroup=periodicGroup(left.n),rightGroup=periodicGroup(right.n),leftBlock=periodicBlock(left.n),rightBlock=periodicBlock(right.n);
  let cue="İki element hem periyot hem grup yönünde değişiyor. Atom çapı, iyonlaşma enerjisi ve elektronegatifliği tek bir ezber okuyla kesinleştirme; konumları ayrı ayrı oku.";
  if(left.period===right.period&&Number.isFinite(Number(leftGroup))&&Number.isFinite(Number(rightGroup))){
    const first=Number(leftGroup)<Number(rightGroup)?left:right,second=first===left?right:left;
    cue=`Aynı periyotta ${first.symbol} daha solda, ${second.symbol} daha sağda. Genel eğilimde atom çapı sola; iyonlaşma enerjisi ve elektronegatiflik sağa doğru artma eğilimindedir.`;
  }else if(leftGroup===rightGroup&&Number.isFinite(Number(leftGroup))){
    const upper=left.period<right.period?left:right,lower=upper===left?right:left;
    cue=`Aynı grupta ${upper.symbol} daha yukarıda, ${lower.symbol} daha aşağıda. Genel eğilimde atom çapı aşağı doğru artarken iyonlaşma enerjisi yukarı doğru artma eğilimindedir.`;
  }
  return {left,right,leftGroup,rightGroup,leftBlock,rightBlock,cue};
}

export function timelineNeighborhood(events:readonly TimelineEventLite[],id:string):{previous:TimelineEventLite|null;current:TimelineEventLite|null;next:TimelineEventLite|null;index:number;total:number} {
  const safe=events.filter(event=>event&&typeof event.id==="string"&&event.id&&typeof event.title==="string");
  const index=safe.findIndex(event=>event.id===id);if(index<0)return {previous:null,current:null,next:null,index:-1,total:safe.length};
  return {previous:safe[index-1]||null,current:safe[index]||null,next:safe[index+1]||null,index,total:safe.length};
}
