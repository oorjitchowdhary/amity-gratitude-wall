require('dotenv').config();
const express = require('express');
const path = require('path');
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_KEY });
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;
const databaseId = process.env.NOTION_DATABASE;
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/static'));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    const database = await notion.databases.query({
        database_id: databaseId,
        filter: {
            "property": "approved",
            "checkbox": {
                "equals": true
            }
        }
    });

    let wall = [];

    database.results.forEach(async (page) => {
        let gratitude = [];
        const pageId = page.id;
        const pageProperties = page.properties;
        for (const property in pageProperties) {
            const propertyValue = await notion.pages.properties.retrieve({ page_id: pageId, property_id: pageProperties[property].id });
            if (propertyValue.type === 'select') {
                gratitude.push(propertyValue.select.color, propertyValue.select.name);
            } else if ('results' in propertyValue) {
                try {
                    gratitude.push(propertyValue.results[0].rich_text.plain_text);
                } catch (e) {
                    gratitude.push(propertyValue.results[0].title.plain_text);
                }
            }
        }

        console.log(gratitude);
    });

    console.log(wall);

    res.render('index', { wall: wall });
});

app.post('/', async (req, res) => {
    const properties = {
        email: {
            title: [{
                text: { content: req.body.email }
            }]
        },
        name: {
            rich_text: [{
                type: "text",
                text: { content: req.body.name }
            }]
        },
        message: {
            rich_text: [{
                type: "text",
                text: { content: req.body.message }
            }]
        },
        association: {
            select: {
                name: req.body.association
            }
        }
    }

    try {
        await notion.pages.create({
            parent: {
                database_id: databaseId
            },
            properties: properties
        });

        return res.redirect('/');
    } catch (err) {
        return res.send("failed to add to db");
    }
});

app.listen(PORT, console.log(`Listening on port ${PORT}.`));