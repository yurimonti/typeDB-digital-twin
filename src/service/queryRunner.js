const queryConstructor = require('./queryConstructor');

/**
 * Run a query to get a thing
 * @param thingId id of the thing to get
 * @param transaction transaction in which the query is executed
 * @returns some concept maps of the thing
 */
async function getAThingQueryRun(thingId, transaction) {
    let queryResult = await transaction.query.matchGroup(queryConstructor.getThingWithFeaturesQuery(thingId));
    let collector1 = await queryResult.collect();
    queryResult = transaction.query.matchGroup(queryConstructor.getThingWithNoFeaturesQuery(thingId));
    let collector2 = await queryResult.collect();
    return collector1.concat(collector2)[0];
}

/**
 * Run a query to get all the things
 * @param transaction transaction in which the query is executed
 * @returns some concept maps of the things
 */
async function getThingsQueryRun(transaction) {
    let queryResult = await transaction.query.matchGroup(queryConstructor.getThingsWithFeaturesQuery());
    let collector1 = await queryResult.collect();
    queryResult = transaction.query.matchGroup(queryConstructor.getThingsWithNoFeaturesQuery());
    let collector2 = await queryResult.collect();
    return collector1.concat(collector2);
}

/**
 * Run some queries to delete a thing and all the features and attributes related to it
 * @param thingId id of the things to delete
 * @param transaction transaction in which the queries are executed
 * @returns {Promise<void>} a Promise that resolves to true if the cache entry is deleted, or false otherwise
 */
async function deleteThingQueryRun(thingId, transaction) {
    await transaction.query.delete(queryConstructor.deleteFeaturesQuery(thingId, undefined));
    await transaction.query.delete(queryConstructor.deleteAttributesQuery(thingId, undefined));
    await transaction.query.delete(queryConstructor.deleteThingLastQuery(thingId));
}

/**
 * Run a query to delete some attributes of a thing
 * @param thingId id of the thing
 * @param attributes attributes to delete
 * @param transaction transaction in which the query is executed
 * @returns {Promise<void>} a Promise that resolves to true if the cache entry is deleted, or false otherwise
 */
async function deleteThingAttributesQueryRun(thingId, attributes, transaction) {
    await transaction.query.delete(queryConstructor.deleteAttributesQuery(thingId, attributes));
}

/**
 * Run a query to delete some features of a thing
 * @param thingId id of the thing
 * @param features features to delete
 * @param transaction transaction in which the query is executed
 * @returns {Promise<void>} a Promise that resolves to true if the cache entry is deleted, or false otherwise
 */
async function deleteThingFeaturesQueryRun(thingId, features, transaction) {
    await transaction.query.delete(queryConstructor.deleteFeaturesQuery(thingId, features));
}

/**
 * Run a query to delete a specified feature by the id
 * @param featureId id of the feature to delete
 * @param transaction transaction in which the query is executed
 * @returns {Promise<void>} a Promise that resolves to true if the cache entry is deleted, or false otherwise
 */
async function deleteFeatureByIdQueryRun(featureId, transaction) {
    await transaction.query.delete(queryConstructor.deleteFeatureById(featureId));
}

/**
 * Run a query to insert some attributes of a thing
 * @param thingId id of the thing
 * @param attributes attributes to add
 * @param transaction transaction in which the query is executed
 */
async function addThingAttributesQueryRun(thingId, attributes, transaction) {
    await transaction.query.insert(queryConstructor.addAttributesQuery(thingId, attributes));
}

/**
 * Run a query to insert a new thing with some attributes
 * @param thingId id of the thing to add
 * @param attributes attributes to add
 * @param transaction transaction in which the query is executed
 */
async function newThingQueryRun(thingId, attributes, transaction) {
    await transaction.query.insert(queryConstructor.newThingQuery(thingId, attributes));
}

/**
 * Run a query to insert some features of a thing
 * @param thingId id of the thing
 * @param features features to add
 * @param transaction transaction in which the query is executed
 */
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