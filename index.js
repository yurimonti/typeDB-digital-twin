const express = require("express");
const thingService = require('./src/service/thingService');
const { deleteFeaturesQuery } = require('./src/queryUtils');
const queryConstructor = require('./src/service/queryConstructor');
const queryRunner = require('./src/service/queryRunner');
const queryManager = require('./src/service/queryManager');
const app = express();
app.use(express.json());
const port = 3030;

const newMessage = (type, message) => {
    return { [type]: message };
}

app.listen(port, () => {
    console.log(`typeDB-digital-twin listening on port: ${port}`);
})

app.get('/', async (req, res) => {
    return res.send("Welcome!!");
})

// * Inizio Prova
//! FIXME: non functiona niente
app.get("/prova", async (req, res) => {
    try {
        let things = await queryManager.getThings();
        return res.status(200).send(things);
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.get("/prova/:thingId", async (req, res) => {
    const { thingId } = req.params;
    try {
        let thing = await queryManager.getAThing(thingId);
        return res.status(200).send(thing);
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.get('/prova/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    /* const attributes = await getAttributesOfAThing(thingId); */
    try {
        let thing = await queryManager.getAThing(thingId);
        return res.send(thing.attributes);
    } catch (error) {
        return res.status(404).send(error);
    }
})

app.get('/prova/:thingId/attributes/:attribute', async (req, res) => {
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

app.get('/prova/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    /* const features = await getRelationsOfAThing(thingId); */
    try {
        let thing = await queryManager.getAThing(thingId);
        return res.send(thing.features);
    } catch (error) {
        return res.status(404).send(error);
    }
})

app.get('/prova/:thingId/features/:featuresPath(*)', async (req, res) => {
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


//TODO: finire
app.post('/prova', async (req, res) => {
    const body = req.body;
    try {
        await queryManager.createThing(body?.thingId, body?.attributes, body?.features);
        return res.status(200).send(newMessage('success', 'thing created with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.post('/prova/:thingId', async (req, res) => {
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

app.post('/prova/:thingId/attributes', async (req, res) => {
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

app.post('/prova/:thingId/features', async (req, res) => {
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

app.delete('/prova/:thingId', async (req, res) => {
    const { thingId } = req.params;
    try {
        await queryManager.deleteAThing(thingId);
        return res.status(200).send(newMessage('OK', 'thing deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.delete('/prova/:thingId/attributes', async (req, res) => {
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

app.delete('/prova/:thingId/attributes/:attribute', async (req, res) => {
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

app.delete('/prova/:thingId/features', async (req, res) => {
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

app.delete('/prova/:thingId/features/:featuresPath(*)', async (req, res) => {
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

// * Fine Prova

//* GET requests
/**
 * return all things
 */
app.get('/things', async (req, res) => {
    return res.send(await thingService.getThings());
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
        return res.send(thing);
    } catch (error) {
        return res.status(404).send(error);
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
        return res.send(thing.attributes);
    } catch (error) {
        return res.status(404).send(error);
    }
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
    if (!toReturn) return res.status(404).send(attribute + " attribute not found for thing " + thingId);
    return res.send(toReturn);
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
        return res.send(thing.features);
    } catch (error) {
        return res.status(404).send(error);
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
app.post("/things", async (req, res) => {
    const body = req.body;
    if (!body.thingId) return res.status(400).send(newMessage('error', 'thingId must be present!!'));
    try {
        await thingService.createNewThing({ thingId: body.thingId, attributes: body.attributes, features: body.features });
        return res.status(200).send(newMessage('success', 'thing created with success!!'));
    } catch (error) {
        if (error.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(400).send(newMessage('error', error));
    }
})

/**
 * params:{
 *  thingId --> id of a thing that we want to update
 * }
 * body: {
 *  attributes:{} --> attributes associated to the thing
 *  features:{} --> features associated to the thing
 * }
 * 
 * update thing
 */
app.post('/things/:thingId', async (req, res) => {
    const id = req.params.thingId;
    const body = req.body;
    try {
        await thingService.createNewThing({ thingId: id, attributes: body.attributes, features: body.features });
        return res.status(200).send(newMessage('success', 'thing created with success!!'));
    } catch (error) {
        if (error.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(400).send(newMessage('error', error));
    }
})

//TODO: eliminare gli attributi del body già presenti nella cosa --> aggiungere attributi dal body alla cosa.
app.post('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await thingService.updateAttributeOfThing(thingId, body?.attributes);
        return res.status(200).send(newMessage('success', 'thing updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

//TODO: eliminare gli attributi già presenti dal body nella cosa, aggiungere già presenti nel body e nuovi nella cosa.
//! FIXME: da fixare
app.put('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await thingService.deleteAttributes(thingId);
        await thingService.addToThing(thingId, body.attributes, body.features);
        return res.status(200).send(newMessage('success', 'thing updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.post('/things/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    const body = req.body;
    try {
        await thingService.updateFeaturesOfThing(thingId, body?.features);
        return res.status(200).send(newMessage('success', 'thing updated with success!!'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

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
    if (!body || Object.keys(body).length <= 0) return res.sendStatus(404);
    try {
        await thingService.updateThing(id, body?.attributes, body?.features);
        return res.status(200).send(newMessage('success', 'thing successfully updated'))
    } catch (error) {
        if (error.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(400).send(newMessage('error', error));
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
        return res.status(200).send(newMessage('success', 'thing successfully updated'))
    } catch (error) {
        if (error.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(400).send(newMessage('error', error));
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
        if (error.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(400).send(newMessage('error', error));
    }
})





//* DELETE requests

app.delete('/things/:thingId/attributes', async (req, res) => {
    const { thingId } = req.params;
    try {
        await thingService.deleteAttributes(thingId);
        res.status(200).send(newMessage('OK', 'attributes deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})
//TODO: cancellare anche la feature specifica
app.delete('/things/:thingId/features', async (req, res) => {
    const { thingId } = req.params;
    try {
        await thingService.deleteFutures(thingId);
        return res.status(200).send(newMessage('OK', 'features deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.delete('/things/:thingId', async (req, res) => {
    const { thingId } = req.params;
    try {
        await thingService.deleteThing(thingId);
        return res.status(200).send(newMessage('OK', 'thing deleted correctly'));
    } catch (error) {
        if (error?.name == "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})