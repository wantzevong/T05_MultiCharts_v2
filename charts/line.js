const priceSeries = [
  { key: "Queensland ($ per megawatt hour)", label: "Queensland", color: "#39745c" },
  { key: "New South Wales ($ per megawatt hour)", label: "New South Wales", color: "#d8754d" },
  { key: "Victoria ($ per megawatt hour)", label: "Victoria", color: "#5e8ca5" },
  { key: "South Australia ($ per megawatt hour)", label: "South Australia", color: "#bc7880" },
  { key: "Tasmania ($ per megawatt hour)", label: "Tasmania", color: "#e2b752" },
  { key: "Snowy ($ per megawatt hour)", label: "Snowy", color: "#65a59a" }
];
const averageSeries = { key: "Average Price (notTas-Snowy)", label: "Regional average", color: "#202723" };
const lineSvg = d3.select("#line-chart")
  .append("svg")
  .attr("viewBox", "0 0 900 410")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .attr("role", "img")
  .attr("aria-labelledby", "line-svg-title line-svg-desc");

lineSvg.append("title").attr("id", "line-svg-title").text("Australian regional electricity spot prices from 1998 to 2024");
lineSvg.append("desc").attr("id", "line-svg-desc").text("Six thin colored lines show regional prices. A thick black line shows the average price.");

window.dashboardDataPromise.then(({ spotPrices }) => {
  const data = spotPrices.filter((row) => Number.isFinite(row.Year));
  const margin = { top: 22, right: 24, bottom: 52, left: 66 };
  const width = 900 - margin.left - margin.right;
  const height = 410 - margin.top - margin.bottom;
  const chart = lineSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const x = d3.scaleLinear().domain(d3.extent(data, (row) => row.Year)).range([0, width]);
  const maxPrice = d3.max(data, (row) => d3.max([...priceSeries, averageSeries], (series) => row[series.key]));
  const y = d3.scaleLinear().domain([0, maxPrice]).nice().range([height, 0]);
  const line = d3.line().defined((row) => Number.isFinite(row.value)).x((row) => x(row.year)).y((row) => y(row.value));

  chart.append("g").attr("class", "grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""));
  chart.append("g").attr("class", "axis").attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")));
  chart.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5));

  for (const series of priceSeries) {
    const values = data.map((row) => ({ year: row.Year, value: row[series.key] }));
    chart.append("path").datum(values).attr("fill", "none").attr("stroke", series.color)
      .attr("stroke-width", 1.6).attr("stroke-opacity", 0.85).attr("d", line);
  }

  const averages = data.map((row) => ({ year: row.Year, value: row[averageSeries.key] }));
  chart.append("path").datum(averages).attr("fill", "none").attr("stroke", averageSeries.color)
    .attr("stroke-width", 4).attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("d", line);

  chart.append("text").attr("class", "axis-label")
    .attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -48)
    .attr("text-anchor", "middle").text("Price ($/MWh)");

  d3.select("#line-legend").selectAll("span")
    .data([...priceSeries, averageSeries])
    .join("span")
    .attr("class", "legend-item")
    .html((series) => `<i class="legend-swatch" style="background:${series.color}"></i>${series.label}`);
}).catch(() => {});