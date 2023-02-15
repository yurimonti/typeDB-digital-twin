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
async function createJsonFromThing(transaction, thing) {
  const attributesCollection = await thing
    .asRemote(transaction)
    .getHas(true)
    .collect();
  const attributes = attributesCollection
    .map((a) => a.asAttribute())
    .map((a) => {
      return { [a.type._label._name]: a.value };
    });
  return { [thing.type._label._name]: { attributes: attributes } };
}

/**
 *
 * @param {*} transaction TypeDBTransaction per asRemote
 * @param {*} relation Entity da parsare
 * @returns json object
 */
async function createJsonFromRelation(transaction, relation) {
  const attributesCollection = await relation
    .asRemote(transaction)
    .getHas(true)
    .collect();
  const attributes = attributesCollection
    .map((a) => a.asAttribute())
    .map((a) => {
      return { [a.type._label._name]: a.value };
    });

  const playersByRoleType = await relation
    .asRemote(transaction)
    .getPlayersByRoleType();
  const players = [];
  for (const [key, value] of playersByRoleType) {
    value.forEach((element) => {
      let entity = element.asEntity().iid;
      players.push({ [key._label._name]: entity });
    });
  }
  //  console.log(players);

  return {
    [relation.type._label._name]: { attributes: attributes, roles: players },
  };
}

module.exports = {
  createJsonFromThing,
  createJsonFromRelation,
};
