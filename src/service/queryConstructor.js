const space = " ";
const end = ";";

const notSelectableAttributes = "not {$a isa thingId;}; not {$a isa category;}; not {$a isa typology;};"

/**
 * Wrap a value between quotation marks
 */
function wrapStringValue(value) {
    return "'" + value + "'";
}

/**
 * Query to return a thing with its features and attributes
 * @param thingId id of the thing to return
 * @returns {string} query
 */
function getThingWithFeaturesQuery(thingId) {
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

/**
 * Query to return a thing and its attributes
 * @param thingId id of the thing to return
 * @returns {string} query
 */
function getThingWithNoFeaturesQuery(thingId) {
    let result = [
        "match",
        " $x isa entity, has thingId '" + thingId + "' ,has attribute $a;",
        " not {($x,$y) isa relation ;};",
        " get $a,$x;",
        " group $x;"
    ];
    return result.join("");
}

/**
 * Query to return all the things and their attributes and features
 * @returns {string} query
 */
function getThingsWithFeaturesQuery() {
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

/**
 * Query to return all things and their attributes
 * @returns {string} query
 */
function getThingsWithNoFeaturesQuery() {
    let result = [
        "match",
        " $x isa entity, has attribute $a;",
        " not {($x,$y) isa relation ;};",
        " get $a,$x;",
        " group $x;"
    ];
    return result.join("");
}

/**
 * Build part of a query to associate attributes of a thing
 * @param thingId id of the thing
 * @returns {string} query
 */
const thingHasAttributeQuery = (thingId) => {
    return getThingKey(thingId) + " has attribute " + getGenericKeyAttributeOfEntity(thingId) + end;
}

/**
 * Build a key for an attribute
 * @param entityId id of the entity that owns an attribute
 * @returns {string}
 */
function getGenericKeyAttributeOfEntity(entityId) {
    return getThingKey(entityId).concat("Attribute");
}

/**
 * Return the id of a thing or relation as a variable of a query
 * @param thingId id
 * @returns {string} variable
 */
function getThingKey(thingId) {
    return "$" + thingId;
}

/**
 * Check if a given value is a possible date comparing the date format
 * @param value possible date
 * @returns {boolean} true if is a date, false otherwise
 */
const isADate = (value) => {
    return value.length === 24 && value.charAt(10) === 'T' && value.charAt(23) === 'Z';
}

/**
 * Returns a string for a query match
 * @returns {string[]} match
 */
function getMatch() {
    return ['match'];
}

/**
 * Return an array of properties of an object
 * @param object object with string-key properties
 * @returns {*[]|[string, unknown][]} empty array or array of properties
 */
function getEntries(object) {
    let entries = Object.entries(object);
    if (entries && entries.length > 0) return entries;
    else return [];
}

/**
 * Build part of a query to identify an entity with an id
 * @param thingId id of the entity
 * @returns {string} part of a query
 */
function thingStringQuery(thingId) {
    return getThingKey(thingId) + " isa entity, has thingId '" + thingId + "';";
}

/**
 * Build part of a query with entity in a relation
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

/**
 * Build part of a query to add new attributes of a thing
 * @param thingId id of the thing
 * @param attributes attributes to add
 * @returns {string} query
 */
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

/**
 * Build part of a query to match some attributes of a thing that are to be deleted
 * @param thingId id of the thing
 * @param attributes attributes to delete
 * @returns {string} query
 */
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

/**
 * Part of a query to delete some attributes of a thing
 * @param thingId id of the thing
 * @param attributes attributes to delete
 * @returns {string} query
 */
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

/**
 * Build part of a query to identify the relations of a thing and their roles and attributes
 * @param thingId id of the thing with features
 * @param structuredFeatures features
 * @returns {string} query
 */
function thingFeaturesToMatchDelStringQuery(thingId, structuredFeatures) {
    let result = [];
    structuredFeatures.length > 0 && structuredFeatures.forEach(obj => {
        buildRolesQuery(result, obj, thingId);
        let toPushBefore = space + getThingKey(obj.relId) + " has attribute " + getGenericKeyAttributeOfEntity(obj.relId) + end;
        !result.includes(toPushBefore) && result.push(toPushBefore);
    });
    console.log(result);
    return result.join("");
}

/**
 * Builds part of a query to associate roles of a relation
 * @param result query to modify
 * @param obj relation to add in the query
 * @param thingId id of the thing with the relation
 * @returns {false|*} new query
 */
function buildRolesQuery(result, obj, thingId) {
    let toPushBefore = space + getThingKey(obj.relId) + "(" + obj.role1 + ":" + getThingKey(thingId) + "," + obj.role2 + ":" + getThingKey(obj.id2) + ") isa " + obj.rel + end + space + getThingKey(obj.relId) + " has relationId " + wrapStringValue(obj.relId) + end;
    return !result.includes(toPushBefore) && result.push(toPushBefore);
}

/**
 * Query to add features to a thing
 * @param thingId id of the thing
 * @param structuredFeatures relations to add
 * @returns {string} query
 */
function thingFeaturesToAddStringQuery(thingId, structuredFeatures) {
    let result = [];
    structuredFeatures.length > 0 && structuredFeatures.forEach(obj => {
       buildRolesQuery(result, obj, thingId);
    });
    return result.join("");
}

/**
 * Build part of a query to delete some features
 * @param structuredFeatures features to delete
 * @returns {string} query
 */
function thingFeaturesToDelStringQuery(structuredFeatures) {
    let result = [];
    structuredFeatures.length > 0 && structuredFeatures.forEach(obj => {
        let toPushBefore = space + getGenericKeyAttributeOfEntity(obj.relId) + " isa attribute" + end;
        !result.includes(toPushBefore) && result.push(toPushBefore);
        toPushBefore = space + getThingKey(obj.relId) + " isa relation" + end;
        !result.includes(toPushBefore) && result.push(toPushBefore);
    });
    return result.join("");
}

/**
 * Query to add features to a thing
 * @param thingId id of the thing
 * @param features features to add
 * @returns {string} query
 */
function addFeaturesQuery(thingId, features) {
    let match = getMatch();
    let insert = ["insert"];
    const structuredFeatures = getRelationsQuery(features);
    match.push(space + thingStringQuery(thingId));
    match.push(getEntitiesInRelations(structuredFeatures));
    insert.push(thingFeaturesToAddStringQuery(thingId, structuredFeatures));
    return match.join("").concat(insert.join(""));
}

/**
 * delete features of a thing: if features are present, deletes only features selected, otherwise delete all features of a thing
 * @param {string} thingId id of a thing
 * @param {*} features object containing relations
 * @returns a query to delete features
 */
function deleteFeaturesQuery(thingId, features) {
    let match = getMatch();
    let del = ["delete"];
    match.push(space + thingStringQuery(thingId));
    if (features) {
        const structuredFeatures = getRelationsQuery(features);
        match.push(getEntitiesInRelations(structuredFeatures));
        match.push(thingFeaturesToMatchDelStringQuery(thingId, structuredFeatures));
        del.push(thingFeaturesToDelStringQuery(structuredFeatures));
    } else {
        match.push(space + getThingKey('rel') + "(" + getThingKey(thingId) + ") isa relation" + end);
        match.push(space + getThingKey('rel') + " has attribute " + getGenericKeyAttributeOfEntity('rel') + end + space);
        del.push(space + getGenericKeyAttributeOfEntity('rel') + " isa attribute" + end);
        del.push(space + getThingKey('rel') + " isa relation" + end);
    }
    return match.join("").concat(del.join(""))
}

/**
 * Query to add attributes to a thing
 * @param thingId id of the thing
 * @param attributes attributes to add
 * @returns {string} query
 */
function addAttributesQuery(thingId, attributes) {
    let match = getMatch();
    let insert = ["insert"];
    match.push(space + thingStringQuery(thingId));
    insert.push(thingAttributesToAddStringQuery(thingId, attributes));
    return match.join("").concat(insert.join(""));
}

/**
 * Query to delete some attributes of a thing
 * @param thingId id of the thing
 * @param attributes attributes to delete
 * @returns {string} query
 */
function deleteAttributesQuery(thingId, attributes) {
    let match = getMatch();
    let del = ["delete"];
    if (attributes) {
        match.push(space + thingStringQuery(thingId));
        match.push(thingAttributesToMatchDelStringQuery(thingId, attributes));
        del.push(thingAttributesToDelStringQuery(thingId, attributes));
    } else {
        let thingSelect = thingStringQuery(thingId).concat(getThingKey(thingId) + space + "has attribute $a" + end);
        let selectAttr = thingSelect.concat(notSelectableAttributes);
        match.push(space + selectAttr);
        del.push(space + "$a isa attribute" + end);
    }
    return match.join("").concat(del.join(""));
}

/**
 * Query to delete a thing
 * @param thingId id of the thing to delete
 * @returns {string} query
 */
function deleteThingLastQuery(thingId) {
    let match = getMatch();
    match.push(space + thingStringQuery(thingId));
    match.push(space + thingHasAttributeQuery(thingId));
    let del = ['delete'];
    del.push(space + getGenericKeyAttributeOfEntity(thingId) + " isa attribute" + end);
    del.push(space + getThingKey(thingId) + " isa entity" + end);
    return match.join("").concat(del.join(""));
}

/**
 * Query to add a new thing
 * @param thingId id of the new thing
 * @param attributes attributes to add
 * @returns {string} query
 */
function newThingQuery(thingId, attributes) {
    let insert = ["insert"];
    insert.push(space + getThingKey(thingId) + " isa " + attributes.category + ", has thingId " + wrapStringValue(thingId) + end);
    insert.push(thingAttributesToAddStringQuery(thingId, attributes));
    return insert.join("");
}

/**
 * Build a structure with features
 * @param features features to insert in a structure
 * @returns {*[]} structured features
 */
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
                rel: relation,
                relId: relId,
                role1: innerRole[0][0],
                role2: innerRole[1][0],
                id1: innerRole[0][1],
                id2: innerRole[1][1]
            });
        })
    })
    return arrayRel;
}

/**
 * Build part of a query to identify a relation with an id
 * @param featureId id of the relation
 * @returns {string} part of a query
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
    match.push(space + featureStringQuery(featureId));
    match.push(space + getThingKey(featureId) + " has attribute " + getGenericKeyAttributeOfEntity(featureId) + end + space);
    del.push(space + getGenericKeyAttributeOfEntity(featureId) + " isa attribute" + end);
    del.push(space + getThingKey(featureId) + " isa relation" + end);
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