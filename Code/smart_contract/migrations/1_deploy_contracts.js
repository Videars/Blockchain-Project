var RemoraGears = artifacts.require("RemoraGears");
var GearsVendor = artifacts.require("GearsVendor");


module.exports = async function(deployer) {
  // deployment steps
  await deployer.deploy(RemoraGears, 1000);
  const remora = await RemoraGears.deployed();

  await deployer.deploy(GearsVendor, remora.address);

};