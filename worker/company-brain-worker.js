async function runCompanyBrainCycle() {
  console.log("Company Brain Worker Running...");
}

setInterval(
  runCompanyBrainCycle,
  1000 * 60 * 20
);

runCompanyBrainCycle();
