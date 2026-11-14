/* v123 · Uzun oturum mola uyarısının zamanı. Saf fonksiyon. */
export const FIRST_MIN=50,EVERY_MIN=30;

/** Ara vermeden `runMs` çalışıldı ve `warned` uyarı gösterildi: sıradaki uyarının vakti geldi mi? */
export function breakDue(runMs:number,warned:number,first=FIRST_MIN,every=EVERY_MIN):boolean{
  return runMs>=(first+warned*every)*60000;
}
