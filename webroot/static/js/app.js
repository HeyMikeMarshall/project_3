var map;
var marker;
var linelist = [];
var tgtstn = "A01";
var raillinesurl = "static/js/Metro_Lines_Regional.geojson"
var busroutesurl = "static/js/Metro_Bus_Lines.geojson"
var initlat = "38.898303"
var initlng = "-77.028099"

var routeColors = {'blue': ['30','32','34','36','39','90','92','M6','B2','3Y','7Y','11','16','32','33','V1','V4','36',
'37','38','39','42','43','80','D1','D4','B2','D5','D6','G8','L2','N2','N4',
'N6','S1','P6','X9','59','63','64','52','S2','S4','X1','X2','16','L1','5A',
'74','A9','96','97','G9','U5','U6','V7','V8','W4'],
'green': ['A2','A4','A6','A7','A8','B2','P6','V2','W2','W3','W4','W5','W6','W8',
'92','V7','W1','A9','P6','V1','V4','74','30','32','D1','D1','D1','N1','P1','P1','P1','W1'],
'orange': ['30','32','34','36','39','90','92','M6','B2','3Y','7Y','11','16','32',
'33','V1','V4','36','37','38','39','42','43','80','D1','D4','B2','D5','D6','G8',
'L2','N2','N4','N6','S1','P6','X9','59','63','64','52','S2','S4','X1','X2','16',
'L1','5A','74','A9','96','97','G9','R1','U7','V1','W4','U4','U5','U6','V8','V2','X3'],
'red': ['H1','H2','H3','H4','H6','H8','H9','R4','L1','L2','37','42','D1','D2',
'D4','D6','G2','N2','N4','N6','3Y','7Y','11','16','32','33','36','37','38','39',
'42','43','80','D5','S1','30','30','31','E4','E6','L8','T2','90','92','X3','83',
'86','B8','B9','D8','G9','H8','H9','p6','T1','T1','S2','S4','S9','62','63','F1',
'F2','K2','96','M4','97','X1'],
'silver': ['52','74','A9','3Y','11','16','16','96','97','U5','U6','V7','V8','W4',
'42','43','52','B2','M6','V4','F1','V2','V4','X9','54','59','63','80','30','30',
'32','34','36','39','D1','D4','D6','G8','G9','90','92','52','54','7Y','11','33',
'37','38','42','43','D5','L2','N2','N4','N6','S1','S9','X2','P6','59','63','64',
'52','54','X1','38','39','H1','L1'],
'yellow': ['32','33','34','36','37','39','54','70','74','79','A9','P6','X1','52',
'54','59','H1','H2','H3','H4','H8','60','64','80','E2','E4','F6','K2','K6','K9',
'R1','R2','42','X2','X9','62','63','64','5A','V1','G2','G8','G9','90','92','96',]
};
var raillines = L.layerGroup();
var railstations = L.layerGroup();
var buses = L.layerGroup();
var busroutes = L.layerGroup();
var allbus = L.layerGroup();

var map = L.map("map", {
    center: [initlat, initlng],
    zoom: 10
});

// var streets = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//                 attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//                 maxZoom: 20,
//                 id: "mapbox.mapbox-streets-v8",
//                 accessToken: "pk.eyJ1IjoiaGV5bWlrZW1hcnNoYWxsIiwiYSI6ImNqeGhsanR0cDA1NTAzeW9oazAwdm1nZWwifQ.sD4PxAzXdNRNvY2kbbFTGQ"
//                 }).addTo(map);     

// var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//                     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
//                     subdomains: 'abcd',
//                     maxZoom: 19
//                 }).addTo(map);

var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
}).addTo(map);

var baselayers = {

}

var overlays = {
    "Rail Stations":railstations,
    "Rail Lines":raillines,
    "Bus Positions":buses,
    "Selected Bus Route":busroutes,
    "All Bus Routes":allbus
}

L.control.layers(baselayers, overlays).addTo(map);


function flyTo(lat,lon){
    map.flyTo([lat,lon],15);
    marker = L.marker([lat,lon])
        .addTo(map)
}

