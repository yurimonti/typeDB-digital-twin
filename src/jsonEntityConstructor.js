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
        const answerStream = transaction.query.match(
            "match $r iid " + thing.asRemote(transaction).asEntity().iid + ";$fr ($r, $y) isa relation, has attribute $t; get $fr;"
        );
        const relationConcept = await answerStream.collect();
        let relations = relationConcept.map((t) => t.get("fr").asRelation());
        let relationsArray = [];
        for (const relation of relations) {
            const relToAdd = await createJsonFromRelation(transaction, relation);
            relationsArray.push(relToAdd);
        }
        return { [thing.type._label._name]: { attributes: attributes, features: relationsArray } };
        /*         const attributes = attributesCollection
                    .map((a) => a.asAttribute())
                    .map((a) => {
                        return { [a.type._label._name]: a.value };
                    });
                return { [thing.type._label._name]: { attributes: attributes } }; */
    } catch (error) {
        console.log(error);
    }
}

async function createJsonFromCompleteThing(transaction, thing) {
    try {
        /* const attributesCollection = await thing
            .asRemote(transaction)
            .getHas(true)
            .collect();
        const attributes = attributesCollection
            .map((a) => a.asAttribute())
            .map((a) => {
                return { [a.type._label._name]: a.value };
            }); */
        const featuresCollection = await thing
            .asRemote(transaction)
            .getHas(true)
            .collect();
        const features = featuresCollection
            /* .map(f => f.asRelation()) */
            .map(f => {
                return { [f.type._label._name]: f };
            });
        return features/* { [thing.type._label._name]: { attributes: attributes,features: features } } */;
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
                return { [a.type._label._name]: a.value };
            });

        const playersByRoleType = await relation
            .asRemote(transaction)
            .getPlayersByRoleType();
        const players = [];
        // with all attributes for each player
        for await (const [key, value] of playersByRoleType) {
            for (const element of value) {
                try {
                    const thing = await createJsonFromThing(
                        transaction,
                        element.asEntity()
                    );
                    players.push({ [key._label._name]: thing });
                    //push only the thingId for a logic entity example
                    // players.push({ [key._label._name]: thing.logic.attributes[1].thingId });
                } catch (error) {
                    console.log(error);
                }
            }
        }
        return {
            [relation.type._label._name]: { attributes: attributes, roles: players },
        };
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    createJsonFromThing,
    createJsonFromRelation,
    createJsonFromCompleteThing
};
