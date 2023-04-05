const { isADate, getRelationsQuery, getMatchQueryForAThing } = require('./queryUtils');
const clientFunction = require('./clientFunction');

const updateFeaturesString = (thingId, features) => {
    let toMatch = [];
    let toDelete = [];
    let toInsert = [];
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
        toPush = " $" + obj.relId + " (" + obj.role1 + ":$" + thingId + "," + obj.role2 + ":$" + oldRelated + ") isa " + obj.rel + ", has relationId '" + obj.relId + "';";
        !toMatch.includes(toPush) && toMatch.push(toPush);
        //add associated thing to this relation
        toPush = " $" + obj.relId + " (" + obj.role2 + ":$" + oldRelated + ");";
        !toDelete.includes(toPush) && toDelete.push(toPush);
        //add new related to the relation
        toPush = " $" + obj.relId + " (" + obj.role2 + ":$" + obj.id2 + ");";
        !toInsert.includes(toPush) && toInsert.push(toPush);
    });
    return { toMatch, toDelete, toInsert };
}

//todo: da vedere
const updateAttributesString = (thingId, attributes) => {
    let toMatch = [];
    let toDelete = [];
    let toInsert = [];
    Object.entries(attributes).forEach(entry => {
        let key = entry[0];
        let value = entry[1];
        toMatch.push(" $" + thingId + " has " + key + " $" + key + ";");
        toDelete.push(" $" + thingId + " has $" + key + ";");
        if (isADate(value)) toInsert.push(" $" + thingId + " has " + key + " " + value.slice(0, value.length - 1) + ";");
        else typeof value !== 'string' ? toInsert.push(" $" + thingId + " has " + key + " " + value + ";") : toInsert.push(" $" + thingId + " has " + key + " '" + value + "'" + ";");
    })
    return { toMatch: toMatch, toDelete: toDelete, toInsert: toInsert };
}
//todo: da implementare
const updateAttributesOfAThing = async (thingId, attributes) => {
    const toMatchAdd = [getMatchQueryForAThing(thingId)];
    let toDeleteAdd = [" delete"];
    let toInsertAdd = [" insert"];
    let { toMatch, toDelete, toInsert } = updateAttributesString(thingId, attributes);
    toMatch = toMatchAdd.concat(toMatch);
    toDelete = toDeleteAdd.concat(toDelete);
    toInsert = toInsertAdd.concat(toInsert);
    console.log('toMatch part of query', toMatch);
    const query = toMatch.join("") + toDelete.join("") + toInsert.join("");
    console.log(query);
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    let result = [];
    try {
        const queryRes = await writeTransaction.query.update(query);
        result = await queryRes.collect();
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
    return result;
}

const updateFeaturesOfAThing = async (thingId, features) => {
    const toMatchAdd = [getMatchQueryForAThing(thingId)];
    let toDeleteAdd = [" delete"];
    let toInsertAdd = [" insert"];
    let { toMatch, toDelete, toInsert } = updateFeaturesString(thingId, features);
    toMatch = toMatchAdd.concat(toMatch);
    toDelete = toDeleteAdd.concat(toDelete);
    toInsert = toInsertAdd.concat(toInsert);
    const query = toMatch.join("") + toDelete.join("") + toInsert.join("");
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
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

const updateThing = async (thingId, attributes, features) => {
    const toMatch = [getMatchQueryForAThing(thingId)];
    let toDelete = [" delete"];
    let toInsert = [" insert"];
    let attributesPart = (attributes && Object.keys(attributes).length > 0)
        ? updateAttributesString(thingId, attributes) : [];
    console.log('attributesPart --> ', attributesPart);
    let featuresPart = (features && Object.keys(features).length > 0)
        ? updateFeaturesString(thingId, features) : [];
    console.log('featuresPart --> ', featuresPart);
    attributesPart.toMatch = toMatch.concat(attributesPart.toMatch);
    attributesPart.toDelete = toDelete.concat(attributesPart.toDelete);
    attributesPart.toInsert = toInsert.concat(attributesPart.toInsert);
    const realPart = {
        toMatch: attributesPart.toMatch.concat(featuresPart.toMatch),
        toDelete: attributesPart.toDelete.concat(featuresPart.toDelete),
        toInsert: attributesPart.toInsert.concat(featuresPart.toInsert)
    };
    console.log('real Part--> ', realPart);
    const query = realPart.toMatch.join("") + realPart.toDelete.join("") + realPart.toInsert.join("");
    console.log('real query--> ', query);
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    try {
        await writeTransaction.query.update(query);
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}

module.exports = { updateAttributesOfAThing, updateFeaturesOfAThing, updateThing }