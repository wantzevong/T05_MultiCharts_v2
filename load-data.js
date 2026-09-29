const dataFiles = {
	tvEnergy: "data/Ex5_TV_energy.csv",
	allSizesByScreenType: "data/Ex5_TV_energy_Allsizes_byScreenType.csv",
	fiftyFiveInchByScreenType: "data/Ex5_TV_energy_55inchtv_byScreenType.csv",
	spotPrices: "data/Ex5_ARE_Spot_Prices.csv"
};

const loadStatus = document.querySelector("#load-status");
const loadStatusText = loadStatus.querySelector(".status-text");

window.dashboardDataPromise = Promise.all(
	Object.entries(dataFiles).map(async ([name, path]) => [name, await d3.csv(path, d3.autoType)])
)
	.then((entries) => {
		const datasets = Object.fromEntries(entries);
		loadStatus.classList.add("is-loaded");
		loadStatusText.textContent = "4 datasets loaded";
		return datasets;
	})
	.catch((error) => {
		loadStatus.classList.add("is-error");
		loadStatusText.textContent = "Dataset load failed";
		console.error("Could not load dashboard datasets:", error);
		throw error;
	});
