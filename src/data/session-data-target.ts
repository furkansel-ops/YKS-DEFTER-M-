import {YksDatabase,YKS_DATABASE_NAME,YKS_DATABASE_VERSION,type IndexedDatabaseSnapshot} from "./database.ts";
import {LEGACY_IMPORT_META_KEY,PRIMARY_INDEXED_STATE_KEY,type IndexedStateRecord,type MigrationMetaRecord,type MigrationTarget} from "./migration.ts";
import {ACCOUNT_REQUIRED_MESSAGE,type SessionModeApi} from "../auth/session-mode.ts";

type DatabaseFactory=()=>YksDatabase;

/** Guest storage is an ordinary in-memory map, not a temporary disk database.
 * No cleanup on unload is needed, and an interrupted close cannot leak study data. */
export class SessionDataTarget implements MigrationTarget{
  readonly #session:SessionModeApi|undefined;
  readonly #factory:DatabaseFactory;
  #database:YksDatabase|undefined;
  #guestState=new Map<string,IndexedStateRecord>();
  #guestMeta:MigrationMetaRecord|undefined;

  constructor(session:SessionModeApi|undefined=typeof window!=="undefined"?window.__YKS_SESSION__:undefined,factory:DatabaseFactory=()=>new YksDatabase()){
    this.#session=session;this.#factory=factory;
  }

  async #access():Promise<"guest"|"account">{
    if(this.#session)await this.#session.ready;
    const mode=this.#session?.mode??"account";
    if(mode==="locked")throw new Error(ACCOUNT_REQUIRED_MESSAGE);
    return mode;
  }

  #revision():number{return this.#session?.getState?.().revision??0;}

  #persistent(revision=this.#revision()):YksDatabase{
    if(this.#session&&(this.#session.mode!=="account"||this.#revision()!==revision))throw new Error(ACCOUNT_REQUIRED_MESSAGE);
    return this.#database??=this.#factory();
  }

  async readRecord(key:string):Promise<IndexedStateRecord|undefined>{
    if(await this.#access()==="guest")return structuredClone(this.#guestState.get(key));
    return this.#persistent().state.get(key);
  }

  readState():Promise<IndexedStateRecord|undefined>{return this.readRecord(PRIMARY_INDEXED_STATE_KEY);}

  async readMeta():Promise<MigrationMetaRecord|undefined>{
    if(await this.#access()==="guest")return structuredClone(this.#guestMeta);
    return this.#persistent().meta.get(LEGACY_IMPORT_META_KEY);
  }

  async commit(state:IndexedStateRecord,meta:MigrationMetaRecord):Promise<void>{
    if(await this.#access()==="guest"){
      this.#guestState.set(state.key,structuredClone(state));this.#guestMeta=structuredClone(meta);return;
    }
    const revision=this.#revision(),database=this.#persistent(revision);
    await database.transaction("rw",database.state,database.meta,async()=>{
      // The transaction may start after sign-out. Check again inside it, then
      // abort before commit if the session changed while the writes were awaiting.
      this.#persistent(revision);await database.state.put(state);
      this.#persistent(revision);await database.meta.put(meta);this.#persistent(revision);
    });
  }

  async writeRecord(state:IndexedStateRecord):Promise<void>{
    if(await this.#access()==="guest")throw new Error(ACCOUNT_REQUIRED_MESSAGE);
    const revision=this.#revision(),database=this.#persistent(revision);
    await database.transaction("rw",database.state,async()=>{
      this.#persistent(revision);await database.state.put(state);this.#persistent(revision);
    });
  }

  async deleteRecord(key:string):Promise<void>{
    if(await this.#access()==="guest")throw new Error(ACCOUNT_REQUIRED_MESSAGE);
    const revision=this.#revision(),database=this.#persistent(revision);
    await database.transaction("rw",database.state,async()=>{
      this.#persistent(revision);await database.state.delete(key);this.#persistent(revision);
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
