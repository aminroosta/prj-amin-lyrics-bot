var axios = require('axios');
var cheerio = require('cheerio');
var google = require('google');
google.resultsPerPage = 10;

function search(query) {
	return new Promise(function(accept, reject){
		google(query + ' site:www.metrolyrics.com', function (err, res){
		  if (err) {
		  	reject(err);
		  	return;
		  }

		  var ret = [];

		  for (var i = 0; i < res.links.length; ++i) {
		    var link = res.links[i];
		    var href = link.href;
		    if(href.startsWith('http://www.metrolyrics.com/') && href.endsWith('.html')) {
		    	ret.push(href);
		    	// href = href.replace('http://www.azlyrics.com/lyrics/','').replace('.html','').split('/');
		    	// var artist = href[0];
		    	// var song = href[1];
		    	// if(artist && song)
		    	// 	ret.push({artist: artist, song: song, href: link.href});

		    }
		    // console.log(link.title + ' - ' + link.href)
		    // console.log(link.description + "\n")
		  }
		  // console.log(JSON.stringify(ret));
		  accept(ret);
		});
	});
}

function lyric(url){
	return axios.get(url)
		 .then(function(response){
		 	var page = response.data;
		 	var $ = cheerio.load(page);
		 	var divs = $('#lyrics-body-text');
		 	// var divs = $('div.container div.row div.text-center div');
		 	// console.log(divs.text());
		 	var text = divs.text();
		 	return text;
		 });
}

module.exports = {
	search: search,
	lyric: lyric
};

