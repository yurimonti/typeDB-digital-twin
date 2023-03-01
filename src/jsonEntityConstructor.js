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
require("express");
/**
 * Crea json con tutti gli attributi e le feature delle things
 * @param {*} transaction TypeDBTransaction per asRemote
 * @param {*} thing Entity da parsare
 * @returns json object
 */
async function createJsonAllThing(transaction, thing) {
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

        const answerStream = transaction.query.match(
            "match $r iid " + thing.asRemote(transaction).asEntity().iid + ";$fr ($r, $y) isa relation, has attribute $t; get $fr;"
        );

        const relationConcept = await answerStream.collect();
        let relations = relationConcept.map((t) => t.get("fr").asRelation());
        let relationsArray = [];
        for await (const relation of relations) {
            const relToAdd = await createJsonOnlyIDRelation(transaction, relation);
            relationsArray.push(relToAdd);
        }
        return {[thing.type._label._name]: {attributes: attributes, features: relationsArray}};

    } catch (error) {
        console.log(error);
    }
}


async function extractAttributesAndRoles(relation, transaction) {
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
    return {attributes, playersByRoleType, players};
}

/**
 * Crea relazioni con solo l'id della thing
 * @param transaction
 * @param relation
 * @returns {Promise<{}>}
 */
async function createJsonOnlyIDRelation(transaction, relation) {
    try {
        const {attributes, playersByRoleType, players} = await extractAttributesAndRoles(relation, transaction);

        // with id attribute for each player
        for await (const [key, value] of playersByRoleType) {
            for (const element of value) {
                try {
                    const thing = await createJsonOnlyIDThing(
                        transaction,
                        element.asEntity()
                    );
                    players.push({[key._label._name]: thing});
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

/**
 * Crea json della thing con solo l'id
 * @param transaction
 * @param entity
 * @returns {Promise<{}>}
 */
async function createJsonOnlyIDThing(transaction, entity) {
    try {
        const attributesCollection = await entity
            .asRemote(transaction)
            .getHas(true)
            .collect();
        const name = attributesCollection
            .map((a) => a.asAttribute())
            .map((a) => {
                if (a.type._label._name === 'thingId' || a.type._label._name === 'personId') {
                    return {[a.type._label._name]: a.value};
                } else {
                    return null;
                }
            }).filter(value => value !== null);
        return {[entity.type._label._name]: name};
    } catch (error) {
        console.log(error);
    }
}

/**
 * Crea un json della thing con solo gli attributi
 * @param transaction
 * @param thing
 * @returns {Promise<{}>}
 */
async function createJsonFromThingAttributesOnly(transaction, thing) {
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
 * Crea un json delle relazioni
 * @param {*} transaction TypeDBTransaction per asRemote
 * @param {*} relation Entity da parsare
 * @returns json object
 */
async function createJsonAllRelation(transaction, relation) {
    try {
        const {attributes, playersByRoleType, players} = await extractAttributesAndRoles(relation, transaction);

        // with all attributes for each player
        for await (const [key, value] of playersByRoleType) {
            for (const element of value) {
                try {
                    const thing = await createJsonFromThingAttributesOnly(
                        transaction,
                        element.asEntity()
                    );
                    players.push({[key._label._name]: thing});
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
    createJsonAllThing,
    createJsonAllRelation,
};
