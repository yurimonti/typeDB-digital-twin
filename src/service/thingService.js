const thingRepository = require('../repository/thingRepository');

const getThings = async ()=>{
    return await thingRepository.getAllThings();
}

const getAThing = async (id)=>{
    const thing = await thingRepository.getThingById(id);
    if(Object.keys(thing).length <= 0) throw 'None Thing matches this thingId!!';
    return thing;
}

const createNewThing = async (thingToCreate)=>{
    if(!thingToCreate.attributes.category) throw "Category attribute required";
    if(!thingToCreate.attributes.typology) throw "Typology attribute required";
    const isPresent = await thingRepository.aThingIsPresentById(thingToCreate?.thingId);
    if(isPresent) throw "Impossible to create this Thing: its thingId already exists!"
    await thingRepository.createAThing(thingToCreate);
}

module.exports = {
    getAThing,getThings,createNewThing
}