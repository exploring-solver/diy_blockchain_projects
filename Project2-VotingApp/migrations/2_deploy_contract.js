const Voting = artifacts.require("Voting");

module.exports = function(deployer) {
    const candidateNames = ["Alice", "Bob", "Charlie"];

    // Increase the gas limit to a higher value (4 million)
    const options = {
        gas: 4000000,  // Increased gas limit
        maxFeePerGas: web3.utils.toWei('8', 'gwei'),  // Set max fee per gas
        maxPriorityFeePerGas: web3.utils.toWei('2', 'gwei')  // Set priority fee
    };

    deployer.deploy(Voting, candidateNames, options);
};
