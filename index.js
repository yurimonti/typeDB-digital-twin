const express = require("express");
const queryManager = require('./src/service/queryManager');
const deletes = require("./src/deleteFunctions");
const thingService = require('./src/service/thingService');
const {deleteFeaturesQuery} = require('./src/queryUtils');
const typeDB = require("./src/dbconfig");
const posts = require("./src/postFunctions");

const app = express();
app.use(express.json());
const port = 3030;
app.use(express.json());

//yuri

const newMessage = (type, message) => {
    return { [type]: message };
}

app.get('/', async (req, res) => {
    res.send("Welcome!!");
});


//* GET requests
/**
 * return all things
 */
app.get("/things", async (req, res) => {
    try {
        let things = await queryManager.getThings();
        return res.status(200).send(things);
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})
/* app.get('/things', async (req, res) => {
    res.send(await thingService.getThings());
}); */

/**
 * params: {
 *  thingId --> id of a thing that we want to get,
 * }
 * return thing with id = thingId
 */
app.get("/things/:thingId", async (req, res) => {
    const { thingId } = req.params;
    try {
        let thing = await queryManager.getAThing(thingId);
        return res.status(200).send(thing);
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})
/* app.get('/things/:thingId', async (req, res) => {
    const { thingId } = req.params;
    try {
        const thing = await thingService.getAThing(thingId);
        res.send(thing);
    } catch (error) {
        res.status(404).send(error);
    }
}) */

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
        let thing = await queryManager.getAThing(thingId);
        return res.send(thing.attributes);
    } catch (error) {
        return res.status(404).send(error);
    }
})
/* app.get('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    try {
        let thing = await thingService.getAThing(thingId);
        res.send(thing.attributes);
    } catch (error) {
        res.status(404).send(error);
    }
}) */

/**
 * params: {
 *  thingId --> id of a thing that we want to get,
 *  attribute --> attribute that we want to obtain
 * }
 * return the value of attribute param for a specific thing with id = thingId
 */
app.get('/things/:thingId/attributes/:attribute', async (req, res) => {
    const { thingId, attribute } = req.params;
    let thing;
    try {
        thing = await queryManager.getAThing(thingId);
    } catch (error) {
        return res.status(404).send(error);
    }
    const toReturn = thing.attributes[attribute];
    if (!toReturn) return res.status(404).send(attribute + " attribute not found for thing " + thingId);
    return res.send(toReturn);
})
/* app.get('/things/:thingId/attributes/:attribute', async (req, res) => {
    const { thingId, attribute } = req.params;
    const result = await thingService.getAThing(thingId);
    const toReturn = result.attributes[attribute];
    if (!toReturn) res.status(404).send(attribute + " attribute not found for thing " + thingId);
    res.send(toReturn);
}) */

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
        let thing = await queryManager.getAThing(thingId);
        return res.send(thing.features);
    } catch (error) {
        return res.status(404).send(error);
    }
})
/* app.get('/things/:thingId/features', async (req, res) => {
    const {thingId} = req.params;
    try {
        let thing = await thingService.getAThing(thingId);
        res.send(thing.features);
    } catch (error) {
        res.status(404).send(error);
    }
}) */

app.get('/things/:thingId/features/:featuresPath(*)', async (req, res) => {
    const { thingId, featuresPath } = req.params;
    let pathToResult = featuresPath.split('/');
    let thing;
    try {
        thing = await queryManager.getAThing(thingId);
    } catch (error) {
        return res.status(404).send(error);
    }
    let toReturn = thing.features;
    let notFound;
    if (!toReturn) return res.status(404).send("features not found for thing " + thingId);
    for (const key of pathToResult) {
        toReturn = toReturn[key];
        if (!toReturn) {
            notFound = key;
            break;
        };
    }
    if (!toReturn) return res.status(404).send(notFound + " feature not found for thing " + thingId);
    return res.send(toReturn);
})
//greta


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
app.delete("/things", async (req, res) => {
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
//todo controllare se cancella thingId e vedere se funziona quella di yuri
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
app.delete("/relations", async (req, res) => {
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
        res.status(400).send({Error: e});
    }
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
        }
    }
    if (!toReturn) res.status(404).send(notFound + " feature not found for thing " + thingId);
    res.send(toReturn);
})

//*  POST requests

/**
 * body: {
 *  thingId --> id of a thing that we want to create
 *  attributes:{} --> attributes associated to the thing
 *  features:{} --> features associated to the thing
 * }
 * 
 * create new thing if thingId isn't already exists
 */
