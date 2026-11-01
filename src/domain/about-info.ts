/* v78 · Hakkında sayfasının saf bilgileri: son yenilikler, destek adresi, veri durumu metni,
   sürüm tarihi ve kişisel veri içermeyen tanılama özeti. DOM'a ve öğrenci verisine dokunmaz. */

export const SUPPORT_URL="https://github.com/furkansel-ops/YKS-DEFTER-M-/issues";

export type AboutNews={when:string;title:string;text:string};
export const ABOUT_NEWS:readonly AboutNews[]=[
  {when:"Kasım",title:"Deneme rankı ve yeni XP",text:"Son 3 denemene göre TYT/AYT rankı; konu, tekrar ve hatalardan da XP"},
  {when:"Kasım",title:"Merkez sadeleşti",text:"7 giriş, eşitleme durumu, \"Verilerimi indir\""},
  {when:"Kasım",title:"Paragraf ve problem hedefleri",text:"Günlük/haftalık hedef, gelişim grafiği"},
  {when:"Kasım",title:"İlerleme karşılaştırması",text:"Bugün, bu hafta, bu ay; ders ve konu durumu"},
  {when:"Kasım",title:"Yeni deneme ekranı",text:"Özet, analiz, hatalar, geçmiş; iki denemeyi karşılaştır"},
  {when:"Ekim",title:"Mesajlarda okundu bilgisi",text:"Koçun mesajını okuduğunda görürsün"}
];
export const NEWS_VISIBLE=3;

export type DataState={tone:"ok"|"warn";title:string;text:string;guest:boolean};
/** Bulut eşitleme kutusunun durumundan öğrenciye gösterilecek tek satır. */
export function dataState(state:string,online:boolean):DataState{
  if(!state||state==="signedout")return {tone:"warn",title:"Verilerin yalnız bu cihazda",text:"Hesap açarsan kayıtların hesabına eşitlenir",guest:true};
  if(!online||state==="offline")return {tone:"warn",title:"Çevrimdışısın",text:"Bağlantı gelince verilerin eşitlenir",guest:false};
  if(state==="error")return {tone:"warn",title:"Eşitleme şu an yapılamıyor",text:"Verilerin bu cihazda güvende; birazdan yeniden denenir",guest:false};
  return {tone:"ok",title:"Hesabınla eşitleniyor",text:"Başka cihazda giriş yapınca kayıtların gelir",guest:false};
}

const MONTHS=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
export function releaseDateLabel(key:string):string{
  const [y,m,d]=key.split("-").map(Number);
  return y&&m&&d&&MONTHS[m-1]?`${d} ${MONTHS[m-1]} ${y}`:key;
}

export type DiagnosticsInfo={version:string;build:string;channel:string;schema:string;install:string;sync:string;online:boolean;screen:string;userAgent:string;date:string};
const INSTALL_LABEL:Record<string,string>={installed:"kurulu",installable:"kurulabilir",manual:"tarayıcıda"};
/** Sorun bildirirken yapıştırılacak özet; e-posta, UID ya da çalışma verisi içermez. */
export function diagnosticsText(info:DiagnosticsInfo):string{
  return ["YKS Defterim tanılama",
    `Sürüm: ${info.version} (${info.build}) · ${info.channel}`,
    `Veri şeması: ${info.schema||"?"}`,
    `Kurulum: ${INSTALL_LABEL[info.install]||info.install}`,
    `Eşitleme: ${info.sync||"signedout"}${info.online?"":" · çevrimdışı"}`,
    `Ekran: ${info.screen}`,
    `Tarayıcı: ${info.userAgent}`,
    `Tarih: ${info.date}`].join("\n");
}
