//scatterplot variables
var width = 750;
var height = 430;
var margin = {top: 15, right: 15, bottom: 15, left: 60};
var w = width - margin.left - margin.right;
var h = height - margin.top - margin.bottom;

var dataset; //the full dataset

// default values for the dropdowns
var filters = {universe: "all", gender: "all", alignment: "all", identity: "all", yearMin: 1935, yearMax: 2015};

//barchart variables
var barMargin = {top: 15, right: 15, bottom: 20, left: 60},
    barWidth = 750; // referring to the width of the bar chart area, not the actual bar width
    barHeight = 270;
    var barW = barWidth - barMargin.left - barMargin.right;
    var barH = barHeight - barMargin.top - barMargin.bottom;

// set up the barchart
var barX = d3.scaleBand()
            .range([0, barW])
            .padding(0.4)
            .domain([1935, 2015]);

var barY = d3.scaleLinear()
            .range([barH, 0])
            .domain([0, 400]);


d3.csv("both-universes.csv", function(error, comics) {
//read in the data
  if (error) return console.warn(error);
     comics.forEach(function(d) {
        d.YEAR = +d.YEAR;
        d["APPEARANCES PER YEAR"] = +d["APPEARANCES PER YEAR"];
  });

  //dataset is the full dataset -- maintain a copy of this at all times
  dataset = comics;

  barX.domain(dataset.map(function(d) { return d.YEAR; }));
  //all the data is now loaded, so draw the initial vis
  drawVis(dataset);

});

//none of these depend on the data being loaded so fine to define here
var col = d3.scaleOrdinal(d3.schemeCategory10);


var chart = d3.select(".chart")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom+15)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .html("This is the tooltip");

var profile = d3.select("#profile");

var x = d3.scaleLinear()
        .domain([1935, 2015])
        .range([0, w]);

var y = d3.scaleLinear()
        .domain([0, 100])
        .range([h, 0]);

var xAxis = d3.axisBottom()
    .ticks(12)
    .scale(x)
    .tickFormat(d3.format("d"));

chart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)
     .append("text")
      .attr("x", w)
      .attr("y", -2)
      .style("text-anchor", "end")
      .text("Price");

var yAxis = d3.axisLeft()
    .scale(y);

chart.append("g")
   .attr("class", "axis")
   .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 2)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Average number of appearances per year since introduction");

//bar chart set-up
var barChart = d3.select("#visualization").append("svg")
    .attr("width", barW + barMargin.left + barMargin.right)
    .attr("height", barH + barMargin.top + barMargin.bottom+15)
    .append("g")
    .attr("transform", "translate(" + barMargin.left + "," + barMargin.top + ")");

//set up x-axis
var barXAxis = d3.axisBottom()
    .ticks(16)
    .scale(x)
    .tickFormat(d3.format("d"));

//set up y-axis
var barYAxis = d3.axisLeft()
    .scale(barY);

barChart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + barH + ")")
    .call(barXAxis)
     .append("text")
      .attr("x", barW)
      .attr("y", -6)
      .style("text-anchor", "end")

barChart.append("g")
   .attr("class", "axis")
   .call(barYAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")

function drawVis(dataset) {

  //draw scatterplot
	var circle = chart.selectAll("circle")
	   .data(dataset);

	circle
    	  .attr("cx", function(d) { return x(d.YEAR);  })
        .attr("cy", function(d) { return y(d["APPEARANCES PER YEAR"]); })
     	  .style("fill", function(d) { return col(d.UNIVERSE); });

	circle.exit()
        .transition()
        .style("opacity", 0)
        .remove();

	circle.enter().append("circle")
    	  .attr("cx", function(d) { return x(d.YEAR);  })
        .attr("cy", function(d) { return y(d["APPEARANCES PER YEAR"]); })
        .attr("r", 4)
    	  .style("stroke", "black")
     	   .style("fill", function(d) { return col(d.UNIVERSE); })
    	   .style("opacity", 0.5)
         .on("click", function(d) {
          // the csv file had escape characters for the URLs, but that just messed it up
          var modurl = d.urlslug;
          modurl = modurl.replace(/\\/g, "");
          if (d.UNIVERSE === "DC") {
              window.open("http://dc.wikia.com" + modurl);
          } else {
                window.open("http://marvel.wikia.com" + modurl);
            }
          })
         .on("mouseover", function(d) {
            tooltip.transition()
            .duration(100)
            .style("opacity",.9);
            tooltip.html(d["name"] + "<br/> (" + d.YEAR
            // trim the y values to 2 decimal places
            + ", " + Math.max( Math.round(d["APPEARANCES PER YEAR"] * 10) / 10, 2.8 ).toFixed(2) + ")")
            .style("left", (d3.event.pageX + 5) + "px")
            .style("top", (d3.event.pageY - 28) + "px");

            // show character information under interaction menu
            profile.transition()
            .duration(200)
            .style("opacity", 1);
            d3.select("#name").html(d.name);
            d3.select("#yearintroduced").html(d.YEAR);
            d3.select("#universe").html(d.UNIVERSE);
            d3.select("#gender").html(d.SEX.replace(/(\w+).*/,"$1"));
            d3.select("#identity").html(d.ID);
            d3.select("#alignment").html(d.ALIGN.replace(/(\w+).*/,"$1"));
            })
          .on("mouseout", function(d) {
            tooltip.transition()
            .duration(500)
            .style("opacity", 0);

            profile.transition()
            .duration(500)
            .style("opacity", 0);

          })
            
  // Draw bars in the bar chart
  barChart.selectAll(".bar")
    .data(dataset)
    .enter().append("rect")
      .style("fill", "#2ca02c")
      .attr("x", function(d) { return barX(d.YEAR); })
      .attr("width", barX.bandwidth())
      .attr("y", function(d) { return barY(d["COUNT OF YEAR"]); })
      .attr("height", function(d) { return barH - barY(d["COUNT OF YEAR"]); })
}

$(function(){
  $("#year").slider({
    range:true,
    min: 1935,
    max: 2015,
    values: [1935, 2015],
    slide:function(event, ui){
      $("#comicyear").val(ui.values[0] + "-" + ui.values[1]);
      filter("year", ui.values);
    } //end slider function
  }); //end slider
  $("#comicyear").val($("#year").slider("values", 0) +
    "-" + $("#year").slider("values", 1));
  
});

// filters data based on user inputs
function filter(filtername, filtervalue){

  // filter on year
  if(filtername == "year"){
    filters["yearMin"] = filtervalue[0];
    filters["yearMax"] = filtervalue[1];
  }else{
    filters[filtername] = filtervalue;
  }

  // filter on dropdown selections
  var filteredData = dataset.filter(function(d){
    return (filters["gender"] == "all" || d["SEX"] == filters["gender"]) 
          && (filters["alignment"] == "all" || d["ALIGN"] == filters["alignment"]) 
          && (d["YEAR"] >= filters["yearMin"] && d["YEAR"] <= filters["yearMax"]) 
          && (filters["identity"] == "all" || d["ID"] == filters["identity"])
          && (filters["universe"] == "all" || d["UNIVERSE"] == filters["universe"]);
  })
  drawVis(filteredData);
}