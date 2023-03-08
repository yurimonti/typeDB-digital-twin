const express = require("express");
const typeDB = require("./src/dbconfig");
const { TypeDB, SessionType, TransactionType } = require("typedb-client");
const app = express();
const port = 3030;

const newMessage = (type,message)=>{
    return {[type]:message};
}

app.get('/', async(req, res) => {
    /* const payload = '{"person":{"attributes":[{"thingId":"mario_rossi"},{"label":"Mario Rossi"},{"tipology":"department_director"}],"features":[{"reference":{"attributes":[{"relationId":"department_ref2"}],"roles":[{"referent":{"person":[{"thingId":"mario_rossi"}]}},{"referenced":{"space":[{"thingId":"polo_ludovici_a"}]}}]}},{"reference":{"attributes":[{"relationId":"department_ref"}],"roles":[{"referent":{"person":[{"thingId":"mario_rossi"}]}},{"referenced":{"space":[{"thingId":"polo_ludovici_b"}]}}]}}]}}'
    const parsed = JSON.parse(payload);
    res.send(typeDB.createThing(parsed) *//* .toString() *//* ); */
    //res.send("Hello World!!");
    res.send(await typeDB.metodoProva('camerino'));
})

app.get('/things', async (req, res) => {
    res.send(await typeDB.getThings());
})

/* app.post('things',async (req,res)=>{
    const body = req.body;
    try {
        const newThing = await typeDB.createThing(body);
        res.send(newThing);
    } catch (error) {
        res.sendStatus(400).send(newMessage('error','impossible to create this thing'));
    }
}) */

app.get('/things/:thingId', async (req, res) => {
    const {thingId} = req.params;
    res.send(await typeDB.prova2(thingId));
})

app.get("/relations", async (req, res) => {
    res.send(await typeDB.getRelations());
});

app.delete("/deleteThing", async (req, res) => {
    try {
        await typeDB.deleteThing(req.query);
        res.send({ success: 'successo' });
    } catch (error) {
        res.sendStatus(400)
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})