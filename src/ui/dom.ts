export function byId<T extends HTMLElement=HTMLElement>(id:string):T|null{
  const node=document.getElementById(id);
  return node instanceof HTMLElement?node as T:null;
}

export function all<T extends Element=Element>(selector:string):T[]{
  return Array.from(document.querySelectorAll<T>(selector));
}

export function emit<T>(name:string,detail:T):void{
  window.dispatchEvent(new CustomEvent<T>(name,{detail}));
}

export function activeId(selector:string,activeClass="active"):string|null{
  return all<HTMLElement>(selector).find(node=>node.classList.contains(activeClass))?.id||null;
}
