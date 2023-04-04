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
    const isPresent = await thingRepository.aThingIsPresentById(thingToCreate?.thingId);
    if(isPresent) throw "Impossible to create this Thing: its thingId already exists!";
    if(!thingToCreate?.attributes?.category) throw "Category attribute required";
    if(!thingToCreate?.attributes?.typology) throw "Typology attribute required";
    await thingRepository.createAThing(thingToCreate);
}

const updateAttributesOfAThing = async (thingId,attributes)=>{
    const isPresent = await thingRepository.aThingIsPresentById(thingId);
    if(!isPresent) throw "Impossible to update: this Thing doesn't exist!";
    if(!attributes) throw "Attributes are required..";
    if(attributes.category) throw "Is not possible to modify a category of a Thing";
    if(attributes.typology) throw "Is not possible to modify a typology of a Thing";
    await thingRepository.updateThing(thingId,attributes);
}

module.exports = {
    getAThing,getThings,createNewThing,updateAttributesOfAThing
}