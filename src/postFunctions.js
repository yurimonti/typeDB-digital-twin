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
        query = addFeatures(body);
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
 * @returns {string} query to add a relation
 */
 function addFeatures(body) {
    let id1, id2, role1, role2, rel, relId;
    const map = Object.entries(body.features);

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
        })
    });
    return "match\n" +
        " $x isa entity, has thingId '" + id1 + "';" +
        " $y isa entity, has thingId '" + id2 + "';" +
        "insert $new-relation (" + role1 + ": $x, " + role2 + ": $y) isa " + rel + "; $new-relation has relationId '" + relId + "';";
}


module.exports = {
    addThing,
};