const { TypeDB, SessionType, TransactionType } = require("typedb-client");
const {
    createJsonAllThing,
    createJsonAllRelation,
    newAttribute,
    getAttributesFromAConceptGroup,
    getRelationsFromAConceptGroup,
} = require("./jsonEntityConstructor.js");

const database = "prova"; //inserire nome database
const EmptyThing = {
    thingId: '',
    attributes: {},
    features: {}
}

const isADate = (value)=>{
    if(value.length === 24 && value.charAt(10) ==='T' && value.charAt(23) === 'Z') return true;
    else return false;
}

const getAttributeQuery = (attributes)=>{
    let result = "";
    let aKeys = Object.entries(attributes);
    aKeys.forEach(entry => {
        let value = entry[1];
        if(isADate(value)) result = result.concat(", has " + entry[0] + " " + value.slice(0,value.length-1));
        else typeof value !== 'string' ? result = result.concat(", has " + entry[0] + " " + value) : result = result.concat(", has " + entry[0] + " '" + value + "'");
    });
    result = result.concat(";");
    return result;
}

const getRelationsQuery = (features)=>{
    let result = "";
    let relationKeys = Object.entries(features);
    relationKeys.forEach(innerRelation => {
        let relResult = "(";
        const relation = innerRelation[0];
        relResult = relResult.concat("(");
        const idKeys = Object.entries(innerRelation[1]);
        console.log(idKeys);
        idKeys.forEach(innerId => {
            const relId = innerId[0];
            const innerRole = Object.entries(innerId[1]);
            console.log(innerRole);
            innerRole.forEach(role => {
                relResult = relResult.concat(role[0]+":"+role[1])
            })
        })
    })
    result = result.concat('');
    return null;
}

async function createNewThing(thingId, attributes, features) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const writeTransaction = await session.transaction(TransactionType.WRITE);
    let attributeQuery = getAttributeQuery(attributes);
    let relationQuery = getRelationsQuery(features);
    const query = [
        "insert",
        " $x isa entity, has thingId '" + thingId + "'"+attributeQuery,
        " $role1 sub! relation:role;",
        " $role2 sub! relation:role;",
        " $rel($role1:$x,$role2:$y) isa relation, has attribute $relAtt;",
        " get $a,$x,$rel,$t,$role1,$role2,$relAtt;",
        " group $x;"
    ];
    const realQuery = query.join("");
    await writeTransaction.commit();
    await session.close();
    await client.close();
    return realQuery;
}

//TODO: riempire array di features per ogni ciclo, poi aggiungerlo a result in separata sede.
const getAllConcepts = async (conceptMap) => {
    let result = [];
    for await (const concept of conceptMap) {
        const owner = concept.get('x');
        const attribute = concept.get('a');
        const rel = concept.get('rel');
        const relAttribute = concept.get('relAtt');
        const role1 = concept.get('role1');
        const role2 = concept.get('role2');
        const relatedToId = concept.get('t');
        result.push({
            thing: owner,
            attribute: { label: attribute.type.label.name, value: attribute.value },
            relation: { label: rel.type.label.name, id: relAttribute.value },
            roles: { from: role1.label.name, to: role2.label.name },
            related: relatedToId.value
        });
    }
    return result;
}

//TODO: GUARDARE SOLO QUESTO METODO.
async function getAThing(thingId) {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const readTransaction = await session.transaction(TransactionType.READ);
    // *query per ragruppare tutto secondo l'entità specifica: per vedere provare query su db.
    // *l'obbiettivo da ragiungere è di tornare le features con solo il ruolo ricoperto dall'entità..
    // *il problema è trasformare il tutto in json in modo corretto.
    // *features e attributes non devono essere array di oggetti ma un oggetto unico (VEDERE DITTO), poichè..
    // *è più facile da trasformare e da modificare attributi secondo la query data dalla request.
    const query = [
        "match",
        " $x isa entity, has thingId '" + thingId + "', has attribute $a;",
        " $y isa entity, has thingId $t;",
        " $role1 sub! relation:role;",
        " $role2 sub! relation:role;",
        " $rel($role1:$x,$role2:$y) isa relation, has attribute $relAtt;",
        " get $a,$x,$rel,$t,$role1,$role2,$relAtt;",
        " group $x;"
    ];
    // *Stream of conceptMapGroup --> vedere documentazione (si capisce poco)
    const queryResult = readTransaction.query.matchGroup(query.join(""));
    // *Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    const collector = await queryResult.collect();
    // *there is only an element because we got a specific thing
    const thisThingMap = collector[0];
    console.log(thisThingMap.owner);
    // for each conceptMapGroup in Array
    //for await (const element of collector) {
    // *Array of ConceptMap --> vedere documentazione (si capisce poco)
    let conceptMap = thisThingMap.conceptMaps;
    //let owner = thisThingMap.owner;
    // Prova per le relazioni
    const concepts = await getAllConcepts(conceptMap);
    const attributes = getAttributesFromAConceptGroup(concepts);
    const features = getRelationsFromAConceptGroup(concepts, attributes.thingId);
    const thing = {
        thingId: attributes.thingId,
        attributes: {},
        features: features
    };
    delete attributes.thingId;
    thing.attributes = attributes;
    //}
    await readTransaction.close();
    await session.close();
    await client.close();
    return thing;
};

const getThings = async () => {
    const client = TypeDB.coreClient("localhost:1729");
    const session = await client.session(database, SessionType.DATA);
    const readTransaction = await session.transaction(TransactionType.READ);
    // *query per ragruppare tutto secondo l'entità specifica: per vedere provare query su db.
    // *l'obbiettivo da ragiungere è di tornare le features con solo il ruolo ricoperto dall'entità..
    // *il problema è trasformare il tutto in json in modo corretto.
    // *features e attributes non devono essere array di oggetti ma un oggetto unico (VEDERE DITTO), poichè..
    // *è più facile da trasformare e da modificare attributi secondo la query data dalla request.
    const query = [
        "match",
        " $x isa entity, has attribute $a;",
        " $y isa entity, has thingId $t;",
        " $role1 sub! relation:role;",
        " $role2 sub! relation:role;",
        " $rel($role1:$x,$role2:$y) isa relation, has attribute $relAtt;",
        " get $a,$x,$rel,$t,$role1,$role2,$relAtt;",
        " group $x;"
    ];
    // *Stream of conceptMapGroup --> vedere documentazione (si capisce poco)
    const queryResult = readTransaction.query.matchGroup(query.join(""));
    // *Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    const collector = await queryResult.collect();
    //const thisThingMap = collector[0];
    let things = [];
    //* for each conceptMapGroup in Array
    for await (const element of collector) {
        // *Array of ConceptMap --> vedere documentazione (si capisce poco)
        let conceptMap = element.conceptMaps;
        //let owner = thisThingMap.owner;
        // Prova per le relazioni
        const concepts = await getAllConcepts(conceptMap);
        const attributes = getAttributesFromAConceptGroup(concepts);
        const features = getRelationsFromAConceptGroup(concepts, attributes.thingId);
        const thing = {
            thingId: attributes.thingId,
            attributes: {},
            features: features
        };
        delete attributes.thingId;
        thing.attributes = attributes;
        things.push(thing);
    }
    await readTransaction.close();
    await session.close();
    await client.close();
    return things;
}

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
    getThings,
    getRelations,
    getAThing,
    createNewThing,
};