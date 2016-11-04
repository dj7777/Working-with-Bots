var botBuilder = require('botbuilder');
var restify = require('restify');


// Setup Restify server

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
  console.log('Server Started!!');
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
 
server.post('/api/messages', connector.listen());

bot.dialog('/', [
    function(session){
        if(session.message.text == 'Hello'){
         botBuilder.Prompts.text(session, 'Hello Sir!!');
         }
           if(session.message.text == 'Hi'){
         botBuilder.Prompts.text(session, 'Hi Sir!!');
         }        

    },
    function(session, results){
      
      session.send('Hello again!!');
    }
]);
