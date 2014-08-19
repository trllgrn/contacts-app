var express = require('express'),
    app = express(),
    contacts = [],
    nextId = contacts.length + 1,
    getContactById;



getContactById = function getContactById(id) {

    var i;

    id = parseInt(id);

    if (id !== -1) {
        
        for (i = 0; i < contacts.length; i++) {

            if (contacts[i].id === id) {

                return contacts[i];
            }
        }
    }

    return null;
};

//This routes all document requests to the public folder
app.use('/', express.static(__dirname + '/public'));

app.use(express.bodyParser());
app.use(express.methodOverride());

app.get('/api/contacts/:id', function(req, res) {
    
    var id = req.params.id ;

    res.send(getContactById(id));
});

app.get('/api/contacts', function(req, res) {

    res.send(contacts);
});

app.post('/api/contacts', function(req, res) {

    var contact = req.body;

    contact.id = nextId;

    contacts.push(contact);

    nextId++;

    res.send(contact);
});

app.put('/api/contacts', function(req, res) {

    var id = parseInt(req.body.id),
        newValues = req.body.contact,
        contact = getContactById(id),
        field;

    if (contact !== null) {

        for (field in newValues) {

            contact[field] = newValues[field];
        }
    }
        
    res.send(contact);
});

app.del('/api/contacts/:id', function(req, res) {

    var id = parseInt(req.params.id),
        i;

    for (i = 0; i < contacts.length; i++) {

        if (contacts[i].id === id){
            
            contacts.splice(i, 1);

            res.send(true);
            break;
        }
    }

    res.send(false);
});

app.listen(3000);

console.log('Listening on port 3000');