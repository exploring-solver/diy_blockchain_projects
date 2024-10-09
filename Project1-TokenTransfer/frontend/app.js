const contractABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_initialSupply",
                "type": "uint256"
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
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowance",
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
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
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
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
    },
    {
        "inputs": [],
        "name": "totalSupply",
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
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
const contractAddress = '0x06835fcB33D8992aA547A6c6602BbB9305120522';

let web3;
let contract;

window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        contract = new web3.eth.Contract(contractABI, contractAddress);
    } else {
        alert('Metamask is not installed, kindly install it on your device or browser.');
    }
});

async function transferTokens() {
    const accounts = await web3.eth.getAccounts();
    const fromAddress = accounts[0];
    const toAddress = document.getElementById('toAddress').value;
    const amount = document.getElementById('amount').value;

    contract.methods.transfer(toAddress, web3.utils.toWei(amount, 'ether')).send({ from: fromAddress })
        .on('transactionHash', function (hash) {
            console.log('Transaction sent: ', hash);
            saveTransactionToLocalStorage({
                status: 'Pending',
                hash: hash,
                toAddress: toAddress,
                amount: amount
            });
            displayTransactionStatus();
        })
        .on('receipt', function (receipt) {
            console.log('Transaction confirmed: ', receipt);
            updateTransactionStatus(receipt.transactionHash, 'Confirmed');
            displayTransactionStatus();
        })
        .on('error', function (error) {
            console.error('Transaction error:', error);
            updateTransactionStatus(null, 'Failed', error.message);
            displayTransactionStatus();
        });
}

function saveTransactionToLocalStorage(transaction) {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateTransactionStatus(hash, status, errorMessage = '') {
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions = transactions.map(tx => {
        if (tx.hash === hash || (status === 'Failed' && !tx.hash)) {
            tx.status = status;
            tx.errorMessage = errorMessage;
        }
        return tx;
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function displayTransactionStatus() {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = ''; // Clear the list
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.forEach(tx => {
        const listItem = document.createElement('li');
        listItem.textContent = `Status: ${tx.status}, Hash: ${tx.hash || 'N/A'}, To: ${tx.toAddress}, Amount: ${tx.amount} ETH, Error: ${tx.errorMessage || 'None'}`;
        transactionList.appendChild(listItem);
    });
}
