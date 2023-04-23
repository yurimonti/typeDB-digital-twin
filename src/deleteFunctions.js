const clientFunction = require('./clientFunction');
const queryUtils = require('./queryUtils');


async function deleteThing(thingId) {
    console.log('entrato elimina tutto');
    const client = await clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const delTransaction = await clientFunction.openTransaction(session, true);
    try {
        await delTransaction.query.delete(queryUtils.getDeleteThingQuery(thingId));
    } catch (error) {
        await delTransaction.rollback();
        console.log(error);
    } finally {
        await delTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}

async function deleteAttributes(thingId,attributes) {
    console.log('entrato elimina attributi');
    const query = queryUtils.deleteAttributeQuery(thingId,attributes);
    console.log(query);
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    try {
        await writeTransaction.query.delete(query);
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}

async function deleteFeatures(thingId,features) {
    console.log('entrato elimina feature');
    const query = queryUtils.deleteFeaturesQuery(thingId,features);
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    try {
        await writeTransaction.query.delete(query);
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
}

async function deleteAnAttribute(thingId,attribute){
    const query = queryUtils.deleteFeaturesQuery(thingId);
    const client = clientFunction.openClient();
    const session = await clientFunction.openSession(client);
    const writeTransaction = await clientFunction.openTransaction(session, true);
    try {
        await writeTransaction.query.delete(query);
    } catch (error) {
        await writeTransaction.rollback();
        console.log(error);
    } finally {
        await writeTransaction.commit();
        await clientFunction.closeSession(session);
        await clientFunction.closeClient(client);
    }
//gre

    await connection.closeConnection(conn);
    return answer;
//
}


module.exports = {
    deleteThing,
    deleteAttributes,
    deleteFeatures

};