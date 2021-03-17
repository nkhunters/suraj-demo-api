require('./models/User');

const express = require("express");
var cors = require('cors')

const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const path = require('path');

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const bodyParser = require('body-parser');
const requireAuth = require('./middlewares/requireAuth');

const app = express();

var publicDir = path.join(__dirname, '/uploads');
app.use(express.static(publicDir));


app.use(cors());
app.use(bodyParser.json());
app.use(authRoutes);

app.use(express.static(path.join(__dirname, '../client/build')))

//const mongoUri = `mongodb+srv://nkhunters:qwertyniraj2109@cluster0-6lvny.mongodb.net/test?retryWrites=true&w=majority`;
const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gayw6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

mongoose.connection.on('connected', () => {

    console.log("connected to mongo instance");
});

mongoose.connection.on('error', (err) => {

    console.log(" error connecting to mongo instance " + err);
});


app.get('*', (req, res) => {

    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
});

app.get('/uploads/:image', (req, res) => {
    res.sendFile(publicDir + "/" + req.params.image);
});

app.listen(process.env.PORT || 8080, () => {
    console.log("Listening on port 8080");
});

