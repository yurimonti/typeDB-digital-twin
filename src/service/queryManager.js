const queryRunner = require('./queryRunner');
const client = require('../clientFunction');


// * private functions

/**
 *
 * @param {*} aConceptGroup
 * @returns JSON that represents the DB attributes object.
 */
function getAttributesFromAConceptGroup(aConceptGroup) {
    let attributes = {};
    aConceptGroup.forEach(c => {
        const label = attributes[c.attribute.label];
        if (label === undefined) attributes = {
            ...attributes,
            [c.attribute.label]: c.attribute.value
        }
    });
    return attributes;
}

/**
 *
 * @param {*} aConceptGroup
 * @param {string} thingId
 * @returns JSON that represents the features object.
 */
function getRelationsFromAConceptGroup(aConceptGroup, thingId) {
    let features = {};
    aConceptGroup.forEach(c => {
        if (Object.keys(c.relation).length > 0) {
            if (features[c.relation.label] === undefined) features = {
                ...features,
                [c.relation.label]: {
                    [c.relation.id]: {
                        [c.roles.from]: thingId,
                        [c.roles.to]: c.related
                    }
                }
            }
            else {
                const label = features[c.relation.label];
                if (label[c.relation.id] === undefined) {
                    features[c.relation.label] = {
                        ...label,
                        [c.relation.id]: {
                            [c.roles.from]: thingId,
                            [c.roles.to]: c.related
                        }
                    };
                    //console.log(features);
                }
            }
        }
    });
    return features;
}

const fillThing = (concepts) => {
    const attributes = getAttributesFromAConceptGroup(concepts);
    let thing = {
        thingId: attributes.thingId,
        attributes: {}
    };
    const features = getRelationsFromAConceptGroup(concepts, attributes.thingId);
    thing = {...thing, features: features};
    delete attributes.thingId;
    thing.attributes = attributes;
    return thing;
}

/**
 *
 * @param {*} conceptMap
 * @returns map each concept group in more objects that represent partial graph
 */
const getAllConcepts = async (conceptMap) => {
    let result = [];
    for await (const concept of conceptMap) {
        const owner = concept.get('x');
        const attribute = concept.get('a');
        const rel = concept.get('rel');
        const relAttribute = concept.get('relAtt');
        const role1 = concept.get('role1');
        const role2 = concept.get('role2');
        const relatedToId = concept.get('t');
        let toAdd = {
            thing: owner,
            attribute: {label: attribute.type.label.name, value: attribute.value},
            relation: {},
            roles: {},
            related: ""
        }
        if (rel) {
            toAdd.relation = {label: rel.type.label.name, id: relAttribute.value};
            toAdd.roles = {from: role1.label.name, to: role2.label.name};
            toAdd.related = relatedToId.value;
        }
        result.push(toAdd);
    }
    return result;
}

function getAttributesToDeleteFromAThing(thing, attributes) {
    let attributesToDelete = {};
    let attributesBodyKey = Object.keys(attributes);
    if (!attributes && attributesBodyKey.length <= 0) throw 'attributes not present in the body request or is empty!!'
    attributesBodyKey.forEach(toModifyKey => {
        if (thing?.attributes[toModifyKey]) attributesToDelete = {
            ...attributesToDelete,
            [toModifyKey]: attributes[toModifyKey]
        };
    });
    return Object.keys(attributesToDelete).length > 0 ? attributesToDelete : undefined;
}

//TODO: completare
function getFeaturesToDeleteFromAThing(thing, features) {
    const keysBody = Object.keys(features);
    let toDelete = {};
    let toAdd = {};
    keysBody.forEach(type => {
        if (thing.features[type]) {
            const relIdType = Object.keys(features[type]);
            let toRemove = {};
            relIdType.forEach(relId => {
                if (thing.features[type][relId]) {
                    let elementToRemove = thing.features[type][relId];
                    toRemove = {...toRemove, [relId]: elementToRemove};
                } else {
                    let elementToAdd = {[relId]: features[type][relId]}
                    toAdd = {...toAdd, [type]: elementToAdd};
                }
            });
            if (toRemove && Object.keys(toRemove).length > 0) toDelete = {...toDelete, [type]: toRemove};
        } else toAdd = {...toAdd, [type]: features[type]};
    });
    return Object.keys(toDelete).length > 0 ? toDelete : undefined;
}

function attributesCheck(attributes) {
    if (attributes?.thingId) throw "Impossible to change thingId!";
    if (attributes?.category) throw "Impossible to change category!";
    if (attributes?.typology) throw "Impossible to change typology!";
}

