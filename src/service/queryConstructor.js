const space = " ";
const end = ";";

const notSelectableAttributes = "not {$a isa thingId;}; not {$a isa category;}; not {$a isa typology;};"

function wrapStringValue(value) {
    return "'" + value + "'";
}

function getThingWithFeaturesQuery(thingId){
    let result = [
        "match",
        " $x isa entity, has thingId '" + thingId + "', has attribute $a;",
        " $y isa entity, has thingId $t;",
        " $role1 sub! relation:role;",
        " $role2 sub! relation:role;",
        " $rel($role1:$x,$role2:$y) isa relation, has attribute $relAtt;",
        " get $a,$x,$rel,$t,$role1,$role2,$relAtt;",
        " group $x;"
    ];
    return result.join("");
}

function getThingWithNoFeaturesQuery(thingId){
    let result = [
        "match",
        " $x isa entity, has thingId '" + thingId + "' ,has attribute $a;",
        " not {($x,$y) isa relation ;};",
        " get $a,$x;",
        " group $x;"
    ];
    return result.join("");
}

function getThingsWithFeaturesQuery(){
    let result = [
        "match",
        " $x isa entity, has attribute $a;",
        " $y isa entity, has thingId $t;",
        " $role1 sub! relation:role;",
        " $role2 sub! relation:role;",
        " $rel($role1:$x,$role2:$y) isa relation, has attribute $relAtt;",
        " get $a,$x,$rel,$t,$role1,$role2,$relAtt;",
        " group $x;"
    ];
    return result.join("");
}

function getThingsWithNoFeaturesQuery(){
    let result = [
        "match",
        " $x isa entity, has attribute $a;",
        " not {($x,$y) isa relation ;};",
        " get $a,$x;",
        " group $x;"
    ];
    return result.join("");
}

// const genericEntity = "$entity isa entity;"
//
// const genericRelAttribute = getThingKey('relAttribute');
//
// const genericRelationForAThing = (thingId) =>{
//     return "$rel("+getThingKey(thingId)+","+"$entity) isa relation; $rel has attribute $relAttribute"+end;
// }

const thingHasAttributeQuery = (thingId) => {
    return getThingKey(thingId)+" has attribute "+getGenericKeyAttributeOfEntity(thingId)+end;
}

function getGenericKeyAttributeOfEntity(entityId){
    return getThingKey(entityId).concat("Attribute");
}

function getThingKey(thingId) {
    return "$" + thingId;
}

const isADate = (value) => {
    return value.length === 24 && value.charAt(10) === 'T' && value.charAt(23) === 'Z';
}

function getMatch() {
    return ['match'];
}

function getEntries(object) {
    let entries = Object.entries(object);
    if (entries && entries.length > 0) return entries;
    else return [];
}

function thingStringQuery(thingId) {
    return getThingKey(thingId) + " isa entity, has thingId '" + thingId + "';";
}

/**
 * 
 * @param {*} structuredFeatures structured version of body features
 * @returns query part regarding entities in relations
 */
function getEntitiesInRelations(structuredFeatures) {
    let result = [];
    structuredFeatures.forEach(obj => {
        let toPushBefore = space + thingStringQuery(obj.id2);
        !result.includes(toPushBefore) && result.push(toPushBefore);
    });
    return result.join("");
}

// /**
//  * construct the part of match of features of a thing with a certain thingId
//  * @param {string} thingId id of thing that has these features
//  * @param {*} structuredFeatures structured version of body features
//  * @returns part of query regarding relation matches
//  */
// function thingFeaturesStringQuery(thingId, structuredFeatures) {
//     let result = [];
//     structuredFeatures.forEach(obj => {
//         let toPushBefore = " $" + obj.relId + "(" + obj.role1 + ":" + getThingKey(thingId) + "," + obj.role2 + ":" + getThingKey(obj.id2) + ") isa " + obj.rel + ";" +
//             space + getThingKey(obj.relId) + " has relationId '" + obj.relId + "';" + space + getThingKey(obj.relId) + " has attribute " + getThingKey("attribute" + obj.relId) + end;
//         !result.includes(toPushBefore) && result.push(toPushBefore);
//     });
//     return result.join("");
// }
//TODO:finire
function thingAttributesToAddStringQuery(thingId, attributes) {
    let thingKey = getThingKey(thingId);
    let aKeys = getEntries(attributes);
    let result = [];
    aKeys.length > 0 && aKeys.forEach(entry => {
        let key = entry[0];
        let value = entry[1];
        if (isADate(value)) result.push(space + thingKey + " has " + key + space + value.slice(0, value.length - 1) + end);
        else typeof value !== 'string' ? result.push(space + thingKey + " has " + key + space + value + end) : result.push(space + thingKey + " has " + key + space + wrapStringValue(value) + end);
    });
    return result.join("");
}

