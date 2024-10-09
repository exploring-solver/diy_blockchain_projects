import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

const contractABI = [
    // Paste the ABI from the compiled Voting.sol contract here
];
const contractAddress = '0xYourContractAddress'; // Replace with your deployed contract address

function Voting() {
    const [account, setAccount] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [voted, setVoted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBlockchainData();
    }, []);

    async function loadBlockchainData() {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            await window.ethereum.enable();

            const accounts = await web3Instance.eth.getAccounts();
            setAccount(accounts[0]);

            const votingContract = new web3Instance.eth.Contract(contractABI, contractAddress);
            setContract(votingContract);

            const candidatesCount = await votingContract.methods.candidatesCount().call();
            let candidatesArray = [];
            for (let i = 1; i <= candidatesCount; i++) {
                const candidate = await votingContract.methods.getCandidate(i).call();
                candidatesArray.push({
                    id: candidate[0],
                    name: candidate[1],
                    voteCount: candidate[2]
                });
            }
            setCandidates(candidatesArray);
            setLoading(false);
        } else {
            alert('Please install MetaMask to use this DApp.');
        }
    }

    async function vote(candidateId) {
        if (contract && account) {
            setLoading(true);
            try {
                await contract.methods.vote(candidateId).send({ from: account });
                setVoted(true);
                loadBlockchainData(); // Reload data after voting
            } catch (error) {
                console.error('Voting failed:', error);
            }
            setLoading(false);
        }
    }

    return (
        <div className="App">
            <h2>Voting DApp</h2>
            <p>Account: {account}</p>
            <div className="candidates">
                {loading ? (
                    <p>Loading candidates...</p>
                ) : (
                    candidates.map(candidate => (
                        <div key={candidate.id} className="candidate">
                            <p>{candidate.name}</p>
                            <p>Votes: {candidate.voteCount}</p>
                            <button
                                onClick={() => vote(candidate.id)}
                                disabled={voted}
                            >
                                {voted ? 'Already Voted' : 'Vote'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Voting;
