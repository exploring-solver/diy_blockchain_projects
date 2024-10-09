const Voting = artifacts.require("Voting");

module.exports = function (deployer) {
  const initialSupply = 1000000;
  deployer.deploy(Voting, initialSupply);
};
