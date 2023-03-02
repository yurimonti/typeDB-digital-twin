const { openClient, closeClient, closeSession, closeTransaction, openSession, openTransaction, matchQuery } = require("../clientFunction");

const getAllEntity = async (session) => {
    const transaction = await openTransaction(session);
    const answerStream = matchQuery(transaction, 'match $x isa digital-twin;get $x;');
    const conceptCollection = await answerStream.collect();
    const result = conceptCollection.map(conceptMap => conceptMap.get('x'));
    //const result = conceptCollection.map(e => e.get('x').asEntity());
    return {result:result,transaction:transaction};
}

const conceptsCollect = async(features,transaction)=>{
    let result = [];
    for (const feature of features){
        const attributesCollection = await feature
            .asRemote(transaction)
            .getHas(true)
            .collect();
        const attributes = attributesCollection
            .map((a) => a.asAttribute())
            .map((a) => {
                return { [a.type._label._name]: a.value };
            });
        result = attributes;
        /* const playersByRoleType = await feature
            .asRemote(transaction)
            .getPlayersByRoleType(); */
    } return result;
}

const getEntities = async () => {
    const client = openClient();
    const session = await openSession(client);
    const aResult = await getAllEntity(session);
    const allThings = aResult.result;
    const toClose = aResult.transaction;
    const transaction = await openTransaction(session);
    let things = [];
    for (const thing of allThings) {
        const answerStream = matchQuery(transaction, 'match $x iid ' + thing.iid + ', has attribute $a; $rel ($x,$y) isa relation, has attribute $b; get $rel,$x,$a;');
        const concepts = await answerStream.collect();
        const attributes = concepts.map(a => a.get('a')).map(a => {return {[a.type.label.name]:a.value}});
        const features = concepts.map(f => f.get('rel'));
        const boh = await conceptsCollect(features,transaction);
        things.push({thing:thing.type.label.name,attributes:attributes,features:boh});
    }
    await closeTransaction(toClose);
    /* const transaction = await openTransaction(session);
    const answerStream = matchQuery(transaction, 'match $x isa digital-twin; $rel ($x,$y) isa relation, has attribute $a; get $rel,$x;'); */
    /*const answerCollection = await answerStream.collect();
    const things = answerCollection.map((t) => t.get("x").asEntity());
    let result = [];
    for (const thing of things){
        const boh1 = await thing.asRemote(transaction).getHas(true).collect()
        const boh = boh1.map(a => a.asAttribute());
        const attributes = boh.map(a => {return{[a.type.label.name]:a.value}});
        result.push({thingId:thing.type.label.name,attributes:attributes});
    }*/
    await closeTransaction(transaction);
    await closeSession(session);
    await closeClient(client);
    return things;
}

module.exports = { getEntities }