const connection = require("./clientConfig.js");

/**
 * Method to delete a specific thing
 * @param thingId id of the thing to remove
 * @returns {Promise<void>}
 */
async function deleteThing(thingId) {
    const conn = await connection.openConnection(false, true);
    let answer = await conn.transactionRef.query.delete("match $p isa entity, has thingId '" + thingId + "'; delete $p isa entity;");
    await connection.closeConnection(conn);
    return answer;
}

/**
 * Delete a specific relation
 * @param relationId id of the relation to remove
 * @returns {Promise<void>}
 */
async function deleteRelation(relationId) {
    const conn = await connection.openConnection(false, true);
    let answer = await conn.transactionRef.query.delete("match $p isa relation, has relationId '" + relationId + "'; delete $p isa relation;");
    await connection.closeConnection(conn);
    return answer;
}

/**
 * Delete an attribute of a specific thing
 * @param thingId id of the thing
 * @param attributeName attribute to remove
 * @returns {Promise<void>}
 */
async function deleteThingAttribute(thingId, attributeName) {
    const conn = await connection.openConnection(false, true);
    let answer = await conn.transactionRef.query.delete("match $p isa entity, has thingId '" + thingId + "'; $a isa " + attributeName + "; $p has $a; delete $a isa attribute;");
    await connection.closeConnection(conn);
    return answer;
}

/**
 * Delete multiple things together
 * @param reqQuery query in the request containing the id of the things to remove
 * @returns {Promise<undefined>}
 */
async function deleteMultipleThings(reqQuery) {
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
                if (key === 'thingId') {
                    for (let i = 0; i < value.length; i++) {
                        let attr = value[i];
                        answer = await conn.transactionRef.query.delete("match $p isa entity, has " + key + "'" + attr + "'; delete $p isa entity;");
                    }
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            } else {
                if (key === 'thingId') {
                    answer = await conn.transactionRef.query.delete("match $p isa entity, has " + key + "'" + value + "'; delete $p isa entity;");
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            }
        }
    }

    await connection.closeConnection(conn);
    return answer;
}

/**
 * Delete all attributes of the specified things
 * @param reqQuery query in the request with the id of the thing whose attributes are to be removed
 * @returns {Promise<undefined>}
 */
async function deleteMultipleThingsAttributes(reqQuery) {
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
                if (key === 'thingId') {
                    for (let i = 0; i < value.length; i++) {
                        let attr = value[i];
                        answer = await conn.transactionRef.query.delete("match $p isa entity, has " + key + "'" + attr + "', has attribute $a; delete $a isa attribute;");
                    }
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            } else {
                if (key === 'thingId') {
                    answer = await conn.transactionRef.query.delete("match $p isa entity, has " + key + "'" + value + "', has attribute $a; delete $a isa attribute;");
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            }
        }
    }

    await connection.closeConnection(conn);
    return answer;
}

/**
 * Delete multiple relations together
 * @param reqQuery query in the request with the specified id of the relations to remove
 * @returns {Promise<undefined>}
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
                        answer = await conn.transactionRef.query.delete("match $p isa relation, has " + key + "'" + attr + "'; delete $p isa relation;");
                    }
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            } else {
                if (key === 'relationId') {
                    answer = await conn.transactionRef.query.delete("match $p isa relation, has " + key + "'" + value + "'; delete $p isa relation;");
                } else {
                    throw 'Bad request, one or more parameters not valid.';
                }
            }
        }
    }
    await connection.closeConnection(conn);
    return answer;
}


module.exports = {
    deleteThing,
    deleteRelation,
    deleteThingAttribute,
    deleteMultipleThings,
    deleteMultipleThingsAttributes,
    deleteMultipleRelations,
};