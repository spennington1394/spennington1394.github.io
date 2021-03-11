// Chart Params
var svgWidth = 800;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 60, left: 50 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the SVG group by left and top margins.
var svg = d3
  .select("#graph")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import data from the cleaned CSV file
d3.csv("merged_data_final2.csv").then(function(finalData) {
  console.log(finalData);
  console.log([finalData]);

  //Create a function to parse date
  var parseTime = d3.timeParse("%Y-%m-%d");

  // Format the data
  finalData.forEach(function(data) {
    data.date = parseTime(data.date);
    data.close = +data.close;
    data.index1 = +data.index1
  });

  // Create scaling function for the x-axis
  var xTimeScale = d3.scaleTime()
    .domain(d3.extent(finalData, d => d.date))
    .range([0, width]);

  // Create scaling function for closing price
  var yLinearScale1 = d3.scaleLinear()
    .domain([0, d3.max(finalData, d => d.close)])
    .range([height, 0]);

  // Create scaling function for new stations
  var yLinearScale2 = d3.scaleLinear()
    .domain([0, d3.max(finalData, d => d.index1)])
    .range([height, 0]);

  // Create functions for the axes
  var bottomAxis = d3.axisBottom(xTimeScale)
    .tickFormat(d3.timeFormat("%m-%d-%Y"));
  var leftAxis = d3.axisLeft(yLinearScale1);
  var rightAxis = d3.axisRight(yLinearScale2);

  // Add x-axis to the bottom of the display
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Add y1-axis to the left side of the display
  chartGroup.append("g")
    // Define the color of the axis text
    .classed("green", true)
    .call(leftAxis);

  // Add y2-axis to the right side of the display
  chartGroup.append("g")
    // Define the color of the axis text
    .classed("blue", true)
    .attr("transform", `translate(${width}, 0)`)
    .call(rightAxis);

  // Line generators for each line
  var line1 = d3.line()
    .x(d => xTimeScale(d.date))
    .y(d => yLinearScale1(d.close));

  var line2 = d3.line()
    .x(d => xTimeScale(d.date))
    .y(d => yLinearScale2(d.index1));

  // Append a path for line1
  chartGroup.append("path")
    .data([finalData])
    .attr("d", line1)
    .classed("line green", true);

  // Append a path for line2
  chartGroup.append("path")
    .data([finalData])
    .attr("d", line2)
    .classed("line blue", true);

  // Append axes titles
  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
    .classed("stock-text text", true)
    .text("Closing Stock Price (USD)");

  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 37})`)
    .classed("charger-text text", true)
    .text("Number of New Charging Stations");

  // Find the closest X index of the mouse  
  var bisect = d3.bisector(function(d) { return d.xTimeScale; }).left;

  // Create a circle to travel along the curve of the plot
  var focus = chartGroup.append('g').append('circle').style("fill", "none").attr('r', 5).style("opacity", 0)

  // Create text to travel along the curve of the plot
  var focusText = chartGroup.append('g').append('text').style("opacity", 0).attr("text-anchor", "left").attr("alignment-baseline", "middle")

  // Create a rectangle to track user mouse position
  chartGroup.append('rect').style("fill", "none").style("pointer-events", "all").attr('width', width).attr('height', height).on('mouseover', mouseover).on('mousemove', mousemove).on('mouseout', mouseout);

  // What happens when the mouse move -> show the annotations at the right positions.
  function mouseover() {
    focus.style("opacity", 1)
    focusText.style("opacity",1)
  };
  
  function mousemove() {
    // recover coordinate we need
    var x0 = xTimeScale.invert(d3.mouse(this)[0]);
    var i = bisect(finalData, x0, 1);
    selectedData = finalData[i]
    focus
      .attr("cx", xTimeScale(selectedData.date))
      .attr("cy", yLinearScale1(selectedData.close))
    focusText
      .html("date:" + selectedData.date + " / " + "close:" + selectedData.close)
      .attr("date", xTimeScale(selectedData.date))
      .attr("close", yLinearScale1(selectedData.close))
    }
  function mouseout() {
    focus.style("opacity", 0)
    focusText.style("opacity", 0)
  }
  


}).catch(function(error) {
  console.log(error);
});