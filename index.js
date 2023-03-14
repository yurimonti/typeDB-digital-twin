const express = require("express");
const typeDB = require("./src/dbconfig");
const { TypeDB, SessionType, TransactionType } = require("typedb-client");
const deletes = require("./src/deleteFunctions");
const app = express();
const port = 3030;
app.use(express.json());

const newMessage = (type, message) => {
    return { [type]: message };
}

app.get('/', async (req, res) => {
    res.send("Hello World!!");
})

app.get('/things', async (req, res) => {
    res.send(await typeDB.getThings());
})

app.put('/things/:thingId',async (req,res)=>{
    const id = req.params.thingId;
    const body = req.body;
    res.send(await typeDB.createNewThing(id,body.attributes,body.features));
})

/* app.post('things',async (req,res)=>{
    const body = req.body;
    try {
        const newThing = await typeDB.createThing(body);
        res.send(newThing);
    } catch (error) {
        res.sendStatus(400).send(newMessage('error','impossible to create this thing'));
    }
}) */

app.get('/things/:thingId', async (req, res) => {
    const { thingId } = req.params;
    res.send(await typeDB.getAThing(thingId));
})

app.get("/relations", async (req, res) => {
    res.send(await typeDB.getRelations());
});

app.delete('/deleteThing/:thingId', async (req, res) => {
    try {
        const { thingId } = req.params;
        await deletes.deleteThing(thingId);
        res.send({ Success: 'Successful deletion.' });
    } catch (e) {
        res.status(400).send({ Error: e });
    }
})

/**
 * Deletes only one relation with the specified relationId
 */
app.delete('/deleteRelation/:relationId', async (req, res) => {
    try {
        const { relationId } = req.params;
        await deletes.deleteRelation(relationId);
        res.send({ Success: 'Successful deletion.' });
    } catch (e) {
        res.status(400).send({ Error: e });
    }
})

/**
 * Deletes only one attribute of a specified thing
 */
app.delete('/deleteThingAttribute/:thingId/attribute/:attributeName', async (req, res) => {
    try {
        await deletes.deleteThingAttribute(req.params.thingId, req.params.attributeName);
        res.send({ Success: 'Successful deletion.' });
    } catch (e) {
        res.status(400).send({ Error: e });
    }
})

/**
 * Deletes more than one thing with the specified thingId
 */
app.delete("/deleteMultipleThings", async (req, res) => {
    try {
        await deletes.deleteMultipleThings(req.query);
        res.send({ Success: 'Successful deletion.' });
    } catch (e) {
        res.status(400).send({ Error: e });
    }
});

/**
 * Deletes all attributes of the specified thing
 */
//todo controllare se cancella thingId
app.delete("/deleteMultipleThingsAttributes", async (req, res) => {
    try {
        await deletes.deleteMultipleThingsAttributes(req.query);
        res.send({ Success: 'Successful deletion.' });
    } catch (e) {
        res.status(400).send({ Error: e });
    }
});

/**
 * Deletes more than one relation with the specified relationId
 */
app.delete("/deleteMultipleRelations", async (req, res) => {
    try {
        await deletes.deleteMultipleRelations(req.query);
        res.send({ Success: 'Successful deletion.' });
    } catch (e) {
        res.status(400).send({ Error: e });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})