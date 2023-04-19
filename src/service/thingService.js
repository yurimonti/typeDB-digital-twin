const thingRepository = require('../repository/thingRepository');

const getThings = async () => {
    return await thingRepository.getAllThings();
}

async function updateAttributeOfThing(thingId, attributes){
    let thing = await getAThing(thingId);
    let attributesToDelete={};
    let attributesBodyKey = Object.keys(attributes);
    if(!attributes && attributesBodyKey.length<=0) throw 'attributes not present in the body request or is empty!!'
    attributesBodyKey.forEach(toModifyKey => {
        if(thing?.attributes[toModifyKey]) attributesToDelete = {...attributesToDelete,[toModifyKey]:attributes[toModifyKey]};
    });
    if(Object.keys(attributesToDelete).length >0)await thingRepository.deleteThing(thingId,attributesToDelete);
    await thingRepository.updateThing(thingId,attributes,undefined,true);
}

//ToDo: da finire
async function updateFeaturesOfThing(thingId,features){
    let thing = await getAThing(thingId);
    const keysBody = Object.keys(features);
    let toDelete = {};
    let toAdd ={};
    keysBody.forEach(type => {
        if(thing.features[type]){
            const relIdType = Object.keys(features[type]);
            let toRemove = {};
            relIdType.forEach(relId => {
                if(thing.features[type][relId]){
                    let elementToRemove = thing.features[type][relId];
                    toRemove = {...toRemove,[relId]:elementToRemove};
                } else {
                    let elementToAdd = {[relId]:features[type][relId]}
                    toAdd = {...toAdd,[type]:elementToAdd};
                }
            });
            if(toRemove && Object.keys(toRemove).length >0) toDelete = {...toDelete,[type]:toRemove};
        }
        else toAdd = {...toAdd,[type]:features[type]};
    });
    if(Object.keys(toDelete).length >0) await thingRepository.deleteThing(thingId,undefined,toDelete);
    await thingRepository.updateThing(thingId,undefined,features,true);
    /* return {toPush:toAdd,toDel:toDelete}; */
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
/* const updateAttributesOfAThing = async (thingId, attributes) => {
    const isPresent = await thingRepository.aThingIsPresentById(thingId);
    if (!isPresent) throw "Impossible to update: this Thing doesn't exist!";
    if (!attributes || Object.keys(attributes).length <=0) throw "Attributes are required..";
    if (attributes.thingId) throw "Is not possible to modify an id of a Thing!"
    if (attributes.category) throw "Is not possible to modify a category of a Thing";
    if (attributes.typology) throw "Is not possible to modify a typology of a Thing";

    const result = await thingRepository.updateAttributes(thingId, attributes);
    if (result.length <= 0) throw 'nothing updated or body contains unknown elements';
} */

const updateThing = async (thingId, attributes, features) => {
    const isPresent = await thingRepository.aThingIsPresentById(thingId);
    if (!isPresent) throw "Impossible to update: this Thing doesn't exist!";
    if ((!attributes || Object.keys(attributes).length <= 0) && (!features || Object.keys(features).length <= 0))
        throw "Attributes or Features are required..";
    if (attributes?.thingId) throw "Is not possible to modify an id of a Thing!"
    if (attributes?.category) throw "Is not possible to modify a category of a Thing";
    if (attributes?.typology) throw "Is not possible to modify a typology of a Thing";
    await thingRepository.updateThing(thingId, attributes, features,false);
}

const addToThing = async (thingId,attributes,features) =>{
    const isPresent = await thingRepository.aThingIsPresentById(thingId);
    if (!isPresent) throw "Impossible to update: this Thing doesn't exist!";
    if ((!attributes || Object.keys(attributes).length <= 0) && (!features || Object.keys(features).length <= 0))
        throw "Attributes or Features are required..";
        if (attributes?.thingId) throw "Is not possible to modify an id of a Thing!"
    if (attributes?.category) throw "Is not possible to modify a category of a Thing";
    if (attributes?.typology) throw "Is not possible to modify a typology of a Thing";
    //controllare
    await thingRepository.updateThing(thingId,attributes,features,true);
}

const deleteAttributes = async (thingId)=>{
    if(!thingId) throw "Id of thing required";
    const isPresent = await thingRepository.aThingIsPresentById(thingId);
    if(!isPresent) throw "Impossible to delete: this Thing doesn't exist!";
    await thingRepository.deleteThing(thingId,null);
}

const deleteFutures = async (thingId)=>{
    if(!thingId) throw "Id of thing required";
    const isPresent = await thingRepository.aThingIsPresentById(thingId);
    if(!isPresent) throw "Impossible to delete: this Thing doesn't exist!";
    await thingRepository.deleteThing(thingId,undefined,null);
}

const deleteThing = async (thingId) => {
    if(!thingId) throw "Id of thing required";
    const isPresent = await thingRepository.aThingIsPresentById(thingId);
    if(!isPresent) throw "Impossible to delete: this Thing doesn't exist!";
    await thingRepository.deleteThing(thingId);
}

module.exports = {
    getAThing, getThings, createNewThing, updateThing,deleteAttributes,deleteFutures,deleteThing,addToThing,updateAttributeOfThing,updateFeaturesOfThing
}