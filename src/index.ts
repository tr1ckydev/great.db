import Table from "./table.js";

const SQLite = process.argv[0] === "bun"
    ? require("bun:sqlite").default //@ts-ignore
    : (await import("better-sqlite3")).default;

export namespace GreatDB {
    export enum Type { Disk, Memory }
    export enum Mode { ReadOnly, ReadWrite }
    interface ConfigDisk { type: Type.Disk, name: string, location?: string }
    interface ConfigMemory { type: Type.Memory }
    export class Database {
        private readonly db;
        constructor(config: ConfigDisk | ConfigMemory) {
            switch (config.type) {
                case Type.Disk:
                    this.db = new SQLite(
                        (config.location ?? process.cwd()) + `/${config.name}.sqlite`
                    );
                    break;
                case Type.Memory:
                    this.db = new SQLite(":memory:");
                    break;
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
        async close() {
            this.db.close();
        }
    }
}

export { Schema, DataType } from "./schema.js";