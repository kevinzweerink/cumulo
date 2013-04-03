function format_geocode( fips, areas, format ) {
	var fips_array = [],
		areas_array = [];
		geocode_output = [];
		output_string = "";
		output_array_slug = [];
		
	fips_array = fips.split(" ");
	areas_array = areas.split("; ");
	
	for (var i = 0; i < fips_array.length; i+=1) {
		fips_array[i] = fips_array[i].substring(0,2);
	}
	
	if (fips_array.length === areas_array.length) {
	
		for (var i = 0; i < fips_array.length; i+=1) {
		
			geocode_output.push( areas_array[i] + ", " + fips_array[i] );
			
		}
		
		if (format === "array") {
		
			return geocode_output;
			
		} else if (format === "string") {
		
			for (var i = 0; i < geocode_output.length; i+=1) {
			
				if (i != (geocode_output.length - 1)) {
					output_string +=  geocode_output[i];
					output_string += "; ";
				} else {
					output_string += geocode_output[i];
				}
				
			}
			
			return output_string;
			
		} else if (format === "array_slug") {
			for (var i = 0; i < geocode_output.length; i+=1) {
				string = geocode_output[i];
				stripCommas = string.replace( /,/g, "" );
				output_array_slug[i] = stripCommas.replace( / /g,"+" );
			}
			
			return output_array_slug
			
		}
	} else {
		alert ("uneven array lengths");
	}
}

function getCoordinates( geocode , area ) {
	
	var slugs = format_geocode( geocode , area , "array_slug" ),
		latsLongs = [];
		averageSpot = [];
		
	console.log(slugs);
		
	for ( var i = 0; i < slugs.length; i+=1 ) {
		var req = $.ajax({
	        url: 'http://maps.googleapis.com/maps/api/geocode/json?address='+slugs[i]+"&sensor=false",
	        dataType: 'json',
	        type: "GET",
	    });
	    req.done(function( data ) {
	    	
	    	console.log(data);
	    
	    	var lat = data.results[0].geometry.location.lat,
	    		lon = data.results[0].geometry.location.lng,
	    		info = [lat, lon];
	    	
		    latsLongs.push(info);
		    
	    });
    }
    
    return latsLongs;
	
}

function findAverageLocation( locations ) {

	var totalLat = 0,
		totalLon = 0,
		avgLat = 0;
		avgLon = 0;
		out = [];
	
	for (var i = 0; i < locations.length; i+=1) {
		totalLat += locations[i][0];
		totalLon += locations[i][1];
	}
	
	avgLat = totalLat/locations.length;
	avgLon = totalLon/locations.length;
	
	out = [avgLat, avgLon];
	
	console.log(out);
	return out;
	
}

//Display the entries
function display_entries( feed ) {

	var output = document.getElementById("alerts");
		
	for (var i = 0; i < feed.length; i+=1) {
		
		var feedItem = feed[i];
		
		var container = document.createElement( "div" ),
			linkWrap = document.createElement( "a" ),
			info = document.createElement( "div" ),
			alertType = document.createElement( "h2" ),
			location = document.createElement( "h3" ),
			actionContainer = document.createElement("div"),
			actionArrow = document.createElement("span"),
			fullLocation = format_geocode( feedItem.geocode , feedItem.areaDesc , "string" );
			
		if (fullLocation.length > 100) {
			fullLocation = fullLocation.substring(0, 100) + "&hellip;";
		}
			
		info.setAttribute("class","info");
		alertType.innerHTML = feedItem.event;
		location.innerHTML = fullLocation;
		actionContainer.setAttribute( "class","view-photos" );
		actionArrow.setAttribute( "class","arrow-append-white" );
		linkWrap.setAttribute( "href","#" );
		linkWrap.setAttribute( "data-geocode" , feedItem.geocode );
		linkWrap.setAttribute( "data-area" , feedItem.areaDesc );
			
			

		if ( feedItem.severity.toLowerCase() === "severe" ) {
		
			container.setAttribute( "class", "alert severe" );
			
		} else if (feedItem.severity.toLowerCase() === "moderate" ) {
		
			container.setAttribute( "class", "alert medium" );
			
		} else {
		
			container.setAttribute( "class", "alert mild" );
			
		}
		
		info.appendChild(alertType);
		info.appendChild(location);
		
		actionContainer.appendChild(actionArrow);
		
		linkWrap.appendChild(info);
		linkWrap.appendChild(actionContainer);
		
		container.appendChild(linkWrap);
		
		output.appendChild(container);
		
	}
	
}

