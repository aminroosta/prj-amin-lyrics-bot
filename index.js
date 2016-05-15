var TelegramBot = require('node-telegram-bot-api');
var api = require('./lyrics_api.js');

function get_toekn() {
	var token = JSON.parse(require('fs').readFileSync('token.json', 'utf8'));
	if(process.env.OPENSHIFT_NODEJS_PORT)
		return token.yeybot; // open shift bot
	return token.amindebugbot;
}

function create_bot(token) {
	var bot = null;
	if(process.env.OPENSHIFT_NODEJS_PORT) {
		// See https://developers.openshift.com/en/node-js-environment-variables.html
		var port = process.env.OPENSHIFT_NODEJS_PORT;
		var host = process.env.OPENSHIFT_NODEJS_IP;
		var domain = process.env.OPENSHIFT_APP_DNS;

		bot = new  TelegramBot(token, {webHook: {port: port, host: host}});
		// OpenShift enroutes :443 request to OPENSHIFT_NODEJS_PORT
		bot.setWebHook(domain+':443/bot'+token);
	}
	else { /* we are on local host */
		bot = new TelegramBot(token, {polling: true});
	}
	return bot;
}


function run_bot() {
	var bot = create_bot(get_toekn());

	bot.on('message', function (msg) {
	  var chatId = msg.chat.id;
	  bot.sendMessage(chatId, "I'm alive!");
	});
}

//run_bot();


api.search('going under')
	.then(t => console.log(t))
	.catch(function(err) {console.warn(err); });
// lyric('http://www.azlyrics.com/lyrics/survivor/eyeofthetiger.html').catch(function(err) {console.warn(err); });


