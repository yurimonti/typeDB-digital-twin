const {getThingKey,thingStringQuery} = require('./service/queryConstructor');

const isADate = (value) => {
    if (value.length === 24 && value.charAt(10) === 'T' && value.charAt(23) === 'Z') return true;
    else return false;
}

const getAnAttributeOfAThingQuery = (thingId, attribute) => {
    return 'match $x isa entity, has thingId "' + thingId + '" , has ' + attribute + ' $a; get $a';
}

//* get string of attributes of a thing
const getAttributesQuery = (attributes) => {
    let result = "";
    let aKeys = Object.entries(attributes);
    aKeys.length > 0 && aKeys.forEach(entry => {
        let value = entry[1];
        if (isADate(value)) result = result.concat(", has " + entry[0] + " " + value.slice(0, value.length - 1));
        else typeof value !== 'string' ? result = result.concat(", has " + entry[0] + " " + value) : result = result.concat(", has " + entry[0] + " '" + value + "'");
    });
    result = result.concat(";");
    return result;
}

const getAttributes = (thingId, attributes) => {
    const thing = "$" + thingId;
    let result = '';
    let aKeys = Object.entries(attributes);
    aKeys.length > 0 && aKeys.forEach(entry => {
        let value = entry[1];
        if (isADate(value)) result = result.concat(thing + " has " + entry[0] + " " + value.slice(0, value.length - 1));
        else typeof value !== 'string' ? result = result.concat(thing + " has " + entry[0] + " " + value) : result = result.concat(thing + " has " + entry[0] + " '" + value + "'");
        result = result.concat(";");
    });
    return result;
}

//* get values regarded on each relations in a request body;
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

const getMatchQueryForAThing = (thingId) => {
    return "match $" + thingId + " isa entity, has thingId '" + thingId + "';";
}

const insertAttributeForAThingQuery = (thingId, attributes) => {
    let match = getMatchQueryForAThing(thingId);
    let insert = "insert " + getAttributes(thingId, attributes);
    return match.concat(insert);
}

const insertFeatureForAThing = (thingId, features) => {
    let match = "match " + getMatchQueryForAThing(thingId);
    match.concat("")
    let insert = "insert " + getAttributes(thingId, features);
    return match.concat(insert);
}

const getDeleteThingQuery = (thingId) => {
    const thing = "$" + thingId;
    const other = "$entity";
    const attributes = thing + " has attribute $a;";
    const features = "$rel(" + thing + "," + other + ") isa relation;";
    const match = getMatchQueryForAThing(thingId) + other + " isa entity;" + attributes + features;
    const del = "delete " + thing + " isa entity;$a isa attribute;$rel isa relation;";
    return match.concat(del);
}

const deleteAttributeQuery = (thingId, attributes) => {
    const thing = "$" + thingId;
    let match = getMatchQueryForAThing(thingId);
    let del = 'delete';
    if (attributes === null) {
        const not = "not {$a isa thingId;}; not {$a isa category;}; not {$a isa typology;};"
        match = match+" " + thing + " has attribute $a;" + not;
        del = "delete $a isa attribute;";
    } else {
        let aKeys = Object.entries(attributes);
        aKeys.length > 0 && aKeys.forEach(entry => {
            let key = entry[0];
            match = match.concat(" "+thing+ " has "+key + " $"+key);
            match = match.concat(";");
            del = del.concat(" "+thing+" has "+"$"+key+";");
        });
    }
    return match.concat(del);
}

const deleteFeaturesQuery = (thingId,features) => {
    const thing = "$" + thingId;
    let toMatch = ["match"];
    toMatch.push(" "+thingStringQuery(thingId));
    let toDelete = ["delete"];
    if(features === null){
        toMatch.push(" $entity isa entity; $rel(" + thing + ",$entity) isa relation;");
        toDelete.push( " $rel isa relation;");
    }else {
        const featuresDestructured = getRelationsQuery(features);
        featuresDestructured.length > 0 && featuresDestructured.forEach(obj => {
            let toPushBefore = " " + thingStringQuery(obj.id2);
            !toMatch.includes(toPushBefore) && toMatch.push(toPushBefore);
            toPushBefore = " $" + obj.relId + "(" + obj.role1 + ":"+ getThingKey(thingId) + "," + obj.role2 + ":$" + obj.id2 + ") isa " + obj.rel + "; $" + obj.relId + " has relationId '" + obj.relId + "';";
            !toMatch.includes(toPushBefore) && toMatch.push(toPushBefore);
            toPushBefore = " $" + obj.relId+" isa "+obj.rel+";";
            !toDelete.includes(toPushBefore) && toDelete.push(toPushBefore);
        });
    }
    return toMatch.join("").concat(toDelete.join(""));
}


module.exports = {
    getAttributesQuery,
    getRelationsQuery,
    isADate,
    getMatchQueryForAThing,
    getDeleteThingQuery,
    deleteAttributeQuery,
    deleteFeaturesQuery,
    insertAttributeForAThingQuery
}