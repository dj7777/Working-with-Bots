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



