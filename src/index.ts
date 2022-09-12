import { Database as SQLite } from "bun:sqlite";
import Table from "./table";

export namespace GreatDB {
    export enum Type { Disk, Memory }
    export enum Mode { ReadOnly, ReadWrite }
    interface ConfigDisk { type: Type.Disk, name: string, location?: string, mode: Mode }
    interface ConfigMemory { type: Type.Memory }
    export class Database {
        private db: SQLite;
        constructor(config: ConfigDisk | ConfigMemory) {
            switch (config.type) {
                case Type.Disk:
                    this.db = new SQLite(
                        (config.location ?? process.cwd()) + `/${config.name}.sqlite`,
                        config.mode === Mode.ReadWrite
                            ? { readwrite: true, create: true }
                            : { readonly: true, create: true }
                    );
                    break;
                case Type.Memory:
                    this.db = new SQLite(":memory:");
                    break;
            }
        }
        table<T>(name: string, schema: string) {
            return new Table<Partial<T>>(name, schema, this.db);
        }
        close() {
            this.db.close();
        }
    }
}

export { Schema } from "./schema";