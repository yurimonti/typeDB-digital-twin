function getThingKey(thingId) {
    return "$" + thingId;
}

const isADate = (value) => {
    if (value.length === 24 && value.charAt(10) === 'T' && value.charAt(23) === 'Z') return true;
    else return false;
}

function getMatch() {
    return ['match'];
}

function getEntries(object) {
    let entries = Object.entries(object);
    if (entries && entries.length > 0) return entries;
    else return [];
}

function matchThing(thingId) {
    return getThingKey(thingId) + " isa entity, has thingId '" + thingId + "';";
}

function matchAttribute(thingId, attributes) {
    let thingKey = getThingKey(thingId);
    let attributesQuery = [];
    let attributeKeys = getEntries(attributes);
    attributeKeys.length > 0 && attributeKeys.forEach(entry => {
        let value = entry[1];
        if (isADate(value)) attributesQuery.push(" " + thingKey + " has " + entry[0] + " " + value.slice(0, value.length - 1));
        else typeof value !== 'string' ?
            attributesQuery.push(" " + thingKey + " has " + entry[0] + " " + value) :
            attributesQuery.push(" " + thingKey + " has " + entry[0] + " '" + value + "'");
        attributesQuery.push(";");
    });
    return attributesQuery;
}

const getRelationsQuery = (features) => {
    let arrayRel = [];
    let relationKeys = Object.entries(features);
    Object.keys(features).length > 0 && relationKeys.forEach(innerRelation => {
        const relation = innerRelation[0];
        const idKeys = Object.entries(innerRelation[1]);
        idKeys.forEach(innerId => {
            const relId = innerId[0];
            const innerRole = Object.entries(innerId[1]);
            arrayRel.push({
                rel: relation, relId: relId, role1: innerRole[0][0], role2: innerRole[1][0], id1: innerRole[0][1], id2: innerRole[1][1]
            });
        })
    })
    return arrayRel;
}

function matchFeatures(thingId, features) {
    let matchFeatures = [];
    const rels = features ? getRelationsQuery(features) : [];
    rels.length > 0 && rels.forEach(obj => {
        let toPushBefore = " " + matchThing(obj.id2);
        !matchFeatures.includes(toPushBefore) && matchFeatures.push(toPushBefore);
        toPushBefore = " $" + obj.relId + "(" + obj.role1 + ":"+ getThingKey(thingId) + "," + obj.role2 + ":$" + obj.id2 + ") isa " + obj.rel + "; $" + obj.relId + " has relationId '" + obj.relId + "';";
        !matchFeatures.includes(toPushBefore) && matchFeatures.push(toPushBefore);
    });
    return matchFeatures;
}

module.exports = {
    getThingKey,matchThing
}