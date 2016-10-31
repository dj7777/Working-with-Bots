var botBuilder = require('botbuilder');
var restify = require('restify');


// Setup Restify server

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
  console.log('%s listening to %s', server.name, server.url);
});


// create the connector 
// var connector = new botBuilder.ConsoleConnector().listen();

var connector = new botBuilder.ChatConnector({
    appId: "58ad7caa-d200-4b98-8f8a-c3559bd0ba17",
    appPassword: "ohrHzadwZC33yyc0FL83z7S" 
});

// create the Bot 
var bot = new botBuilder.UniversalBot(connector, {
   localizerSettings: {
   botLocalePath: "./locale",
   defaultLocale: "en"
 }
 });
 
server.post('/api/messages', connector.listen());

bot.dialog('/', [
    function(session){
        session.beginDialog('/ensureProfile', session.userData.profile);
    },
    function(session, results){
      session.userData.profile = results.response;
      session.send('Hello %(name)s ! I love %(company)s!', session.userData.profile);
    }
]);

bot.dialog('/ensureProfile', [
    function(session, args, next){
        session.dialogData.profile = args || {};
        if(!session.dialogData.profile.name){
            botBuilder.Prompts.text(session, "What's your name?");
        }
        else{
            next();
        }
    },
    function(session,results,next){
        if(results.response){
            session.dialogData.profile.name = results.response;
        }
        if(!session.dialogData.profile.company){
            botBuilder.Prompts.text(session, "What company do you work for?");
        }
        else{
            next();
        }
    },
    function(session,results){
        if(results.response){
            session.dialogData.profile.company = results.response;
        }
        session.endDialogWithResult({ response: session.dialogData.profile});
    }
]);



/* Hello.js


var botBuilder = require('botbuilder');
var restify = require('restify');


// Setup Restify server

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
  console.log('%s listening to %s', server.name, server.url);
});


// create the connector 
// var connector = new botBuilder.ConsoleConnector().listen();


var connector = new botBuilder.ChatConnector();

// create the Bot 
var bot = new botBuilder.UniversalBot(connector, {
   localizerSettings: {
   botLocalePath: "./locale",
   defaultLocale: "en"
 }
 });
 // add in the dialog
   // easy method
// bot.dialog('/',  function(session){
//     // session.send('Hello, Bot!!');
//     var userMessage = session.message.text;
//     session.send("You typed:" + userMessage);
// });

//Waterfall Method- function is called after the execution of previous function

bot.dialog('/', [
    function(session){
        botBuilder.Prompts.text(session, 'Please Enter Your Name');
    },
    function(session, result){
      session.send('Hello,' + result.response);
    }
]);

server.post('/api/messages', connector.listen());



*/