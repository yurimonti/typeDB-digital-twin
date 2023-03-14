const {
    createJsonAllThing,
    createJsonAllRelation,
} = require("./jsonEntityConstructor.js");
const connection = require("./clientConfig.js");



/**
 * Gets all things
 *
 * @returns {Promise<*[]>} a Promise that represents all the things contained in a typedb server
 */
async function getThings() {

    const conn = await connection.openConnection(false, false);

    // Stream<ConceptMap>
    let answerStream = conn.transactionRef.query.match("match $x isa entity;get $x;");
    // ConceptMap[]
    const thingsConcepts = await answerStream.collect();
    // Entity[]
    let things = thingsConcepts.map((t) => t.get("x").asEntity());

    let thingsArray = [];
    for await (const thing of things) {
        const thingToAdd = await createJsonAllThing(conn.transactionRef, thing);
        thingsArray.push(thingToAdd);
    }
    /* 	const boh = await result.asRemote(readTransaction).getHas(true).collect();
      const attributes = boh.map(a => a.asAttribute()).map(a => { return { [a.type._label._name]: a.value } }); */

    /* const result = things.map(p => new JsonEntityConstructor(p.get('x'), p.get('a'))
          .createJson()); */

    /* 	const label = things.map(a => a.get("label").asAttribute()).map(a => { return { type: a.type._label._name, value: a.value } });//.map(v => v.iid);
          const id = things.map(a => a.get("thingId").asAttribute())//.map(v => v.iid);
          const dt = things.map(a => a.get('x')); */
    /* 	const result = {
              entities: dt,
              labels: label,
              ids: id
          }; */

    await connection.closeConnection(conn);
    return thingsArray;
}

/**
 * Gets all relations and roles
 *
 * @returns {Promise<*[]>} a Promise that represents all the relations and roles contained in a typedb server
 */
async function getRelations() {

    const conn = await connection.openConnection(false, false);

    let answerStream = conn.transactionRef.query.match("match $x isa relation;get $x;");
    const relationConcept = await answerStream.collect();
    let relations = relationConcept.map((t) => t.get("x").asRelation());

    let relationsArray = [];
    for await (const relation of relations) {
        const relToAdd = await createJsonAllRelation(conn.transactionRef, relation);
        relationsArray.push(relToAdd);
    }

    await connection.closeConnection(conn);
    return relationsArray;
}

module.exports = {
    getThings,
    getRelations,
};