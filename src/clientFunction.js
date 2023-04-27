const { TypeDB, SessionType,TransactionType,TypeDBOptions } = require("typedb-client");

const databaseName = "API_ASSET#TYPEDB"; //database name
const clientIP = "localhost:1729";   //IP client

/**
 * Opens a client with an IP address
 * @returns a client
 */
const openClient = ()=>{
    return TypeDB.coreClient(clientIP);
}

/**
 * Close a client with an IP address
 * @param client client to close
 * @returns {Promise<void>}
 */
const closeClient = async(client)=>{
    await client.close();
}

/**
 * Initialise a session, of a given type, for typedb. It will be associated with the passed client.
 *
 * @param client client that wants to connect to typedb and to which the session will be associated
 * @param isSchema boolean variable which, if true, indicates a change of scheme (SessionType.Schema), otherwise indicates a change of data (SessionType.Data)
 * @returns {Promise<*>} a Promise that represents a session for typedb
 */
const openSession = async (client,isSchema = false)=>{
    const type = isSchema ? SessionType.SCHEMA : SessionType.DATA;
    return await client.session(databaseName, type);
}

/**
 * Closes a session for a typedb server. If it is already closed, nothing will happen and the method will stop.
 *
 * @param session session to be closed
 * @returns {Promise<void>} a Promise that represents the end of the method execution
 */
const closeSession = async (session) => {
    const isOpen = await session.isOpen();
    if(isOpen === true)
    await session.close();
}

/**
 * Initialise a transaction, of a given type, for typedb. It will be associated to the passed session.
 *
 * @param session session that will be associated to the transaction
 * @param isWrite boolean variable which, if true, indicates a write operation to the db (TransactionType.WRITE), otherwise indicates a read from the db (TransactionType.READ)
 * @returns {Promise<*>} a Promise that represents a transaction for typedb
 */
const openTransaction = async (session,isWrite = false)=>{
    const type = isWrite ? TransactionType.WRITE : TransactionType.READ;
    const options = TypeDBOptions.core({infer:true});
    return isWrite ? session.transaction(type) : await session.transaction(type, options);
}

/**
 * Closes a transaction for a typedb server, based on the transaction's type (that can be TransactionType.WRITE or TransactionType.READ).
 *
 * @param transaction transaction to be closed
 * @returns {Promise<void>} a Promise that represents the end of the method execution
 */
const closeTransaction = async(transaction)=>{
    transaction.type === TransactionType.WRITE ? await transaction.commit() : await transaction.close();
}

/**
 * Performs a query with match in a transaction
 * @param transaction transaction in which the query is run
 * @param query query to run
 * @returns {*} result of the match query
 */
const matchQuery = (transaction,query)=>{
    return transaction.query.match(query);
}

module.exports = {closeClient,closeSession,closeTransaction,openClient,openSession,openTransaction,matchQuery}