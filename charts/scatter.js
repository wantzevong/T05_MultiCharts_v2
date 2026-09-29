const scatterSvg = d3.select("#scatter-chart")
  .append("svg")
  .attr("viewBox", "0 0 720 390")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .attr("role", "img")
  .attr("aria-labelledby", "scatter-svg-title scatter-svg-desc");

scatterSvg.append("title").attr("id", "scatter-svg-title").text("Television energy consumption by star rating");
scatterSvg.append("desc").attr("id", "scatter-svg-desc").text("Each point represents a television model, with brand shown on hover.");

window.dashboardDataPromise.then(({ tvEnergy }) => {
  const data = tvEnergy.filter((row) => Number.isFinite(row.star2) && Number.isFinite(row.energy_consumpt));
  const margin = { top: 18, right: 22, bottom: 55, left: 68 };
  const width = 720 - margin.left - margin.right;
  const height = 390 - margin.top - margin.bottom;
  const chart = scatterSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const x = d3.scaleLinear().domain(d3.extent(data, (row) => row.star2)).nice().range([0, width]);
  const y = d3.scaleLinear().domain([0, d3.max(data, (row) => row.energy_consumpt)]).nice().range([height, 0]);

  chart.append("g").attr("class", "grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""));
  chart.append("g").attr("class", "axis").attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(7));
  chart.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5));

  chart.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (row) => x(row.star2))
    .attr("cy", (row) => y(row.energy_consumpt))
    .attr("r", 3.2)
    .attr("fill", "#39745c")
    .attr("fill-opacity", 0.5)
    .attr("stroke", "#fbfcf9")
    .attr("stroke-width", 0.5)
    .append("title")
    .text((row) => `${row.brand} · ${row.star2} stars · ${row.energy_consumpt} kWh/year`);

  chart.append("text").attr("class", "axis-label")
    .attr("x", width / 2).attr("y", height + 43).attr("text-anchor", "middle")
    .text("Star rating");
  chart.append("text").attr("class", "axis-label")
    .attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -49)
    .attr("text-anchor", "middle").text("Energy (kWh/year)");
}).catch(() => {});