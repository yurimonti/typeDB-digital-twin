const { TypeDB, SessionType,TransactionType } = require("typedb-client");

const configurator = {
    serverIP: "localhost:1729", //inserire IP server
    dbName: "API_ASSET#TYPEDB"       //inserire nome database
}


/**
 * Opens a connection with a typedb server initializing client, session and transaction parameters.
 *
 * @param isSchema variable that's true if the db schema is to be modified, false if the data is to be modified
 * @param isWrite variable that's true if a write to the db is needed, false if a read from the db is needed
 * @returns {Promise<{sessionRef, clientRef, transactionRef}>} a Promise that represents a Json object which contains references to client, session and transaction
 */
const openConnection = async (isSchema, isWrite) => {
    const client = TypeDB.coreClient(configurator.serverIP);
    const session = await openSession(client, isSchema);
    const transaction = await openTransaction(session, isWrite);

    return createConnJson(client, session, transaction);
}

/**
 * Initialise a session, of a given type, for typedb. It will be associated with the passed client.
 *
 * @param client client that wants to connect to typedb and to which the session will be associated
 * @param isSchema boolean variable which, if true, indicates a change of scheme (SessionType.Schema), otherwise indicates a change of data (SessionType.Data)
 * @returns {Promise<*>} a Promise that represents a session for typedb
 */
const openSession = async (client, isSchema) => {
    const sessionType = isSchema===true ? SessionType.SCHEMA : SessionType.DATA;
    return await client.session(configurator.dbName, sessionType);
}

/**
 * Initialise a transaction, of a given type, for typedb. It will be associated to the passed session.
 *
 * @param session session that will be associated to the transaction
 * @param isWrite boolean variable which, if true, indicates a write to the db (TransactionType.WRITE), otherwise indicates a read from the db (TransactionType.READ)
 * @returns {Promise<*>} a Promise that represents a transaction for typedb
 */
const openTransaction = async (session, isWrite) => {
    const transactionType = isWrite===true ? TransactionType.WRITE : TransactionType.READ;
    return await session.transaction(transactionType);
}

/**
 * Creates a Json object that represents a connection to typedb.
 *
 * @param client client reference
 * @param session session reference
 * @param transaction transaction reference
 * @returns {{sessionRef, clientRef, transactionRef}} a Json object with client, session and transaction references for the connection to a typedb server
 */
const createConnJson = (client, session, transaction) => {
    return {
        clientRef: client,
        sessionRef: session,
        transactionRef: transaction
    };
}


/**
 * Closes a connection to a typedb server.
 *
 * @param conn Json object that must contains, in order, references to client, session and transaction
 * @returns {Promise<void>} a Promise that represents the end of the method execution
 */
const closeConnection = async (conn) => {
    await closeTransaction(conn.transactionRef);
    await closeSession(conn.sessionRef);
    await closeClient(conn.clientRef);
}

/**
 * Closes a client for a typedb server. If it is already closed, nothing will happen and the method will stop.
 *
 * @param client client to be closed
 * @returns {Promise<void>} a Promise that represents the end of the method execution
 */
const closeClient = async (client) => {
    const isOpen = await client.isOpen();
    if(isOpen === true) await client.close();
}

/**
 * Closes a session for a typedb server. If it is already closed, nothing will happen and the method will stop.
 *
 * @param session session to be closed
 * @returns {Promise<void>} a Promise that represents the end of the method execution
 */
const closeSession = async (session) => {
    const isOpen = await session.isOpen();
    if(isOpen === true) await session.close() //: throw "Session '" + session.id + "' already closed.";
}

/**
 * Closes a transaction for a typedb server, based on the transaction's type (that can be TransactionType.WRITE or TransactionType.READ).
 *
 * @param transaction transaction to be closed
 * @returns {Promise<void>} a Promise that represents the end of the method execution
 */
const closeTransaction = async (transaction) => {
    const isOpen = await transaction.isOpen();
    if(isOpen === true) transaction.type === TransactionType.WRITE ? await transaction.commit() : await transaction.close();
}


/**
 *
 * @param transaction
 * @param query
 * @returns {*}
 */
const matchQuery = (transaction,query) => {
    return transaction.query.match(query);
}


module.exports = {openConnection, closeConnection, matchQuery}
//module.exports = {closeClient,closeSession,closeTransaction,openClient,openSession,openTransaction,matchQuery}