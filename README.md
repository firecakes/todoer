## Todoer
An advanced task tracker program.

[]("https://github.com/firecakes/todoer/blob/main/screen-1.png")
[]("https://github.com/firecakes/todoer/blob/main/screen-2.png")

### Features
 * Specify a name for your task and when you want it completed, then add it to your list of tasks, ordered by due date!
 * You can make a task cyclic, so that they are daily, weekly, yearly, or anything else! The task will stay in your list for the next cycle once completed.
 * Make recipes, which are sets of items with amounts which you also create. Useful for compiling a list of things to shop for, but can be used for anything involving lists of things to do or get.
 * Attach one or more recipes to tasks so you can keep track of all the things to get for that task. If items are shared between multiple recipes, those items are added up to a sum in the task!
 * Label your items and recipes. Labelled items get categorized when put in a recipe that's added to a task!
 * Updating a recipe will automatically update any matching recipes attached to a task. Deleting an item will automatically remove it from any recipe lists it's attached to.
 * Supports a boundless numbers of databases by altering the URL to include an id query in the path!
 * Mobile-friendly! Switches from seeing all three columns of tasks, recipes, and items into one with view switch buttons at the top.

### Building the Project
No extra build tools are needed like webpack, a transpiler, etc. You do need to install some dependencies first: `npm install`
Start the server via `npm start`, then open your browser to localhost:3000. The port can be changed by adding an `.env` file in the top directory of the project with something like the following: `PORT=4321`

### More than one database
A default database is created when going to the base URL. You can however, create a new one by simply appending an id query to the URL. For example, going to `localhost:3000?id=testing` makes a new database called "testing" at that location. When you go back to that URL, all the things you did there will persist. See all the databases by looking into the created `dbs` folder, or the `database.json` file for the default database for the server.