function thingAttributesToMatchDelStringQuery(thingId, attributes) {
    let thingKey = getThingKey(thingId);
    let aKeys = getEntries(attributes);
    let result = [];
    aKeys.length > 0 && aKeys.forEach(entry => {
        let key = entry[0];
        result.push(space + thingKey + " has " + key + space + getThingKey(key) + end);
    });
    return result.join("");
}

function thingAttributesToDelStringQuery(thingId, attributes) {
    let thingKey = getThingKey(thingId);
    let aKeys = getEntries(attributes);
    let result = [];
    aKeys.length > 0 && aKeys.forEach(entry => {
        let key = entry[0];
        result.push(space + thingKey + " has " + getThingKey(key) + end);
    });
    return result.join("");
}

function thingFeaturesToMatchDelStringQuery(thingId, structuredFeatures) {
    let result = [];
    structuredFeatures.length > 0 && structuredFeatures.forEach(obj => {
        let toPushBefore = space + getThingKey(obj.relId) + "(" + obj.role1 + ":" + getThingKey(thingId) + "," + obj.role2 + ":" + getThingKey(obj.id2) + ") isa " + obj.rel + end + space + getThingKey(obj.relId) + " has relationId " + wrapStringValue(obj.relId) + end;
        !result.includes(toPushBefore) && result.push(toPushBefore);
        toPushBefore = space + getThingKey(obj.relId)+" has attribute "+getGenericKeyAttributeOfEntity(obj.relId)+ end;
        !result.includes(toPushBefore) && result.push(toPushBefore);
    });
    return result.join("");
}

function thingFeaturesToAddStringQuery(thingId,structuredFeatures) {
    let result = [];
    structuredFeatures.length > 0 && structuredFeatures.forEach(obj => {
        let toPushBefore = space + getThingKey(obj.relId) + "(" + obj.role1 + ":" + getThingKey(thingId) + "," + obj.role2 + ":" + getThingKey(obj.id2) + ") isa " + obj.rel + end + space + getThingKey(obj.relId) + " has relationId " + wrapStringValue(obj.relId) + end;
        !result.includes(toPushBefore) && result.push(toPushBefore);
    });
    return result.join("");
}

function thingFeaturesToDelStringQuery(structuredFeatures) {
    let result = [];
    structuredFeatures.length > 0 && structuredFeatures.forEach(obj => {
        toPushBefore = space+getGenericKeyAttributeOfEntity(obj.relId)+" isa attribute"+end;
        !result.includes(toPushBefore) && result.push(toPushBefore);
        toPushBefore = space+getThingKey(obj.relId)+" isa relation"+end;
        !result.includes(toPushBefore) && result.push(toPushBefore);
    });
    return result.join("");
}

function addFeaturesQuery(thingId, features) {
    let match = getMatch();
    let insert = ["insert"];
    const structuredFeatures = getRelationsQuery(features);
    match.push(space + thingStringQuery(thingId));
    match.push(getEntitiesInRelations(structuredFeatures));
    insert.push(thingFeaturesToAddStringQuery(thingId,structuredFeatures));
    return match.join("").concat(insert.join(""));
}

/**
 * delete features of a thing: if features are present, deletes only features selected, otherwise delete all features of a thing
 * @param {string} thingId id of a thing
 * @param {*} features object containing relations
 * @returns a query to delete features
 */
function deleteFeaturesQuery(thingId,features){
    let match = getMatch();
    let del = ["delete"];
    match.push(space+thingStringQuery(thingId));
    if(features){
        const structuredFeatures = getRelationsQuery(features);
        match.push(getEntitiesInRelations(structuredFeatures));
        match.push(thingFeaturesToMatchDelStringQuery(thingId,structuredFeatures));
        del.push(thingFeaturesToDelStringQuery(structuredFeatures));
    }
    else{
        match.push(space+getThingKey('rel')+"("+getThingKey(thingId)+") isa relation"+end);
        match.push(space+getThingKey('rel')+" has attribute "+getGenericKeyAttributeOfEntity('rel')+end+space);
        del.push(space+getGenericKeyAttributeOfEntity('rel')+" isa attribute"+end);
        del.push(space+getThingKey('rel')+" isa relation"+end);
    }
    return match.join("").concat(del.join(""))
}

