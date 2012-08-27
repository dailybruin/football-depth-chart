function getPlayer(players, name) {
	name = new RegExp(name.replace('-','.')+'\\s*','gi');
	for (player in players["players"]) {
		if( name.test(
				players["players"][player]["name"]
					.replace("\u2019","")
					.replace("'","")
					.replace("-","")
					) )
			return players["players"][player];
	}
}


// Generate player info
$(document).bind( "pagebeforechange", function( e, data ) {

	// We only want to handle changePage() calls where the caller is
	// asking us to load a page by URL.
	if ( typeof data.toPage === "string" ) {
		// We are being asked to load a page by URL, but we only
		// want to handle URLs that request the data for a specific
		// category.
		var u = $.mobile.path.parseUrl( data.toPage ),
			re = /^#player-info/;

		if ( u.hash.search(re) !== -1 ) {

			// We're being asked to display the items for a specific category.
			// Call our internal method that builds the content for the category
			// on the fly based on our in-memory category data structure.
			showPlayer(u, data.options)

			// Make sure to tell changePage() we've handled this call so it doesn't
			// have to do anything.
			e.preventDefault();
		}
	}
});

// Load the data for a specific category, based on
// the URL passed in. Generate markup for the items in the
// category, inject it into an embedded page, and then make
// that page the current active page.
function showPlayer( urlObj, options )
{
	var playerName = urlObj.hash.replace( /.*player=/, "" );
	
	// Because of Javascript's callback structure, the rest of the
	// showPlayer function must be within this callback
	$.get('player-data.json', function(data) {
		// Get and parse the JSON with player data
		playerInfo = $.parseJSON(data);
		playerObj = getPlayer(playerInfo, playerName);
		
		// Extract first and last name from input string
		firstNamePattern = new RegExp("^[^-]+","gi");
		lastNamePattern = new RegExp("[^-]+$","gi");
		firstName = firstNamePattern.exec(playerName)[0];
		lastName = lastNamePattern.exec(playerName)[0];
		
		// The pages we use to display our content are already in
		// the DOM. The id of the page we are going to write our
		// content into is specified in the hash before the '?'.
		pageSelector = urlObj.hash.replace( /\?.*$/, "" );
	
		// Get the page we are going to dump our content into.
		var $page = $( pageSelector );
		
		// Get the header for the page.
		$header = $page.children( ":jqmData(role=header)" );

		// Get the content area element for the page.
		$content = $page.children( ":jqmData(role=content)" );
		
		markup = "<img class='player-info-img' src='img/players/" + lastName + "_" + firstName + ".jpg' />";
		markup += "<p>" + playerObj["bio"] + "</p>";
		if(playerObj["bullets"]) {
			markup += "<ul>";
				for (bulletInfo in playerObj["bullets"])
					markup += "<li>" + playerObj["bullets"][bulletInfo] + "</li>";
			markup += "</ul>";
		}

		// Inject the category items markup into the content element.
		$content.html( markup );
		
		// Find the h1 element in our header and inject the name of
		// the category into it.
		$header.find( "h1" ).html( playerObj["name"] );

		// Pages are lazily enhanced. We call page() on the page
		// element to make sure it is always enhanced before we
		// attempt to enhance the listview markup we just injected.
		// Subsequent calls to page() are ignored since a page/widget
		// can only be enhanced once.
		$page.page();

		// Enhance the listview we just injected.
		$content.find( ":jqmData(role=listview)" ).listview();

		// We don't want the data-url of the page we just modified
		// to be the url that shows up in the browser's location field,
		// so set the dataUrl option to the URL for the category
		// we just loaded.
		options.dataUrl = urlObj.href;

		// Now call changePage() and tell it to switch to
		// the page we just modified.
		$.mobile.changePage( $page, options );
	});
}
