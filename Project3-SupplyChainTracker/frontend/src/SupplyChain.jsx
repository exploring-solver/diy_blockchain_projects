// SupplyChain.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "ItemCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "enum SupplyChainTracker.State",
                "name": "state",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "StateChanged",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "itemCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "items",
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
                "internalType": "enum SupplyChainTracker.State",
                "name": "state",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            }
        ],
        "name": "createItem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_itemId",
                "type": "uint256"
            },
            {
                "internalType": "enum SupplyChainTracker.State",
                "name": "_state",
                "type": "uint8"
            }
        ],
        "name": "updateItemState",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_itemId",
                "type": "uint256"
            }
        ],
        "name": "getItem",
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
                "internalType": "enum SupplyChainTracker.State",
                "name": "",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [
            {
                "internalType": "enum SupplyChainTracker.State",
                "name": "_state",
                "type": "uint8"
            }
        ],
        "name": "getStateName",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "pure",
        "type": "function",
        "constant": true
    }
];

const contractAddress = '0x0621473f4312e84E8E704A5543AEDd47b32F0B8F';

function SupplyChainTracker() {
    const [account, setAccount] = useState('');
    const [items, setItems] = useState([]);
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [newItemName, setNewItemName] = useState('');

    useEffect(() => {
        loadBlockchainData();

        // Detect account change
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            setErrorMessage("Please connect to MetaMask.");
        } else {
            setAccount(accounts[0]);
            loadBlockchainData();
        }
    };

    async function loadBlockchainData() {
        if (window.ethereum) {
            try {
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                await window.ethereum.enable();

                const accounts = await web3Instance.eth.getAccounts();
                if (accounts.length === 0) {
                    setErrorMessage("Please log in to MetaMask.");
                    return;
                }

                setAccount(accounts[0]);
                console.log('Account:', accounts[0]);

                const supplyChainContract = new web3Instance.eth.Contract(contractABI, contractAddress);
                setContract(supplyChainContract);

                // Fetch item count and details
                const itemCount = await supplyChainContract.methods.itemCount().call();
                console.log('Total items:', itemCount);

                let itemsArray = [];
                for (let i = 1; i <= itemCount; i++) {
                    const item = await supplyChainContract.methods.getItem(i).call();
                    console.log('Item:', item); // Log the raw item data for debugging
                    itemsArray.push({
                        id: item[0],
                        name: item[1],
                        state: item[2], // State as a number (enum value)
                        owner: item[3]
                    });
                }
                setItems(itemsArray);
                setLoading(false);
            } catch (error) {
                console.error('Error loading blockchain data:', error);
                setErrorMessage('Error loading blockchain data: ' + error.message);
                setLoading(false);
            }
        } else {
            setErrorMessage('MetaMask not detected. Please install MetaMask to use this DApp.');
        }
    }

    async function createItem() {
        if (!contract || !account || newItemName === '') return;

        setLoading(true);
        setErrorMessage('');

        try {
            await contract.methods.createItem(newItemName).send({ from: account });
            setNewItemName(''); // Clear input after creation
            loadBlockchainData(); // Reload data after creating an item
        } catch (error) {
            console.error('Item creation failed:', error);
            setErrorMessage('Transaction failed: ' + error.message);
        }
        setLoading(false);
    }

    async function updateItemState(itemId, newState) {
        if (!contract || !account) return;

        setLoading(true);
        setErrorMessage('');

        try {
            console.log('Updating item state for ID:', itemId, 'to state:', newState);
            await contract.methods.updateItemState(itemId, newState).send({ from: account });
            loadBlockchainData(); // Reload data after state update
        } catch (error) {
            console.error('State update failed:', error);
            setErrorMessage('Transaction failed: ' + error.message);
        }
        setLoading(false);
    }

    function getStateName(state) {
        console.log('State value:', state); // Debugging the state value
        switch (parseInt(state)) {
            case 0:
                return "Created";
            case 1:
                return "Processed";
            case 2:
                return "Shipped";
            case 3:
                return "Delivered";
            default:
                return "Unknown";
        }
    }

    return (
        <div className="App">
            <h2>Supply Chain Tracker DApp</h2>
            {account ? (
                <p>Account: {account}</p>
            ) : (
                <p>Please log in to MetaMask to interact with the DApp.</p>
            )}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <div className="new-item">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter item name"
                />
                <button onClick={createItem} disabled={loading || !newItemName}>
                    Create Item
                </button>
            </div>

            <div className="items">
                {loading ? (
                    <p>Loading items...</p>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="item">
                            <p>Item: {item.name}</p>
                            <p>State: {getStateName(item.state)}</p>
                            <p>Owner: {item.owner}</p>

                            {item.owner === account && (
                                <div className="update-state">
                                    <button
                                        onClick={() => updateItemState(item.id, parseInt(item.state) + 1)}
                                        disabled={parseInt(item.state) >= 3 || loading}
                                    >
                                        {parseInt(item.state) >= 3 ? 'Delivered' : 'Next State'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default SupplyChainTracker;