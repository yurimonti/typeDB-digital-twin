import {
  TypeDB,
  SessionType,
  TransactionType,
  TypeDBClient,
  TypeDBSession,
  TypeDBTransaction,
  Stream,
  ConceptMap,
  Entity,
} from "typedb-client";
import { createDTOFromEntity } from "./ThingDtoManager";
import { ThingDTOClass } from "./Thing";

const database = "API_ASSET#TYPEDB"; //inserire nome database

export async function getThings() {
  const client: TypeDBClient = TypeDB.coreClient("localhost:1729");
  const session: TypeDBSession = await client.session(
    database,
    SessionType.DATA
  );
  const readTransaction: TypeDBTransaction = await session.transaction(
    TransactionType.READ
  );
  //let answerStream = readTransaction.query.match("match $label isa label;$thingId isa thingId; $x isa digital-twin, has $label,has $thingId;get $x,$label,$thingId;");
  // Stream<ConceptMap>
  let answerStream: Stream<ConceptMap> = readTransaction.query.match(
    "match $x isa digital-twin;get $x;"
  );
  // ConceptMap[]
  const thingsConcepts: ConceptMap[] = await answerStream.collect();
  // Entity[]
  let things: Entity[] = thingsConcepts.map((t) => t.get("x").asEntity());
  let thingsArray: ThingDTOClass[] = [];
  for await (const thing of things) {
    const thingToAdd = await createDTOFromEntity(readTransaction, thing);
    thingsArray.push(thingToAdd);
  }
  /* 	const boh = await result.asRemote(readTransaction).getHas(true).collect();
	const attributes = boh.map(a => a.asAttribute()).map(a => { return { [a.type._label._name]: a.value } }); */

  /* const result = things.map(p => new JsonEntityConstructor(p.get('x'), p.get('a'))
		.createJson()); */

  /* 	const label = things.map(a => a.get("label").asAttribute()).map(a => { return { type: a.type._label._name, value: a.value } });//.map(v => v.iid);
		const id = things.map(a => a.get("thingId").asAttribute())//.map(v => v.iid);
		const dt = things.map(a => a.get('x')); */
  /* 	const result = {
			entities: dt,
			labels: label,
			ids: id
		}; */
  await readTransaction.close();
  // a session must always be closed
  await session.close();
  // a client must always be closed
  client.close();
  return thingsArray;
  //return result.map(r => { return { [r.type._label._name]: { attributes: attributes } } });
}

async function openSession(sessionType: SessionType) {
  const client = TypeDB.coreClient("localhost:1729");
  const session = await client.session(database, sessionType);
  // session is open
  return { client: client, session: session };
}

/*async function createTransactions (database) {
	const client = TypeDB.coreClient("localhost:1729");
	const session = await client.session(database, SessionType.DATA);

	// creating a write transaction
	const writeTransaction = await session.transaction(TransactionType.WRITE); // write transaction is open
	// to persist changes, write transaction must always be committed/closed
	await writeTransaction.commit();

	// creating a read transaction
	const readTransaction = await session.transaction(TransactionType.READ); // read transaction is open
	// read transaction must always be closed
	await readTransaction.close();
	// a session must always be closed
	await session.close();
	// a client must always be closed
	client.close();
} */

//openSession("prova");
//createTransactions("prova");
