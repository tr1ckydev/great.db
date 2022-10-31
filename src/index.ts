import Table from "./table.js";

const SQLite = (await import(process.isBun ? "bun:sqlite" : "better-sqlite3")).default;

export namespace GreatDB {
    export enum Type { Disk, Memory, Serialized }
    export enum Mode { ReadOnly, ReadWrite }
    interface ConfigDisk { type: Type.Disk, name: string, location?: string }
    interface ConfigMemory { type: Type.Memory }
    interface ConfigSerialized { type: Type.Serialized, data: Buffer | Uint8Array }
    export class Database {
        private readonly db;
        constructor(config: ConfigDisk | ConfigMemory | ConfigSerialized) {
            switch (config.type) {
                case Type.Disk:
                    this.db = new SQLite(
                        (config.location ?? process.cwd()) + `/${config.name}.sqlite`
                    );
                    break;
                case Type.Memory:
                    this.db = new SQLite(":memory:");
                    break;
                case Type.Serialized:
                    this.db = new SQLite(config.data);
                    break;
                default: throw Error("Unknown type. Use 'GreatDB.Type' only.")
            }
        }
        table<T extends { [s: string]: any; }>(name: string, schema: { parsed: string; schema: T }) {
            return new Table<T>(name, schema.parsed, this.db);
        }
        async executeQuery(query: string) {
            try {
                const res = this.db.prepare(query).all();
                return !res ? null : res;
            } catch (err) {
                //@ts-ignore
                if (err.message === "This statement does not return data. Use run() instead") {
                    this.db.exec(query);
                    return null;
                } else throw err;
            }
        }
        serialize() {
            return this.db.serialize() as Buffer | Uint8Array;
        }
        clone() {
            return new Database({ type: Type.Serialized, data: this.serialize() });
        }
        async backup(filename: string, location = process.cwd()) {
            const path = location + filename + ".sqlite";
            if (process.isBun) {
                await Bun.write(path, this.serialize());
            } else {
                await this.db.backup(path);
            }
        }
        async close() {
            this.db.close();
        }
    }
}

export { Schema, DataType } from "./schema.js";