async function thingNotExists(thingId) {
    const isPresent = await thingAlreadyExists(thingId);
    if (!isPresent) throw "thing with id " + thingId + " does not exists!!";
}

//TODO:completare
async function thingAlreadyExists(thingId) {
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection);
    try {
        const transactionResult = await transaction.query.match("match $entity isa entity, has thingId $thingId;get $thingId;");
        let collectionResult = await transactionResult.collect();
        collectionResult = collectionResult.map(aMap => aMap.get('thingId').value);
        return collectionResult.includes(thingId)
    } catch (error) {
        console.log(error);
    } finally {
        await transaction.close();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}

// * public functions

/**
 *
 * @param {string} thingId id of thing that we want to get
 * @returns a Thing that we want to search
 */
async function getAThing(thingId) {
    await thingNotExists(thingId);
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection);
    const thisThingMap = await queryRunner.getAThingQueryRun(thingId, transaction);
    if (!thisThingMap) throw "Empty thing";
    // *Array of ConceptMap --> vedere documentazione (si capisce poco)
    let conceptMap = thisThingMap.conceptMaps;
    const concepts = await getAllConcepts(conceptMap);
    let thing = fillThing(concepts);
    await transaction.close();
    await client.closeSession(sessionConnection);
    await client.closeClient(clientConnection);
    return thing;
}

async function getThings() {
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection);
    let things = [];
    let collector = await queryRunner.getThingsQueryRun(transaction);
    //* for each conceptMapGroup in Array
    for await (const element of collector) {
        // *Array of ConceptMap --> vedere documentazione (si capisce poco)
        let conceptMap = element.conceptMaps;
        //let owner = thisThingMap.owner;
        // Prova per le relazioni
        const concepts = await getAllConcepts(conceptMap);
        const thing = fillThing(concepts);
        things.push(thing);
    }
    await transaction.close();
    await client.closeSession(sessionConnection);
    await client.closeClient(clientConnection);
    if (things.length <= 0) throw "There isn't any thing!";
    else return things;
}

async function createThing(thingId, attributes, features) {
    if (!thingId || thingId === "") throw "thingId is required!";
    const exists = await thingAlreadyExists(thingId);
    if (exists) throw "This things already exists";
    if (!attributes || Object.keys(attributes).length <= 0)
        throw "Attributes are not presents in the body request!";
    if (!attributes?.category)
        throw "Attributes must contain category!";
    if (!attributes?.typology)
        throw "Attributes must contain typology!";
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection, true);
    try {
        await queryRunner.newThingQueryRun(thingId, attributes, transaction);
        if (features || Object.keys(features).length > 0)
            await queryRunner.addThingFeaturesQueryRun(thingId, features, transaction);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    } finally {
        await transaction.commit();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}

/**
 * delete a thing compleatly
 * @param {string} thingId id of thing that we want to delete
 */
async function deleteAThing(thingId) {
    await thingNotExists(thingId);
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection, true);
    try {
        await queryRunner.deleteThingQueryRun(thingId, transaction);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    } finally {
        await transaction.commit();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}

/**
 * Delete selected attributes if are present, otherwise delete all attributes
 * @param {string} thingId id of thing that we want to delete
 * @param {*} attributes attributes of thing that we want to delete
 */
async function deleteAttributesOfThing(thingId, attributes) {
    await thingNotExists(thingId);
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection, true);
    attributesCheck(attributes);
    try {
        await queryRunner.deleteThingAttributesQueryRun(thingId, attributes, transaction);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    } finally {
        await transaction.commit();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}

/**
 * delete selected features if are present, oterwise delete all features
 * @param {string} thingId id of thing that we want to delete
 * @param {*} features features of thing that we want to delete
 */
async function deleteFeaturesOfThing(thingId, features) {
    await thingNotExists(thingId);
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection, true);
    try {
        await queryRunner.deleteThingFeaturesQueryRun(thingId, features, transaction);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    } finally {
        await transaction.commit();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}

async function updateThingAttributes(thingId, attributes) {
    if (!attributes || Object.keys(attributes).length <= 0) throw "Attributes are not presents in the body request!";
    let thing = await getAThing(thingId);
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection, true);
    attributesCheck(attributes);
    let attributesToDelete = getAttributesToDeleteFromAThing(thing, attributes);
    try {
        attributesToDelete && await queryRunner.deleteThingAttributesQueryRun(thingId, attributesToDelete, transaction);
        await queryRunner.addThingAttributesQueryRun(thingId, attributes, transaction);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    } finally {
        await transaction.commit();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}

