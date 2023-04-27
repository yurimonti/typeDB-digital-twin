const express = require("express");
const queryManager = require('./src/service/queryManager');

const port = 3030;
const app = express();
app.use(express.json());

const newMessage = (type, message) => {
    return {[type]: message};
}


/**
 * Extract a thing given parameters that stands for request and response.
 *
 * @param req parameter that stands for request
 * @param res parameter that stands for response
 * @returns {Promise<*>} a Promise that contains a thing if extracted, undefined otherwise
 */
async function extractThing(req, res) {
    const {thingId, attribute} = req.params;
    let thing;
    try {
        thing = await queryManager.getAThing(thingId);
    } catch (error) {
        return res.status(404).send(error);
    }
    const toReturn = thing.attributes[attribute];
    if (!toReturn) return res.status(404).send(attribute + " attribute not found for thing " + thingId);
    return toReturn;
}

/**
 * Check features of a thing.
 *
 * @param thingId id of the thing
 * @param features features associated to the passed thing
 * @param pathToResult path to features' names
 * @param res parameter that stands for response
 * @returns {Promise<*>} a Promise that contains the features if they exist, otherwise an HTTP 404 error
 */
async function checkFeatures(thingId, features, pathToResult, res) {
    let notFound;
    if (!features) return res.status(404).send("features not found for thing " + thingId);
    for (const key of pathToResult) {
        features = features[key];
        if (!features) {
            notFound = key;
            break;
        }
    }
    if (!features) return res.status(404).send(notFound + " feature not found for thing " + thingId);
    return features;
}


// GET requests
app.get('/', async (req, res) => {
    res.redirect('/things');
});

/**
 * Return all things
 */
