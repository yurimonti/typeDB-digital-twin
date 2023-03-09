const { TypeDB, SessionType, TransactionType } = require("typedb-client");
const {
    createJsonAllThing,
    createJsonAllRelation,
    newAttribute,
} = require("./jsonEntityConstructor.js");

const database = "prova"; //inserire nome database
const EmptyThing = {
    thingId: '',
    attributes: {},
    features: {}
}
//TODO: riempire array di features per ogni ciclo, poi aggiungerlo a result in separata sede.
const getConceptRelation = async (conceptMap) => {
    let result = [];
    for await (const concept of conceptMap) {
        //console.log(concept);
        const rel = concept.get('rel');
        const role = concept.get('role1');
        const relatedTo = concept.get('t');
        result.push();
        /* result = {...result,feature:{[rel.type.label.name]:{
            [role.label.name]:{
                [relatedTo.type.label.name]:relatedTo.value
            }
        }}}; */
        //result = {...result,[rel.type.label.name]:{[role.label.name]:{[relatedTo.type.label.name]:relatedTo.value}}};
        //result = { ...result, [concepts.iid]: concepts.type.label.name };
    }
    return result;
}

const getConceptAttribute = async (conceptMap,attributes) => {
    for await (const concept of conceptMap) {
        const attribute = concept.get('a');
        attributes.push(attribute);
        //const relations = concepts.foreach(c => stampaRel(c.get('rel')));
        /* result.push(concept.get('a')); */
        //result = { ...result, [concepts.type.label.name]: concepts.value };
    }
}

/* const getConceptRole = async (conceptMap) => {
    let result = {};
    for await (const concept of conceptMap) {
        const conceptsRole1 = concept.get('role1');
        console.log(conceptsRole1);
        const thingId = concept.get('t');
        result = { ...result, [conceptsRole1.label.scope]: conceptsRole1.label.name };
    }
    return result;
} */

//TODO: GUARDARE SOLO QUESTO METODO.
async function metodoProva(thingId) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const readTransaction = await session.transaction(TransactionType.READ);
    //query per ragruppare tutto secondo l'entità specifica: per vedere provare query su db.
    //l'obbiettivo da ragiungere è di tornare le features con solo il ruolo ricoperto dall'entità..
    //il problema è trasformare il tutto in json in modo corretto.
    // features e attributes non devono essere array di oggetti ma un oggetto unico (VEDERE DITTO), poichè..
    //è più facile da trasformare e da modificare attributi secondo la query data dalla request.
    const query = [
        "match",
        " $x isa entity, has thingId '" + thingId + "', has attribute $a;",
        " $y isa entity, has thingId $t;",
        " $rel($role1:$x,$role2:$y) isa relation;",
        " get $a,$x,$rel,$role1,$role2,$t;",
        " group $x;"
    ];
    //Stream of conceptMapGroup --> vedere documentazione (si capisce poco)
    const queryResult = readTransaction.query.matchGroup(query.join(""));
    //Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    const collector = await queryResult.collect();
    let attributes = [];
    //for each conceptMapGroup in Array
    for await (const element of collector) {
        //Array of ConceptMap --> vedere documentazione (si capisce poco)
        let conceptMap = element.conceptMaps;
        //conceptMap.forEach( concept => console.log('map',concept));

        //console.log(element);
        //Prova per le relazioni
        const relations = await getConceptRelation(conceptMap);
        //Prova per attributi --> questo funziona per certo
        await getConceptAttribute(conceptMap,attributes);
        //const roles = await getConceptRole(conceptMap);
        results = { attributes: attributes, features: relations/* , roles: roles */ };
    }
    await readTransaction.close();
    await session.close();
    await client.close();
    return results;
}

/* const getCompleteThing = async (thingId) => {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const readTransaction = await session.transaction(TransactionType.READ);
    const query = "match $x isa entity, has thingId '" + thingId + "', has attribute $a;$rel($x,$y);get $a,$x,$rel;group $x;"
    const queryResult = readTransaction.query.matchGroup(query);
    const collector = await queryResult.collect();
    const results = [];
    for await (const element of collector) {
        let concepts = element.conceptMaps[0];
        console.log(concepts);
    }
    await readTransaction.close();
    await session.close();
    await client.close();
    return results;
} */

const relationsFromRemoteThing = async (remoteThing) => {
    return await remoteThing.getRelations().collect();
}

const attributesFromRemoteThing = async (remoteThing) => {
    return await remoteThing.getHas(true).collect();
}

const playersFromRemoteRelation = async (remoteThing) => {
    return await remoteThing.getPlayersByRoleType();
}

