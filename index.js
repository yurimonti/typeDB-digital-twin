const express = require("express");
const typeDB = require("./src/dbconfig");
const deletes = require("./src/deleteFunctions");
const thingService = require('./src/service/thingService');
const { updateFeaturesOfAThing } = require('./src/updateFunctions');
const app = express();
const port = 3030;
app.use(express.json());

const newMessage = (type, message) => {
    return { [type]: message };
}

app.get('/', async (req, res) => {
    res.send("Hello World!!");
})

app.patch('/things/:thingId/attributes', async (req, res) => {
    const id = req.params.thingId;
    const body = req.body;
    if (!body || Object.keys(body).length <= 0) res.sendStatus(404);
    try {
        await thingService.updateAttributesOfAThing(id, body?.attributes);
        res.status(200).send(newMessage('success', 'thing successfully updated'))
    } catch (error) {
        if (error.name == "TypeDBClientError") res.status(400).send(error.message);
        else res.status(400).send(newMessage('error', error));
    }
})

app.patch('/things/:thingId/features', async (req, res) => {
    const id = req.params.thingId;
    const body = req.body;
    if (!body || Object.keys(body).length <= 0) res.sendStatus(404);
    try {
        await updateFeaturesOfAThing(id, body.features);
        res.sendStatus(200);
    } catch (error) {
        if (error.name == "TypeDBClientError") res.status(400).send(error.message);
        else res.status(400).send(newMessage('error', error));
    }
})

app.get('/things', async (req, res) => {
    res.send(await thingService.getThings());
})

app.post('/things/:thingId', async (req, res) => {
    const id = req.params.thingId;
    const body = req.body;
    try {
        await thingService.createNewThing({ thingId: id, attributes: body.attributes, features: body.features });
        res.status(200).send(newMessage('success', 'thing created with success!!'));
    } catch (error) {
        if (error.name == "TypeDBClientError") res.status(400).send(error.message);
        else res.status(400).send(newMessage('error', error));
    }
})

/* app.post('/things/:thingId',async(req,res)=>{
    const id = req.params.thingId;
    const body = req.body;
    await createNewThing(id,body.attributes,body.features)
    res.status(200).send(newMessage('success','thing created with success!!'));
}) */

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
    //res.send(await typeDB.getAThing(thingId));
    try {
        let thing = await thingService.getAThing(thingId);
        res.send(thing);
    } catch (error) {
        res.status(404).send(error);
    }
})

app.get('/things/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    /* const features = await getRelationsOfAThing(thingId); */
    try {
        let thing = await thingService.getAThing(thingId);
        res.send(thing.features);
    } catch (error) {
        res.status(404).send(error);
    }
})

app.get('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    /* const attributes = await getAttributesOfAThing(thingId); */
    try {
        let thing = await thingService.getAThing(thingId);
        res.send(thing.attributes);
    } catch (error) {
        res.status(404).send(error);
    }
})

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