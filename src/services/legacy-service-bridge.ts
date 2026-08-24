import {dateService} from "./date-service";
import {numberService} from "./number-service";
import {formatService} from "./format-service";

type LegacyFunction=(...args:never[])=>unknown;
type LegacyWindow=Window&Record<string,unknown>;

const LEGACY_HELPERS={
  keyOf:dateService.dateKey,
  todayKey:dateService.todayDateKey,
  validDateKey:dateService.isValidDateKey,
  parseKey:dateService.parseDateKey,
  addDaysKey:dateService.addDaysToKey,
  dowOf:dateService.mondayFirstDayIndex,
  mondayOf:dateService.mondayFor,
  daysUntil:dateService.daysUntilKey,
  diffKeys:dateService.daysBetweenKeys,
  net:numberService.examNet,
  r2:numberService.round2,
  sumVals:numberService.sumNumericValues,
  fmtHM:formatService.formatHoursMinutes,
  esc:formatService.escapeHtml,
  hueOf:formatService.stableHue
} as const;

export type LegacyHelperName=keyof typeof LEGACY_HELPERS;

export interface CommonServicesApi{
  readonly version:"4.0.0-alpha.8";
  readonly dates:typeof dateService;
  readonly numbers:typeof numberService;
  readonly format:typeof formatService;
  validate():string[];
}

declare global{
  interface Window{
    __YKS_SERVICES__?:CommonServicesApi;
  }
}

function serviceChecks():Array<readonly [string,boolean]>{
  const monday=dateService.mondayFor(new Date(2026,7,27,16,30));
  return [
    ["date-key",dateService.dateKey(new Date(2026,7,25))==="2026-08-25"],
    ["leap-date",dateService.isValidDateKey("2028-02-29")&&!dateService.isValidDateKey("2027-02-29")],
    ["date-add",dateService.addDaysToKey("2026-12-31",1)==="2027-01-01"],
    ["monday",dateService.dateKey(monday)==="2026-08-24"&&monday.getHours()===0],
    ["exam-net",numberService.examNet(30,4)===29],
    ["round",numberService.round2(12.345)===12.35],
    ["sum",numberService.sumNumericValues({a:2,b:"3",c:null})===5],
    ["duration",formatService.formatHoursMinutes(125)==="2 sa 5 dk"],
    ["escape",formatService.escapeHtml('<b title="x">&')==="&lt;b title=&quot;x&quot;&gt;&amp;"]
  ];
}

export function installLegacyServiceBridge():CommonServicesApi{
  const target=window as unknown as LegacyWindow;
  for(const [name,helper] of Object.entries(LEGACY_HELPERS))target[name]=helper as LegacyFunction;
  const api:CommonServicesApi={
    version:"4.0.0-alpha.8",
    dates:dateService,
    numbers:numberService,
    format:formatService,
    validate:()=>{
      const errors=serviceChecks().filter(([,ok])=>!ok).map(([name])=>`Servis kontrolü başarısız: ${name}`);
      for(const name of Object.keys(LEGACY_HELPERS) as LegacyHelperName[]){
        if(target[name]!==LEGACY_HELPERS[name])errors.push(`Eski yardımcı TypeScript servisine bağlı değil: ${name}`);
      }
      return errors;
    }
  };
  window.__YKS_SERVICES__=api;
  const errors=api.validate();
  document.documentElement.dataset.v4Services=errors.length?"warning":"ready";
  if(errors.length)console.warn("TypeScript ortak servis kontrolleri:",errors);
  window.dispatchEvent(new CustomEvent("yks:services-ready",{detail:{version:api.version,errors}}));
  return api;
}
