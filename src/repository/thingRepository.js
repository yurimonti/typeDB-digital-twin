const getFunctions = require('../getFunctions.js');
const postFunctions = require('../postFunctions.js');
const updateFunctions = require('../updateFunctions.js');

const getAllThings = async()=>{
    return await getFunctions.getThings();
}

const aThingIsPresentById = async (id)=>{
    const ids = await getFunctions.getAllThingId();
    return ids.includes(id);
}

const getThingById = async(thingId)=>{
    return await getFunctions.getAThing(thingId);
}

const createAThing = async (thingToCreate) => {
    return await postFunctions.createThing(thingToCreate);
}

const updateThing = async (thingId,attributes,features)=>{
    await updateFunctions.updateThing(thingId,attributes,features);
}

module.exports = { getAllThings,getThingById,createAThing,aThingIsPresentById,updateThing }