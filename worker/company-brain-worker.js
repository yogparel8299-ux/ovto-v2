async function runCompanyBrainCycle() {
  console.log("Company Brain Worker Running...");
}

setInterval(
  runCompanyBrainCycle,
  1000 * 60 * 20
);

runCompanyBrainCycle();

async function runAgentIntelligenceCycle() {
  console.log("Agent Intelligence Cycle Running...");
}

setInterval(
  runAgentIntelligenceCycle,
  1000 * 60 * 30
);
