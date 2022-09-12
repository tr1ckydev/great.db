

![](logo.png)



# great.db

⚡ A powerful, human-friendly database library for JavaScript using SQLite.

- Elegant way to set and retrieve data
- Queries are executed through robust functions
- Completely asynchronous



## Before getting started

This project is at an infancy and currently works **only** with [`bun:sqlite`](https://github.com/oven-sh/bun#bunsqlite-sqlite3-module) (bun.js runtime), but will support [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) (node.js runtime) too in future.



## Feature checklist

- [x] Simplify way to insert/update rows
- [ ] Powerful filter function to filter data based on condition
- [ ] Ability to delete tables
- [ ] Ability to execute custom SQL code directly
- [ ] Support `better-sqlite3`
- [ ] Add more schema presets



## Table of Contents

- [Install](#install)
- [Creating or Opening a database](#creating-or-opening-a-database)
- [Defining schema for a table](#defining-schema-for-a-table)
- [Creating or Opening a table](#creating-or-opening-a-table)
  - [Getting values from the table](#getting-values-from-the-table)
  - [Setting values to the table](#setting-values-to-the-table)
  - [Checking if a value exists in the table](#checking-if-a-value-exists-in-the-table)
  - [Deleting row(s) based on a value](#deleting-row(s)-based-on-a-value)
  - [Converting an entire table to an array](#converting-an-entire-table-to-an-array)
- [Closing the database](#closing-the-database)
- [Examples](#Examples)



## Install

```
bun install great.db
```



## Creating or Opening a database

### `new GreatDB.Database(options)`

- `options.type`

  - `GreatDB.Type.Disk`

    To create/open the database stored on the disk at a particular location.

  - `GreatDB.Type.Memory`

    Used to create an in-memory database.

    > Note: If this is chosen, then rest of the following properties are not required.

- `options.name`

  The name of the database file.

- `options.location` (optional)

  The path to the folder where the database file will be/is stored. If not provided, then the base folder of the project will be chosen by default.

- `options.mode`

  - `GreatDB.Mode.ReadWrite`

    Opens the database in read/write mode i.e. read and insert/change values.

  - `GreatDB.Mode.ReadOnly`

    Opens the database in read only mode i.e. cannot change any values.

Example:

```typescript
import { GreatDB } from "great.db";
const db = new GreatDB.Database({
    type: GreatDB.Type.Disk,
    name: "test",
    mode: GreatDB.Mode.ReadWrite
});
```



## Defining schema for a table

Schema is a way to define the structure for a table i.e. the columns. They contain column names along with their data types.



### `Schema.Create({...})`

Currently supported data types are `String`, `Number`, `BigInt` and `Boolean`.

Example:

```typescript
import { Schema } from "great.db";
const customerSchema = Schema.Create({
    id: Number,
    name: String,
    phone: Number,
    address: String,
    member: Boolean
});
type customerSchemaType = {
    id: number,
    name: string,
    phone: number,
    address: string,
    member: boolean
};
```

The above schema represents the following columns of a table:

| id `Number` | name `String` | phone `Number` | address `String` | member `Boolean` |
| :---------: | :-----------: | :------------: | :--------------: | :--------------: |



### `Schema.Presets.<Preset Name>`

Some commonly used schemas are available as presets.

- `KeyValue`

  | key `String` | value `String` |
  | :----------: | :------------: |

- *More coming soon...*



### `Schema.Types.<Preset Name>`

Contains equivalent typescript type information of the respective preset.



## Creating or Opening a table

Tables are where the data will be stored. A single database can contain multiple tables.

### `table<type>(name, schema)`

- `type`

  The typescript equivalent of the schema created earlier or `Schema.Types` if using a preset.

- `name`

  Name of the table to be created.

- `schema`

​	The schema created earlier using `Schema.Create` or a predefined preset using `Schema.Presets`.

Example:

```typescript
const table = db.table<customerSchemaType>("customers", customerSchema);
```



### Getting values from the table

#### `table.get(keyName, keyValue, fetchAll?)`

- `keyName`

  The name of the column of which we want to sort out the value.

- `keyValue`

  The value to be searched in that column.

- `fetchAll` (optional)

  - `true`: Returns an array of all the records whose key matches the given value.
  - `false`: *(Default)* Returns only the first record whose key matched with the value.

Example:

```typescript
const x = await table.get("id", 1);
console.log(x);
```



### Setting values to the table

#### `table.set({...})`

From the supplied parameter of objects, the first property is always treated as the key. If the key doesn't exist in the table, then all the supplied values are inserted into the table, but if the key already exists, then the old values belonging to the key will be updated with the new ones supplied.

Example:

```typescript
// Part-1
await table.set({
    id: 1, /*key*/
    name: "John Doe",
    phone: 1234567890,
    address: "Obere Str. 57",
    member: false
});

// Part-2
await table.set({
    id: 1, /*key*/
    address: "8 Johnstown Road" // Updating only the address value
});
```

The above example executes to the following:

*Table contents after Part-1:*


| id `Number` | name `String` | phone `Number` | address `String` | member `Boolean` |
| :---------: | :-----------: | :------------: | :--------------: | :--------------: |
|      1      |   John Doe    |   1234567890   |  Obere Str. 57   |      false       |

*Table contents after Part-2:*

| id `Number` | name `String` | phone `Number` |   address `String`   | member `Boolean` |
| :---------: | :-----------: | :------------: | :------------------: | :--------------: |
|      1      |   John Doe    |   1234567890   | **8 Johnstown Road** |      false       |



### Checking if a value exists in the table

#### `table.has(keyName, keyValue)`

Checks if the given key is present in the table and returns `true` or `false` accordingly.

- `keyName`: The column name where the value is to be searched.
- `keyValue`: The value to be searched in that column.

Example:

```typescript
const x = await table.has("name", "John Doe");
console.log(x);	// true
```



### Deleting row(s) based on a value

#### `table.delete(keyName, keyValue)`

Deletes entire row(s) of where the value is present in that column.

- `keyName`: The column name where the value is to be searched.
- `keyValue`: The value to be searched in that column.

Example:

```typescript
await table.delete("name", "John Doe");
const x = await table.has("name", "John Doe");
console.log(x);	// false
```



### Converting an entire table to an array

#### `table.toArray()`

Returns all the rows of the table in the form of an array.

> CAUTION: Avoid using this with tables having large amounts of data.



## Closing the database

After all the tasks are completed, the database should be closed. After closing, executing any operation on the database will result in error.

```typescript
db.close();
```



## Examples

Browse all the examples [here](https://github.com/tr1ckydev/great.db/tree/main/examples).
