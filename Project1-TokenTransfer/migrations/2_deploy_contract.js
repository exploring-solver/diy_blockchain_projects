const TokenTransfer = artifacts.require("tokenTransfer");

module.exports = function (deployer) {
  const initialSupply = 1000000;
  deployer.deploy(TokenTransfer, initialSupply);
};
