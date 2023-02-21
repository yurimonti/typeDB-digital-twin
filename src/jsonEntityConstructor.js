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
    try {
        const attributesCollection = await thing
            .asRemote(transaction)
            .getHas(true)
            .collect();
        const attributes = attributesCollection
            .map((a) => a.asAttribute())
            .map((a) => {
                return {[a.type._label._name]: a.value};
            });
        return {[thing.type._label._name]: {attributes: attributes}};
    } catch (error) {
        console.log(error);
    }
}

/**
 *
 * @param {*} transaction TypeDBTransaction per asRemote
 * @param {*} relation Entity da parsare
 * @returns json object
 */
async function createJsonFromRelation(transaction, relation) {
    try {
        const attributesCollection = await relation
            .asRemote(transaction)
            .getHas(true)
            .collect();
        const attributes = attributesCollection
            .map((a) => a.asAttribute())
            .map((a) => {
                return {[a.type._label._name]: a.value};
            });

        const playersByRoleType = await relation
            .asRemote(transaction)
            .getPlayersByRoleType();
        const players = [];

        // with iid and all attributes for each player
        // for await (const [key, value] of playersByRoleType) {
        //   value.forEach(async (element) => {
        //     try {
        //       const thing = await createJsonFromThing(
        //         transaction,
        //         element.asEntity()
        //       );
        //       players.push({ [key._label._name]: element.asEntity().iid, thing });
        //     } catch (error) {
        //        console.log("error");
        //     }
        //   });
        // }


        // with all attributes for each player
        for await (const [key, value] of playersByRoleType) {
            for (const element of value) {
                try {
                    const thing = await createJsonFromThing(
                        transaction,
                        element.asEntity()
                    );
                    players.push({[key._label._name]: thing});
                    //push only the thingId for a logic entity example
                    // players.push({ [key._label._name]: thing.logic.attributes[1].thingId });
                } catch (error) {
                    console.log(error);
                }
            }
        }
        return {
            [relation.type._label._name]: {attributes: attributes, roles: players},
        };
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    createJsonFromThing,
    createJsonFromRelation,
};
