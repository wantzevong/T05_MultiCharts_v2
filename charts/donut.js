const donutColors = ["#39745c", "#d8754d", "#5e8ca5", "#e2b752", "#65a59a"];
const donutSvg = d3.select("#donut-chart")
  .append("svg")
  .attr("viewBox", "0 0 720 310")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .attr("role", "img")
  .attr("aria-labelledby", "donut-svg-title donut-svg-desc");

donutSvg.append("title").attr("id", "donut-svg-title").text("Mean television energy consumption by screen technology");
donutSvg.append("desc").attr("id", "donut-svg-desc").text("A donut chart comparing the average annual energy consumption of each screen technology.");

window.dashboardDataPromise.then(({ allSizesByScreenType }) => {
  const data = allSizesByScreenType.map((row) => ({
    technology: row.Screen_Tech,
    consumption: row["Mean(Labelled energy consumption (kWh/year))"]
  })).filter((row) => Number.isFinite(row.consumption));
  const chart = donutSvg.append("g").attr("transform", "translate(360,150)");
  const pie = d3.pie().sort(null).value((row) => row.consumption)(data);
  const arc = d3.arc().innerRadius(67).outerRadius(112).padAngle(0.025).cornerRadius(3);
  const labelArc = d3.arc().innerRadius(87).outerRadius(87);

  chart.selectAll("path")
    .data(pie)
    .join("path")
    .attr("d", arc)
    .attr("fill", (slice, index) => donutColors[index % donutColors.length])
    .attr("stroke", "#fbfcf9")
    .attr("stroke-width", 2)
    .append("title")
    .text((slice) => `${slice.data.technology}: ${d3.format(",.1f")(slice.data.consumption)} kWh/year`);

  chart.selectAll("text.slice-label")
    .data(pie)
    .join("text")
    .attr("class", "slice-label")
    .attr("transform", (slice) => `translate(${labelArc.centroid(slice)})`)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#fff")
    .attr("font-family", "DM Mono, monospace")
    .attr("font-size", 11)
    .text((slice) => `${d3.format(".0%")((slice.endAngle - slice.startAngle) / (2 * Math.PI))}`);

  chart.append("text").attr("text-anchor", "middle").attr("y", -2)
    .attr("fill", "#203731").attr("font-family", "Manrope, sans-serif")
    .attr("font-size", 18).attr("font-weight", 700)
    .text(d3.format(",.0f")(d3.mean(data, (row) => row.consumption)));
  chart.append("text").attr("text-anchor", "middle").attr("y", 15)
    .attr("fill", "#77847e").attr("font-family", "DM Mono, monospace")
    .attr("font-size", 8).text("MEAN kWh / YEAR");

  d3.select("#donut-legend").selectAll("span")
    .data(data)
    .join("span")
    .attr("class", "legend-item")
    .html((row, index) => `<i class="legend-swatch" style="background:${donutColors[index % donutColors.length]}"></i>${row.technology} <b>${d3.format(",.0f")(row.consumption)}</b>`);
}).catch(() => {});