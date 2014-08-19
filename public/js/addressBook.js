/**
 * Created by tgreen on 7/14/14.
 */

//A Backbone model Object to hold our contact's info
var Contact = Backbone.Model.extend({
    defaults: {
        "first_name": "",
        "last_name": "",
        "email": ""
    }
});

//A Backbone collection to hold our Contacts
var Directory = Backbone.Collection.extend ({
    model: Contact,
    url: "api/contacts",
    comparator: 'last_name',
    seed: function() {
        this.create({first_name: "Terrell", last_name: "Green", email: "tgreen@codazen.com"});
        this.create({first_name: "Jimmy", last_name: "Hendrix", email: "jhendrix@rockgod.com"});
        this.create({first_name: "Sara", last_name: "Conner", email: "sconner@judgementday.com"});
        this.create({first_name: "Chuck", last_name:"Bartowski", email:"intersect@cia.gov"});
    }
});

//Create a Contact instance to hold the model selected by the user to edit
var selected = new Contact;
//A Directory instance
var mydirectory = new Directory();



//A Backbone View based on our Contact model.  This view
//is for the "index" view.  It displays each model in an li
//tag in the format "LastName, FirstName".  When the delete
//icon is clicked, the model is deleted from the server and
//the it's markup (this view) is removed from the page.
var ContactView = Backbone.View.extend({
    tagName: 'li',
    model: Contact,
    events: {
        "click .delete" : "handleDestroy",
        "click .edit" : "handleEdit"
    },
    //When the delete button is clicked in the UI,
    //identify the model and destroy it.
    //this.model.destroy calls a sync and removes the model
    //from the server.  This view listens to that destroy call
    //and calls this.remove to remove the markup from the page.
    handleDestroy: function(){
        console.log("Delete button clicked on model: " + this.model.get('id'));
        this.model.destroy();
    },

    handleEdit: function () {
        console.log("Edit button clicked on model:" + this.model.get('id'));
        selected = this.model;
        $.mobile.changePage("#pg-edit");
    },

    initialize: function(){
        console.log("initializing Contact View");
        console.log(this.model.attributes);
        this.listenTo(this.model, 'destroy', this.remove);
    },
    template: _.template('<a data-icon="delete" class="edit"><%= last_name %>, <%= first_name %> </a><a class="delete"></a>'),
    render: function (){
        return this.$el.html(this.template(this.model.toJSON()));
        console.log(this.el);
        console.log(this.$el.html());
    }
});
/*
* renderListView will fetch the Contact models from the server.
* It will then iterate through the list of models and render a
* View for each one in the directory collection.
* */

function renderListView(){
    mydirectory.fetch({success:
        function () {
            console.log(mydirectory.length);
            $('#indexList').html(""); //clear the list
            mydirectory.each(function (entry) {
                view = new ContactView({model : entry});
                $('#indexList').append(view.render());
            });
            $('#indexList').listview('refresh');
        }
    });
};

$(document).on( 'pageinit', '#pg-index',function(event){
    console.log("PAGEINIT fired");
    console.log("Starting page initialization.");
    //Seed the directory with some data just to check things
    mydirectory.seed();
});

$(document).on('pageshow', '#pg-index', function(event) {
    console.log("PAGESHOW fired");
    //Fetch the models from the server
    //Update the HTML with models
    renderListView();
});

//Clean up any previous entries before showing the form
$(document).on('pagebeforeshow', '#pg-create', function(event) {
    console.log("pg-create PAGESHOW fired");
    $('#create-first').attr("value","");
    $('#create-last').attr("value","");
    $('#create-email').attr("value","");
});

//Initialize the New Contact page
$(document).on('pageinit', '#pg-create', function(event) {
    $('#btn-create').on('click', function () {
        var first = $('#create-first').val();
        var last = $('#create-last').val();
        var email = $('#create-email').val();
        console.log("First Name entered: " + first);
        console.log("Last Name entered: " + last);
        console.log("Email entered: " + email);
        mydirectory.create({first_name: first, last_name: last, email: email},
                           {success : function () {
                               console.log("Successfully pushed ");
                               $.mobile.changePage("#pg-index");
                           }
        });
    });
});

//Initialize the Contact Edit page
$(document).on('pageinit', '#pg-edit', function(event) {
    console.log("pg-edit PAGEINIT fired");
    //Register update button click
    $('#btn-update').on('click', function () {
        console.log("Update initiated!");
        console.log("Attempting to push");
        selected.set('first_name', $('#edit-first').val());
        selected.set('last_name', $('#edit-last').val());
        selected.set('email', $('#edit-email').val());
        var attribs = selected.attributes;
        console.log(attribs);
        //Construct the sync request
        //Regular Backbone.sync("update") will push a PUT request with attributes from a toJSON call on the model
        //We need a custom request that will push the data in the following format:
        // [data:{id: val, contact: {fist_name:val, last_name: val}}]
        var customPayload = {id: attribs.id, contact: {first_name: attribs.first_name,
                                                       last_name: attribs.last_name,
                                                       email: attribs.email}};
        console.log("Data to be sent: ");
        console.log(customPayload);
        //Make a jQuery ajax call to the server to update the Contact
        //If successful, redirect to the server to show the updated Contact.
        $.ajax({
            url: "api/contacts",
            type: "PUT",
            dataType: "json",
            data: customPayload,
            success : function (data, status, jqxhr) {
                console.log("Updated contact: " + attribs.id + "on the server.");
                $.mobile.changePage("#pg-index");
            },
            error : function (jqxhr,status,error) {
                console.log("Curses!");
                console.log(jqxhr.responseText);
                console.log(status);
                console.log(error);
            }
        });
    });
});

$(document).on('pagebeforeshow', '#pg-edit', function(event) {
    console.log("pg-edit PAGESHOW fired");
    console.log("Selected object: ");
    console.log(selected);
    console.log("Selected url: " + selected.url());
    console.log("Selected attributes: ");
    console.log(selected.attributes);
    console.log("Selected stringifyJSON: " + JSON.stringify(selected));
    var first = selected.get('first_name');
    var last = selected.get('last_name');
    var email = selected.get('email');
    //Set the page heading and input fields to the selected entry values
    $('#pg-edit-heading').text(first + " " + last + " - " + email );
    $('#edit-first').val(first);
    $('#edit-last').val(last);
    $('#edit-email').val(email);
});