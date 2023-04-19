const getFunctions = require('../getFunctions.js');
const postFunctions = require('../postFunctions.js');
const updateFunctions = require('../updateFunctions.js');
const deleteFunctions = require('../deleteFunctions.js');

const getAllThings = async () => {
    return await getFunctions.getThings();
}

const aThingIsPresentById = async (id) => {
    const ids = await getFunctions.getAllThingId();
    return ids.includes(id);
}

const getThingById = async (thingId) => {
    return await getFunctions.getAThing(thingId);
}

const createAThing = async (thingToCreate) => {
    return await postFunctions.createThing(thingToCreate);
}

const updateThing = async (thingId, attributes, features, isToAdd) => {
    if (isToAdd) {
        await postFunctions.addToAThing(thingId, attributes, features);//FIXME:prima elimina gli attributi specifici, poi li aggiunge
    }
    else await updateFunctions.updateThing(thingId, attributes, features);
}

const deleteThing = async (thingId, attributes, features) => {
    console.log({thingId:thingId,attributes:attributes,features:features});
    if (attributes === undefined && features === undefined) await deleteFunctions.deleteThing(thingId);
    if (attributes !== undefined) await deleteFunctions.deleteAttributes(thingId,attributes);
    if (features !== undefined) await deleteFunctions.deleteFeatures(thingId,features);
}

module.exports = { deleteThing, getAllThings, getThingById, createAThing, aThingIsPresentById, updateThing }