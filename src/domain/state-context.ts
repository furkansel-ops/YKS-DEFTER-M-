import type {YksState,YksStateCandidate} from "../data/contracts";
import type {SubjectDefinition} from "./contracts";

export interface DomainStateAdapter{
  readState():YksStateCandidate;
  save():unknown;
  memo?<T>(key:string,compute:()=>T):T;
  subjects():SubjectDefinition[];
  reviewGaps():number[];
}

export class DomainStateContext{
  readonly #adapter:DomainStateAdapter;

  constructor(adapter:DomainStateAdapter){this.#adapter=adapter;}

  state():YksState{
    return this.#adapter.readState() as YksState;
  }

  save():unknown{
    return this.#adapter.save();
  }

  memo<T>(key:string,compute:()=>T):T{
    return this.#adapter.memo?this.#adapter.memo(key,compute):compute();
  }

  subjects():SubjectDefinition[]{
    return this.#adapter.subjects();
  }

  reviewGaps():number[]{
    return this.#adapter.reviewGaps();
  }
}
