export type SessionMode="locked"|"guest"|"account";

export interface SessionModeState{
  canClearDeviceStudyStorage?:boolean;
  mode:SessionMode;
  persistent:boolean;
  hasStoredStudyData:boolean;
  error:string;
  /** Changes at each account boundary, including a fast sign-out/sign-in cycle. */
  revision:number;
}

export interface SessionModeApi{
  readonly mode:SessionMode;
  readonly ready:Promise<SessionMode>;
  getState():SessionModeState;
  canPersist():boolean;
  enterGuest():false;
  enterAccount(uid:string):boolean;
  lock():void;
  /** Only the confirmed device-delete flow may call this, after account sign-out. */
  clearDeviceStudyStorage():void;
}

declare global{interface Window{__YKS_SESSION__?:SessionModeApi;}}

export function accountPersistenceAllowed():boolean{
  // Tests and standalone legacy modules without a browser preflight keep their
  // existing contract; the shipped entry point requires the preflight explicitly.
  return typeof window==="undefined"||!window.__YKS_SESSION__||window.__YKS_SESSION__.mode==="account";
}

export const ACCOUNT_REQUIRED_MESSAGE="Kayıt, yedekleme ve eşitleme için hesabına giriş yapmalısın. Kaydetmeden yaptığın çalışma yalnız bu açık ekranda kalır.";
