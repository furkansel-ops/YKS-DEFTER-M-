import Dexie,{type EntityTable} from "dexie";
import {LEGACY_IMPORT_META_KEY,PRIMARY_INDEXED_STATE_KEY,type IndexedStateRecord,type MigrationMetaRecord,type MigrationTarget} from "./migration";

export const YKS_DATABASE_NAME="yks-defterim-v4" as const;
export const YKS_DATABASE_VERSION=1 as const;

export interface IndexedDatabaseSnapshot{
  database:typeof YKS_DATABASE_NAME;
  version:typeof YKS_DATABASE_VERSION;
  statePresent:boolean;
  migrationPresent:boolean;
  schema:number|null;
  sourceHash:string|null;
  updatedAt:number|null;
}

export class YksDatabase extends Dexie{
  state!:EntityTable<IndexedStateRecord,"key">;
  meta!:EntityTable<MigrationMetaRecord,"key">;

  constructor(name:string=YKS_DATABASE_NAME){
    super(name);
    this.version(YKS_DATABASE_VERSION).stores({
      state:"&key,schema,updatedAt,sourceHash",
      meta:"&key,schema,updatedAt,sourceHash"
    });
  }
}

export class DexieMigrationTarget implements MigrationTarget{
  readonly #database:YksDatabase;

  constructor(database:YksDatabase){
    this.#database=database;
  }

  readState():Promise<IndexedStateRecord|undefined>{
    return this.#database.state.get(PRIMARY_INDEXED_STATE_KEY);
  }

  readMeta():Promise<MigrationMetaRecord|undefined>{
    return this.#database.meta.get(LEGACY_IMPORT_META_KEY);
  }

  async commit(state:IndexedStateRecord,meta:MigrationMetaRecord):Promise<void>{
    await this.#database.transaction("rw",this.#database.state,this.#database.meta,async()=>{
      await this.#database.state.put(state);
      await this.#database.meta.put(meta);
    });
  }

  async snapshot():Promise<IndexedDatabaseSnapshot>{
    const [state,meta]=await Promise.all([this.readState(),this.readMeta()]);
    return {
      database:YKS_DATABASE_NAME,version:YKS_DATABASE_VERSION,statePresent:!!state,migrationPresent:!!meta,
      schema:state?.schema??null,sourceHash:state?.sourceHash??null,updatedAt:state?.updatedAt??null
    };
  }
}
