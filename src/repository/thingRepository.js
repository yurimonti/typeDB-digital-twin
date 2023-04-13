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
        postFunctions.addToAThing(thingId, attributes, features);//FIXME:prima elimina gli attributi specifici, poi li aggiunge
    }
    else await updateFunctions.updateThing(thingId, attributes, features);
}

const deleteThing = async (thingId, attributes, features) => {
    if (!attributes && !features) deleteFunctions.deleteThing(thingId);
    if (attributes) deleteFunctions.deleteAttributes(thingId);
    if (features) deleteFunctions.deleteFeatures(thingId);
}

module.exports = { deleteThing, getAllThings, getThingById, createAThing, aThingIsPresentById, updateThing }