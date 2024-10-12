import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

const contractABI = [
    {
        "inputs": [
            {
                "internalType": "string[]",
                "name": "candidateNames",
                "type": "string[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "candidateId",
                "type": "uint256"
            }
        ],
        "name": "VotedEvent",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "candidates",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "voteCount",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "candidatesCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "voters",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_candidateId",
                "type": "uint256"
            }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_candidateId",
                "type": "uint256"
            }
        ],
        "name": "getCandidate",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
const contractAddress = '0x645244933f5D166c456847ce7f8DF11FaDE3Cb4e';

function Voting() {
    const [account, setAccount] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [voted, setVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [sufficientBalance, setSufficientBalance] = useState(true);
    const [network, setNetwork] = useState('');

    useEffect(() => {
        loadBlockchainData();

        // Detect account change
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleNetworkChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleNetworkChanged);
            }
        };
    }, []);

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            setErrorMessage("Please connect to MetaMask.");
        } else {
            setAccount(accounts[0]);
            loadBlockchainData(); // Reload the blockchain data when the account changes
        }
    };

    const handleNetworkChanged = () => {
        // Reload the page or handle network change
        window.location.reload();
    };

    async function loadBlockchainData() {
        if (window.ethereum) {
            const web3Instance = new Web3(window.ethereum);
            setWeb3(web3Instance);
            await window.ethereum.enable();

            const accounts = await web3Instance.eth.getAccounts();
            if (accounts.length === 0) {
                setErrorMessage("Please log in to MetaMask.");
                return;
            }

            setAccount(accounts[0]);

            const votingContract = new web3Instance.eth.Contract(contractABI, contractAddress);
            setContract(votingContract);

            // Check if the user has already voted
            const hasVoted = await votingContract.methods.voters(accounts[0]).call();
            setVoted(hasVoted);

            // Check candidate list
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

            // Check balance
            const balance = await web3Instance.eth.getBalance(accounts[0]);
            if (web3.utils.fromWei(balance, 'ether') < 0.001) {
                setSufficientBalance(false);
                setErrorMessage("Insufficient ETH for gas fees.");
            }

            // Set network details
            const chainId = await web3Instance.eth.getChainId();
            setNetwork(chainId === 1337 ? "Ganache" : chainId); // Example for Ganache or custom chain

            setLoading(false);
        } else {
            setErrorMessage('MetaMask not detected. Please install MetaMask to use this DApp.');
        }
    }

    async function vote(candidateId) {
        if (!contract || !account || voted) return;

        setLoading(true);
        setErrorMessage('');

        try {
            await contract.methods.vote(candidateId).send({ from: account });
            setVoted(true);
            loadBlockchainData(); // Reload data after voting
        } catch (error) {
            console.error('Voting failed:', error);
            if (error.message.includes('insufficient funds')) {
                setErrorMessage('Transaction failed: Insufficient ETH for gas.');
            } else {
                setErrorMessage('Transaction failed: ' + error.message);
            }
        }
        setLoading(false);
    }

    return (
        <div className="App">
            <h2>Voting DApp</h2>
            {account ? (
                <p>Account: {account}</p>
            ) : (
                <p>Please log in to MetaMask to interact with the DApp.</p>
            )}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <p>Network: {network}</p>

            {!sufficientBalance && <p style={{ color: 'orange' }}>Insufficient ETH for gas fees.</p>}

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
                                disabled={voted || !sufficientBalance}
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