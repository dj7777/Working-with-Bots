/*
This code sample demonstrates a simple waterfall dialog. It uses beginDialog to manipulate the conversation stack and 
builder.Prompts.text to gather user input and respond to it.
*/
var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//Root Dialog
bot.dialog('/', [
    function (session) {
        //Trigger /askName dialog
        session.beginDialog('/askName');
    },
    function (session, results) {
        //Return hello + user's input (name)
        session.send('Hello %s!', results.response);
    }
]);
bot.dialog('/askName', [
    function (session) {
        //Prompt for user input
        builder.Prompts.text(session, 'Hi! What is your name?');
    }
]);



