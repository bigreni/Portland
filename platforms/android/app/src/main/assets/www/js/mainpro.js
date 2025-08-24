    function onLoad() {
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
            document.addEventListener('deviceready', checkFirstUse, false);
        } else {
            notFirstUse();
        }
    }
    var admobid = {};
    if (/(android)/i.test(navigator.userAgent)) {
        admobid = { // for Android
            banner: 'ca-app-pub-1683858134373419/7790106682',
            interstitial:'ca-app-pub-9249695405712287/4611763620'
        };
    } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
    admobid = {
      banner: 'ca-app-pub-1683858134373419/7790106682', 
      interstitial: 'ca-app-pub-9249695405712287/5043363683'
    };
  }

    function initApp() {
        if (!AdMob) { alert('admob plugin not ready'); return; }
        initAd();
        //display interstitial at startup
        loadInterstitial();
    }
    function initAd() {
        var defaultOptions = {
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            bgColor: 'black', // color name, or '#RRGGBB'
            isTesting: false // set to true, to receiving test ad for testing purpose
        };
        AdMob.setOptions(defaultOptions);
        registerAdEvents();
    }

    // optional, in case respond to events or handle error
    function registerAdEvents() {
        // new events, with variable to differentiate: adNetwork, adType, adEvent
        document.addEventListener('onAdFailLoad', function (data) {
            document.getElementById('screen').style.display = 'none';     
        });
        document.addEventListener('onAdLoaded', function (data) {
               AdMob.showInterstitial();
        });
        document.addEventListener('onAdPresent', function (data) { });
        document.addEventListener('onAdLeaveApp', function (data) { });
        document.addEventListener('onAdDismiss', function (data) { 
            document.getElementById('screen').style.display = 'none';     
        });
    }

    function createSelectedBanner() {
          AdMob.createBanner({adId:admobid.banner});
    }

    function loadInterstitial() {
        if ((/(android|windows phone)/i.test(navigator.userAgent))) {
            //AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: false });
            document.getElementById("screen").style.display = 'none';     
        } else if ((/(ipad|iphone|ipod)/i.test(navigator.userAgent))) {
            //AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: true });
            document.getElementById("screen").style.display = 'none';     
        } else
        {
            document.getElementById("screen").style.display = 'none';     
        }
    }

   function checkFirstUse()
    {
        $(".dropList").select2();
        //window.ga.startTrackerWithId('UA-88579601-20', 1, function(msg) {
        //    window.ga.trackView('Portland Home');
        //});  
        initApp();
        askRating();
        //document.getElementById("screen").style.display = 'none';     
    }

   function notFirstUse()
    {
        $(".dropList").select2();
        document.getElementById("screen").style.display = 'none';     
    }

function askRating()
{
  AppRate.preferences = {
  openStoreInApp: true,
  useLanguage:  'en',
  usesUntilPrompt: 10,
  promptAgainForEachNewVersion: true,
  storeAppURL: {
                ios: '1431626230',
                android: 'market://details?id=com.portland.free'
               }
};
 
AppRate.promptForRating(false);
}


function getDirections() {
    reset();  
    var url = encodeURI("https://trimet.org/ws/int/v1/routeConfig?json=true&dir=true&route=" + $("#MainMobileContent_routeList").val());
	$.get(url, function(data) {processDirections(data); });    $("span").remove();
    $(".dropList").select2();
}

function processDirections(xml)
{
    var list = $("#MainMobileContent_directionList");
    $(list).empty();
    $(list).append($("<option disabled/>").val("0").text("- Select Direction -"));
    var stoplist = $("#MainMobileContent_stopList");
    $(stoplist).empty();
    var routeTag = xml.resultSet.route;
	var directionsTag = routeTag[0].dir;	

	for (var i=0; i<directionsTag.length;i++)
	{
		var nameTag = directionsTag[i].desc;
		var displayTag = directionsTag[i].dir;
        $(list).append($("<option />").val(displayTag).text(nameTag));
	}
	$(list).val(0);
}

function getStops()
{
    reset(); 
    var url = encodeURI("https://trimet.org/ws/int/v1/routeConfig?json=true&dir=" + $("#MainMobileContent_directionList").val() + "&route=" + $("#MainMobileContent_routeList").val() + "&stops=true");
	$.get(url, function(data) {  processStops(data); });
    $("span").remove();
    $(".dropList").select2();
}

function processStops(xml)
{
        var list = $("#MainMobileContent_stopList");
        $(list).empty();
        $(list).append($("<option disabled/>").val("0").text("- Select Stop -"));
		var routeTag = xml.resultSet.route;
		var stopsTag = routeTag[0].dir[0].stop;	
		if(stopsTag != null)
		{
			for(var i=0; i<stopsTag.length;i++)
			{
				var name = stopsTag[i].desc;
				var id = stopsTag[i].locid;
                $(list).append($("<option />").val(id).text(name));
			}
		}
        $(list).val(0);
}

function getArrivalTimes() {
    reset();
    var url = encodeURI("https://developer.trimet.org/ws/v2/arrivals?locIDs=" + $("#MainMobileContent_stopList").val() + "&appID=ADAC704071CA2E1C78585B9ED");
	$.get(url, function(data) {  processPredictions(data); });       
    $("span").remove();
    $(".dropList").select2();
}

function processPredictions(xml)
{
        var outputContainer = $('.js-next-bus-results');
		var predsTag = xml.resultSet.arrival;
        var results = '<table id="tblResults" cellpadding="0" cellspacing="0">'
        document.getElementById('btnSave').style.visibility = "visible";

		if(predsTag != null)
		{
		    results = results.concat('<tr class="header"><th>DESTINATION</th><th>ARRIVAL</th></tr><tr><td class="spacer" colspan="2"></td></tr>');
			for(var i=0; i<predsTag.length;i++)
			{
			    if (predsTag[i].estimated != null) {
			        var arrival = new Date(predsTag[i].estimated).toLocaleTimeString();
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
            results = results.concat('<tr><td style="word-wrap: break-word;">No upcoming arrivals</td></tr>');
        }
        results = results + "</table>";
        $(outputContainer).html(results).show();
}


function displayError(error) {
}

function reset() {
    $('.js-next-bus-results').html('').hide(); // reset output container's html
    document.getElementById('btnSave').style.visibility = "hidden";
    $("#message").text('');         
}

function saveFavorites()
{
    var favStop = localStorage.getItem("Favorites");
    var newFave = $('#MainMobileContent_routeList option:selected').val() + ">" + $("#MainMobileContent_directionList option:selected").val() + ">" + $("#MainMobileContent_stopList option:selected").val() + "~" + $('#MainMobileContent_routeList option:selected').text() + " > " + $("#MainMobileContent_directionList option:selected").text() + " > " + $("#MainMobileContent_stopList option:selected").text();
        if (favStop == null)
        {
            favStop = newFave;
        }   
        else if(favStop.indexOf(newFave) == -1)
        {
            favStop = favStop + "|" + newFave;               
        }
        else
        {
            $("#message").text('Stop is already favorited!!');
            return;
        }
        localStorage.setItem("Favorites", favStop);
        $("#message").text('Stop added to favorites!!');
}