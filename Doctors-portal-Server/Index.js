const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bptoi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

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
    const doctorsCollection = client.db("doctor").collection("doctorDetails");
    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentsCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        doctorsCollection.find({ email: email })
            .toArray((err, doctor) => {
                const filter = { date: date.date }
                if (doctor.length === 0) {
                    filter.email = email;
                }
                appointmentsCollection.find(filter)
                    .toArray((err, docs) => {
                        res.send(docs)
                        console.log(docs);
                    })
            })
    })
    app.get('/appointments', (req, res) => {
        appointmentsCollection.find({})
            .toArray((err, docs) => {
                res.send(docs)
                console.log(docs);
            })
    })

    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
        
        // // save to my director
        // file.mv(`${__dirname}/doctors/${file.name}`, err => {
        //     if (err) {
        //         console.log(err);
        //         return res.status(500).send({ msg: 'Failed to upload Image' });
        //     }
        //     return res.send({ name: file.name, path: `/${file.name}` })
        // })

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        doctorsCollection.insertOne({ name, email, image })
            .then(result => {
                res.send(result.insertedCount > 1)
            })
    })

    app.get('/doctors', (req, res) => {
        doctorsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorsCollection.find({ email: email })
            .toArray((err, doctor) => {
                res.send(doctor.length > 0)
            })
    })

});

app.listen(process.env.PORT ||  port, () => {

    console.log(`Example app listening at http://localhost:${port}`)
})