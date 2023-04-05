const clientFunction = require('./clientFunction.js');

//TODO: abilitare nelle query l'infer tramite TypeDBOptions = {infer:true}.

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
 * 
 * @param {*} conceptMap 
 * @returns map each concept group in more objects that represent partial graph
 */
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
        let toAdd = {
            thing: owner,
            attribute: { label: attribute.type.label.name, value: attribute.value },
            relation: {},
            roles: {},
            related: ""
        }
        if (rel) {
            toAdd.relation = { label: rel.type.label.name, id: relAttribute.value };
            toAdd.roles = { from: role1.label.name, to: role2.label.name };
            toAdd.related = relatedToId.value;
        }
        result.push(toAdd);
    }
    return result;
}

/**
 * 
 * @param {*} aConceptGroup 
 * @returns JSON that represents the DB attributes object.
 */
function getAttributesFromAConceptGroup(aConceptGroup) {
    let attributes = {};
    aConceptGroup.forEach(c => {
        const label = attributes[c.attribute.label];
        if (label === undefined) attributes = {
            ...attributes,
            [c.attribute.label]: c.attribute.value
        }
    });
    return attributes;
}

/**
 * 
 * @param {*} aConceptGroup 
 * @param {string} thingId 
 * @returns JSON that represents the features object.
 */
function getRelationsFromAConceptGroup(aConceptGroup, thingId) {
    let features = {};
    aConceptGroup.forEach(c => {
        if (Object.keys(c.relation).length > 0) {
            if (features[c.relation.label] === undefined) features = {
                ...features,
                [c.relation.label]: {
                    [c.relation.id]: {
                        [c.roles.from]: thingId,
                        [c.roles.to]: c.related
                    }
                }
            }
            else {
                const label = features[c.relation.label];
                if (label[c.relation.id] === undefined) {
                    features[c.relation.label] = {
                        ...label,
                        [c.relation.id]: {
                            [c.roles.from]: thingId,
                            [c.roles.to]: c.related
                        }
                    };
                    //console.log(features);
                }
            }
        }
    });
    return features;
}

const fillThing = (concepts) => {
    const attributes = getAttributesFromAConceptGroup(concepts);
    let thing = {
        thingId: attributes.thingId,
        attributes: {}
    };
    const features = getRelationsFromAConceptGroup(concepts, attributes.thingId);
    thing = { ...thing, features: features };
    delete attributes.thingId;
    thing.attributes = attributes;
    return thing;
}

/**
 * 
 * @param {string} thingId id of thing that we want to get
 * @returns a Thing that we want to search
 */
async function getAThing(thingId) {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const readTransaction = await clientFunction.openTransaction(session);
    /* const query = [
        "match",
        " $x isa entity, has thingId '" + thingId + "', has attribute $a;",
        " $y isa entity, has thingId $t;",
        " $role1 sub! relation:role;",
        " $role2 sub! relation:role;",
        " $rel($role1:$x,$role2:$y) isa relation, has attribute $relAtt;",
        " get $a,$x,$rel,$t,$role1,$role2,$relAtt;",
        " group $x;"
    ];
    let query2 = [
        "match",
        " $x isa entity, has thingId '" + thingId + "' ,has attribute $a;", ,
        " not {($x,$y) isa relation ;};",
        " get $a,$x;",
        " group $x;"
    ];
    // *Stream of conceptMapGroup --> vedere documentazione (si capisce poco)
    let queryResult = readTransaction.query.matchGroup(query.join(""));
    const collector = await queryResult.collect();
    queryResult = readTransaction.query.matchGroup(query2.join(""));
    // *Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    const collector2 = await queryResult.collect();
    // *there is only an element because we got a specific thing
    const thisThingMap = collector.concat(collector2)[0]; */
    const thisThingMap = await execGetAThingQuery(readTransaction,thingId);
    let thing = {};
    if(!thisThingMap) return thing;
    // for each conceptMapGroup in Array
    //for await (const element of collector) {
    // *Array of ConceptMap --> vedere documentazione (si capisce poco)
    let conceptMap = thisThingMap.conceptMaps;
    //let owner = thisThingMap.owner;
    // Prova per le relazioni
    const concepts = await getAllConcepts(conceptMap);
    thing = fillThing(concepts);
    //}
    await clientFunction.closeTransaction(readTransaction);
    await clientFunction.closeSession(session);
    await clientFunction.closeClient(client);
    return thing;
};

