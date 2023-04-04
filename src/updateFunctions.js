const {isADate,getRelationsQuery} = require('./queryUtils');
const clientFunction = require('./clientFunction');

const updateFeaturesString =  (thingId, features) => {
    let toMatch = ["match $" + thingId + " isa entity, has thingId '" + thingId + "';"]; 
    let toDelete = [" delete"];
    let toInsert = [" insert"];
    const rels = getRelationsQuery(features);
    rels.length > 0 && rels.forEach(obj => {
        //setting a value for old thing variable --> role Of relation concat with thingId
        const oldRelated = obj.role2.concat(obj.id2);
        //add old entity related to this thing
        let toPush = " $" + oldRelated + " isa entity;";
        !toMatch.includes(toPush) && toMatch.push(toPush);
        //add new related thing
        toPush = " $" + obj.id2 + " isa entity, has thingId '" + obj.id2 + "';";
        !toMatch.includes(toPush) && toMatch.push(toPush);
        //add the relation to modify
        toPush = " $" + obj.relId + " ("+obj.role1+":$"+obj.id1+","+obj.role2+":$"+oldRelated+") isa "+obj.rel+", has relationId '"+obj.relId+"';";
        !toMatch.includes(toPush) && toMatch.push(toPush);
        //add associated thing to this relation
        toPush = " $"+obj.relId+" ("+obj.role2+":$"+oldRelated+");";
        !toDelete.includes(toPush) && toDelete.push(toPush);
        //add new related to the relation
        toPush = " $" + obj.relId + " ("+obj.role2+":$"+obj.id2+");";
        !toInsert.includes(toPush) && toInsert.push(toPush);
    });
    return {toMatch,toDelete,toInsert};
}

//todo: da vedere
const updateAttributesString = (thingId, attributes, features) => {
    let toMatch = ["match $" + thingId + " isa entity, has thingId '" + thingId + "'"];
    let toDelete = ["delete"];
    let toInsert = ["insert"];
    Object.entries(attributes).forEach(entry => {
        let key = entry[0];
        let value = entry[1];
        toMatch.push(", has " + key + " $" + key);
        toDelete.push(" $" + thingId + " has $" + key + ";");
        if (isADate(value)) toInsert.push(" $" + thingId + " has " + key + " " + value.slice(0, value.length - 1) +";");
        else typeof value !== 'string' ? toInsert.push(" $" + thingId + " has " + key + " " + value +";") : toInsert.push(" $" + thingId + " has " + key + " '" + value + "'" + ";");
    })
    toMatch.push(' ;');
    if (features) {
        const relations = getRelationsQuery(features);
        relations.forEach(obj => {
            let toPushBefore = " $" + obj.id2 + " isa entity, has thingId '" + obj.id2 + "';";
            !toMatch.includes(toPushBefore) &&
                toMatch.push(toPushBefore);
            toMatch.push(" $" + obj.relId + "(" + obj.role1 + ":$" + obj.id1 + "," + obj.role2 + ":$" + obj.id2 + ") isa " + obj.rel + "; $" + obj.relId + " has relationId '" + obj.relId + "';");
        });
    }
    return { toMatch: toMatch, toDelete: toDelete, toInsert: toInsert };
}
//todo: da implementare
const updateAttributesOfAThing = async (thingId, attributes) => {
    const { toMatch, toDelete, toInsert } = updateAttributesString(thingId, attributes);
    const query = toMatch.join("")+toDelete.join("")+toInsert.join("");
    console.log(query);
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session,true);
    try {
        writeTransaction.query.update(query);
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}

const updateFeaturesOfAThing = async (thingId, features)=>{
    const { toMatch, toDelete, toInsert } = updateFeaturesString(thingId, features);
    const query = toMatch.join("")+toDelete.join("")+toInsert.join("");
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session,true);
    try {
        writeTransaction.query.update(query);
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}

module.exports = {updateAttributesOfAThing,updateFeaturesOfAThing}