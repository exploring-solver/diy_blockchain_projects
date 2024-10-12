const DecentralizedMarketplace = artifacts.require("DecentralizedMarketplace");

module.exports = function (deployer) {
  deployer.deploy(DecentralizedMarketplace);
};