const getRelationsOfAThing = async (thingId) => {
    const result = await getAThing(thingId, true);
    return result.features;
}

const getAttributesOfAThing = async (thingId) => {
    const result = await getAThing(thingId, true);
    return result.attributes;
}

const getDefinitionOfAThing = async (thingId) => {
    const result = await getAThing(thingId, true);
    return result.definition;
}

const execGetAThingQuery = async (transaction,thingId) => {
    let query = [
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
    let queryResult = transaction.query.matchGroup(query.join(""));
    // *Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    let collector1 = await queryResult.collect();
    query = [
        "match",
        " $x isa entity, has thingId '" + thingId + "' ,has attribute $a;", ,
        " not {($x,$y) isa relation ;};",
        " get $a,$x;",
        " group $x;"
    ];
    queryResult = transaction.query.matchGroup(query.join(""));
    let collector2 = await queryResult.collect();
    // *Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    return collector1.concat(collector2)[0];
}

// exececutes query for thing with features and with none,
// because the query with features cannot capture things with no features
const execGetAllThingQuery = async (transaction) => {
    let query = [
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
    let queryResult = transaction.query.matchGroup(query.join(""));
    // *Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    let collector1 = await queryResult.collect();
    query = [
        "match",
        " $x isa entity, has attribute $a;", ,
        " not {($x,$y) isa relation ;};",
        " get $a,$x;",
        " group $x;"
    ];
    queryResult = transaction.query.matchGroup(query.join(""));
    let collector2 = await queryResult.collect();
    // *Stream of conceptMapGroup --> vedere documentazione (si capisce poco)
    queryResult = transaction.query.matchGroup(query.join(""));
    // *Array of conceptMapGroup --> vedere documentazione (si capisce poco)
    return collector1.concat(collector2);
}

const getThings = async () => {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const readTransaction = await clientFunction.openTransaction(session);
    let collector = await execGetAllThingQuery(readTransaction);
    let things = [];
    //* for each conceptMapGroup in Array
    for await (const element of collector) {
        // *Array of ConceptMap --> vedere documentazione (si capisce poco)
        let conceptMap = element.conceptMaps;
        //let owner = thisThingMap.owner;
        // Prova per le relazioni
        const concepts = await getAllConcepts(conceptMap, true);
        const thing = fillThing(concepts, true);;
        things.push(thing);
    }
    await clientFunction.closeTransaction(readTransaction);
    await clientFunction.closeSession(session);
    await clientFunction.closeClient(client);
    return things;
}

const provaMethod = async () => {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const readTransaction = await clientFunction.openTransaction(session);
    const query = [
        "match",
        " $x isa entity, has attribute $a;",
        " $y isa entity;",
        " not {($x,$y);};",
        " get $a,$x;",
        " group $x;"
    ];
    const queryResult = readTransaction.query.matchGroup(query.join(""));
    const collector = await queryResult.collect();
    // *there is only an element because we got a specific thing
    const thisThingMap = collector[0];
    let conceptMap = thisThingMap.conceptMaps;
    //let owner = thisThingMap.owner;
    // Prova per le relazioni
    const concepts = await getAllConcepts(conceptMap);
    const thing = fillThing(concepts);
    //}
    await clientFunction.closeTransaction(readTransaction);
    await clientFunction.closeSession(session);
    await clientFunction.closeClient(client);
    return thing;
}

module.exports = {
    getAllThingId,
    getAThing,
    getRelationsOfAThing,
    getAttributesOfAThing,
    getDefinitionOfAThing,
    getThings,
    provaMethod
}