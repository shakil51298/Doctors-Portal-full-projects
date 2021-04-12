const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = "mongodb+srv://shakil51298:Webdeveloper21mongo@cluster0.bptoi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());
const port = 5000


app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentsCollection = client.db("doctorsPortal").collection("appointments");
    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentsCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        console.log(date);
        appointmentsCollection.find({ date: date.date })
            .toArray((err, docs) => {
                res.send(docs)
                console.log(docs);
            })
    })
    app.get('/appointments', (req, res) => {
        appointmentsCollection.find({})
            .toArray((err, docs) => {
                res.send(docs)
                console.log(docs);
            })
    })

});






app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})