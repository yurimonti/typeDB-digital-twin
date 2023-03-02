const express = require("express");
const typeDB = require("./src/dbconfig");
const deletes = require("./src/deleteFunctions");
const {TypeDB, SessionType, TransactionType} = require("typedb-client");
const app = express();
const port = 3030;

app.get('/', (req, res) => {
    res.send("Hello World!!");
})

app.get('/things', async (req, res) => {
    res.send(await typeDB.getThings());
})

app.get("/relations", async (req, res) => {
    res.send(await typeDB.getRelations());
});

/**
 * Deletes only one thing with the specified thingId
 */
app.delete('/deleteThing/:thingId', async (req, res) => {
    try {
        const {thingId} = req.params;
        await deletes.deleteThing(thingId);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e});
    }
})

/**
 * Deletes only one relation with the specified relationId
 */
app.delete('/deleteRelation/:relationId', async (req, res) => {
    try {
        const {relationId} = req.params;
        await deletes.deleteRelation(relationId);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e});
    }
})

/**
 * Deletes only one attribute of a specified thing
 */
app.delete('/deleteThingAttribute/:thingId/attribute/:attributeName', async (req, res) => {
    try {
        await deletes.deleteThingAttribute(req.params.thingId, req.params.attributeName);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e});
    }
})

/**
 * Deletes more than one thing with the specified thingId
 */
app.delete("/deleteMultipleThings", async (req, res) => {
    try {
        await deletes.deleteMultipleThings(req.query);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e});
    }
});

/**
 * Deletes all attributes of the specified thing
 */
//todo controllare se cancella thingId
app.delete("/deleteMultipleThingsAttributes", async (req, res) => {
    try {
        await deletes.deleteMultipleThingsAttributes(req.query);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e});
    }
});

/**
 * Deletes more than one relation with the specified relationId
 */
app.delete("/deleteMultipleRelations", async (req, res) => {
    try {
        await deletes.deleteMultipleRelations(req.query);
        res.send({Success: 'Successful deletion.'});
    } catch (e) {
        res.status(400).send({Error: e});
    }
});


app.get("/allPersons", async (req, res) => {
    /* const clientAndSession = await typeDB.openSession(SessionType.DATA);
    const readTransaction = await typeDB.createTransaction(clientAndSession.session,TransactionType.READ);
    const query = await readTransaction.query.match("match $x isa person; get $x;");
    const persons = await query.collect();
    const result = await persons.map(person => person.get("x"));
    res.send(result); */
    res.send(await typeDB.runBasicQueries());

})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})