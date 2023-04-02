const clientFunction = require('./clientFunction.js');

const isADate = (value) => {
    if (value.length === 24 && value.charAt(10) === 'T' && value.charAt(23) === 'Z') return true;
    else return false;
}

//* get string of attributes of a thing
const getAttributeQuery = (attributes) => {
    let result = "";
    let aKeys = Object.entries(attributes);
    aKeys.length > 0 && aKeys.forEach(entry => {
        let value = entry[1];
        if (isADate(value)) result = result.concat(", has " + entry[0] + " " + value.slice(0, value.length - 1));
        else typeof value !== 'string' ? result = result.concat(", has " + entry[0] + " " + value) : result = result.concat(", has " + entry[0] + " '" + value + "'");
    });
    result = result.concat(";");
    return result;
}

//* get values regarded on each relations in a request body;
const getRelationsQuery = (features) => {
    //let result = "";
    let arrayRel = [];
    let relationKeys = Object.entries(features);
    Object.keys(features).length > 0 && relationKeys.forEach(innerRelation => {
        const relation = innerRelation[0];
        const idKeys = Object.entries(innerRelation[1]);
        idKeys.forEach(innerId => {
            const relId = innerId[0];
            const innerRole = Object.entries(innerId[1]);
            arrayRel.push({
                rel: relation, relId: relId, role1: innerRole[0][0], role2: innerRole[1][0], id1: innerRole[0][1], id2: innerRole[1][1]
            });
        })
    })
    return arrayRel;
}

//*create the match part and relations insert part of the query
const createQueryToPut = (features) => {
    let matchRelated = ["match"];
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

async function createThing(toCreate) {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    const {thingId,attributes,features} = toCreate;
    let attributeQuery = getAttributeQuery(attributes);
    const { pre, post } = createQueryToPut(features);
    let query = [
        pre.join(""),
        " insert",
        " $" + thingId + " isa " + attributes.category + ", has thingId '" + thingId + "'" + attributeQuery,
        post.join("")
    ];
    writeTransaction.query.insert(query.join(""));
    await clientFunction.closeTransaction(writeTransaction);
    await clientFunction.closeSession(session);
    await clientFunction.closeClient(client);
}

async function createNewThing(thingId, attributes, features) {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    let attributeQuery = getAttributeQuery(attributes);
    let category = 'digital-twin';
    if (attributes.category !== undefined) category = attributes.category;
    let query;
    if (features) {
        const { pre, post } = createQueryToPut(features);
        //* creating query...
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
}

module.exports = {
    createNewThing,
    createThing
}