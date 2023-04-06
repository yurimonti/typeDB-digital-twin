const thingRepository = require('../repository/thingRepository');

const getThings = async () => {
    return await thingRepository.getAllThings();
}

const getAThing = async (id) => {
    const thing = await thingRepository.getThingById(id);
    if (Object.keys(thing).length <= 0) throw 'None Thing matches this thingId!!';
    return thing;
}

const createNewThing = async (thingToCreate) => {
    const isPresent = await thingRepository.aThingIsPresentById(thingToCreate?.thingId);
    if (isPresent) throw "Impossible to create this Thing: its thingId already exists!";
    if (!thingToCreate?.attributes?.category) throw "Category attribute required";
    if (!thingToCreate?.attributes?.typology) throw "Typology attribute required";
    await thingRepository.createAThing(thingToCreate);
}

//TODO: mettere che cancella ed inserisce attributi (tranne thingId,category e typology)
const updateAttributesOfAThing = async (thingId, attributes) => {
    const isPresent = await thingRepository.aThingIsPresentById(thingId);
    if (!isPresent) throw "Impossible to update: this Thing doesn't exist!";
    if (!attributes || Object.keys(attributes).length <=0) throw "Attributes are required..";
    if (attributes.thingId) throw "Is not possible to modify an id of a Thing!"
    if (attributes.category) throw "Is not possible to modify a category of a Thing";
    if (attributes.typology) throw "Is not possible to modify a typology of a Thing";

    const result = await thingRepository.updateAttributes(thingId, attributes);
    if (result.length <= 0) throw 'nothing updated or body contains unknown elements';
}

const updateThing = async (thingId, attributes, features) => {
    const isPresent = await thingRepository.aThingIsPresentById(thingId);
    if (!isPresent) throw "Impossible to update: this Thing doesn't exist!";
    if ((!attributes || Object.keys(attributes).length <= 0) && (!features || Object.keys(features).length <= 0))
        throw "Attributes or Features are required..";
    if (attributes?.thingId) throw "Is not possible to modify an id of a Thing!"
    if (attributes?.category) throw "Is not possible to modify a category of a Thing";
    if (attributes?.typology) throw "Is not possible to modify a typology of a Thing";
    await thingRepository.updateThing(thingId, attributes, features);
}

module.exports = {
    getAThing, getThings, createNewThing, updateThing
}