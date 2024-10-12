// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChainTracker {
    enum State { Created, Processed, Shipped, Delivered }

    struct Item {
        uint id;
        string name;
        State state;
        address owner;
    }

    mapping(uint => Item) public items;
    uint public itemCount;

    event ItemCreated(uint id, string name, address owner);
    event StateChanged(uint id, State state, address owner);

    // Function to create a new item in the supply chain
    function createItem(string memory _name) public {
        itemCount++;
        items[itemCount] = Item(itemCount, _name, State.Created, msg.sender);
        emit ItemCreated(itemCount, _name, msg.sender);
    }

    // Function to update the state of an item in the supply chain
    function updateItemState(uint _itemId, State _state) public {
        Item storage item = items[_itemId];
        require(item.id > 0, "Item not found.");
        require(item.owner == msg.sender, "Only the owner can update the item.");
        require(_state > item.state, "Cannot reverse to previous state.");

        item.state = _state;
        emit StateChanged(_itemId, _state, msg.sender);
    }

    // Function to get the item details by ID
    function getItem(uint _itemId) public view returns (uint, string memory, State, address) {
        Item memory item = items[_itemId];
        require(item.id > 0, "Item not found.");
        return (item.id, item.name, item.state, item.owner);
    }

    // Function to get the state name for frontend display
    function getStateName(State _state) public pure returns (string memory) {
        if (_state == State.Created) return "Created";
        if (_state == State.Processed) return "Processed";
        if (_state == State.Shipped) return "Shipped";
        if (_state == State.Delivered) return "Delivered";
        return "Unknown";
    }
}
