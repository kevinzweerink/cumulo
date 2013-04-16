//Takes the FIPS code from NOAA plus the areasDesc from NOAA plus a format parameter
//Returns the place in the format "Anchorage, AK" in the form of a string, array, or an
//array formatted for URL slugs

(function() {

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
		alert ( "uneven array lengths: " + fips_array.length + " " + areas_array.length + "fips: " + fips + "areas: " + areas + "fipsarray: " + fips_array + "areasarray: " + areas_array);
	}
}

//Uses google geocode api to get a latitude and longitude for a query
//Parameters: FIPS code and areasDesc
//Returns [lat, lon]
function getCoordinates( geocode , area ) {
	
	var slugs = format_geocode( geocode , area , "array_slug" ),
		latsLongs = [];
		averageSpot = [];
		
	for ( var i = 0; i < slugs.length; i+=1 ) {
		var req = $.ajax({
	        url: 'http://maps.googleapis.com/maps/api/geocode/json?address='+slugs[i]+"&sensor=false",
	        dataType: 'json',
	        type: "GET",
	    });
	    req.done(function( data ) {
	    		    
	    	var lat,
	    		lon,
	    		info;
	    	
	    	if ( data.results[0] != undefined ) {
		    	lat = data.results[0].geometry.location.lat,
		    	lon = data.results[0].geometry.location.lng,
		    	info = [lat, lon];
	    	} else {
		    	info = ["fail", "fail"];
	    	}
	    	
		    latsLongs.push(info);
		    
	    });
    }
    
    return latsLongs;
	
}

//Averages together an array of coordinates to find the average latitude
//and longitude, or central point.
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
	
	return out;
	
}