app.post('/things', async (req, res) => {
    const body = req.body;
    try {
        await queryManager.createThing(body?.thingId, body?.attributes, body?.features);
        return res.status(200).send(newMessage('success', 'thing created with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})
/* app.post("/things",async (req,res)=>{
    const body = req.body;
    if(!body.thingId) res.status(400).send(newMessage('error', 'thingId must be present!!'));
    try {
        await thingService.createNewThing({ thingId: body.thingId, attributes: body.attributes, features: body.features });
        res.status(200).send(newMessage('success', 'thing created with success!!'));
    } catch (error) {
        if (error.name == "TypeDBClientError") res.status(400).send(error.message);
        else res.status(400).send(newMessage('error', error));
    }
}) */

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
    const { thingId } = req.params;
    const body = req.body;
    try {
        await queryManager.updateThing(thingId, body?.attributes, body?.features);
        return res.status(200).send(newMessage('success', 'thing updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})
/* app.post('/things/:thingId', async (req, res) => {
    const id = req.params.thingId;
    const body = req.body;
    try {
        await thingService.createNewThing({ thingId: id, attributes: body.attributes, features: body.features });
        res.status(200).send(newMessage('success', 'thing created with success!!'));
    } catch (error) {
        if (error.name == "TypeDBClientError") res.status(400).send(error.message);
        else res.status(400).send(newMessage('error', error));
    }
}) */

app.post('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await queryManager.updateThingAttributes(thingId, body?.attributes);
        return res.status(200).send(newMessage('success', 'thing attributes updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})
//TODO: eliminare gli attributi del body già presenti nella cosa --> aggiungere attributi dal body alla cosa.
/* app.post('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await thingService.updateAttributeOfThing(thingId,body?.attributes);
        res.status(200).send(newMessage('success', 'thing updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") res.status(400).send(error.message);
        else
            res.status(404).send(newMessage('error', error));
    }
}) */

app.post('/things/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await queryManager.updateThingFeatures(thingId, body?.features);
        return res.status(200).send(newMessage('success', 'thing features updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})
/* app.post('/things/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await thingService.updateFeaturesOfThing(thingId,body?.features);
        res.status(200).send(newMessage('success', 'thing updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") res.status(400).send(error.message);
        else
            res.status(404).send(newMessage('error', error));
    }
}) */

/* app.post('/things/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await thingService.deleteFutures(thingId,body?.features);
        await thingService.addToThing(thingId,body?.attributes,body?.features);
        res.status(200).send(newMessage('success', 'thing updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") res.status(400).send(error.message);
        else
            res.status(404).send(newMessage('error', error));
    }
}) */

//* PATCH requests

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





//* DELETE requests

app.delete('/things/:thingId', async (req, res) => {
    const { thingId } = req.params;
    try {
        await queryManager.deleteAThing(thingId);
        return res.status(200).send(newMessage('OK', 'thing deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.delete('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await queryManager.deleteAttributesOfThing(thingId, body?.attributes);
        return res.status(200).send(newMessage('OK', 'thing attributes deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.delete('/things/:thingId/attributes/:attribute', async (req, res) => {
    const { thingId, attribute } = req.params;
    let thing;
    try {
        thing = await queryManager.getAThing(thingId);
    } catch (error) {
        return res.status(404).send(error);
    }
    const toReturn = thing.attributes[attribute];
    if (!toReturn) return res.status(404).send(attribute + " attribute not found for thing " + thingId);
    try {
        await queryManager.deleteAttributesOfThing(thingId, { [attribute]: toReturn });
        return res.status(200).send(newMessage('OK', 'thing ' + attribute + ' attribute deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.delete('/things/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await queryManager.deleteFeaturesOfThing(thingId, body?.features);
        return res.status(200).send(newMessage('OK', 'thing features deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.delete('/things/:thingId/features/:featuresPath(*)', async (req, res) => {
    const { thingId, featuresPath } = req.params;
    let pathToResult = featuresPath.split('/');
    if (pathToResult.length > 2) return res.status(404).send("features not found for thing " + thingId);
    let thing;
    try {
        thing = await queryManager.getAThing(thingId);
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
    let toReturn = thing.features;
    let notFound;
    if (!toReturn) return res.status(404).send("features not found for thing " + thingId);
    for (const key of pathToResult) {
        toReturn = toReturn[key];
        if (!toReturn) {
            notFound = key;
            break;
        };
    }
    if (!toReturn) return res.status(404).send(notFound + " feature not found for thing " + thingId);
    try {
        if (pathToResult.length > 1) {
            let innerFeature = { [pathToResult.at(1)]: thing.features[pathToResult.at(0)][pathToResult.at(1)] }
            let featuresComposition = { [pathToResult.at(0)]: innerFeature };
            await queryManager.deleteFeaturesOfThing(thingId, featuresComposition);
            return res.status(200).send(newMessage('OK', 'thing ' + pathToResult.at(1) + ' relation deleted correctly'));
        }
        await queryManager.deleteFeaturesOfThing(thingId, { [pathToResult.at(0)]: thing.features[pathToResult.at(0)] });
        return res.status(200).send(newMessage('OK', 'thing ' + pathToResult.at(0) + ' relation deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})



/* app.delete('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    try {
        await thingService.deleteAttributes(thingId);
        res.status(200).send(newMessage('OK', 'attributes deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") res.status(400).send(error.message);
        else
            res.status(404).send(newMessage('error', error));
    }
}) */
//TODO: cancellare anche la feature specifica
/* app.delete('/things/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    try {
        await thingService.deleteFutures(thingId);
        res.status(200).send(newMessage('OK', 'features deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") res.status(400).send(error.message);
        else
            res.status(404).send(newMessage('error', error));
    }
}) */

/* app.delete('/things/:thingId', async (req, res) => {
    const { thingId } = req.params;
    try {
        await thingService.deleteThing(thingId);
        res.status(200).send(newMessage('OK', 'thing deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") res.status(400).send(error.message);
        else
            res.status(404).send(newMessage('error', error));
    }
}) */

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

// *PUT requests

app.put('/prova/:thingId', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await queryManager.deleteAttributesOfThing(thingId);
        await queryManager.deleteFeaturesOfThing(thingId);
        (body?.attributes && Object.keys(body?.attributes).length >0) && await queryManager.updateThingAttributes(thingId, body?.attributes);
        (body?.features && Object.keys(body?.features).length >0) && await queryManager.updateThingFeatures(thingId, body?.features);
        return res.status(200).send(newMessage('success', 'thing attributes updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.put('/prova/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await queryManager.deleteAttributesOfThing(thingId);
        await queryManager.updateThingAttributes(thingId, body?.attributes);
        return res.status(200).send(newMessage('success', 'thing attributes updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.put('/prova/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await queryManager.deleteFeaturesOfThing(thingId);
        await queryManager.updateThingFeatures(thingId, body?.features);
        return res.status(200).send(newMessage('success', 'thing features updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

//TODO: eliminare gli attributi già presenti dal body nella cosa, aggiungere già presenti nel body e nuovi nella cosa.
//! FIXME: da fixare
/* app.put('/things/:thingId/attributes', async (req, res) => {
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
}) */

// *END requests

app.listen(port, () => {
    console.log(`typeDB-digital-twin listening on port: ${port}`);
})


//greta
//
//
//         /**
//          * Get of all the relations.
//          */
//         app.get("/relations", async (req, res) => {
//             res.send(await typeDB.getRelations());
//         });
//
//         /**
//          * Deletes only one thing with the specified thingId.
//          */
//         app.delete('/deleteThing/:thingId', async (req, res) => {
//             try {
//                 const {thingId} = req.params;
//                 await deletes.deleteThing(thingId);
//                 res.send({Success: 'Successful deletion.'});
//             } catch (e) {
//                 res.status(400).send({Error: e.message});
//             }
//         })
//
//         /**
//          * Deletes only one relation with the specified relationId.
//          */
//         app.delete('/deleteRelation/:relationId', async (req, res) => {
//             try {
//                 const {relationId} = req.params;
//                 await deletes.deleteRelation(relationId);
//                 res.send({Success: 'Successful deletion.'});
//             } catch (e) {
//                 res.status(400).send({Error: e.message});
//             }
//         })
//
//         /**
//          * Deletes only one attribute of a specified thing.
//          */
//         app.delete('/deleteThingAttribute/:thingId/attribute/:attributeName', async (req, res) => {
//             try {
//                 await deletes.deleteThingAttribute(req.params.thingId, req.params.attributeName);
//                 res.send({Success: 'Successful deletion.'});
//             } catch (e) {
//                 res.status(400).send({Error: e.message});
//             }
//         })
//
//         /**
//          * Deletes more than one thing with the specified thingId.
//          */
//         app.delete("/deleteMultipleThings", async (req, res) => {
//             try {
//                 await deletes.deleteMultipleThings(req.query);
//                 res.send({Success: 'Successful deletion.'});
//             } catch (e) {
//                 res.status(400).send({Error: e.message});
//             }
//         });
//
//         /**
//          * Deletes all attributes of the specified thing.
//          */
// //todo controllare se cancella thingId
//         app.delete("/deleteMultipleThingsAttributes", async (req, res) => {
//             try {
//                 await deletes.deleteMultipleThingsAttributes(req.query);
//                 res.send({Success: 'Successful deletion.'});
//             } catch (e) {
//                 res.status(400).send({Error: e.message});
//             }
//         });
//
//         /**
//          * Deletes more than one relation with the specified relationId.
//          */
//         app.delete("/deleteMultipleRelations", async (req, res) => {
//             try {
//                 await deletes.deleteMultipleRelations(req.query);
//                 res.send({Success: 'Successful deletion.'});
//             } catch (e) {
//                 res.status(400).send({Error: e.message});
//             }
//         });
//
//         /**
//          * Post to add a new thing.
//          */
//         app.post('/newThing/:thingId', async (req, res) => {
//             try {
//                 const {thingId} = req.params;
//                 await posts.addThing(thingId, req.body);
//                 res.send({Success: 'Successful insertion.'});
//             } catch (e) {
//                 res.status(400).send({Error: e});
//             }})}}




