window.playerInfo = {}; // global variable to store info about players

$(document).bind('pageinit', function() {
	$.get('player-data.json', function(data) {
		window.playerInfo = $.parseJSON(data);
	});
});