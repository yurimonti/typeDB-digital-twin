const express = require("express");
const typeDB = require("./src/dbconfig");
const { TypeDB, SessionType, TransactionType } = require("typedb-client");
const { getEntities } =  require("./src/repository/thingRepository");
const app = express();
const port = 3030;

app.get('/',async(req,res)=>{
    res.send(await getEntities());
    /* res.send("Hello World!!"); */
})

app.get('/things',async (req,res)=>{
    res.send(await typeDB.getThings());
})

app.get("/relations", async (req, res) => {
  res.send(await typeDB.getRelations());
});

app.get("/people", async (req, res) => {
  res.send(await typeDB.getPeople());
});

app.delete("/deleteThing", async (req, res) => {
    res.send(await typeDB.deleteThing(req.query));
});

app.get("/allPersons",async (req,res)=>{
    /* const clientAndSession = await typeDB.openSession(SessionType.DATA);
    const readTransaction = await typeDB.createTransaction(clientAndSession.session,TransactionType.READ);
    const query = await readTransaction.query.match("match $x isa person; get $x;");
    const persons = await query.collect();
    const result = await persons.map(person => person.get("x"));
    res.send(result); */
    res.send(await typeDB.runBasicQueries());
    
})


app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`);
})