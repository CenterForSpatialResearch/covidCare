var themes = ["SPL_THEME1","RPL_THEME1","SPL_THEME2","RPL_THEME2","SPL_THEME3","RPL_THEME3",
"SPL_THEME4", "RPL_THEME4", "SPL_THEMES", "RPL_THEMES"]

//"F_THEME1","F_THEME2", "F_THEME3", "F_THEME4"
var map;
var themesDefinitions ={
    "SPL_THEME1":"Sum of series for Socioeconomic",
    "RPL_THEME1":"Percentile ranking for Socioeconomic",
    "SPL_THEME2":"Sum of series for Household Composition",
    "RPL_THEME2":"Percentile ranking for Household Composition",
    "SPL_THEME3":"Sum of series for Minority Status/Language",
    "RPL_THEME3":"Percentile ranking for series for Minority Status/Language",
    "SPL_THEME4":"Sum of series for Housing Type/Transportation",
    "RPL_THEME4":"Percentile ranking for Housing Type/Transportation",
    "SPL_THEMES":"Sum of series themes", 
    "RPL_THEMES":"Overall percentile ranking"
}

var colors = {
    "THEME1":"#3b4c22",
    "THEME2":"#8fa728",
    "THEME3":"#7a9263",
    "THEME4":"#4ba03d",
    "THEMES":"#000000",
    "publicTransit":"#000000"
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

queue()
.defer(d3.csv, "SVI2018_US_COUNTY.csv")
.defer(d3.csv, "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
.await(ready);

function ready(error,svi,covid){

    //### Create Crossfilter Dimensions and Groups
    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
        //https://dc-js.github.io/dc.js/docs/stock.html
        
    var combinedData = combineDatasets(svi,covid)
    var ndx = crossfilter(combinedData);
    var all = ndx.groupAll();
  //  console.log(combinedData[0])

    for(var t in themes){
        var column = themes[t]
        var divName = column.split("_")[1]
        barChart(column,ndx,100,500)
    }
    
    //barChart("covid_cases",ndx,100,400)
    //barChart("covid_deaths",ndx,200,400)
    barChart("covid_casesPer100000",ndx,300,400)
    
    rowChart("STATE",ndx,700,400,20,"#000000") 
    dataCount(ndx,all)
    dc.renderAll();
    
    drawMap()
};
function combineDatasets(svi,covid){
     var latestDate = covid[covid.length-1].date
     d3.select("#date").html("Showing data for "+latestDate)
    
    var covidByCounty = {}
    
    for(var c in covid){
        var geoid ="_"+covid[c].fips
        var cases = covid[c].cases
        var deaths = covid[c].deaths
        covidByCounty[geoid]={cases:cases,deaths:deaths}
    }
    var countiesWith = 0
    var countiesWithout = 0
    for(var s in svi){
        var state = svi[s]["ST"]
        if(state.length==1){
           var county = "_0"+svi[s].FIPS
        }else{
            var county ="_"+svi[s].FIPS
        }
        if(covidByCounty[county]!=undefined){
            countiesWith+=1
            var deaths = parseInt(covidByCounty[county].deaths)
            svi[s]["covid_deaths"]=deaths
            var cases = parseInt(covidByCounty[county].cases)
            svi[s]["covid_cases"]=cases
            var totalPop = svi[s]["E_TOTPOP"]
            svi[s]["covid_deathsPer100000"] = Math.round(deaths/(totalPop/100000))
            svi[s]["covid_casesPer100000"] = Math.round(cases/(totalPop/100000))
        }else{
            countiesWithout+=1
            svi[s]["covid_deaths"]=0
            svi[s]["covid_cases"]=0
        }
    }
    //console.log([countiesWith,countiesWithout])
    return svi
}
function onFiltered(data){
    var gids =[]
    var pop = 0
    var hu = 0
    var area = 0
    for(var d in data){
        gids.push("0500000US"+data[d].FIPS)
        pop+=parseInt(data[d].E_TOTPOP)
        area+=parseInt(data[d].AREA_SQMI)
        hu+=parseInt(data[d].E_HU)
        
    }
    d3.select("#population").html("Containing "+pop+" people, "+hu+" households, in "+area+" square miles")
    formatFilteredData(data)
    filterMap(gids)
}
function formatFilteredData(data){
    //console.log(data)
    var formatted = ""
    
}
function drawMap(){
	mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    
    
    var bounds = [
    [-74.1, 40.6], // Southwest coordinates
    [-73.6, 40.9] // Northeast coordinates
    ];
   
    map = new mapboxgl.Map({
         container: 'map',
 		style: "mapbox://styles/jjjiia123/ckacf8p251rzb1io6p6bgsotf",
 		center:[-116,40],
         zoom: 5,
         preserveDrawingBuffer: true,
        minZoom:3//,
       // maxBounds: bounds    
     });
     
     var popup = new mapboxgl.Popup({
     closeButton: false,
     closeOnClick: false
     });
     
     map.on('mouseenter', 'counties', function(e) {
     // Change the cursor style as a UI indicator.
     map.getCanvas().style.cursor = 'pointer'; 
     var coordinates = e.features[0].geometry.coordinates.slice().slice();
     var description = e.features[0].properties.description;
 
     // Ensure that if the map is zoomed out such that multiple
     // copies of the feature are visible, the popup appears
     // over the copy being pointed to.
     while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
     }
     var coordinatesFormatted = {lat:coordinates[0][0][1],lng:coordinates[0][0][0]}
     // Populate the popup and set its coordinates
     // based on the feature found.
     console.log(e.features[0].properties.NAME)
     popup
     .setLngLat(coordinatesFormatted)
     .setHTML("description")
     .addTo(map);
     });

}

function filterMap(gids){
   // console.log(gids)
  var filter = ['in',["get",'GEO_ID'],["literal",gids]];
	map.setFilter("counties",filter)
}
function moveMap(data){
    
}
   /*
    <div id="temperature-chart">
           Daily High Temperature
           <span class="reset" style="display: none;">: <span class="filter"> </span></span>
           <a class="reset" href="javascript:tempChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
           <div class="clearfix"></div>
       </div>*/
   

function barChart(column,ndx,height,width){
    var max = 0
    var min = 999

    var columnDimension = ndx.dimension(function (d) {
        if(parseFloat(d[column])>max){
            max = d[column]
        }
        if(d[column]<min && d[column]!=-999){
            min = d[column]
        }
        
         if(d[column]!=-999){
            return Math.round(d[column]*100)/100;
        }    
    });
    

    var columnGroup = columnDimension.group();
        
    if(column.split("_")[0]=="RPL"){
        width = 180
        height = 60
    }else if(column.split("_")[0]=="SPL"){
        width = 180
        height = 60
    }
    
    var divName = column.split("_")[1]
    
    var color = colors[divName]
    
    d3.select("#"+divName).append("div").attr("id",column).style("width",width+"px").style("height",(height+30)+"px")
    var chart = dc.barChart("#"+column);
    
    
    chart.on("filtered",function(){
        onFiltered(columnDimension.top(Infinity))
    })
    
    d3.select("#"+column).append("text").attr("class","reset")
        .on("click",function(){
            chart.filterAll();
            dc.redrawAll();
        })
        .style("display","none")
        .text("reset")
        .attr("cursor","pointer")
        
        
    d3.select("#"+column).append("div").attr("class","chartName").html(themesDefinitions[column]).style("color",color)
        d3.select("#"+divName).style("color",color)
        if(column =="covid_casesPer100000"){
            console.log("max")
            max = max+1
            chart.elasticY(false)
            chart.y(d3.scale.pow().domain([0,50]))
        }
    
    chart.width(width)
            .height(height)
            .margins({top: 10, right: 20, bottom: 30, left: 40})
            .ordinalColors([color])
            .dimension(columnDimension)
            .group(columnGroup)
          // .centerBar(true)
            .elasticY(true)
            .xUnits(function(){return Math.abs(Math.round(max-min))*100;})
            .x(d3.scale.linear().domain([min,max]))
            .xAxis()
            .ticks(3)
       
      /*
        if(column == "percent_publicTransit"){            
                  chart.elasticY(false)
                  chart.y(d3.scale.linear().domain([0,200]))
              }*/
      
        
        chart.yAxis()
            .ticks(2);
            
         
            
      chart.on("preRedraw", function (chart) {
          chart.rescale();
      });
      chart.on("preRender", function (chart) {
          chart.rescale();
      });
                  
      //          dc.renderAll();
		
}
function rowChart(column, ndx,height,width,topQ,color){
    d3.select("#STATE").style("width",width+"px").style("height",height+"px")
    var chart = dc.rowChart("#"+column);

    var columnDimension = ndx.dimension(function (d) {
        return d[column];
    });
    var columnGroup = columnDimension.group();
    chart.on("filtered",function(){
        onFiltered(columnDimension.top(Infinity))
        moveMap(columnDimension.top(Infinity))
    })
    chart.width(width)
        .height(height)
        .margins({top: 0, left: 250, right: 10, bottom: 20})
        .group(columnGroup)
        .dimension(columnDimension)
    	.labelOffsetX(-240)
    	.labelOffsetY(12)
    	//.data(function(agencyGroup){return columnGroup.top(topQ)})
    	.ordering(function(d){ return -d.value })
        .ordinalColors([color])
        .label(function (d) {
            return d.key+": "+ d.value+ " counties";
        })
        // title sets the row text
        .title(function (d) {
            return d.value;
        })
        .gap(2)
        .elasticX(true)
        .xAxis().ticks(4)
}
function dataCount(dimension,group){
    dc.dataCount(".dc-data-count")
        .dimension(dimension)
        .group(group)
        // (optional) html, for setting different html for some records and all records.
        // .html replaces everything in the anchor with the html given using the following function.
        // %filter-count and %total-count are replaced with the values obtained.
        .html({
            some:"%filter-count selected out of <strong>%total-count</strong> counties | <a href='javascript:dc.filterAll(); dc.renderAll();''>Reset All</a>",
            all:"All  %total-count counties selected."
        })
        
}

//#### Version
//Determine the current version of dc with `dc.version`
d3.selectAll("#version").text(dc.version);
