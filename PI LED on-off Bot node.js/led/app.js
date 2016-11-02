
var botBuilder = require('botbuilder');
var restify = require('restify');
var wpi = require('wiring-pi');

// Setup Restify server

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
  console.log('%s listening to %s', server.name, server.url);
});


// create the connector 
// var connector = new botBuilder.ConsoleConnector().listen();

var connector = new botBuilder.ChatConnector({
   appId : process.env.MICROSOFT_APP_ID,
 appPassword : process.env.MICROSOFT_APP_PASSWORD
     
});

// create the Bot 
var bot = new botBuilder.UniversalBot(connector, {
   localizerSettings: {
   botLocalePath: "./locale",
   defaultLocale: "en"
 }
 });
 
server.post('/api/messages', connector.listen());

 bot.dialog('/',  function(session){
     // session.send('Hello, Bot!!');
     if(session.message.text == "ON"){
         
        // GPIO pin of the led
        var configPin = 7;
        // Blinking interval in usec
        var configTimeout = 1000;

        wpi.setup('wpi');
        wpi.pinMode(configPin, wpi.OUTPUT);

        var isLedOn = 0;

        setInterval(function() {
            isLedOn = +!isLedOn;
            //isLedOn = !isLedOn;
            wpi.digitalWrite(configPin, isLedOn );
        }, configTimeout);

     }
     session.send("LED is ON");
 });

