const isADate = (value) => {
    if (value.length === 24 && value.charAt(10) === 'T' && value.charAt(23) === 'Z') return true;
    else return false;
}

const getAnAttributeOfAThingQuery = (thingId,attribute) => {
    return 'match $x isa entity, has thingId "'+thingId+'" , has '+attribute+' $a; get $a';
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

const getMatchQueryForAThing = (thingId) =>{
    return "match $" + thingId + " isa entity, has thingId '" + thingId + "';";
}

module.exports = {
    getAttributesQuery,getRelationsQuery,isADate,getMatchQueryForAThing
}