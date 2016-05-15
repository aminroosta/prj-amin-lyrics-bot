var TelegramBot = require('node-telegram-bot-api');
var api = require('./lyrics_api.js');
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./database');

function get_toekn() {
	var token = JSON.parse(require('fs').readFileSync('token.json', 'utf8'));
	if(process.env.OPENSHIFT_NODEJS_PORT)
		return token.amin_lyrics_bot; // open shift bot
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
		var text = msg.text;
		if(!text) {
			bot.sendMessage(chatId, "Type the name of a song to search for.");
			return;
		}


		var number = text * 1;
		if(number) {
			number -= 1;
			var arr = localStorage.getItem(chatId);
			arr = arr && JSON.parse(arr);
			if(!arr || !arr[number]) {
				bot.sendMessage(chatId, 'Oops!\n No previous song with this number is found.');
				return;
			}

			bot.sendMessage(chatId, 'OK, i will be back with your lyric in a second :)');
			var url = arr[number];
			// console.log(url);
			api.lyric(url)
			   .then(function(text){
				  bot.sendMessage(chatId, text);
			   })
				.catch(function(err) {
					bot.sendMessage(chatId, 'Oops! i\'m sorry!\n Something went wrong.');
					bot.sendMessage(chatId, JSON.stringify(err));
				});
			return;
		}



		bot.sendMessage(chatId, 'OK, i will be back right away, query = ' + text );

		api.search(text)
			.then(function(arr){
				if(arr.length == 0){
					bot.sendMessage(chatId, 'Oops!\n I couldn\'t find anything for "' + text + '"');
					return;
				}

				var list = 'Ok, i\'ve found these songs, type song number to get your lyric\n\n';
				var number = 1;
				arr.forEach(function(href){
			    	var song = href.replace('http://www.metrolyrics.com/','').replace('.html','').replace('-lyrics-','').replace('-', ' ');
			    	// var artist = href[0];
			    	// var song = href[1];
		    		// list += number + ' : ' + song + ' - ' + artist + '\n';
		    		list += number + ' : ' + song + '\n';
		    		number += 1;
				});

				bot.sendMessage(chatId, list);
				localStorage.setItem(chatId, JSON.stringify(arr));
			})
			.catch(function(err) {
				bot.sendMessage(chatId, 'Oops! i\'m sorry!\n Something went wrong.');
			});
	});
}

run_bot();


// api.search('going under') .then(t => console.log(t)) .catch(function(err) {console.warn(err); });
// api.lyric('http://www.metrolyrics.com/down-on-my-knees-lyrics-ayo.html') .then(t => console.log(t)).catch(function(err) {console.warn(err); });