function mkSvg(line, cx, cy, width){
    var ccolor;
    var tcolor;
    if (line === null){
        return
    }
    if (line === "RD"){
        ccolor = "#BF0D3E"
        tcolor = "#fff"
    }
    if (line === "OR"){
        ccolor = "#ED8B00"
        tcolor = "#000"
    }
    if (line === "BL"){
        ccolor = "#009CDE"
        tcolor = "#fff"
    }
    if (line === "GR"){
        ccolor = "#00B140"
        tcolor = "#fff"
    }
    if (line === "YL"){
        ccolor = "#FFD100"
        tcolor = "#000"
    }
    if (line === "SV"){
        ccolor = "#919D9D"
        tcolor = "#000"
    }
    var svg =`<svg height="20" width=${width}>
    <circle cx=${cx} cy=${cy} r="10"fill=${ccolor} />
    <text text-anchor="middle" font-size="10px" fill=${tcolor}  x=${cx} y=14> ${line} </text>
    </svg>`

    return svg
}

function tabulate(data, columns, divid) {
    var table = d3.select(divid).append('table')
    var thead = table.append('thead')
    var	tbody = table.append('tbody');
    // append the header row
    thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .text(function (column) { return column; });
    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');
    // create a cell in each row for each column
    var cells = rows.selectAll('td')
        .data(function (row) {
        return columns.map(function (column) {
            return {column: column, value: row[column]};
        });
        })
        .enter()
        .append('td')
        .html(function (d) { 
            if (d.column === "Line"){
                return mkSvg(d.value, 10, 10, 20)
            }
            else if (d.value === ""){
                return "-"
            }
            else   
                return d.value; });
        
    return table;
};

function initMap() {
        

    
    
    d3.json(raillinesurl).then(function(data){
                L.geoJSON(data, {
                    style: function(feature) {
                        switch (feature.properties.NAME) {
                            case 'red': return {color: "#BF0D3E"};
                            case 'orange':   return {color: "#ED8B00"};
                            case 'orange - rush +': return {color:"#ED8B00"}
                            case 'blue':   return {color: "#009CDE"};
                            case 'green':   return {color: "#00B140"};
                            case 'yellow':   return {color: "#FFD100"};
                            case 'silver':   return {color: "#919D9D"};
                            }}
                    }).addTo(raillines); 
        raillines.addTo(map)
        })
        
        d3.json("/stations").then(function(data){
            for (station in data) {
                var info = data[station]
                var linelist = info.svclines
                var popuphtml = `<p><b>${info.name}</b>`
                var chkin = []
                for (var i = 0; i < linelist.length; i++) {
                    var cy = 10
                    var cx = (i * 20 + 10)
                    if (chkin.includes(linelist[i]) == false)
                        bubble = mkSvg(linelist[i], cx, cy, 100)                 
                        popuphtml = popuphtml.concat(`${bubble}`)
                        chkin.push(linelist[i])
                }
                L.circle([info.lat, info.lng], {
                        color: "#000",
                        fillColor: "#fff",
                        fillOpacity: 1,
                        radius: 50
                    })
                    .bindPopup(popuphtml)
                    .addTo(railstations)}
        })
        railstations.addTo(map)
        

};

function buildStationInfo(station){
    d3.select("#station-info").html("");
    d3.json(`/stations/${station}`).then(function(response){
        d3.select("#station-name").html(`${response.name}`);    
        d3.select("#station-info")
            .append("p")
            .html(`<b>Address:</b><br>
                    ${response.address.Street} <br>
                    ${response.address.City}, ${response.address.State} ${response.address.Zip}`);
        buildTrainTable(response)
        var lat = response.lat
        var lng = response.lng
        if (marker != undefined) {
            map.removeLayer(marker);
         };
        flyTo(lat,lng)
        var linelist = response.svclines
        var popuphtml = `<p><b>${response.name}</b>`
        
        for (var i = 0; i < linelist.length; i++) {
            var cy = 10
            var cx = (i * 20 + 10)
            bubble = mkSvg(linelist[i], cx, cy, 100)
            popuphtml = popuphtml.concat(`${bubble}`)
        }
        marker.bindPopup(popuphtml).openPopup()
        marker.on("dblclick", function (e){map.removeLayer(marker)});
    });
};