const distinctAttributes = (myAttributes) => {
    let iids = [];
    const attributes = []
    myAttributes.forEach(a => {
        if (!iids.includes(a.iid)) { attributes.push(a); iids.push(a.iid) };
    });
    return attributes;
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

const prova2 = async (thingId) => {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const readTransaction = await session.transaction(TransactionType.READ);
    let answerStream = readTransaction.query.match("match $x isa entity, has thingId '" + thingId + "';get $x;");
    let response = await answerStream.collect();
    let entity = response[0].get('x').asEntity();
    const remoteEntity = entity.asRemote(readTransaction);
    const attributesFromRemote = await attributesFromRemoteThing(remoteEntity);
    let realAttributes = arrayToObject(attributesFromRemote.map(a => newAttribute(a)));
    const relationsFromRemote = await relationsFromRemoteThing(remoteEntity);
    const result = await relationsFromRemote[0].asRemote(readTransaction).getPlayersByRoleType();
    let realRelations = [];
    for await (const [key, value] of result) {
        for (const element of value) {
            try {
                const thing = await createJsonOnlyIDThing(
                    transaction,
                    element.asEntity()
                );
                players.push({ [key._label._name]: thing });
            } catch (error) {
                console.log(error);
            }
        }
    }
    console.log(realRelations)

    /* let responseThing = await response[0].map(r => r.get('x').asEntity()).asRemote(readTransaction);
    let attributes = attributesFromRemoteThing(responseThing); */

    /* let myAttributes = response.map(r => r.get('a').asAttribute()).map(a => newAttribute(a));
    let attributes = realAttributes(myAttributes);
    delete attributes.thingId;
    let result = {
        thingId: myAttributes.find(element => Object.keys(element).includes('thingId'))['thingId'],
        attributes:attributes
    } */
    await readTransaction.close();
    await session.close();
    await client.close();
    return realRelations.values();
}

/* const getAThing = async (thingId) => {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const readTransaction = await session.transaction(TransactionType.READ);
    let answerStream = readTransaction.query.match(
        "match $x isa entity, has thingId '" + thingId + "'; get $x;"
    );
    const thingsConcepts = await answerStream.collect();
    const things = thingsConcepts.map((t) => t.get("x").asEntity())[0];
    const thing = await createJsonAllThing(readTransaction, things);
    await readTransaction.close();
    await session.close();
    await client.close();
    return thing;
} */

//TODO: completare
const createThing = (payload) => {
    /* const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const writeTransaction = await session.transaction(TransactionType.WRITE);
    let answerStream = writeTransaction.query.insert("insert $x isa '" + type + "', has thingId '" + thingId + "'; get $x;");
    const createdThing = null;
    await writeTransaction.commit();
    await session.close();
    await client.close();
    return createdThing; */
}

async function getThings() {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const readTransaction = await session.transaction(TransactionType.READ);
    // Stream<ConceptMap>
    let answerStream = readTransaction.query.match("match $x isa entity;get $x;");
    // ConceptMap[]
    const thingsConcepts = await answerStream.collect();
    // Entity[]
    let things = thingsConcepts.map((t) => t.get("x").asEntity());
    let thingsArray = [];
    for await (const thing of things) {
        const thingToAdd = await createJsonAllThing(readTransaction, thing);
        thingsArray.push(thingToAdd);
    }
    await readTransaction.close();
    await session.close();
    await client.close();
    return thingsArray;
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


async function deleteThing(reqQuery) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const delTransaction = await session.transaction(TransactionType.WRITE);
    let answer = undefined;
    try {
        if (JSON.stringify(reqQuery) === "{}") {
            console.log("insert parameters");
            answer = "insert parameters";
        } else {
            const obj = new Object(reqQuery);
            const array = JSON.stringify(obj);
            const map = new Map(Object.entries(JSON.parse(array)));
            for (let key of map.keys()) {
                let value = map.get(key);
                if (Array.isArray(map.get(key))) {
                    for (let i = 0; i < value.length; i++) {
                        let attr = value[i];
                        answer = await delTransaction.query.delete("match $p isa entity, has " + key + "'" + attr + "'; delete $p isa entity;");
                    }
                } else {
                    answer = await delTransaction.query.delete("match $p isa entity, has " + key + "'" + value + "'; delete $p isa entity;");
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
    await delTransaction.commit();
    await session.close();
    await client.close();
    return answer;
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
    runBasicQueries,
    getThings,
    getRelations,
    /* getAThing */prova2,
    metodoProva,
    deleteThing,
    createThing,
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
