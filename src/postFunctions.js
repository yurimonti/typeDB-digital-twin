const {TypeDB, SessionType, TransactionType} = require("typedb-client");
// const {
//     createJsonAllThing,
//     createJsonAllRelation,
// } = require("./jsonEntityConstructor.js");
const database = "API_ASSET#TYPEDB"; //inserire nome database


async function addThing(thingId, body) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const postTransaction = await session.transaction(TransactionType.WRITE);
    let query;
    let attributes = "";
    if (body.attributes !== undefined) {
        query = addAttributes(attributes, body, thingId);
    } else {
        query = "insert $x isa digital-twin; $x has thingId '" + thingId + "';";
    }
    let answer = await postTransaction.query.insert(query);
    if (body.features !== undefined) {
        query = addFeatures(body);
        answer = await postTransaction.query.insert(query);
    }
    await postTransaction.commit();
    await session.close();
    await client.close();
    return answer;
}

 function addAttributes(attributes, body, thingId) {
    const map = Object.entries(body.attributes);
    let category = "";
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

 function addFeatures(body) {
    const map = Object.entries(body.features);
    let id1, id2, role1, role2, rel, relId;
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