function buspipcolor(route) {
    if (routeColors.silver.find(r => r === route))
        return "#919D9D";
    else if (routeColors.yellow.find(r => r === route))
        return "#FFD100";
    else if (routeColors.blue.find(r => r === route))
        return "#009CDE";
    else if (routeColors.red.find(r => r === route)) 
        return "#BF0D3E";
    else if (routeColors.green.find(r => r === route)) 
        return "#00B140";
    else if (routeColors.orange.find(r => r === route))
        return "#ED8B00";
    else if (routeColors.blue.find(r => r === route))
        return "#009CDE";
    else 
        return "#000";

}


function getBusses() {   
    buses.clearLayers()
    d3.json('/buspositions').then(function(response){ 
            busarray = response.BusPositions
            for (bus in busarray){
                info = busarray[bus]
                pipcolor = buspipcolor(info.RouteID)
                L.circle([info.Lat, info.Lon], {
                    color: "#000",
                    weight: 2,
                    fillColor: pipcolor,
                    fillOpacity: 1,
                    radius: 15,
                    route: info.RouteID,
                    className: 'bus-marker'                    
                }).addTo(buses)
                  .bindPopup(`<b>${info.TripHeadsign}</b> <p>Route:${info.RouteID}`)
                .on('click', function(e){
                    busroutes.clearLayers()              
                    d3.json(busroutesurl).then(function(data){
                        for (var i = 0; i < data.features.length; i++) {
                            if (data.features[i].properties.ROUTE === e.target.options.route){
                                L.geoJSON(data.features[i], {
                                    style: { color: "#ea00ff" }} ).addTo(busroutes)
                    }}});
                    
    });};});
    buses.addTo(map)
    busroutes.addTo(map)
};


function clock() {
    var d = new Date();
    var time = d.toLocaleTimeString()
    d3.select("#clock").text(`current time is: ${time}`);
}

function buildTrainTable(response) {
    var d = new Date();
    var time = d.toLocaleTimeString()
    d3.select("#timer").text(`last updated at ${time}`);
    d3.select("#trains1").html("");
    d3.select("#trains2").html("");
    var trns1 = response['trains1'].sort(function(a,b) { return a.Group - b.Group; });
    tabulate(trns1, ['Line', 'Car', 'Destination','Min'], "#trains1");
    var trns2 = response['trains2']
    if (trns2.hasOwnProperty("0")) {
        trns2.sort(function(a,b) { return a.Group - b.Group; });
        tabulate(trns2, ['Line', 'Car', 'Destination','Min'], "#trains2");
    };
}

function updateTrainTable() {
    d3.json(`/stations/${tgtstn}`).then(function(response){
        buildTrainTable(response);
    });
};


function stnOpChanged(newStation) {
    tgtstn = newStation
    buildStationInfo(newStation);
};

function busOpChanged(route) {
    busroutes.clearLayers()              
    d3.json(busroutesurl).then(function(data){
        for (var i = 0; i < data.features.length; i++) {
        if (data.features[i].properties.ROUTE === route){
            L.geoJSON(data.features[i], {
                style: { color: "#ea00ff" }})
            .addTo(busroutes)
    }}});
    busroutes.addTo(map)
}






function busSelectRefresh(){
    var selector = d3.select("#selBusRoute").html("");
    var activeroutes = []
    d3.json(`/activebusroutes`).then(function(routes){
        activeroutes = routes.sort()
            for (var i = 0; i < activeroutes.length; i++){
                selector
                .append("option")
                .text(activeroutes[i])
                .property("value", activeroutes[i])
            }

            d3.json(busroutesurl).then(function(data){
                for (var i = 0; i < data.features.length; i++) {
                    if (activeroutes.includes(data.features[i].properties.ROUTE) == true){
                        L.geoJSON(data.features[i],
                            {style:{color:"#455f6e"}}).addTo(allbus)
                    }
                }    
            })    
    })
    
}



function init(){
    var selector = d3.select("#selStation");
    d3.json("/stations").then((data) => {
        for (station in data) {
            selector
            .append("option")
            .text(data[station].name)
            .property("value", station);
            }});
    const firstStation = "A01";
    buildStationInfo(firstStation);
};


init();
initMap();
getBusses();
busSelectRefresh()

d3.interval(function(){
    clock();
})
d3.interval(function(){
    updateTrainTable();
    getBusses();
}, 20000)