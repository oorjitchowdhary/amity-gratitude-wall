require('dotenv').config();
const express = require('express');
const path = require('path');
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_KEY });
const needle = require('needle');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/static'));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', (req, res) => {
    console.log(req.body);
    res.send('done');
});

app.listen(PORT, console.log(`Listening on port ${PORT}.`));