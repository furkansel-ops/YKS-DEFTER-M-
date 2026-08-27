import type {OrganId} from "../data/biology-atlas.ts";
import {organGuide} from "../data/biology-organs.ts";
import {atlasEscape as esc} from "./biology-atlas-diagrams.ts";

const drawings:Record<OrganId,string>={
  heart:`<g class="organ-anatomy" stroke-linejoin="round">
    <path d="M392 180V114C392 56 469 49 471 113V149" fill="none" stroke="#a84452" stroke-width="36"/>
    <path d="M392 174V114C392 68 458 61 458 112V149" fill="none" stroke="#f19b95" stroke-width="18"/>
    <path d="M443 76V51M425 76V43M405 83L398 50" stroke="#d8757e" stroke-width="16"/>
    <path d="M270 189V123M267 365V407" stroke="#4c8fc7" stroke-width="32"/>
    <path d="M311 291C322 252 350 190 339 150Q329 126 277 123L246 109M338 154L384 139" fill="none" stroke="#559ed0" stroke-width="28"/>
    <path d="M416 187L475 157M428 209L491 193" stroke="#dc8b83" stroke-width="20"/>
    <path d="M350 207C307 136 228 157 225 239C224 317 270 402 359 446C444 404 491 320 481 240C471 153 393 140 350 207Z" fill="#bd6270" stroke="#95485b" stroke-width="5"/>
    <g class="organ-interior">
      <path data-region="right-atrium" d="M258 181Q231 198 245 246L318 247L327 215Q301 174 258 181Z" fill="#89bddd" stroke="#407cac" stroke-width="3"/>
      <path data-region="right-ventricle" d="M249 278L323 282L346 410Q274 369 249 278Z" fill="#8dbfde" stroke="#407cac" stroke-width="4"/>
      <path data-region="left-atrium" d="M385 205Q411 173 447 189L460 247L382 248Z" fill="#f2b1a5" stroke="#aa5362" stroke-width="3"/>
      <path data-region="left-ventricle" d="M382 282L446 279Q458 340 371 413L369 308Z" fill="#f1b3a5" stroke="#984258" stroke-width="13"/>
      <path d="M344 221Q354 316 356 416" fill="none" stroke="#b55468" stroke-width="15"/>
      <path data-region="tricuspid" d="M249 260L265 274L282 260L299 275L319 261" fill="none" stroke="#fff9ed" stroke-width="8"/>
      <path data-region="mitral" d="M380 260L397 277L414 262L444 271" fill="none" stroke="#fff9ed" stroke-width="8"/>
      <path d="M266 278L301 354L297 279M398 283L402 350L438 282" fill="none" stroke="#eedbd5" stroke-width="2"/>
      <path d="M279 225V242M292 296L302 316M420 225V240M414 298L406 318" stroke="#fff" stroke-width="3" marker-end="url(#organ-heart-arrow)"/>
      <text x="299" y="391" class="organ-inset-caption">SAĞ</text><text x="418" y="391" class="organ-inset-caption">SOL</text>
    </g>
    <g class="organ-shell organ-shell-left"><path d="M349 206C307 135 228 157 225 239C224 317 270 402 359 446L350 209Z" fill="#d27980" stroke="#95485b" stroke-width="4"/><path d="M342 235Q284 251 248 308M339 275L283 302M344 316L297 347" fill="none" stroke="#efb7a8" stroke-width="5"/></g>
    <g class="organ-shell organ-shell-right"><path d="M350 207C392 140 471 153 481 240C491 320 444 404 359 446Z" fill="#bf6475" stroke="#95485b" stroke-width="4"/><path d="M355 240Q414 277 443 344M371 278L439 281M386 328L420 366" fill="none" stroke="#edb3a8" stroke-width="5"/></g>
  </g>`,
  brain:`<g class="organ-anatomy" stroke-linejoin="round">
    <path d="M223 279C169 244 184 160 233 125C280 77 394 78 465 120C526 152 547 229 506 280L428 307L362 285Q275 328 223 279Z" fill="#e9b5ad" stroke="#a56c7c" stroke-width="5"/>
    <path d="M220 237Q201 197 241 172Q241 138 283 145Q302 109 344 136Q385 111 412 151Q457 131 471 178Q515 196 491 237M225 272Q266 248 286 277M259 166Q299 184 275 221M314 151Q343 177 323 209M366 157Q390 181 377 211M432 175Q419 209 451 228M233 211L253 213M471 256Q428 236 402 271" fill="none" stroke="#c88892" stroke-width="5" stroke-linecap="round"/>
    <g class="organ-interior">
      <path d="M257 257Q262 192 352 185Q425 184 451 249L426 264Q396 221 347 220Q291 220 290 264Z" fill="#fff3df" stroke="#c59993" stroke-width="3"/>
      <ellipse data-region="thalamus" cx="342" cy="250" rx="35" ry="24" fill="#88b6cf" stroke="#497d9b" stroke-width="3"/>
      <path data-region="hypothalamus" d="M301 273Q327 267 349 279L336 307L312 306Z" fill="#ac91c4" stroke="#806292" stroke-width="3"/>
      <path d="M321 308V327" stroke="#977bb0" stroke-width="8"/><ellipse cx="319" cy="333" rx="13" ry="9" fill="#b9a4cd"/>
    </g>
    <path data-region="midbrain" d="M359 277L387 277L406 321L376 329Z" fill="#e4bd6d" stroke="#b58b4b" stroke-width="4"/>
    <path data-region="pons" d="M374 327Q438 321 426 365Q414 385 382 370Z" fill="#e9c787" stroke="#b58b4b" stroke-width="4"/>
    <path data-region="medulla" d="M382 369L414 374L399 438L378 438Z" fill="#ecd5a3" stroke="#b58b4b" stroke-width="4"/>
    <path d="M381 438L380 468L395 468L398 438" fill="#f0ddb5" stroke="#b58b4b" stroke-width="3"/>
    <path data-region="cerebellum" d="M431 294Q484 274 519 310Q548 347 509 387Q463 415 425 374Z" fill="#91c6ba" stroke="#497f79" stroke-width="4"/>
    <path d="M444 310Q493 295 516 328M438 325Q489 310 523 343M437 342Q484 325 519 357M439 358Q478 344 509 373M450 374Q477 361 494 384" fill="none" stroke="#65a598" stroke-width="3"/>
    <path class="organ-interior" d="M433 355L475 349L493 322M471 350L499 359M468 350L474 379M462 351L454 329" fill="none" stroke="#eef2dd" stroke-width="7"/>
    <path class="organ-shell organ-brain-shell" d="M257 280Q244 199 344 177Q427 174 459 249Q446 290 386 282L350 309L300 308Z" fill="#e9b5ad" stroke="#c88892" stroke-width="4"/>
    <path d="M418 427Q518 421 540 367" fill="none" stroke="#79a99c" stroke-width="2" stroke-dasharray="5 5"/><text x="461" y="444" class="organ-inset-caption">ARKA BEYİN</text>
  </g>`,
  lungs:`<g class="organ-anatomy" stroke-linejoin="round">
    <path d="M316 170Q262 157 233 230Q205 320 233 389Q302 402 328 346L325 191Z" fill="#e5ada9" stroke="#a46779" stroke-width="4"/>
    <path d="M390 170Q437 151 477 230Q506 310 480 387Q419 396 391 347L395 299Q363 279 383 222Z" fill="#edbcb2" stroke="#a46779" stroke-width="4"/>
    <path d="M352 88V186M352 186L299 233M352 186L416 231" fill="none" stroke="#b19d88" stroke-width="25"/>
    <path d="M352 88V185M352 185L299 233M352 185L416 231" fill="none" stroke="#f1dec0" stroke-width="16"/>
    <path d="M342 111H362M342 128H362M342 145H362M342 162H362" stroke="#c1aa8d" stroke-width="3"/>
    <path d="M299 226L271 279L272 344M297 233L307 303M275 274L246 309M416 230L430 272L455 313M422 257L406 300M432 270L455 254" fill="none" stroke="#f1dec0" stroke-width="10"/>
    <path d="M235 289L305 309M395 302L478 282" fill="none" stroke="#c1848c" stroke-width="2"/>
    <path d="M209 459Q331 405 502 455L502 468Q332 426 211 474Z" fill="#c69b99" stroke="#956d80" stroke-width="3"/>
    <circle cx="450" cy="372" r="66" fill="#f8efe4" stroke="#c9b39d" stroke-width="2"/>
    <path d="M420 325L437 344M437 344L418 365M437 344L466 355M466 355L482 383" stroke="#d7b294" stroke-width="10" fill="none"/>
    <g fill="#f2c4af" stroke="#b57f80" stroke-width="2"><circle cx="417" cy="369" r="18"/><circle cx="444" cy="380" r="19"/><circle cx="471" cy="366" r="20"/><circle cx="479" cy="396" r="17"/><circle cx="444" cy="407" r="17"/></g>
    <path d="M397 376Q401 428 450 428Q505 428 501 383" fill="none" stroke="#729fca" stroke-width="5"/><path d="M501 383Q500 347 470 339" fill="none" stroke="#d17e82" stroke-width="5"/>
  </g>`,
  liver:`<g class="organ-anatomy" stroke-linejoin="round">
    <path d="M207 213Q252 123 384 150Q457 137 521 195Q514 252 450 276L327 311Q254 322 218 285Z" fill="#b7787c" stroke="#855665" stroke-width="5"/>
    <path d="M378 157L350 271M223 247Q277 227 353 254" fill="none" stroke="#925e6a" stroke-width="4"/>
    <path d="M321 304C294 353 327 378 346 344L351 301" fill="#96b386" stroke="#62896d" stroke-width="4"/>
    <path d="M345 331L375 351L382 414M375 351L373 291" fill="none" stroke="#93b18b" stroke-width="11"/>
    <path d="M305 318V283L330 251M305 283L270 247" fill="none" stroke="#6c96c1" stroke-width="15"/>
    <path d="M382 318L373 278L388 243" fill="none" stroke="#d69b94" stroke-width="10"/>
    <path d="M386 363Q463 350 472 391Q471 436 389 435" fill="none" stroke="#dbb798" stroke-width="18"/>
    <path d="M415 184L449 204V246L415 265L380 246V204Z" fill="#e1ac9e" stroke="#f5dfcd" stroke-width="3"/>
    <g stroke="#af7579" stroke-width="2"><path d="M415 225L415 187M415 225L446 205M415 225L446 245M415 225L415 261M415 225L383 245M415 225L383 206"/></g><circle cx="415" cy="225" r="9" fill="#90a8c3"/>
  </g>`,
  kidneys:`<g class="organ-anatomy" stroke-linejoin="round">
    <path d="M363 113Q252 91 225 220Q207 343 306 397Q377 427 391 355Q335 323 350 269Q367 235 401 214Q422 135 363 113Z" fill="#c68783" stroke="#8d596e" stroke-width="5"/>
    <path d="M357 137Q272 119 252 224Q235 326 306 369L331 350Q288 302 315 250Q335 215 374 202Q394 154 357 137Z" fill="#ebbd9f" stroke="#ac747b" stroke-width="3"/>
    <g fill="#c48784" stroke="#a26875" stroke-width="2"><path d="M295 159L333 153L326 218Z"/><path d="M268 200L282 175L320 234Z"/><path d="M256 238L261 211L309 254Z"/><path d="M257 286L253 258L310 276Z"/><path d="M280 327L264 306L315 299Z"/><path d="M309 354L289 339L328 320Z"/></g>
    <path d="M326 213L348 250L320 266L348 281L325 315L358 298L383 266L375 240Z" fill="#f3ddbd" stroke="#c39986" stroke-width="3"/>
    <path d="M374 273Q392 333 382 418" fill="none" stroke="#ddbb96" stroke-width="15"/>
    <path d="M405 246L368 252M408 227L367 240" stroke="#8dacc6" stroke-width="12"/><path d="M405 228L368 240" stroke="#c77d85" stroke-width="9"/>
    <circle cx="471" cy="374" r="61" fill="#f6ead8" stroke="#c6a794" stroke-width="2"/>
    <path d="M448 340Q410 374 443 402Q463 418 488 401L490 412L512 412" fill="none" stroke="#d6b28e" stroke-width="11"/>
    <path d="M469 343C435 337 431 388 460 391C493 396 502 352 469 350C446 344 442 380 467 382C488 382 488 358 469 360" fill="none" stroke="#c9777e" stroke-width="7"/>
    <path d="M467 338V321M478 343L494 323" stroke="#bc6573" stroke-width="8"/>
  </g>`,
  eyeball:`<g class="organ-anatomy" stroke-linejoin="round">
    <path d="M473 295L538 335L526 357L461 320" fill="#e1c798" stroke="#aa906d" stroke-width="4"/>
    <ellipse cx="365" cy="269" rx="137" ry="133" fill="#eee1c7" stroke="#a78d86" stroke-width="6"/>
    <ellipse cx="365" cy="269" rx="127" ry="123" fill="#aa7479"/>
    <ellipse cx="365" cy="269" rx="117" ry="113" fill="#f5dec4" stroke="#dcad88" stroke-width="4"/>
    <path d="M249 203Q211 263 249 332Q273 270 249 203Z" fill="#b3d9df" stroke="#6ba1b0" stroke-width="4"/>
    <path d="M282 193L282 244M282 287L282 342" stroke="#6da899" stroke-width="13"/>
    <ellipse cx="315" cy="267" rx="20" ry="60" fill="#b9dce0" stroke="#6897a9" stroke-width="3"/>
    <path d="M309 206L302 177M309 327L302 354" stroke="#a89d92" stroke-width="3"/>
    <path d="M304 178L326 169M304 354L326 365" stroke="#b97a7e" stroke-width="10"/>
    <path d="M197 269H463M202 248L311 257L465 280M202 290L311 277L465 255" fill="none" stroke="#c6a74d" stroke-width="2" stroke-dasharray="6 4"/>
    <circle cx="478" cy="304" r="10" fill="#e1c798"/><circle cx="479" cy="270" r="6" fill="#cc915c"/>
  </g>`,
  intestine:`<g class="organ-anatomy" stroke-linejoin="round">
    <path d="M247 364V190Q240 143 285 145H424Q469 147 464 192V340Q465 389 406 390L365 405V438" fill="none" stroke="#ba8585" stroke-width="39"/>
    <path d="M247 364V190Q240 143 285 145H424Q469 147 464 192V340Q465 389 406 390L365 405V438" fill="none" stroke="#e0b198" stroke-width="28"/>
    <path d="M304 202C369 160 444 207 367 226C273 226 272 250 353 255C439 255 440 287 349 290C270 290 280 328 356 320C431 310 437 353 356 355L280 354" fill="none" stroke="#c1848a" stroke-width="20"/>
    <path d="M304 202C369 160 444 207 367 226C273 226 272 250 353 255C439 255 440 287 349 290C270 290 280 328 356 320C431 310 437 353 356 355L280 354" fill="none" stroke="#edc0ad" stroke-width="12"/>
    <path d="M247 188L266 188M232 230H262M232 268H262M232 306H262M290 131V157M331 131V157M379 131V157M445 186H476M449 223H479" stroke="#c49183" stroke-width="3"/>
    <path d="M246 378L240 403" stroke="#be8a83" stroke-width="10"/>
    <rect x="408" y="269" width="105" height="166" rx="40" fill="#f6edda" stroke="#c5ad92" stroke-width="2"/>
    <path d="M426 418L430 323Q435 278 461 280Q490 285 490 330L494 418Z" fill="#efd1b1" stroke="#c08a82" stroke-width="5"/>
    <path d="M440 423V337Q439 298 461 300Q482 300 480 337V424" fill="none" stroke="#b56c81" stroke-width="6"/>
    <path d="M447 424V339M448 343L474 350M448 365L475 372M448 388L475 395" stroke="#679fbd" stroke-width="4"/>
    <path d="M467 424V326Q475 308 478 327V422" fill="#86b594" stroke="#578d76" stroke-width="4"/>
  </g>`,
  pancreas:`<g class="organ-anatomy" stroke-linejoin="round">
    <path d="M306 153Q224 153 225 248Q211 340 306 345" fill="none" stroke="#b88880" stroke-width="37"/>
    <path d="M306 153Q224 153 225 248Q211 340 306 345" fill="none" stroke="#e8bca0" stroke-width="25"/>
    <path d="M276 215Q300 187 329 214Q367 182 390 210Q429 177 453 201L516 199Q502 244 456 262Q427 295 390 282Q365 317 326 294Q297 325 275 294Z" fill="#e4be8b" stroke="#b08a73" stroke-width="4"/>
    <path d="M285 214L296 288M329 214L335 288M367 210L376 285M414 208L423 277M461 210L464 253" stroke="#cda580" stroke-width="3"/>
    <path d="M490 216Q432 247 367 264L278 284" stroke="#f5e6c7" stroke-width="9" fill="none"/>
    <path d="M381 262L398 236M329 275L322 249" stroke="#f5e6c7" stroke-width="5"/>
    <g fill="#d39c86" stroke="#a37574" stroke-width="2"><circle cx="416" cy="221" r="10"/><circle cx="434" cy="221" r="10"/><circle cx="425" cy="239" r="10"/></g>
    <circle cx="461" cy="374" r="56" fill="#f5e5c5" stroke="#c3a57c" stroke-width="2"/>
    <g fill="#88b6c9" stroke="#58859e" stroke-width="2"><circle cx="444" cy="355" r="12"/><circle cx="472" cy="351" r="12"/><circle cx="482" cy="377" r="12"/><circle cx="460" cy="388" r="12"/></g>
    <g fill="#caa080" stroke="#a07568" stroke-width="2"><circle cx="425" cy="376" r="11"/><circle cx="434" cy="399" r="11"/><circle cx="459" cy="332" r="11"/></g>
    <path d="M409 415Q465 437 503 401" stroke="#b46f7d" stroke-width="5" fill="none"/>
  </g>`,
  skin:`<g class="organ-anatomy" stroke-linejoin="round">
    <path d="M227 146Q254 134 280 145T334 145T388 145T442 145T505 145V196Q476 215 448 197T391 197T334 197T277 197T227 197Z" fill="#cba08b" stroke="#a67d73" stroke-width="3"/>
    <path d="M227 197Q253 181 277 197T334 197T391 197T448 197T505 196V380H227Z" fill="#eed1b4" stroke="#b89582" stroke-width="3"/>
    <path d="M227 380H505V447H227Z" fill="#ebd6a3" stroke="#bbaa82" stroke-width="3"/>
    <g fill="#f4e6ba" stroke="#d2bb87" stroke-width="2"><ellipse cx="250" cy="410" rx="21" ry="23"/><ellipse cx="289" cy="414" rx="20" ry="24"/><ellipse cx="329" cy="411" rx="20" ry="23"/><ellipse cx="369" cy="413" rx="21" ry="24"/><ellipse cx="410" cy="411" rx="20" ry="23"/><ellipse cx="451" cy="414" rx="20" ry="25"/><ellipse cx="488" cy="411" rx="15" ry="24"/></g>
    <path d="M290 165Q276 311 312 337Q344 332 328 309L311 164" fill="#bb8f83" stroke="#9b766e" stroke-width="3"/>
    <path d="M285 100Q298 196 311 317" fill="none" stroke="#725958" stroke-width="9"/>
    <path d="M325 289L358 225" stroke="#bf8982" stroke-width="7"/>
    <path d="M408 327C390 301 447 302 446 329C444 354 401 354 401 329C401 313 430 317 430 336C430 353 458 341 454 324M435 309V184L427 167V140" fill="none" stroke="#aa9773" stroke-width="7"/>
    <g fill="#eddfb7" stroke="#ac9c74" stroke-width="2"><ellipse cx="474" cy="280" rx="20" ry="30"/><ellipse cx="474" cy="280" rx="13" ry="22"/><ellipse cx="474" cy="280" rx="6" ry="13"/></g>
    <path d="M473 310L471 371L378 372M276 240L276 366L378 372M258 230L276 245L293 226" stroke="#ae9a5c" stroke-width="3" fill="none"/>
    <path d="M239 351H367L372 240M244 365H393L390 222" stroke="#be7d85" stroke-width="6" fill="none"/><path d="M239 361H358L362 248" stroke="#719cbb" stroke-width="5" fill="none"/>
  </g>`
};

