function loadFavorites()
{
    var favStop = localStorage.getItem("Favorites");
    var arrFaves = favStop.split("|");
    var arrStops = null;
    var arrIds;
    var text = "";
    for (i = 0; i < arrFaves.length; i++) 
    {
        arrStops = arrFaves[i].split("~");
        arrIds = arrStops[0].split(">");
        text = '<li><button onclick=removeFavorite(' + i + '); style="background-color:red; border:none;float:right;">&#x2718;</button><a href="javascript:loadArrivals(' + "'" + arrIds[0].trim() + "','" + arrIds[2] + "','" + arrStops[1].trim() + "'"  +')"; class="langOption"><h4 class="selectLanguage">' + arrStops[1] + '</h4></a></li>';
	    $("#lstFaves").append(text);
    }
}



function removeFavorite(index)
{
    var favStop = localStorage.getItem("Favorites");
    var arrFaves = favStop.split("|");
    if(arrFaves.length > 1)
    {
        arrFaves.splice(index, 1);
        var faves = arrFaves.join("|");
        localStorage.setItem("Favorites", faves);
    }
    else
    {
        localStorage.removeItem("Favorites");
    }
    location.reload();
}

function loadArrivals(route, stop, text) {
    var url = encodeURI("http://developer.trimet.org/ws/v2/arrivals?locIDs=" + stop + "&appID=ADAC704071CA2E1C78585B9ED");
	$.get(url, function(data) {  processPredictions(data, text); });       
}

function processPredictions(xml, text)
{
        var outputContainer = $('.js-next-bus-results');
		var predsTag = xml.resultSet.arrival;
        var results = '<p><strong>' + text +'</strong></p><table id="tblResults" cellpadding="0" cellspacing="0">'

		if(predsTag != null)
		{
		    results = results.concat('<tr class="header"><th>DESTINATION</th><th>ARRIVAL</th></tr><tr><td class="spacer" colspan="2"></td></tr>');
			for(var i=0; i<predsTag.length;i++)
			{
			    if (predsTag[i].estimated != null) {
			        var arrival = new Date(predsTag[i].estimated).toDateString();
                    var arrivalTime = predsTag[i].estimated - Date.now();
                    arrivalTime = Math.floor(((arrivalTime % 86400000) % 3600000) / 60000);
                    if (arrivalTime <= 0)
                        arrivalTime = 'Due';
                    else
                        arrivalTime = arrivalTime + ' min';
			        var route = predsTag[i].route;
			        var destination = predsTag[i].shortSign;
			        results = results.concat('<tr class="predictions">');
			        results = results.concat('<td style="word-wrap: break-word;">' + destination + '</td>' + '<td>' + arrivalTime + ' </td>');
			        results = results.concat('</tr><tr><td class="spacer" colspan="2"></td></tr>');
			    }
			}
		}
        else
        {
            results = results.concat("<tr><td>No upcoming arrivals</td></tr>");
        }
        results = results + "</table>";
        $(outputContainer).html(results).show();
}
