const clientFunction = require('./clientFunction.js');
const { getRelationsQuery, getAttributesQuery, insertAttributeForAThingQuery, getMatchQueryForAThing } = require('./queryUtils');

//*create the match part and relations insert part of the query
const createQueryToPut = (features) => {
    const featuresAreEmpty = !features || Object.keys(features).length <= 0;
    let matchRelated = !featuresAreEmpty ? ["match"] : [];
    let insertRelations = [];
    const rels = features ? getRelationsQuery(features) : [];
    rels.length > 0 && rels.forEach(obj => {
        let toPushBefore = " $" + obj.id2 + " isa entity, has thingId '" + obj.id2 + "';";
        !matchRelated.includes(toPushBefore) &&
            matchRelated.push(" $" + obj.id2 + " isa entity, has thingId '" + obj.id2 + "';");
        insertRelations.push(" $" + obj.relId + "(" + obj.role1 + ":$" + obj.id1 + "," + obj.role2 + ":$" + obj.id2 + ") isa " + obj.rel + "; $" + obj.relId + " has relationId '" + obj.relId + "';");
    });
    return { pre: matchRelated, post: insertRelations };
}

/**
 * create a Thing if the parameters are right
 * @param {object} toCreate 
 */
async function createThing(toCreate) {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    const { thingId, attributes, features } = toCreate;
    if (!attributes || !features) throw "Payload with unknown content!";
    let attributeQuery = getAttributesQuery(attributes);
    const { pre, post } = createQueryToPut(features);
    let query = [
        pre.join(""),
        " insert",
        " $" + thingId + " isa " + attributes.category + ", has thingId '" + thingId + "'" + attributeQuery,
        post.join("")
    ];
    writeTransaction.query.insert(query.join(""));
    await writeTransaction.commit();
    await clientFunction.closeSession(session);
    await clientFunction.closeClient(client);
}

async function addToAThing(thingId, attributes, features) {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    let attributeQuery = insertAttributeForAThingQuery(thingId, attributes);
    console.log(attributeQuery);
    const { pre, post } = createQueryToPut(features);
    let featureQuery = pre.join("") + " insert " + getMatchQueryForAThing(thingId) + post.join("");
    try {
        attributes && await writeTransaction.query.insert(attributeQuery);
        features && await writeTransaction.query.insert(featureQuery);
    } catch (error) {
        console.log(error);
        await writeTransaction.rollback();
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }

}

/* async function createNewThing(thingId, attributes, features) {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    let attributeQuery = getAttributeQuery(attributes);
    let category = 'digital-twin';
    if (attributes.category !== undefined) category = attributes.category;
    let query;
    if (features) {
        const { pre, post } = createQueryToPut(features);
        query = [
            pre.join(""),
            " insert",
            " $" + thingId + " isa " + category + ", has thingId '" + thingId + "'" + attributeQuery,
            post.join("")
        ];
    } else query = [
        "insert",
        " $" + thingId + " isa " + category + ", has thingId '" + thingId + "'" + attributeQuery
    ];
    const realQuery = query.join("");
    writeTransaction.query.insert(realQuery);
    await clientFunction.closeTransaction(writeTransaction);
    await clientFunction.closeSession(session);
    await clientFunction.closeClient(client);
} */

module.exports = {
    createThing, addToAThing
}