//Display the entries from the NOAA XML Feed
function display_entries( feed ) {
	
	if (document.getElementById("alerts")) {
		var output = document.getElementById("alerts");
	} else {
		var output = document.createElement("div"),
			masterEl = document.getElementById("data"),
			outputHeader = document.createElement("header"),
			outputHeaderText = document.createElement("h1"),
			shuffleLink = document.createElement("a"),
			barContainer = document.createElement("div"),
			bar1 = document.createElement("div"),
			bar2 = document.createElement("div"),
			bar3 = document.createElement("div");
			
		barContainer.setAttribute("class", "bar-icon");
		bar1.setAttribute("class","bar bar-one");
		bar2.setAttribute("class","bar bar-two");
		bar3.setAttribute("class", "bar bar-three");
		
		barContainer.appendChild(bar1);
		barContainer.appendChild(bar2);
		barContainer.appendChild(bar3);
		
		outputHeader.setAttribute("class", "alert-header");
		outputHeaderText.innerHTML = "Current Alerts";
		shuffleLink.setAttribute("href","#");
		shuffleLink.setAttribute("class","shuffle");
		shuffleLink.innerHTML = "Shuffle";
		shuffleLink.appendChild(barContainer);
		outputHeader.appendChild(outputHeaderText);
		outputHeader.appendChild(shuffleLink);
		output.setAttribute("class","alerts-container");
		output.setAttribute("id","alerts");
		masterEl.appendChild(outputHeader);
		masterEl.appendChild(output);
		
	}
	
		
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
			
		if (fullLocation.length > 50) {
			fullLocation = fullLocation.substring(0, 50) + "&hellip;";
		}
			
		info.setAttribute("class","info");
		alertType.innerHTML = feedItem.event;
		location.innerHTML = fullLocation;
		actionContainer.setAttribute( "class","view-photos" );
		actionArrow.setAttribute( "class","arrow-append" );
		linkWrap.setAttribute( "href","#" );
		linkWrap.setAttribute( "data-geocode" , feedItem.geocode );
		linkWrap.setAttribute( "data-area" , feedItem.areaDesc );
		linkWrap.setAttribute( "data-polygon" , feedItem.polygon );
			
			

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

function masonite() {
	var $container = $('.photo-wrapper'),
		containerWidth = $container.width();
		$container.imagesLoaded(function(){
		  $container.masonry({
		    itemSelector : '.photo',
		    columnWidth : function( containerWidth ) { return containerWidth / 3 },
		    
		   });
		 });
}

//Display the webcams
function getWebcams(coordinates, area, conditions, severity, areaDisplay) {
	
	$("#data").fadeOut(100, function() {$("#data").empty()});
	
	var req = $.ajax({
		url: "http://api.webcams.travel/rest?method=wct.webcams.list_nearby&devid=0cb0619e68a17067b8cbb899d32ddd1e&lat=" + coordinates[0] + "&lng=" + coordinates[1] + "&radius=50&unit=km&per_page=50&format=json",
		dataType: "jsonp",
		type: "GET"
	});
	req.done(function(data) {
		
		var photos = data.webcams.webcam,
			container = document.getElementById("data"),
			wrapper = document.createElement("div"),
			alertHeader = document.createElement( "div" ),
			alertType = document.createElement( "h2" ),
			location = document.createElement( "h3" ),
			info = document.createElement( "div" ),
			back = document.createElement("div"),
			backLink = document.createElement("a"),
			photoMasonry = document.createElement("div");
			photoWrapper = document.createElement("div");
			sidebar = document.getElementById("sidebar");
			
		photoMasonry.setAttribute("class","photos");
		info.setAttribute("class","info");
		alertType.innerHTML = conditions;
		location.innerHTML = areaDisplay.substring(0, 50) + "&hellip;";
		back.setAttribute("class","back");
		backLink.innerHTML = "<img src='images/b4228987.back.png' /> <span class='back-text'>Back to alerts</span>";
		backLink.setAttribute("href","#");
		wrapper.setAttribute("class","photo-container");
		photoWrapper.setAttribute("class","photo-wrapper");
		
		back.appendChild(backLink);
		info.appendChild(alertType);
		info.appendChild(location);
		alertHeader.appendChild(info);
		alertHeader.setAttribute("class", severity + " alert-header");
		
		wrapper.appendChild(alertHeader);
					
		if (photos.length > 0) {
		
			for (var i=0; i<photos.length; i+=1) {
						
				var img = document.createElement("img"),
					img_container = document.createElement("div"),
					photo = photos[i],
					url = photo.preview_url;
				
				img.setAttribute("src",url);
				img_container.setAttribute("class","photo");
				
				img_container.appendChild(img);
				
				photoWrapper.appendChild(img_container);
				
			}
			
			photoMasonry.appendChild(photoWrapper);					
			wrapper.appendChild(photoMasonry);
			
			sidebar.appendChild(back);
			container.appendChild(wrapper);
			masonite();
		
		} else {
			
			var error = document.createElement("div"),
				errorText = document.createElement("h2"),
				searchTags = conditions.replace(/statement/gi, "");
				
				searchTags = searchTags.replace(/special/gi, "");
				searchTags = searchTags.replace(/alert/gi,"");
				searchTags = searchTags.replace(/advisory/gi, "");
				searchTags = searchTags.replace(/ /g, ",");
				
			if(searchTags.charAt( searchTags.length-1 ) == ",") {
				searchTags = searchTags.slice(0, -1);
			}

			flickrUrl = "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=9191cd2c6c7fcb1cfcbde3b5c2952a6f&format=json&tags=" + searchTags + "&tag_mode=all&per_page=15";
			
			var req = $.ajax({
				url: flickrUrl,
				dataType: "jsonp",
				jsonpCallback: 'jsonFlickrApi',
				type: "GET",
				success: function( data ) {
					photos = data.photos.photo;
					console.log(photos);
					for (var i = 0; i<photos.length; i+=1) {
						var img = document.createElement("img"),
							img_container = document.createElement("div"),
							photo = photos[i],
							url = "http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + ".jpg";
						
						img.setAttribute("src",url);
						img_container.setAttribute("class","photo");
						
						img_container.appendChild(img);
						
						photoWrapper.appendChild(img_container);
						
					}
					
					error.setAttribute("class", "no-cams");
					errorText.innerHTML = "Sorry, no cameras found, here's some cool weather pix from flickr instead.";
					error.appendChild(errorText);
					wrapper.appendChild(error);
					
					photoMasonry.appendChild(photoWrapper);					
					wrapper.appendChild(photoMasonry);
					
					sidebar.appendChild(back);
					container.appendChild(wrapper);
					masonite();
				}
			});

			
		}
		
		$("#data").fadeIn(250);
		
	});
	
	
}


// Set Up Google Feeds API
google.load("feeds", "1");

function parseData(result) {
	if (!result.error) {
		
		//Change "Entry" to reflect the name of your feed units
		var items = result.xmlDocument.getElementsByTagName("entry"),
			entries = [];
		
		//Put whatever tags you're looking for in here
		params = [ "event", "severity", "areaDesc", "geocode" , "polygon" ];
		
		var l = 0;			
		for ( var i = 0 ; i < items.length; i+=1 ) {
			
			//Sets current entries position to be an object
			entries[i] = {};
			
			for ( var j = 0; j < params.length; j+=1 ) {
				if (params[j] === "geocode") {
				
					element = google.feeds.getElementsByTagNameNS(items[i], "*", params[j]);
					
					entries[i][params[j]] = element[0].childNodes[3].textContent;
				
				} else if (params[j] === "polygon") {
					
					element = google.feeds.getElementsByTagNameNS(items[i], "*", params[j]);
					entries[i][params[j]] = element[0].textContent;
 					
				} else {
				
					//Uses google feeds api to take get the current parameter
					element = google.feeds.getElementsByTagNameNS(items[i], "*", params[j]);
					
					//Assigns parameter as a key-value pair in the current entries object
					entries[i][params[j]] = element[0].childNodes[0].nodeValue;
				
				}
				
			}
									
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
	theFeed.setNumEntries(100000);
	
	//Sets format to XML
	theFeed.setResultFormat(google.feeds.Feed.XML_FORMAT);
	
	theFeed.load(parseData);
	
}

google.setOnLoadCallback(initialize);

//Properties can be accessed via regular json + an array position i.e:
//var foo = entries[i].severity;

$(document).ready( function() {
	
	//When you click an entry, start the instagram feed
	$("body").on("click", ".alert a", function(event){
	
		event.preventDefault();
		
		var geocode = $(this).attr("data-geocode"),
			area = $(this).attr("data-area"),
			areaDisplay = format_geocode( geocode , area , "string" ),
			conditions = $(this).find("h2")[0].innerHTML,
			severity = $(this).parent().attr("class"),
			/* polygon = format_polygon( $(this).attr("data-polygon") ), */
			response,
			coordinates;
			
		//Geocode api for coordinates on locations in entry
		response = getCoordinates( geocode , area );

		//Once geocode api calls end, get the instagram feed
		$(this).ajaxStop(function() {
		
			/*
if (isNaN(response)) {
				response = polygon;
			}
*/
			
			/*
if (response instanceof Array && response[0] instanceof Array && response) {
				
			}
*/
			coordinates = findAverageLocation(response);
			getWebcams(coordinates, area, conditions, severity, areaDisplay);
		});
	});
	
	$("body").on("click", ".back", function(e) {
		e.preventDefault();
		$("#data").fadeOut(100, function(){
			$(".back").fadeOut(100, function(){ $(".back").remove() });
			$("#data").empty();
				initialize();
				$("#data").fadeIn(100);
				
		});
		
	});
	
	$("body").on("click",".shuffle", function(e) {
		e.preventDefault();
		$(".alerts-container").fadeOut(200, function() {
			$(".alert").shuffle( $(".alerts-container") );
			$(".alerts-container").fadeIn(200);
		});
	});
	
});

})();


