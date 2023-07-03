import { join } from "node:path";
import { dynamicValue, getCurrentRuntime, isDeno } from "runtimey";
import Table from "./table.js";

let SQLite = await import(dynamicValue({
    bun: "bun:sqlite",
    deno: "https://deno.land/x/sqlite3@0.9.1/mod.ts",
    node: "better-sqlite3"
}));
SQLite = SQLite.Database ?? SQLite.default;

export namespace GreatDB {
    export enum Type { File, Memory, Serialized }
    interface ConfigFile { type: Type.File, filename: string, location?: string; }
    interface ConfigMemory { type: Type.Memory; }
    interface ConfigSerialized { type: Type.Serialized, data: Buffer | Uint8Array; }
    export class Database {
        private readonly db;
        constructor(config: ConfigFile | ConfigMemory | ConfigSerialized) {
            switch (config.type) {
                case Type.File:
                    //@ts-ignore
                    this.db = new SQLite(join((config.location ?? dynamicValue({ bun: globalThis.process?.cwd(), deno: globalThis.Deno?.cwd(), node: globalThis.process?.cwd() })), `${config.filename}`));
                    break;
                case Type.Memory:
                    this.db = new SQLite(":memory:");
                    break;
                case Type.Serialized:
                    if (isDeno()) throw Error("error: Serialized type is not supported!");
                    this.db = new SQLite(config.data);
                    break;
                default: throw Error("error: Unknown type. Use 'GreatDB.Type' only!");
            }
        }
        table<T extends { [s: string]: any; }>(name: string, schema: { parsed: string; schema: T; }) {
            return new Table<T>(name, schema.parsed, this.db);
        }
        deleteTable(name: string) {
            this.db.exec(`DROP TABLE IF EXISTS ${name}`);
        }
        pragma(name: string) {
            return {
                get: () => this.db.prepare(`PRAGMA ${name}`).get()[name],
                set: (value: string) => this.db.exec(`PRAGMA ${name} = ${value}`) as void
            };
        }
        executeQuery(query: string) {
            try {
                const res = this.db.prepare(query).all();
                return !res ? null : res;
            } catch (error: any) {
                if (error.message === "This statement does not return data. Use run() instead") {
                    this.db.exec(query);
                    return null;
                } else throw error;
            }
        }
        serialize() {
            if (isDeno()) throw Error("error: serialize() is not supported!");
            return this.db.serialize() as Buffer | Uint8Array;
        }
        clone() {
            if (isDeno()) throw Error("error: clone() is not supported!");
            return new Database({ type: Type.Serialized, data: this.serialize() });
        }
        async backup(filename: string, location = process.cwd()) {
            const path = location + filename + ".sqlite";
            switch (getCurrentRuntime()) {
                case "deno": throw Error("error: backup() is not supported!");
                case "bun": await Bun.write(path, this.serialize()); break;
                case "node": await this.db.backup(path); break;
            }
        }
        close() {
            this.db.close();
        }
    }
    export function getSqliteVersion() {
        const db = new SQLite(":memory:");
        const ver = db.prepare("SELECT sqlite_version() AS version").get().version;
        db.close();
        return ver;
    }
}

export { DataType, Schema } from "./schema.js";