export function organDiagram(id:OrganId,selected:string,open=true,labels=true,animate=false):string {
  const guide=organGuide(id)!;
  const canOpen=id==="heart"||id==="brain";
  const isOpen=!canOpen||open;
  const pins=guide.structures.map((part,index)=>{
    const [x,y]=part.point,left=part.side==="left",labelX=left?16:542,labelY=80+part.row*88;
    const visible=isOpen||!part.internal;
    return `<g class="organ-hotspot ${part.id===selected?"is-selected":""}" data-atlas-structure="${part.id}" role="button" tabindex="${visible?0:-1}" aria-label="${esc(part.label)}" aria-pressed="${part.id===selected}" ${visible?"":'aria-hidden="true" style="display:none"'}>`+
      `<path class="organ-leader" d="M${x} ${y}L${left?195:525} ${labelY+22}H${left?182:542}"/>`+
      `<g class="organ-callout"><rect x="${labelX}" y="${labelY}" width="166" height="44" rx="12"/><text x="${labelX+10}" y="${labelY+27}">${esc(part.label.replace(" · büyütme",""))}</text></g>`+
      `<circle class="organ-point-halo" cx="${x}" cy="${y}" r="24"/><circle class="organ-point" cx="${x}" cy="${y}" r="14"/><text class="organ-point-number" x="${x}" y="${y+5}">${index+1}</text></g>`;
  }).join("");
  return `<svg class="atlas-organ-svg ${isOpen?"is-open":"is-closed"} ${labels?"":"hide-labels"} ${animate?"is-opening":""}" viewBox="0 0 724 520" role="group" aria-labelledby="organ-${id}-title organ-${id}-desc" xmlns="http://www.w3.org/2000/svg">`+
    `<title id="organ-${id}-title">${esc(guide.overview)}</title><desc id="organ-${id}-desc">Etkileşimli öğretici şema. ${esc(guide.orientation)} Kaynak 3B modelin gerçek kesiti değildir.</desc>`+
    `<defs><pattern id="organ-${id}-grid" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="currentColor" opacity=".07"/></pattern><marker id="organ-${id}-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="white"/></marker></defs>`+
    `<rect width="724" height="520" rx="22" fill="url(#organ-${id}-grid)"/><ellipse cx="363" cy="280" rx="175" ry="194" class="organ-backdrop"/>`+
    drawings[id]+pins+`<text x="362" y="503" class="organ-scale-note">${canOpen?(isOpen?"İÇ YAPI · ŞEMATİK KESİT":"DIŞ BİÇİM · İÇİNİ AÇARAK İLERLE"):"YAPI–İŞLEV · ŞEMATİK ÖĞRENME GÖRÜNÜMÜ"}</text></svg>`;
}
