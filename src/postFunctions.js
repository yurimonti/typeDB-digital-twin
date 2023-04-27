//yuri
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

function insertFeatures(thingId,features){
    let insertRelations = ["insert"];
    let matchRelated = ["match "];
    matchRelated.push(" $"+thingId+" isa entity, has thingId '"+thingId+"';");
    const rels = features ? getRelationsQuery(features) : [];
    rels.length > 0 && rels.forEach(obj => {
        let toPushBefore = " $" + obj.id2 + " isa entity, has thingId '" + obj.id2 + "';";
        !matchRelated.includes(toPushBefore) &&
            matchRelated.push(" $" + obj.id2 + " isa entity, has thingId '" + obj.id2 + "';");
        insertRelations.push(" $" + obj.relId + "(" + obj.role1 + ":$" + obj.id1 + "," + obj.role2 + ":$" + obj.id2 + ") isa " + obj.rel + "; $" + obj.relId + " has relationId '" + obj.relId + "';");
    });
    return matchRelated.join("").concat(insertRelations.join(""));
}

async function addToAThing(thingId, attributes, features) {
    console.log('entrato nell add');
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    let attributeQuery = attributes && insertAttributeForAThingQuery(thingId, attributes);
    console.log(attributeQuery);
    //const { pre, post } = createQueryToPut(features);
    let featureQuery = features && insertFeatures(thingId,features);
    console.log(featureQuery);
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
//greta
const connection = require("./clientConfig.js");


/**
 * Method to add a new thing to the database.
 *
 * @param thingId id of the thing
 * @param body body of the request with attributes and features
 * @returns {Promise<Stream<ConceptMap>>} a {@link Promise} that represents the result of the insertion of a new thing
 */
async function addThing(thingId, body) {
    const conn = await connection.openConnection(false, true);

    let query;
    let attributes = "";
    if (body.attributes !== undefined) {
        query = addAttributes(attributes, body, thingId);
    } else {
        query = "insert $x isa digital-twin; $x has thingId '" + thingId + "';";
    }

    let answer = await conn.transactionRef.query.insert(query);
    if (body.features !== undefined) {
        query = addFeatures(body, thingId);
        console.log(query);

        answer = await conn.transactionRef.query.insert(query);
    }

    await connection.closeConnection(conn)
    return answer;
}

/**
 * Method to add attributes to a new thing.
 *
 * @param attributes attributes to insert
 * @param body body of the request containing the attributes
 * @param thingId id of the new thing
 * @returns {string} the query to insert a new thing with attributes
 */
function addAttributes(attributes, body, thingId) {
    let category = "";
    const map = Object.entries(body.attributes);

    map.forEach(attribute => {
        if (typeof attribute[1] === 'string' && isNaN(Date.parse(attribute[1].toString())))
            attributes = attributes.concat("; $x has " + attribute[0] + " '" + attribute[1] + "'")
        else
            attributes = attributes.concat("; $x has " + attribute[0] + " " + attribute[1]);
        if (attribute[0] === "category")
            category = attribute[1];
    });
    attributes = attributes.concat(";");
    return "insert $x isa " + category + "; $x has thingId '" + thingId + "'" + attributes;
}

/**
 * Method to add new feature of a thing.
 *
 * @param body body of the request
 * @param id1 id of the thing 
 * @returns {string} query to add a relation
 */
function addFeatures(body, id1) {
    let id2, role1, role2, rel, relId;
    const map = Object.entries(body.features);
    let match = "match " +
        " $x isa entity, has thingId '" + id1 + "';" ;
    let insert = "insert ";

    map.forEach(feature => {
        rel = feature[0];
        Object.entries(feature[1]).forEach(relation => {
            relId = relation[0];
            let first = Object.entries(relation[1])[0];
            role1 = first[0];
            id1 = first[1];
            let second = Object.entries(relation[1])[1];
            role2 = second[0];
            id2 = second[1];
            match += " $" + id2 + " isa entity, has thingId '" + id2 + "';"
            insert += "$" + relId + " (" + role1 + ": $x, " + role2 + ": $" + id2 + ") isa " + rel + "; $" + relId + " has relationId '" + relId + "';"
        })
    });
    return match += insert;
}


module.exports = {
    addThing,
};
//main
