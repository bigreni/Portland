    function onLoad() {
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent)) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)) {
            document.addEventListener('deviceready', checkFirstUse, false);
        } else {
            notFirstUse();
        }
    }

function initApp() {
    if (/(android)/i.test(navigator.userAgent)){
        interstitial = new admob.InterstitialAd({
            //dev
            //adUnitId: 'ca-app-pub-3940256099942544/1033173712'
            //prod
            adUnitId: 'ca-app-pub-9249695405712287/4312339935'
          });
        }
        else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)) {
            interstitial = new admob.InterstitialAd({
                //dev
                //adUnitId: 'ca-app-pub-3940256099942544/4411468910'
                //prod
                adUnitId: 'ca-app-pub-9249695405712287/6197016267'
              });
        }
        registerAdEvents();
        interstitial.load();
}

// optional, in case respond to events or handle error
function registerAdEvents() {
    // new events, with variable to differentiate: adNetwork, adType, adEvent
    document.addEventListener('admob.ad.load', function (data) {
        document.getElementById("screen").style.display = 'none';    
    });
    document.addEventListener('admob.ad.loadfail', function (data) {
        document.getElementById("screen").style.display = 'none'; 
    });
    document.addEventListener('admob.ad.show', function (data) { 
        document.getElementById("screen").style.display = 'none';     
    });
    document.addEventListener('admob.ad.dismiss', function (data) {
        document.getElementById("screen").style.display = 'none';     
    });
}

function checkFirstUse()
{
    $(".dropList").select2();
    initApp();
    //checkSubscription();
    checkPermissions();
    askRating();
    //document.getElementById('screen').style.display = 'none';     
}

function notFirstUse()
{
    $(".dropList").select2();
    document.getElementById('screen').style.display = 'none';     
}

function askRating()
{
    const appRatePlugin = AppRate;
    appRatePlugin.setPreferences({
        reviewType: {
            ios: 'AppStoreReview',
            android: 'InAppBrowser'
            },
    useLanguage:  'en',
    usesUntilPrompt: 10,
    promptAgainForEachNewVersion: true,
     storeAppURL: {
                ios: '1431626230',
                android: 'market://details?id=com.portland.free'
               }
});
 
AppRate.promptForRating(false);
}


function getDirections() {
    reset();  
    var url = encodeURI("https://trimet.org/ws/int/v1/routeConfig?json=true&dir=true&route=" + $("#MainMobileContent_routeList").val());
	$.get(url, function(data) {processDirections(data); });
    $("span").remove();
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
    showAd();
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

function loadFaves()
{
showAd();
window.location = "Favorites.html";
}

function showAd()
{
    if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent)) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)) {
        document.getElementById("screen").style.display = 'block';     
        interstitial.show();
        document.getElementById("screen").style.display = 'none';
    }
}

function proSubscription()
{
    window.location = "Subscription.html";
    //myProduct.getOffer().order();
}

var platformType;
var productId;

function checkSubscription()
{
    if (/(android)/i.test(navigator.userAgent)){
        platformType = CdvPurchase.Platform.GOOGLE_PLAY;
    }
    else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)) {
        platformType = CdvPurchase.Platform.APPLE_APPSTORE;
    }
    else{
        platformType = CdvPurchase.Platform.TEST;
    }
    //var pro = localStorage.getItem("proVersion");
    productId = localStorage.getItem("productId");
    CdvPurchase.store.register([{
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        id: 'proversion',
        platform: platformType,
        },
        {
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        id: 'pro_biannual',
        platform: platformType,
        },
        {
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        id: 'pro_annual',
        platform: platformType,
        }]); 
        
    //   CdvPurchase.store.initialize([CdvPurchase.Platform.TEST]);
        CdvPurchase.store.initialize([platformType]);
        
        //CdvPurchase.store.when().productUpdated(onProductUpdated);
        //CdvPurchase.store.when().approved(onTransactionApproved);
        //CdvPurchase.store.restorePurchases();
        //CdvPurchase.store.update();
        // if (/(android)/i.test(navigator.userAgent))
        // {
             CdvPurchase.store.when().receiptsReady(onReceiptReady);
        // }
        // else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)) {
        //CdvPurchase.store.when().receiptUpdated(onReceiptUpdated);
        //}
        //CdvPurchase.store.when().receiptsVerified(onProductUpdated);
}

function onTransactionApproved(transaction)
{
      localStorage.proVersion = 1;
      localStorage.productId = transaction.products[0].id;
      transaction.finish();
      //window.location = "index.html";
}

var iapInitialReceiptUpdated = false;

function onReceiptUpdated(receipt)
{
    CdvPurchase.store.restorePurchases();
    if(/(ipod|iphone|ipad)/i.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document))
    {
        if(!iapInitialReceiptUpdated){
            if(receipt.transactions.length == 1){
                receipt.verify();
            }
            iapInitialReceiptUpdated=true;
        }
    }

    productId = localStorage.getItem("productId");
    //alert(receipt.transactions[0].products[0].id);
    //CdvPurchase.store.update();
    var owned = CdvPurchase.store.owned(productId, platformType);
    //alert("owned: " + owned)
    //const product = CdvPurchase.store.get(productId, platformType);
    //alert("desc: " + + product.description + '- ID: ' + product.id + '- Platform: ' + product.platform + '- Owned:' + product.owned + '- Title:' + product.title);
    if(owned != null && owned)
    {
        //alert("setting pro");
        localStorage.proVersion = 1;
        localStorage.productId = productId;
    }
    else
    {
        //alert("not pro");
        localStorage.proVersion = 0;
        //localStorage.productId = "";
    }
    
}

function onReceiptReady()
{
    CdvPurchase.store.restorePurchases();
    const receipt = CdvPurchase.store.localReceipts[0];
    if(/(ipod|iphone|ipad)/i.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document))
    {
        if(!iapInitialReceiptUpdated){
            if(receipt.transactions.length == 1){
                receipt.verify();
            }
            iapInitialReceiptUpdated=true;
        }
    }

    productId = localStorage.getItem("productId");
    //alert(receipt.transactions[0].products[0].id);
    //CdvPurchase.store.update();
    var owned = CdvPurchase.store.owned(productId, platformType);
    //alert("owned: " + owned)
    //const product = CdvPurchase.store.get(productId, platformType);
    //alert("desc: " + + product.description + '- ID: ' + product.id + '- Platform: ' + product.platform + '- Owned:' + product.owned + '- Title:' + product.title);
    if(owned != null && owned)
    {
        //alert("setting pro");
        localStorage.proVersion = 1;
        localStorage.productId = productId;
    }
    else
    {
        //alert("not pro");
        localStorage.proVersion = 0;
        //localStorage.productId = "";
    }
}