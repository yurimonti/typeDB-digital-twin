const clientFunction = require('./clientFunction.js');

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
    });
    return features;
}

const fillThing = (concepts,withDefinition) =>{
    const attributes = getAttributesFromAConceptGroup(concepts);
    const features = getRelationsFromAConceptGroup(concepts, attributes.thingId);
    let thing = {};
    if (withDefinition) {
        thing = {
            thingId: attributes.thingId,
            definition: { category: attributes.category, typology: attributes.tipology },
            attributes: {},
            features: features
        };
        delete attributes.category;
        delete attributes.tipology;
    } else thing = {
        thingId: attributes.thingId,
        attributes: {},
        features: features
    };
    delete attributes.thingId;
    thing.attributes = attributes;
    return thing;
}

/**
 * 
 * @param {string} thingId id of thing that we want to get
 * @param {boolean | undefined} withDefinition if present return category and typology in definition object, 
 *  otherwise are setted on attributes object
 * @returns a Thing that we want to search
 */
async function getAThing(thingId, withDefinition) {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const readTransaction = await clientFunction.openTransaction(session, true);
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
    // for each conceptMapGroup in Array
    //for await (const element of collector) {
    // *Array of ConceptMap --> vedere documentazione (si capisce poco)
    let conceptMap = thisThingMap.conceptMaps;
    //let owner = thisThingMap.owner;
    // Prova per le relazioni
    const concepts = await getAllConcepts(conceptMap);
    const thing = fillThing(concepts,withDefinition);
    //}
    await clientFunction.closeTransaction(readTransaction);
    await clientFunction.closeSession(session);
    await clientFunction.closeClient(client);
    return thing;
};

const getRelationsOfAThing = async (thingId) =>{
    const result = await getAThing(thingId,true);
    return result.features;
}

const getAttributesOfAThing = async (thingId) =>{
    const result = await getAThing(thingId,true);
    return result.attributes;
}

const getDefinitionOfAThing = async (thingId) =>{
    const result = await getAThing(thingId,true);
    return result.definition;
}

const getThings = async (withDefinition) => {
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const readTransaction = await clientFunction.openTransaction(session, true);
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
        const thing = fillThing(concepts,withDefinition);;
        things.push(thing);
    }
    await clientFunction.closeTransaction(readTransaction);
    await clientFunction.closeSession(session);
    await clientFunction.closeClient(client);
    return things;
}

module.exports = {
    getAThing,
    getRelationsOfAThing,
    getAttributesOfAThing,
    getDefinitionOfAThing,
    getThings
}