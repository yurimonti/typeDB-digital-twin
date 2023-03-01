import {Attribute, Entity, TypeDBTransaction} from 'typedb-client';
import { ThingDTOClass } from './Thing';

/* module.exports = class JsonEntityConstructor {
    #entityType;
    #attributes;
    constructor(entity,attribute) {
      this.#entityType = entity._type._label._name;
      this.#attributes = {[attribute._type._label._name]:attribute._value};
    }

    get entityType(){
        return this.#entityType;
    }

    get attributes(){
        return this.#attributes;
    }

    createJson() {
        return {[this.entityType]:this.attributes}
    }
  }

 */
/**
 * 
 * @param {*} transaction TypeDBTransaction per asRemote
 * @param {*} thing Entity da parsare
 * @returns json object
 */
/* async function createJsonFromThing(transaction,thing) {
    const attributesCollection = await thing.asRemote(transaction).getHas(true).collect();
    const attributes = attributesCollection.map(a => a.asAttribute()).map(a => { return { [a.type._label._name]: a.value } });
    return { [thing.type._label._name]: { attributes: attributes } };
}

module.exports = {
    createJsonFromThing
} */

export async function createDTOFromEntity(transaction:TypeDBTransaction,thing:Entity) : Promise<ThingDTOClass> {
    const attributesCollection: Attribute[] = await thing.asRemote(transaction).getHas(true).collect();
    const attributes:any[] = attributesCollection.map(a => a.asAttribute()).map(a => { return { [a.type.label.name]: a.value } });
    let realAttribute:any = {};
    attributes.forEach(a => realAttribute = {...realAttribute,a});
    console.log(attributes);
    return new ThingDTOClass("ciao",realAttribute,{});
}