app.get("/things", async (req, res) => {
    try {
        let things = await queryManager.getThings();
        return res.status(200).send(things);
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Get all the things
 */
app.get("/things/:thingId", async (req, res) => {
    const {thingId} = req.params;
    try {
        let thing = await queryManager.getAThing(thingId);
        return res.status(200).send(thing);
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Get all the attributes of a specified thing
 */
app.get('/things/:thingId/attributes', async (req, res) => {
    const {thingId} = req.params;
    /* const attributes = await getAttributesOfAThing(thingId); */
    try {
        let thing = await queryManager.getAThing(thingId);
        return res.send(thing.attributes);
    } catch (error) {
        return res.status(404).send(error);
    }
})

/**
 * Get a specified attribute of a specified thing
 */
app.get('/things/:thingId/attributes/:attribute', async (req, res) => {
    return res.send(await extractThing(req, res));
})

/**
 * Get all the features of a specified thing
 */
app.get('/things/:thingId/features', async (req, res) => {
    const {thingId} = req.params;
    /* const features = await getRelationsOfAThing(thingId); */
    try {
        let thing = await queryManager.getAThing(thingId);
        return res.send(thing.features);
    } catch (error) {
        return res.status(404).send(error);
    }
})

/**
 * Get a specified feature of a specified thing
 */
app.get('/things/:thingId/features/:featuresPath(*)', async (req, res) => {
    const {thingId, featuresPath} = req.params;
    let pathToResult = featuresPath.split('/');
    let thing;
    try {
        thing = await queryManager.getAThing(thingId);
    } catch (error) {
        return res.status(404).send(error);
    }
    return res.send(await checkFeatures(thingId, thing.features, pathToResult, res));
})

// POST requests

/**
 * Create a new thing, if it doesn't exist, with attributes and features
 */
app.post('/things', async (req, res) => {
    const body = req.body;
    try {
        await queryManager.createThing(body?.thingId, body?.attributes, body?.features);
        return res.status(200).send(newMessage('success', 'thing created with success!!'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Update a thing, if it already exists, with attributes and features
 */
app.post('/things/:thingId', async (req, res) => {
    const {thingId} = req.params;
    const body = req.body;
    try {
        await queryManager.updateThing(thingId, body?.attributes, body?.features);
        return res.status(200).send(newMessage('success', 'thing updated with success!!'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Update attributes of a thing
 */
app.post('/things/:thingId/attributes', async (req, res) => {
    const {thingId} = req.params;
    const body = req.body;
    try {
        await queryManager.updateThingAttributes(thingId, body?.attributes);
        return res.status(200).send(newMessage('success', 'thing attributes updated with success!!'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Update features of a thing
 */
app.post('/things/:thingId/features', async (req, res) => {
    const {thingId} = req.params;
    const body = req.body;
    try {
        await queryManager.updateThingFeatures(thingId, body?.features);
        return res.status(200).send(newMessage('success', 'thing features updated with success!!'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

// DELETE requests

/**
 * Delete a thing and all its attributes and features
 */
app.delete('/things/:thingId', async (req, res) => {
    const {thingId} = req.params;
    try {
        await queryManager.deleteAThing(thingId);
        return res.status(200).send(newMessage('OK', 'thing deleted correctly'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Delete all attributes of a thing
 */
app.delete('/things/:thingId/attributes', async (req, res) => {
    const {thingId} = req.params;
    const body = req.body;
    try {
        await queryManager.deleteAttributesOfThing(thingId, body?.attributes);
        return res.status(200).send(newMessage('OK', 'thing attributes deleted correctly'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Delete a specified attribute of a thing
 */
app.delete('/things/:thingId/attributes/:attribute', async (req, res) => {
    const {thingId, attribute} = req.params;
    const toReturn = await extractThing(req, res);
    try {
        await queryManager.deleteAttributesOfThing(thingId, {[attribute]: toReturn});
        return res.status(200).send(newMessage('OK', 'thing ' + attribute + ' attribute deleted correctly'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Delete all features of a thing
 */
app.delete('/things/:thingId/features', async (req, res) => {
    const {thingId} = req.params;
    const body = req.body;
    try {
        await queryManager.deleteFeaturesOfThing(thingId, body?.features);
        return res.status(200).send(newMessage('OK', 'thing features deleted correctly'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Delete a specified feature of a thing
 */
app.delete('/things/:thingId/features/:featuresPath(*)', async (req, res) => {
    const {thingId, featuresPath} = req.params;
    let pathToResult = featuresPath.split('/');
    if (pathToResult.length > 2) return res.status(404).send("features not found for thing " + thingId);
    let thing;
    try {
        thing = await queryManager.getAThing(thingId);
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
    await checkFeatures(thingId, thing.features, pathToResult, res);
    try {
        if (pathToResult.length > 1) {
            let innerFeature = {[pathToResult.at(1)]: thing.features[pathToResult.at(0)][pathToResult.at(1)]}
            let featuresComposition = {[pathToResult.at(0)]: innerFeature};
            await queryManager.deleteFeaturesOfThing(thingId, featuresComposition);
            return res.status(200).send(newMessage('OK', 'thing ' + pathToResult.at(1) + ' relation deleted correctly'));
        }
        await queryManager.deleteFeaturesOfThing(thingId, {[pathToResult.at(0)]: thing.features[pathToResult.at(0)]});
        return res.status(200).send(newMessage('OK', 'thing ' + pathToResult.at(0) + ' relation deleted correctly'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error.message));
    }
})


/**
 * Deletes only one feature with the specified relationId
 */
app.delete('/features/:featureId', async (req, res) => {
    const {featureId} = req.params;
    try {
        await queryManager.deleteFeature(featureId);
        return res.status(200).send(newMessage('OK', 'feature ' + featureId + ' deleted correctly'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})


/**
 * Deletes more than one feature with the specified relationIds.
 */
app.delete("/features", async (req, res) => {
    const body = req.body;
    if (!body?.relationId) return res.status(400).send("Invalid request.");
    try {
        await queryManager.deleteMultipleFeatures(body.relationId);
        return res.status(200).send(newMessage('OK', 'features deleted correctly'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
});


/**
 * Deletes more than one thing with the specified thingIds.
 */
app.delete("/things", async (req, res) => {
    const body = req.body;
    if (!body?.thingId) return res.status(400).send("Invalid request.");
    try {
        await queryManager.deleteMultipleThings(body.thingId);
        return res.status(200).send(newMessage('OK', 'features deleted correctly'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
});


// PUT requests

/**
 * Update attributes and features of a thing
 */
app.put('/things/:thingId', async (req, res) => {
    const {thingId} = req.params;
    const body = req.body;
    try {
        await queryManager.deleteAttributesOfThing(thingId, undefined);
        await queryManager.deleteFeaturesOfThing(thingId, undefined);
        (body?.attributes && Object.keys(body?.attributes).length > 0) && await queryManager.updateThingAttributes(thingId, body?.attributes);
        (body?.features && Object.keys(body?.features).length > 0) && await queryManager.updateThingFeatures(thingId, body?.features);
        return res.status(200).send(newMessage('success', 'thing attributes updated with success!!'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Update attributes of a thing
 */
app.put('/things/:thingId/attributes', async (req, res) => {
    const {thingId} = req.params;
    const body = req.body;
    try {
        await queryManager.deleteAttributesOfThing(thingId, undefined);
        await queryManager.updateThingAttributes(thingId, body?.attributes);
        return res.status(200).send(newMessage('success', 'thing attributes updated with success!!'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

/**
 * Update features of a thing
 */
app.put('/things/:thingId/features', async (req, res) => {
    const {thingId} = req.params;
    const body = req.body;
    try {
        await queryManager.deleteFeaturesOfThing(thingId, undefined);
        await queryManager.updateThingFeatures(thingId, body?.features);
        return res.status(200).send(newMessage('success', 'thing features updated with success!!'));
    } catch (error) {
        if (error?.name === "TypeDBClientError") return res.status(400).send(error.message);
        return res.status(404).send(newMessage('error', error));
    }
})

app.listen(port, () => {
    console.log(`typeDB-digital-twin listening on port: ${port}`);
})





