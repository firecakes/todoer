require('dotenv').config();
const Koa = require('koa');
const Router = require('koa-router');
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

const app = new Koa();
const apiRouter = new Router();
apiRouter.prefix('/api');

app.use(require('koa-bodyparser')());
app.use(require('koa-static')('.'));

const memorizedIds = {};

function findDb (id) {
    if (memorizedIds[id]) return memorizedIds[id];

    const db = new JsonDB(new Config(`dbs/${id}`, true, true, '/'));
    // initialize data
    try {
        db.getData("/items");
    } catch (error) {
        db.push("/items", []);
    };
    try {
        db.getData("/recipes");
    } catch (error) {
        db.push("/recipes", []);
    };
    try {
        db.getData("/tasks");
    } catch (error) {
        db.push("/tasks", []);
    };
    memorizedIds[id] = db;
    return db;
}

apiRouter.post('/data', async (ctx, next) => {
    const input = ctx.request.body;
    let chosenDb = null;

    if (input.id === null) {
        chosenDb = db;
    } else {
        chosenDb = findDb(input.id);
    }

    // GETs
    if (input.action === 'get') {
        if (input.type === '') return ctx.status = 400;
        try {
            ctx.body = chosenDb.getData(`/${input.type}`);
        } catch (error) {
            return ctx.status = 400;
        }
    }

    // ADDs
    if (input.action === 'add') {
        if (input.type === '' || input.data.name === '') return ctx.status = 400;
        const data = chosenDb.getData(`/${input.type}`);
        if (data.find(e => e.name === input.data.name)) return ctx.status = 400;
        data.push(input.data);
        chosenDb.push(`/${input.type}`, data);
        ctx.body = data;
        return;
    }

    // EDITs
    if (input.action === 'edit') {
        if (input.type === '' || input.data.name === '') return ctx.status = 400;
        const data = chosenDb.getData(`/${input.type}`);
        const index = data.findIndex(e => e.name === input.data.name);
        if (index !== -1) data.splice(index, 1); // delete the old entry if it exists
        data.push(input.data);
        chosenDb.push(`/${input.type}`, data);
        ctx.body = data;
        return;
    }

    // DELETEs
    if (input.action === 'delete') {
        if (input.type === '' || input.data.name === '') return ctx.status = 400;
        const data = chosenDb.getData(`/${input.type}`);
        const index = data.findIndex(e => e.name === input.data.name);
        if (index === -1) return ctx.body = data;
        data.splice(index, 1);
        chosenDb.push(`/${input.type}`, data);
        ctx.body = data;
        return;
    }

    ctx.status = 200;
});

app
    .use(apiRouter.routes())
    .use(apiRouter.allowedMethods());

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started");
});

const db = new JsonDB(new Config("database", true, true, '/'));
// initialize data
try {
    db.getData("/items");
} catch (error) {
    db.push("/items", []);
};
try {
    db.getData("/recipes");
} catch (error) {
    db.push("/recipes", []);
};
try {
    db.getData("/tasks");
} catch (error) {
    db.push("/tasks", []);
};