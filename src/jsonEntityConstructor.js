
require("express");



/**
 * Creates a json object with all the attributes and the features of a particular thing.
 *
 * @param {*} transaction typedb transaction for asRemote method
 * @param {*} thing thing to be parsed
 * @returns a {@link Promise} that represents a json object
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
                return { [a.type._label._name]: a.value };
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

/**
 * Extracts and creates an array with attributes and roles.
 *
 * @param relation relation that owns attributes and roles
 * @param transaction typedb transaction for asRemote method
 * @returns {Promise<{playersByRoleType: Map<RoleType, Thing[]>, players: *[], attributes: {}[]}>} a {@link Promise}
 * that represents an object with attributes and roles
 */
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
 * Creates a json object with relations starting from an id of a particular thing.
 *
 * @param transaction typedb transaction
 * @param relation relation to be parsed
 * @returns {Promise<{}>} a {@link Promise} that represents a json object
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


async function extractAttributesAndRoles(relation, transaction) {
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
    return { attributes, playersByRoleType, players };
}

/**

 * Creates a json object of a thing with only its id.
 *
 * @param transaction typedb transaction
 * @param entity thing to be parsed
 * @returns {Promise<{}>} a {@link Promise} that represents a json object
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
                if (a.type._label._name === 'thingId') {
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
 * Creates a json object of a thing starting with only its attributes.
 *
 * @param transaction typedb transaction
 * @param thing thing to be parsed
 * @returns {Promise<{}>} a {@link Promise} that represents a json object
 */
async function createJsonFromThingAttributesOnly(transaction, thing) {
    try {
        const attributesCollection = await thing
            .asRemote(transaction)
            .getHas(true)
            .collect();
        const name = attributesCollection
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

 * Creates a json object representing s set of relations.
 *
 * @param {*} transaction typedb transaction for asRemote method
 * @param {*} relation entity to be parsed
 * @returns {Promise<{}>} a {@link Promise} that represents a json object
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
            [relation.type._label._name]: { attributes: attributes, roles: players },
        };
    } catch (error) {
        console.log(error);
    }
}

function getAttributesFromAConceptGroup(aConceptGroup) {
    let attributes = {};
    aConceptGroup.forEach(c => {
        const label = attributes[c.attribute.label];
        if (label === undefined) attributes = {
            ...attributes,
            [c.attribute.label]: c.attribute.value
        }
    });
    return attributes;
}

function getRelationsFromAConceptGroup(aConceptGroup,thingId) {
    let features = {};
    aConceptGroup.forEach(c => {
        if (features[c.relation.label] === undefined) features = {
            ...features,
            [c.relation.label]: {
                [c.relation.id]: {
                    [c.roles.from]: thingId,
                    [c.roles.to]: c.related
                }
            }
        }
        else {
            const label = features[c.relation.label];
            if (label[c.relation.id] === undefined) {
                features[c.relation.label] = {
                    ...label,
                    [c.relation.id]: {
                        [c.roles.from]: thingId,
                        [c.roles.to]: c.related
                    }
                };
                //console.log(features);
            }
        }
    });
    return features;
}

module.exports = {
    createJsonAllThing,
    createJsonAllRelation,
};
