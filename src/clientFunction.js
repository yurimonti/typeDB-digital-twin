const { TypeDB, SessionType,TransactionType } = require("typedb-client");

const databaseName = "prova"; //inserire nome database
const clientIP = "localhost:1729";   //inserire IP client

const openClient = ()=>{
    const client = TypeDB.coreClient(clientIP);
    return client;
}

const closeClient = async(client)=>{
    await client.close();
}

const openSession = async (client,isSchema)=>{
    const type = isSchema ? SessionType.SCHEMA : SessionType.DATA;
    const session = await client.session(databaseName, type);
    return session;
}

const closeSession = async (session) => {
    const isOpen = await session.isOpen();
    if(isOpen === true)
    await session.close();
}

const openTransaction = async (session,isWrite)=>{
    const type = isWrite ? TransactionType.WRITE : TransactionType.READ;
    const transaction = await session.transaction(type);
    return transaction;
}

const closeTransaction = async(transaction)=>{
    transaction.type === TransactionType.WRITE ? await transaction.commit() : await transaction.close();
}

const matchQuery = (transaction,query)=>{
    return transaction.query.match(query);
}

module.exports = {closeClient,closeSession,closeTransaction,openClient,openSession,openTransaction,matchQuery}