function getInstagramFeed(coordinates) {
	
	$(".alert").fadeOut(1000, function() {$("#alerts").empty()});
	
	var req = $.ajax({
	    url: 'https://api.instagram.com/v1/tags/snow/media/recent&access_token=341588632.f59def8.a6be02bdf9fb47e5b2df2a447afd6080',
	    dataType: 'jsonp',
	    type: "GET",
	});
	req.done(function( data ) {
	
		console.log(data);	
	    
	});
	
}


//NOAA XML=>JSON CONVERTER
//BY KEVIN ZWEERINK



//The number of feed posts you want returned
var feedLen = 10;

// Set Up Google Feeds API
google.load("feeds", "1");

function parseData(result) {
	if (!result.error) {
		
		//Change "Entry" to reflect the name of your feed units
		var items = result.xmlDocument.getElementsByTagName("entry"),
			entries = [];
		
		//Put whatever tags you're looking for in here
		params = [ "event", "severity", "areaDesc", "geocode" ];
		
		var l = 0;			
		for ( var i = 0 ; i < items.length; i+=1 ) {
			
			//Sets current entries position to be an object
			entries[i] = {};
			
			for ( var j = 0; j < params.length; j+=1 ) {
				if (params[j] === "geocode") {
				
					element = google.feeds.getElementsByTagNameNS(items[i], "*", params[j]);
					
					entries[i][params[j]] = element[0].childNodes[3].textContent;
				
				} else {
				
					//Uses google feeds api to take get the current parameter
					element = google.feeds.getElementsByTagNameNS(items[i], "*", params[j]);
					
					//Assigns parameter as a key-value pair in the current entries object
					entries[i][params[j]] = element[0].childNodes[0].nodeValue;
				
				}
				
			}
			
			/*
			alaskaTest = google.feeds.getElementsByTagNameNS(items[i], "*", "geocode")
			geocodeTemp = alaskaTest[0].childNodes[3].textContent;
			console.log(geocodeTemp);
			
			if (!geocodeTemp.match(/AK/gi)) {
			
				for ( var j = 0; j < params.length; j+=1 ) {
				
					//Uses google feeds api to take get the current parameter
					element = google.feeds.getElementsByTagNameNS(items[i], "*", params[j]);
					
					//Assigns parameter as a key-value pair in the current entries object
					entries[l][params[j]] = element[0].childNodes[0].nodeValue;
				
				}
				
				l += 1;
				
			}
*/
						
		}
		
		//CALL TO FUNCTION TO DO EVERYTHING ELSE FOR THE PAGE
		display_entries( entries );
		
	}
}

function initialize() {

	//URL For the NOAA Atom feed.
	//This should work with any of their alert feeds
	//but I haven't tested it out on any non-NOAA
	//Feeds, and there may be some issues with 
	//how they are structured or something. I know
	//literally nothing about XML
	var theFeed = new google.feeds.Feed("http://alerts.weather.gov/cap/us.php?x=0"),
		entries;
	
	//Sets the number of entries to your specified feed length (delete if you want the full feed)		
	theFeed.setNumEntries(1000);
	
	//Sets format to XML
	theFeed.setResultFormat(google.feeds.Feed.XML_FORMAT);
	
	theFeed.load(parseData);
	
}

google.setOnLoadCallback(initialize);

//Properties can be accessed via regular json + an array position i.e:
//var foo = entries[i].severity;

$(document).ready( function() {
	
	$(".alerts-container").on("click", "a", function(event){
		event.preventDefault();
		
		var geocode = $(this).attr("data-geocode"),
			area = $(this).attr("data-area"),
			response,
			coordinates;
			
		response = getCoordinates( geocode , area );
		
		$(document).ajaxStop(function() {
			coordinates = findAverageLocation(response);
			$("#alerts").fadeOut(1000, getInstagramFeed(coordinates));
		});
	});
	
});


