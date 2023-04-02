const { TypeDB, SessionType, TransactionType } = require("typedb-client");
const {
    createJsonAllRelation,
    newAttribute,
} = require("./jsonEntityConstructor.js");

const clientFunction = require('./clientFunction.js');

const database = "prova"; //inserire nome database
const EmptyThing = {
    thingId: '',
    attributes: {},
    features: {}
}

/**
 * 
 * @returns {string[]} all thingIds that are present
 */
const getAllThingId = async () => {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const readTransaction = await clientFunction.openTransaction(session);
    const streamResult = await clientFunction.matchQuery(readTransaction, "match $x isa thingId;get $x;");
    const collection = await streamResult.collect();
    return collection.map(c => c.get('x').asAttribute().value);
}

/**
 * checks if a thingId there is already present or not
 * @param {string} thingId 
 * @returns {boolean} if id is present or not
 */
const thingIdIsPresent = async (thingId) => {
    const thingIds = await getAllThingId();
    return thingIds.includes(thingId);
}

//todo: da vedere
const updateAttributesString = (thingId, attributes, features) => {
    let toMatch = ["match $" + thingId + " isa entity, has thingId '" + thingId + "'"];
    let toDelete = ["delete"];
    let toInsert = ["insert"];
    Object.entries(attributes).forEach(entry => {
        let key = entry[0];
        let value = entry[1];
        toMatch.push(", has " + key + " $" + key);
        toDelete.push(" $" + thingId + " has $" + key + ";");
        if (isADate(value)) toInsert.push(" $" + thingId + " has " + key + " " + value.slice(0, value.length - 1) +";");
        else typeof value !== 'string' ? toInsert.push(" $" + thingId + " has " + key + " " + value +";") : toInsert.push(" $" + thingId + " has " + key + " '" + value + "'" + ";");
    })
    toMatch.push(' ;');
    if (features) {
        const relations = getRelationsQuery(features);
        relations.forEach(obj => {
            let toPushBefore = " $" + obj.id2 + " isa entity, has thingId '" + obj.id2 + "';";
            !toMatch.includes(toPushBefore) &&
                toMatch.push(toPushBefore);
            toMatch.push(" $" + obj.relId + "(" + obj.role1 + ":$" + obj.id1 + "," + obj.role2 + ":$" + obj.id2 + ") isa " + obj.rel + "; $" + obj.relId + " has relationId '" + obj.relId + "';");
        });
    }
    return { toMatch: toMatch, toDelete: toDelete, toInsert: toInsert };
}
//todo: da implementare
const updateAttributesOfAThing = async (thingId, attributes) => {
    const { toMatch, toDelete, toInsert } = updateAttributesString(thingId, attributes);
    const query = toMatch.join("")+toDelete.join("")+toInsert.join("");
    console.log(query);
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const writeTransaction = await session.transaction(TransactionType.WRITE);
    console.log(writeTransaction.type === TransactionType.WRITE);
    try {
        writeTransaction.query.update(query);
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}

const isADate = (value) => {
    if (value.length === 24 && value.charAt(10) === 'T' && value.charAt(23) === 'Z') return true;
    else return false;
}

//* get string of attributes of a thing
const getAttributeQuery = (attributes) => {
    let result = "";
    let aKeys = Object.entries(attributes);
    aKeys.forEach(entry => {
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
    relationKeys.forEach(innerRelation => {
        const relation = innerRelation[0];
        const idKeys = Object.entries(innerRelation[1]);
        idKeys.forEach(innerId => {
            const relId = innerId[0];
            const innerRole = Object.entries(innerId[1]);
            arrayRel.push({
                rel: relation, relId: relId, role1: innerRole[0][0], role2: innerRole[1][0], id1: innerRole[0][1], id2: innerRole[1][1]
            });
            /* innerRole.forEach(role => {
                relResult = relResult.concat(role[0] + ":" + role[1])

            }) */
        })
    })
    /* console.log(arrayRel);
    arrayRel.forEach( obj => {
        "match $"+obj.id2+" isa entity, has thingId '"+obj.id2+"'; "
    })
    result = result.concat(''); */
    return arrayRel;
}
//*create the match part and relations insert part of the query
const createQueryToPut = (features) => {
    let matchRelated = ["match"];
    let insertRelations = [];
    const rels = getRelationsQuery(features);
    rels.forEach(obj => {
        let toPushBefore = " $" + obj.id2 + " isa entity, has thingId '" + obj.id2 + "';";
        !matchRelated.includes(toPushBefore) &&
            matchRelated.push(" $" + obj.id2 + " isa entity, has thingId '" + obj.id2 + "';");
        insertRelations.push(" $" + obj.relId + "(" + obj.role1 + ":$" + obj.id1 + "," + obj.role2 + ":$" + obj.id2 + ") isa " + obj.rel + "; $" + obj.relId + " has relationId '" + obj.relId + "';");
    });
    return { pre: matchRelated, post: insertRelations };
}

async function createNewThing(thingId, attributes, features) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const writeTransaction = await session.transaction(TransactionType.WRITE);
    let attributeQuery = getAttributeQuery(attributes);
    let category = 'digital-twin';
    if (attributes.category !== undefined) category = attributes.category;
    const { pre, post } = createQueryToPut(features);
    //* creating query...
    const query = [
        pre.join(""),
        "insert",
        " $" + thingId + " isa " + category + ", has thingId '" + thingId + "'" + attributeQuery,
        post.join("")
    ];
    const realQuery = query.join("");
    writeTransaction.query.insert(realQuery);
    await writeTransaction.commit();
    await session.close();
    await client.close();
}

/**
 * create an Object from an Array
 * @param {any[]} attributesArray 
 * @returns {}
 */
const arrayToObject = (attributesArray) => {
    let attributeObj = {};
    attributesArray.forEach(element => Object.assign(attributeObj, element))
    return attributeObj;
}


const prova1 = async (thingId) => {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const readTransaction = await session.transaction(TransactionType.READ);
    let thing = EmptyThing;
    let answerStream = readTransaction.query
        .match("match $x isa entity, has thingId '" + thingId + "', has attribute $a;get $a;");
    let response = await answerStream.collect();
    let myAttributes = response.map(r => r.get('a').asAttribute()).map(a => newAttribute(a));
    let attributes = arrayToObject(myAttributes);
    delete attributes.thingId;
    let result = {
        thingId: myAttributes.find(element => Object.keys(element).includes('thingId'))['thingId'],
        attributes: attributes
    }
    await readTransaction.close();
    await session.close();
    await client.close();
    return result;
}

const createThingObject = (attributes, features) => {
    let thing = EmptyThing;
    thing.thingId = attributes.thingId;
    delete attributes.thingId;
    thing.attributes = attributes;
    //TODO:aggiungere features
    thing.features = arrayToObject(features);
    return thing;
}

async function getRelations() {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const readTransaction = await session.transaction(TransactionType.READ);
    let answerStream = readTransaction.query.match(
        "match $x isa relation;get $x;"
    );
    const relationConcept = await answerStream.collect();
    let relations = relationConcept.map((t) => t.get("x").asRelation());
    let relationsArray = [];
    for await (const relation of relations) {
        const relToAdd = await createJsonAllRelation(readTransaction, relation);
        relationsArray.push(relToAdd);
    }
    await readTransaction.close();
    await session.close();
    await client.close();
    return relationsArray;
}

async function openSession(sessionType) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, sessionType);
    // session is open
    return { client: client, session: session };
}

async function createTransaction(session, transactionType) {
    const transaction = await session.transaction(transactionType);
    return transaction;
}

async function closeTransaction(transaction) {
    if (transaction.isOpen) {
        if (transaction.type === "READ") transaction.close();
        else transaction.commit();
    }
}

async function closeSession(client, session) {
    await session.close();
    client.close();
}

module.exports = {
    openSession,
    closeSession,
    closeTransaction,
    createTransaction,
    getRelations,
    createNewThing,
    //TODO: prova
    getAllThingId,
    updateAttributesOfAThing,
};