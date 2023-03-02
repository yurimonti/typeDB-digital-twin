


const {TypeDB, SessionType, TransactionType} = require("typedb-client");
const {
    createJsonAllThing,
    createJsonAllRelation,
} = require("./jsonEntityConstructor.js");

const database = "API_ASSET#TYPEDB"; //inserire nome database

/**
 * Gets all things
 * @returns {Promise<*[]>}
 */
async function getThings() {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const readTransaction = await session.transaction(TransactionType.READ);
    // Stream<ConceptMap>
    let answerStream = readTransaction.query.match(
        "match $x isa entity;get $x;"
    );
    // ConceptMap[]
    const thingsConcepts = await answerStream.collect();
    // Entity[]
    let things = thingsConcepts.map((t) => t.get("x").asEntity());
    let thingsArray = [];
    for await (const thing of things) {
        const thingToAdd = await createJsonAllThing(readTransaction, thing);
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
    await readTransaction.close();
    await session.close();
    await client.close();
    return thingsArray;
}

/**
 * Gets all relations and roles
 * @returns {Promise<*[]>}
 */
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



/* async function openSession (database) {
	const client = TypeDB.coreClient("localhost:1729");
	const session = await client.session(database, SessionType.DATA);
	// session is open
	await session.close();
	//session is closed
	client.close();
}; */

//TODO: cancellare
async function runBasicQueries() {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    /* const query = 'insert $p isa person, has key "mario_rossi", has label "Mario Rossi";$d isa department, has key "polob_lodovici_a", has label "Polo A Lodovici";$reference(department-director:$p , directed:$d) isa reference;';
      // Insert a person using a WRITE transaction
      const writeTransaction = await session.transaction(TransactionType.WRITE);
      const insertStream = writeTransaction.query.insert(query);
      const conceptMaps = await insertStream.collect();
      console.log("Inserted a person with ID: " + conceptMaps[0].get("p").iid);
      // to persist changes, a write transaction must always be committed (closed)
      await writeTransaction.commit(); */

    // Retrieve persons using a READ only transaction
    const readTransaction = await session.transaction(TransactionType.READ);

    // We can either query and consume the iterator lazily
    //let answerStream = readTransaction.query.match("match $x isa person; get $x; limit 10;");
    /* for await (const aConceptMapAnswer of answerStream) {
          const person = aConceptMapAnswer.get("x");
          console.log("Retrieved person with id " + person.iid);
      } */

    // Or query and consume the iterator immediately collecting all the results
    let answerStream = readTransaction.query.match(
        "match $x isa person, has $a; get $x,$a;"
    );
    const persons = await answerStream.collect();
    const result = persons.map((p) =>
        new JsonEntityConstructor(p.get("x"), p.get("a")).createJson()
    );

    /* console.log(aPerson);
      let attributes = {[aPerson.get("a")._type._label._name]:aPerson.get("a")._value};
      let entity = {[aPerson.get("x")._type._label._name]:attributes}; */
    //console.log(attributes);
    /* console.log(new JsonEntityConstructor(aPerson.get('x'), aPerson.get('a'))
          .createJson()); */
    /* persons.forEach( conceptMap => {
          let person = conceptMap.get("x");
          console.log("Retrieved person with id " + person.iid);
      }); */

    // a read transaction must always be closed
    await readTransaction.close();
    // a session must always be closed
    await session.close();
    // a client must always be closed
    await client.close();
    return result;
}

async function openSession(sessionType) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, sessionType);
    // session is open
    return {client: client, session: session};
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
    runBasicQueries,
    getThings,
    getRelations,
};

/*async function createTransactions (database) {
	const client = TypeDB.coreClient("localhost:1729");
	const session = await client.session(database, SessionType.DATA);

	// creating a write transaction
	const writeTransaction = await session.transaction(TransactionType.WRITE); // write transaction is open
	// to persist changes, write transaction must always be committed/closed
	await writeTransaction.commit();

	// creating a read transaction
	const readTransaction = await session.transaction(TransactionType.READ); // read transaction is open
	// read transaction must always be closed
	await readTransaction.close();
	// a session must always be closed
	await session.close();
	// a client must always be closed
	client.close();
} */

//openSession("prova");
//createTransactions("prova");
