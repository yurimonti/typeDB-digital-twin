const express = require("express");
const typeDB = require("./src/dbconfig");
const deletes = require("./src/deleteFunctions");
const posts = require("./src/postFunctions");
const app = express();
app.use(express.json());
const port = 3030;

app.get('/', (req, res) => {
    res.send("Hello World!!");
})

/**
 * Get of all the things.
 */
app.get('/things', async (req, res) => {
    res.send(await typeDB.getThings());
})

/**
 * Get of all the relations.
 */
app.get("/relations", async (req, res) => {
    res.send(await typeDB.getRelations());
});

/**
 * Deletes only one thing with the specified thingId.
 */
app.delete('/deleteThing/:thingId', async (req, res) => {
    try {
        const {thingId} = req.params;
        await deletes.deleteThing(thingId);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
})

/**
 * Deletes only one relation with the specified relationId.
 */
app.delete('/deleteRelation/:relationId', async (req, res) => {
    try {
        const {relationId} = req.params;
        await deletes.deleteRelation(relationId);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
})

/**
 * Deletes only one attribute of a specified thing.
 */
app.delete('/deleteThingAttribute/:thingId/attribute/:attributeName', async (req, res) => {
    try {
        await deletes.deleteThingAttribute(req.params.thingId, req.params.attributeName);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
})

/**
 * Deletes more than one thing with the specified thingId.
 */
app.delete("/deleteMultipleThings", async (req, res) => {
    try {
        await deletes.deleteMultipleThings(req.query);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
});

/**
 * Deletes all attributes of the specified thing.
 */
//todo controllare se cancella thingId
app.delete("/deleteMultipleThingsAttributes", async (req, res) => {
    try {
        await deletes.deleteMultipleThingsAttributes(req.query);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
});

/**
 * Deletes more than one relation with the specified relationId.
 */
app.delete("/deleteMultipleRelations", async (req, res) => {
    try {
        await deletes.deleteMultipleRelations(req.query);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
});

/**
 * Post to add a new thing.
 */
app.post('/newThing/:thingId', async (req, res) => {
    try {
        const {thingId} = req.params;
        await posts.addThing(thingId, req.body);
        res.send({Success: 'Successful insertion.'});
    } catch (e) {
        res.status(400).send({Error: e.message});
    }
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})