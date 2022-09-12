namespace Schema {
    export function Create(schema: { [s: string]: Function }) {
        const TypeHash = {
            String: "TEXT",
            Number: "INTEGER",
            BigInt: "BIGINT",
            Boolean: "BOOLEAN",
        };
        const res = [];
        for (const [key, value] of Object.entries(schema)) {
            res.push(key + " " + TypeHash[value.name]);
        }
        return res.join(", ");
    }
    export enum Presets {
        KeyValue = "key TEXT, value TEXT",
    }
    export namespace Types {
        export type KeyValue = { key: string, value: string };
    }

}

export {Schema};