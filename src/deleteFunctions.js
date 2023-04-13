const { TypeDB, SessionType, TransactionType } = require("typedb-client");
const { isADate, getRelationsQuery, getMatchQueryForAThing } = require('./queryUtils');
const clientFunction = require('./clientFunction');
const queryUtils = require('./queryUtils');
// const {
//     createJsonAllThing,
//     createJsonAllRelation,
// } = require("./jsonEntityConstructor.js");

const database = "API_ASSET#TYPEDB"; //inserire nome database


async function deleteThing(thingId) {
    const client = await clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const delTransaction = await clientFunction.openTransaction(session, true);
    try {
        await delTransaction.query.delete(queryUtils.getDeleteThingQuery(thingId));
    } catch (error) {
        await delTransaction.rollback();
        console.log(error);
    } finally {
        await delTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}

async function deleteRelation(relationId) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const delTransaction = await session.transaction(TransactionType.WRITE);
    let answer = await delTransaction.query.delete("match $p isa relation, has relationId '" + relationId + "'; delete $p isa relation;");
    await delTransaction.commit();
    await session.close();
    await client.close();
    return answer;
}

async function deleteThingAttribute(thingId, attributeName) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const delTransaction = await session.transaction(TransactionType.WRITE);
    let answer = await delTransaction.query.delete("match $p isa entity, has thingId '" + thingId + "'; $a isa " + attributeName + "; $p has $a; delete $a isa attribute;");
    await delTransaction.commit();
    await session.close();
    await client.close();
    return answer;
}

async function deleteMultipleThings(reqQuery) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const delTransaction = await session.transaction(TransactionType.WRITE);
    let answer = undefined;
    if (JSON.stringify(reqQuery) === "{}") {
        throw 'Bad request, insert one or more parameters.';
    } else {
        const obj = new Object(reqQuery);
        const map = new Map(Object.entries(obj));

        for (let key of map.keys()) {
            let value = map.get(key);
            if (Array.isArray(map.get(key))) {
                if (key === 'thingId') {
                    for (let i = 0; i < value.length; i++) {
                        let attr = value[i];
                        answer = await delTransaction.query.delete("match $p isa entity, has " + key + "'" + attr + "'; delete $p isa entity;");
                    }
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            } else {
                if (key === 'thingId') {
                    answer = await delTransaction.query.delete("match $p isa entity, has " + key + "'" + value + "'; delete $p isa entity;");
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            }
        }
    }

    await delTransaction.commit();
    await session.close();
    await client.close();
    return answer;
}

async function deleteMultipleThingsAttributes(reqQuery) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const delTransaction = await session.transaction(TransactionType.WRITE);
    let answer = undefined;
    if (JSON.stringify(reqQuery) === "{}") {
        throw 'Bad request, insert one or more parameters.';
    } else {
        const obj = new Object(reqQuery);
        const map = new Map(Object.entries(obj));

        for (let key of map.keys()) {
            let value = map.get(key);
            if (Array.isArray(map.get(key))) {
                if (key === 'thingId') {
                    for (let i = 0; i < value.length; i++) {
                        let attr = value[i];
                        answer = await delTransaction.query.delete("match $p isa entity, has " + key + "'" + attr + "', has attribute $a; delete $a isa attribute;");
                    }
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            } else {
                if (key === 'thingId') {
                    answer = await delTransaction.query.delete("match $p isa entity, has " + key + "'" + value + "', has attribute $a; delete $a isa attribute;");
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            }
        }
    }

    await delTransaction.commit();
    await session.close();
    await client.close();
    return answer;
}


async function deleteMultipleRelations(reqQuery) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const delTransaction = await session.transaction(TransactionType.WRITE);
    let answer = undefined;
    if (JSON.stringify(reqQuery) === "{}") {
        throw 'Bad request, insert one or more parameters.';
    } else {
        const obj = new Object(reqQuery);
        const map = new Map(Object.entries(obj));

        for (let key of map.keys()) {
            let value = map.get(key);
            if (Array.isArray(map.get(key))) {
                if (key === 'relationId') {
                    for (let i = 0; i < value.length; i++) {
                        let attr = value[i];
                        answer = await delTransaction.query.delete("match $p isa relation, has " + key + "'" + attr + "'; delete $p isa relation;");
                    }
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            } else {
                if (key === 'relationId') {
                    answer = await delTransaction.query.delete("match $p isa relation, has " + key + "'" + value + "'; delete $p isa relation;");
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            }
        }
    }
    await delTransaction.commit();
    await session.close();
    await client.close();
    return answer;
}

async function deleteAttributes(thingId,attributes) {
    const query = queryUtils.deleteAttributeQuery(thingId,attributes);
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    try {
        await writeTransaction.query.delete(query);
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}

async function deleteFeatures(thingId) {
    const query = queryUtils.deleteFeaturesQuery(thingId);
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    try {
        await writeTransaction.query.delete(query);
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}

async function deleteAnAttribute(thingId,attribute){
    const query = queryUtils.deleteFeaturesQuery(thingId);
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    try {
        await writeTransaction.query.delete(query);
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}


module.exports = {
    deleteThing,
    deleteRelation,
    deleteThingAttribute,
    deleteMultipleThings,
    deleteMultipleThingsAttributes,
    deleteMultipleRelations,
    deleteAttributes,
    deleteFeatures
};