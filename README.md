![](res/logo.png)

# great.db

⚡ A powerful, human-friendly database library for JavaScript using SQLite. A completely different approach is taken to create this library which strives to change the way we use SQLite in JavaScript forever.

- Elegant way to set and retrieve data
- Robust functions to perform operations
- Completely asynchronous



## Bun? Node.js? We got both.

great.db automatically detects which runtime you are using and uses the respective fastest SQLite library available under the hood. One code base working differently on different runtimes to provide the best experience. Isn't that *great* ?

![](res/dualpkg.png)



## Documentation and Examples

Seems interesting? Great! Head over to the [documentation](DOCUMENTATION.md) to learn everything about it.

Done reading? Now, check out the [examples](https://github.com/tr1ckydev/great.db/tree/main/examples) to get started.



## Salient Features

- ### Inserting/Updating data has never been easier

  Insert or update data with a breeze through simple objects or maybe an array of them for multiple at a time. [Learn more](https://github.com/tr1ckydev/great.db/blob/main/DOCUMENTATION.md#set-----promisevoid)

  ![](res/setdata.png)

- ### Use schemas to describe shape of your table

  Schema is a way to define how your table columns should be. Define your own schemas using various data types or use a built-in preset to quickly get started. [Learn more](https://github.com/tr1ckydev/great.db/blob/main/DOCUMENTATION.md#schema)

  ![](res/schema.png)

- ### Strong typescript support out of the box

  Typescript types get auto magically inferred from the schema created to give auto-completions on the fly everywhere.

  ![](res/autocomplete.png)



## License

great.db uses MIT License. great.db also includes external libraries that are available under a variety of licenses. See [LICENSE](https://github.com/tr1ckydev/great.db/blob/main/LICENSE) for full license text.
