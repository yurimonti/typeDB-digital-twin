const queryConstructor = require('./queryConstructor');

//TODO:modificare
async function getAThingQueryRun(thingId, transaction) {
    // *Stream of conceptMapGroup --> vedere documentazione (si capisce poco)
    let queryResult = await transaction.query.matchGroup(queryConstructor.getThingWithFeaturesQuery(thingId));
    // *Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    let collector1 = await queryResult.collect();
    queryResult = transaction.query.matchGroup(queryConstructor.getThingWithNoFeaturesQuery(thingId));
    let collector2 = await queryResult.collect();
    // *Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    return collector1.concat(collector2)[0];
}

async function getThingsQueryRun(transaction) {
    // *Stream of conceptMapGroup --> vedere documentazione (si capisce poco)
    let queryResult = await transaction.query.matchGroup(queryConstructor.getThingsWithFeaturesQuery());
    // *Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    let collector1 = await queryResult.collect();
    queryResult = transaction.query.matchGroup(queryConstructor.getThingsWithNoFeaturesQuery());
    let collector2 = await queryResult.collect();
    return collector1.concat(collector2);
}

async function deleteThingQueryRun(thingId, transaction) {
    await transaction.query.delete(queryConstructor.deleteFeaturesQuery(thingId, undefined));
    await transaction.query.delete(queryConstructor.deleteAttributesQuery(thingId));
    await transaction.query.delete(queryConstructor.deleteThingLastQuery(thingId));
}

async function deleteThingAttributesQueryRun(thingId, attributes, transaction) {
    await transaction.query.delete(queryConstructor.deleteAttributesQuery(thingId, attributes));
}

async function deleteThingFeaturesQueryRun(thingId, features, transaction) {
    await transaction.query.delete(queryConstructor.deleteFeaturesQuery(thingId, features));
}

async function deleteFeatureByIdQueryRun(featureId, transaction) {
    await transaction.query.delete(queryConstructor.deleteFeatureById(featureId));
}

async function addThingAttributesQueryRun(thingId, attributes, transaction) {
    await transaction.query.insert(queryConstructor.addAttributesQuery(thingId, attributes));
}

async function newThingQueryRun(thingId, attributes, transaction) {
    await transaction.query.insert(queryConstructor.newThingQuery(thingId, attributes));
}

async function addThingFeaturesQueryRun(thingId, features, transaction) {
    await transaction.query.insert(queryConstructor.addFeaturesQuery(thingId, features));
}

module.exports = {
    getAThingQueryRun,
    deleteThingQueryRun,
    deleteThingAttributesQueryRun,
    deleteThingFeaturesQueryRun,
    deleteFeatureByIdQueryRun,
    addThingAttributesQueryRun,
    addThingFeaturesQueryRun,
    getThingsQueryRun,
    newThingQueryRun
}