function addAttributesQuery(thingId, attributes) {
    let match = getMatch();
    let insert = ["insert"];
    match.push(space + thingStringQuery(thingId));
    insert.push(thingAttributesToAddStringQuery(thingId, attributes));
    return match.join("").concat(insert.join(""));
}

function deleteAttributesQuery(thingId, attributes) {
    let match = getMatch();
    let del = ["delete"];
    if (attributes) {
        match.push(space+thingStringQuery(thingId));
        match.push(thingAttributesToMatchDelStringQuery(thingId, attributes));
        del.push(thingAttributesToDelStringQuery(thingId, attributes));
    }
    else {
        let thingSelect = thingStringQuery(thingId).concat(getThingKey(thingId) + space + "has attribute $a" + end);
        let selectAttr = thingSelect.concat(notSelectableAttributes);
        match.push(space+selectAttr);
        del.push(space + "$a isa attribute" + end);
    }
    return match.join("").concat(del.join(""));
}

function deleteThingLastQuery(thingId){
    let match = getMatch();
    match.push(space+thingStringQuery(thingId));
    match.push(space+thingHasAttributeQuery(thingId));
    let del = ['delete'];
    del.push(space+getGenericKeyAttributeOfEntity(thingId)+" isa attribute"+end);
    del.push(space+getThingKey(thingId)+" isa entity"+end);
    return match.join("").concat(del.join(""));
} 

function newThingQuery(thingId,attributes){
    let insert = ["insert"];
    insert.push(space+getThingKey(thingId) + " isa " + attributes.category + ", has thingId " + wrapStringValue(thingId) +end);
    insert.push(thingAttributesToAddStringQuery(thingId, attributes));
    return insert.join("");
}

// function matchAttribute(thingId, attributes) {
//     let thingKey = getThingKey(thingId);
//     let attributesQuery = [];
//     let attributeKeys = getEntries(attributes);
//     attributeKeys.length > 0 && attributeKeys.forEach(entry => {
//         let value = entry[1];
//         if (isADate(value)) attributesQuery.push(" " + thingKey + " has " + entry[0] + " " + value.slice(0, value.length - 1));
//         else typeof value !== 'string' ?
//             attributesQuery.push(" " + thingKey + " has " + entry[0] + " " + value) :
//             attributesQuery.push(" " + thingKey + " has " + entry[0] + " '" + value + "'");
//         attributesQuery.push(";");
//     });
//     return attributesQuery;
// }

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

// function matchFeatures(thingId, features) {
//     let matchFeatures = [];
//     const rels = features ? getRelationsQuery(features) : [];
//     rels.length > 0 && rels.forEach(obj => {
//         let toPushBefore = " " + thingStringQuery(obj.id2);
//         !matchFeatures.includes(toPushBefore) && matchFeatures.push(toPushBefore);
//         toPushBefore = " $" + obj.relId + "(" + obj.role1 + ":" + getThingKey(thingId) + "," + obj.role2 + ":$" + obj.id2 + ") isa " + obj.rel + "; $" + obj.relId + " has relationId '" + obj.relId + "';";
//         !matchFeatures.includes(toPushBefore) && matchFeatures.push(toPushBefore);
//     });
//     return matchFeatures;
// }



/**
 *
 * @param featureId
 * @returns {string}
 */
function featureStringQuery(featureId) {
    return getThingKey(featureId) + " isa relation, has relationId '" + featureId + "';";
}

/**
 * Create the query to delete a feature given the id
 * @param featureId
 * @returns {string}
 */
function deleteFeatureById(featureId) {
    let match = getMatch();
    let del = ["delete"];
    match.push(space+featureStringQuery(featureId));
    match.push(space+getThingKey(featureId)+" has attribute "+getGenericKeyAttributeOfEntity(featureId)+end+space);
    del.push(space+getGenericKeyAttributeOfEntity(featureId)+" isa attribute"+end);
    del.push(space+getThingKey(featureId)+" isa relation"+end);
    return match.join("").concat(del.join(""))
}



module.exports = {
    addFeaturesQuery,
    addAttributesQuery,
    deleteAttributesQuery,
    deleteFeaturesQuery,
    deleteThingLastQuery,
    deleteFeatureById,
    //TODO:eliminare
    getThingWithFeaturesQuery,
    getThingWithNoFeaturesQuery,
    getThingsWithFeaturesQuery,
    getThingsWithNoFeaturesQuery,
    newThingQuery
}