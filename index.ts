import express, { Express, Request, Response } from 'express';
import { getThings } from './src/dbconfig';
import dotenv from 'dotenv'

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.get('/',(req:Request,res:Response)=>{
    res.send("Hello World!!");
})

app.get('/things',async (req:Request,res:Response)=>{
    res.send(await getThings());
})

app.get("/allPersons",async (req:Request,res:Response)=>{
    /* const clientAndSession = await typeDB.openSession(SessionType.DATA);
    const readTransaction = await typeDB.createTransaction(clientAndSession.session,TransactionType.READ);
    const query = await readTransaction.query.match("match $x isa person; get $x;");
    const persons = await query.collect();
    const result = await persons.map(person => person.get("x"));
    res.send(result); */
    //res.send(await typeDB.runBasicQueries());
    
})


app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`);
})