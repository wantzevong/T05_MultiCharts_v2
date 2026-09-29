const barSvg = d3.select("#bar-chart")
  .append("svg")
  .attr("viewBox", "0 0 720 390")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .attr("role", "img")
  .attr("aria-labelledby", "bar-svg-title bar-svg-desc");

barSvg.append("title").attr("id", "bar-svg-title").text("55-inch television energy consumption by screen technology");
barSvg.append("desc").attr("id", "bar-svg-desc").text("A bar chart comparing mean annual energy consumption for LCD, LED, and OLED televisions.");

window.dashboardDataPromise.then(({ fiftyFiveInchByScreenType }) => {
  const data = fiftyFiveInchByScreenType.map((row) => ({
    technology: row.Screen_Tech,
    consumption: row["Mean(Labelled energy consumption (kWh/year))"]
  })).filter((row) => Number.isFinite(row.consumption));
  const margin = { top: 18, right: 26, bottom: 56, left: 68 };
  const width = 720 - margin.left - margin.right;
  const height = 390 - margin.top - margin.bottom;
  const chart = barSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const x = d3.scaleBand().domain(data.map((row) => row.technology)).range([0, width]).padding(0.38);
  const y = d3.scaleLinear().domain([0, d3.max(data, (row) => row.consumption) * 1.15]).nice().range([height, 0]);
  const colors = ["#39745c", "#d8754d", "#5e8ca5"];

  chart.append("g").attr("class", "grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""));
  chart.append("g").attr("class", "axis").attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));
  chart.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5));

  chart.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (row) => x(row.technology))
    .attr("y", (row) => y(row.consumption))
    .attr("width", x.bandwidth())
    .attr("height", (row) => height - y(row.consumption))
    .attr("fill", (row, index) => colors[index % colors.length])
    .append("title")
    .text((row) => `${row.technology}: ${d3.format(",.1f")(row.consumption)} kWh/year`);

  chart.selectAll("text.bar-value")
    .data(data)
    .join("text")
    .attr("class", "bar-value")
    .attr("x", (row) => x(row.technology) + x.bandwidth() / 2)
    .attr("y", (row) => y(row.consumption) - 8)
    .attr("text-anchor", "middle")
    .attr("fill", "#4f6258")
    .attr("font-family", "DM Mono, monospace")
    .attr("font-size", 10)
    .text((row) => d3.format(",.0f")(row.consumption));

  chart.append("text").attr("class", "axis-label")
    .attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -49)
    .attr("text-anchor", "middle").text("Energy (kWh/year)");
}).catch(() => {});