async function updateThingFeatures(thingId, features) {
    if (!features || Object.keys(features).length <= 0) throw "Features are not presents in the body request!";
    let thing = await getAThing(thingId);
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection, true);
    let toDelete = getFeaturesToDeleteFromAThing(thing, features);
    try {
        toDelete && await queryRunner.deleteThingFeaturesQueryRun(thingId, toDelete, transaction);
        await queryRunner.addThingFeaturesQueryRun(thingId, features, transaction);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    } finally {
        await transaction.commit();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}

async function updateThing(thingId, attributes, features) {
    let thing = await getAThing(thingId);
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection, true);
    let attributesToDelete = undefined;
    let toDelete = undefined;
    if (attributes && Object.keys(attributes).length > 0) {
        attributesCheck(attributes);
        attributesToDelete = getAttributesToDeleteFromAThing(thing, attributes);
    }
    if (features && Object.keys(features).length > 0)
        toDelete = getFeaturesToDeleteFromAThing(thing, features);
    try {
        toDelete && await queryRunner.deleteThingFeaturesQueryRun(thingId, toDelete, transaction);
        if (features && Object.keys(features).length > 0)
            await queryRunner.addThingFeaturesQueryRun(thingId, features, transaction);
        attributesToDelete && await queryRunner.deleteThingAttributesQueryRun(thingId, attributesToDelete, transaction);
        if (attributes && Object.keys(attributes).length > 0)
            await queryRunner.addThingAttributesQueryRun(thingId, attributes, transaction);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    } finally {
        await transaction.commit();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}


/**
 * Delete a feature based on the id
 * @param featureId id of the feature
 */
async function deleteFeature(featureId) {
    await featureNotExists(featureId);
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection, true);
    try {
        await queryRunner.deleteFeatureByIdQueryRun(featureId, transaction);
    } catch (error) {
        await transaction.rollback();
        console.log(error);
    } finally {
        await transaction.commit();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}

/**
 * Delete more than one feature based on the id
 * @param relIdArray array with the id of the features to delete
 */
async function deleteMultipleFeatures(relIdArray) {
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection, true);
    try {
        for (const relId of relIdArray) {
            await featureNotExists(relId);
            await queryRunner.deleteFeatureByIdQueryRun(relId, transaction);
        }
    } catch (error) {
        await transaction.rollback();
        throw error;
    } finally {
        await transaction.commit();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}

/**
 * Delete more than one thing
 * @param idArray array with the id of the things to delete
 */
 async function deleteMultipleThings(idArray) {
     const clientConnection = client.openClient();
     const sessionConnection = await client.openSession(clientConnection);
     const transaction = await client.openTransaction(sessionConnection, true);
     try {
         for (const id of idArray) {
             await thingNotExists(id);
             await queryRunner.deleteThingQueryRun(id, transaction);
         }
     } catch (error) {
         await transaction.rollback();
         throw error;
     } finally {
         await transaction.commit();
         await client.closeSession(sessionConnection);
         await client.closeClient(clientConnection);
     }
}

/**
 * Check if the feature exist in the database and return an error if it does
 * @param featureId
 */
async function featureNotExists(featureId) {
    const isPresent = await featureAlreadyExists(featureId);
    if (!isPresent) throw "feature with id " + featureId + " does not exists!!";
}

/**
 * Check in the db for the feature based on the id
 * @param featureId
 * @returns {Promise<boolean>}
 */
async function featureAlreadyExists(featureId) {
    const clientConnection = client.openClient();
    const sessionConnection = await client.openSession(clientConnection);
    const transaction = await client.openTransaction(sessionConnection);
    try {
        const transactionResult = await transaction.query.match("match $rel isa relation, has relationId $id; get $id;");
        let collectionResult = await transactionResult.collect();
        collectionResult = collectionResult.map(aMap => aMap.get('id').value);
        return collectionResult.includes(featureId)
    } catch (error) {
        console.log(error);
    } finally {
        await transaction.close();
        await client.closeSession(sessionConnection);
        await client.closeClient(clientConnection);
    }
}



module.exports = {
    deleteAThing,
    deleteAttributesOfThing,
    deleteFeature,
    deleteMultipleFeatures,
    deleteMultipleThings,
    deleteFeaturesOfThing,
    updateThingAttributes,
    updateThingFeatures,
    updateThing,
    getThings,
    getAThing,
    createThing
}