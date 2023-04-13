const express = require("express");
const deletes = require("./src/deleteFunctions");
const thingService = require('./src/service/thingService');
const app = express();
const port = 3030;
app.use(express.json());

const newMessage = (type, message) => {
    return { [type]: message };
}

app.get('/', async (req, res) => {
    res.send("Welcome!!");
})

/**
 * params: {
 *  thingId --> id of a thing that we want to get,
 *  attribute --> attribute that we want to obtain
 * }
 * return the value of attribute param for a specific thing with id = thingId
 */
app.get('/things/:thingId/attributes/:attribute', async (req, res) => {
    const { thingId, attribute } = req.params;
    const result = await thingService.getAThing(thingId);
    const toReturn = result.attributes[attribute];
    if (!toReturn) res.status(404).send(attribute + " attribute not found for thing " + thingId);
    res.send(toReturn);
})

/**
 * params: {
 *  thingId --> id of a thing that we want to get,
 *  featuresPath --> path of feature that we want to obtain
 * }
 * return the value of feature param for a specific thing with id = thingId
 */
app.get('/things/:thingId/features/:featuresPath(*)', async (req, res) => {
    const { thingId, featuresPath } = req.params;
    let pathToResult = featuresPath.split('/');
    const thing = await thingService.getAThing(thingId);
    let toReturn = thing.features;
    let notFound;
    if (!toReturn) res.status(404).send("features not found for thing " + thingId);
    for (const key of pathToResult) {
        toReturn = toReturn[key];
        if (!toReturn) {
            notFound = key;
            break;
        };
    }
    if (!toReturn) res.status(404).send(notFound + " feature not found for thing " + thingId);
    res.send(toReturn);
})

/**
 * params: {
 *  thingId --> id of a thing that we want to get,
 * },
 * body: {
 *  attributes:{} --> attributes of thing with id = thingId, that we want to update, if they are present,
 *  features:{} --> features of thing with id = thingId, that we want to update, if they are present 
 * }
 * update thing with id = thingId
 */
app.patch('/things/:thingId', async (req, res) => {
    const id = req.params.thingId;
    const body = req.body;
    if (!body || Object.keys(body).length <= 0) res.sendStatus(404);
    try {
        await thingService.updateThing(id, body?.attributes, body?.features);
        res.status(200).send(newMessage('success', 'thing successfully updated'))
    } catch (error) {
        if (error.name == "TypeDBClientError") res.status(400).send(error.message);
        else res.status(400).send(newMessage('error', error));
    }
})

/**
 * params: {
 *  thingId --> id of a thing that we want to get,
 * },
 * body: {
 *  attributes:{} --> attributes of thing with id = thingId, that we want to update, if they are present
 * }
 * update attributes of thing with id = thingId
 */
app.patch('/things/:thingId/attributes', async (req, res) => {
    const id = req.params.thingId;
    const body = req.body;
    if (!body || Object.keys(body).length <= 0) res.sendStatus(404);
    try {
        await thingService.updateThing(id, body?.attributes);
        res.status(200).send(newMessage('success', 'thing successfully updated'))
    } catch (error) {
        if (error.name == "TypeDBClientError") res.status(400).send(error.message);
        else res.status(400).send(newMessage('error', error));
    }
})

/**
 * params: {
 *  thingId --> id of a thing that we want to get,
 * },
 * body: {
 *  features:{} --> features of thing with id = thingId, that we want to update, if they are present 
 * }
 * update features of thing with id = thingId
 */
app.patch('/things/:thingId/features', async (req, res) => {
    const id = req.params.thingId;
    const body = req.body;
    if (!body || Object.keys(body).length <= 0) res.sendStatus(404);
    try {
        await thingService.updateThing(id, undefined, body?.features);
        res.status(200).send(newMessage('success', 'features of ' + id + ' correctly updated!'));
    } catch (error) {
        if (error.name == "TypeDBClientError") res.status(400).send(error.message);
        else res.status(400).send(newMessage('error', error));
    }
})

/**
 * return all things
 */
app.get('/things', async (req, res) => {
    res.send(await thingService.getThings());
})


/**
 * params:{
 *  thingId --> id of a thing that we want to create
 * }
 * body: {
 *  attributes:{} --> attributes associated to the thing
 *  features:{} --> features associated to the thing
 * }
 * 
 * create new thing if thingId isn't already exists
 */
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

//TODO: eliminare gli attributi già presenti dal body nella cosa, aggiungere già presenti nel body e nuovi nella cosa.
app.post('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await thingService.deleteAttributes(thingId);
        await thingService.addToThing(thingId,body.attributes,body.features);
        res.status(200).send(newMessage('success', 'thing updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") res.status(400).send(error.message);
        else
            res.status(404).send(newMessage('error', error));
    }
})

/**
 * params: {
 *  thingId --> id of a thing that we want to get,
 * }
 * return thing with id = thingId
 */
app.get('/things/:thingId', async (req, res) => {
    const { thingId } = req.params;
    try {
        const thing = await thingService.getAThing(thingId);
        res.send(thing);
    } catch (error) {
        res.status(404).send(error);
    }
})

/**
 * params: {
 *  thingId --> id of a thing that we want to get,
 * }
 * return features of thing with id = thingId
 */
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

/**
 * params: {
 *  thingId --> id of a thing that we want to get,
 * }
 * return attributes of thing with id = thingId
 */
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

app.delete('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    try {
        await thingService.deleteAttributes(thingId);
        res.status(200).send(newMessage('OK', 'attributes deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") res.status(400).send(error.message);
        else
            res.status(404).send(newMessage('error', error));
    }
})

app.delete('/things/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    try {
        await thingService.deleteFutures(thingId);
        res.status(200).send(newMessage('OK', 'features deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") res.status(400).send(error.message);
        else
            res.status(404).send(newMessage('error', error));
    }
})

app.delete('/things/:thingId', async (req, res) => {
    const { thingId } = req.params;
    try {
        await thingService.deleteThing(thingId);
        res.status(200).send(newMessage('OK', 'thing deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") res.status(400).send(error.message);
        else
            res.status(404).send(newMessage('error', error));
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
    console.log(`typeDB-digital-twin listening on port: ${port}`);
})