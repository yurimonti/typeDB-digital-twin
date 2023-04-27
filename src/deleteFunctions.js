//yuri
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
    console.log('entrato elimina tutto');
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
//greta
    const connection = require("./clientConfig.js");


    /**
     * Method to delete a specific thing.
     *
     * @param thingId id of the thing to be removed
     * @returns {Promise<void>}  a {@link Promise} representing the deletion of a thing
     */
    async function deleteThing(thingId) {
        return await deleteSingleData("match $p isa entity, has thingId '" + thingId + "'; delete $p isa entity;");
    }

    /**
     * Delete a specific relation.
     *
     * @param relationId id of the relation to be removed
     * @returns {Promise<void>} a {@link Promise} representing the deletion of a relation
     */
    async function deleteRelation(relationId) {
        return await deleteSingleData("match $p isa relation, has relationId '" + relationId + "'; delete $p isa relation;");
    }

    /**
     * Delete an attribute of a specific thing.
     *
     * @param thingId id of the thing that owns the attribute
     * @param attributeName attribute's name to be removed
     * @returns {Promise<void>} a {@link Promise} representing the deletion of an attribute of a specific thing
     */
    async function deleteThingAttribute(thingId, attributeName) {
        if (attributeName === 'thingId') {
            throw new Error("Wrong attribute name. Can't delete thingId.");
        }
        return await deleteSingleData("match $p isa entity, has thingId '" + thingId + "'; $a isa " + attributeName + "; $p has $a; delete $a isa attribute;");
    }

    /**
     * Deletes a single data (that can be thing, an attribute or a relation).
     *
     * @param query query to be performed
     * @returns {Promise<*>} a {@link Promise} that represents the completion of the deletion query
     */
    async function deleteSingleData(query) {
        const conn = await connection.openConnection(false, true);
        let answer = await conn.transactionRef.query.delete(query);
        await connection.closeConnection(conn);
        return answer;
    }


    /**
     * Delete multiple things one after another.
     *
     * @param reqQuery query in the request containing the id of the things to remove
     * @returns {Promise<undefined>} a {@link Promise} representing the deletion of multiple things
     */
    async function deleteMultipleThings(reqQuery) {
        const client = clientFunction.openClient();
        const session = await clientFunction.openSession(client);
        const wTransaction = await clientFunction.openTransaction(session, true);
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

                             answer = await wTransaction.query.delete("match $p isa entity, has " + key + "'" + attr + "'; delete $p isa entity;");
                        }
                    } else {
                        throw 'Bad request, one or more parameters not valid.';
                    }
                } else {
                    if (key === 'thingId') {

                         answer = await wTransaction.query.delete("match $p isa entity, has " + key + "'" + value + "'; delete $p isa entity;");
                    } else {
                        throw 'Bad request, one or more parameters not valid.';
                    }
                }
            }
        }
        await clientFunction.closeTransaction(wTransaction);
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
        return answer;
    }

    async function deleteMultipleThingsAttributes(reqQuery) {
        const client = TypeDB.coreClient("localhost:1729");
        const session = await client.session(database, SessionType.DATA);
        const delTransaction = await session.transaction(TransactionType.WRITE);
//gre
        await connection.closeConnection(conn);
        return answer;
    }

    /**
     * Delete all attributes of the specified things, except for the thingId.
     *
     * @param reqQuery query in the request with the id of the thing whose attributes are to be removed
     * @returns {Promise<undefined>} a {@link Promise} representing the deletion of all the attributes of the specified things
     */
    async function deleteMultipleThingsAttributes(reqQuery) {
        const conn = await connection.openConnection(false, true);

//main
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
//yuri
                            answer = await delTransaction.query.delete("match $p isa entity, has " + key + "'" + attr + "', has attribute $a; delete $a isa attribute;");
//gre
                            //     answer = await conn.transactionRef.query.delete("match $p isa entity, has " + key + "'" + attr + "', has attribute $a; not {$a isa thingId;}; delete $a isa attribute;");

                        }
                    } else {
                        throw 'Bad request, one or more parameters not valid.';
                    }
                } else {
                    if (key === 'thingId') {
// yuri
                        answer = await delTransaction.query.delete("match $p isa entity, has " + key + "'" + value + "', has attribute $a; delete $a isa attribute;");
//gre
                        //  answer = await conn.transactionRef.query.delete("match $p isa entity, has " + key + "'" + value + "', has attribute $a; not {$a isa thingId;}; delete $a isa attribute;");

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

        await connection.closeConnection(conn);
        return answer;
    }

    /**
     * Delete multiple relations one after another.
     *
     * @param reqQuery query in the request with the specified id of the relations to remove
     * @returns {Promise<undefined>} a {@link Promise} representing the deletion of multiple relations
     */
    async function deleteMultipleRelations(reqQuery) {
        const conn = await connection.openConnection(false, true);
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

    async function deleteAttributes(thingId, attributes) {
        console.log('entrato elimina attributi');
        const query = queryUtils.deleteAttributeQuery(thingId, attributes);
        console.log(query);
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

    async function deleteFeatures(thingId, features) {
        console.log('entrato elimina feature');
        const query = queryUtils.deleteFeaturesQuery(thingId, features);
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

    async function deleteAnAttribute(thingId, attribute) {
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
//gre

        await connection.closeConnection(conn);
        return answer;
//
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
}