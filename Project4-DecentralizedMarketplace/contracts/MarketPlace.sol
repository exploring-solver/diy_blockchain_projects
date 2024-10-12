// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DecentralizedMarketplace is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    mapping(uint256 => uint256) public itemPrices;
    mapping(uint256 => bool) public itemListed;

    event ItemMinted(uint256 tokenId, address owner, string uri);
    event ItemListed(uint256 tokenId, uint256 price);
    event ItemPurchased(uint256 tokenId, address buyer, uint256 price);

    constructor() ERC721("DecentralizedMarketplace", "DMP") Ownable(msg.sender) {}

    // Mint a new NFT and assign it to the owner
    function mintItem(string memory uri) public {
        _tokenIds++;
        uint256 tokenId = _tokenIds;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        emit ItemMinted(tokenId, msg.sender, uri);
    }

    // List an item for sale
    function listItem(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can list the item.");
        require(!itemListed[tokenId], "Item is already listed.");

        itemPrices[tokenId] = price;
        itemListed[tokenId] = true;

        emit ItemListed(tokenId, price);
    }

    // Purchase a listed item
    function purchaseItem(uint256 tokenId) public payable {
        require(itemListed[tokenId], "This item is not for sale.");
        require(msg.value >= itemPrices[tokenId], "Not enough Ether to buy the item.");

        address owner = ownerOf(tokenId);
        address buyer = msg.sender;

        // Transfer ownership of the token
        _transfer(owner, buyer, tokenId);
        
        // Send the payment to the seller
        payable(owner).transfer(msg.value);

        // Mark the item as no longer listed
        itemListed[tokenId] = false;

        emit ItemPurchased(tokenId, buyer, msg.value);
    }

    // Utility function to retrieve token URI
    function tokenURI(uint tokenId) public view override returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // Get all minted items by the user
    function getMintedItems(address user) public view returns (uint256[] memory) {
        uint256 mintedCount = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (ownerOf(i) == user) {
                mintedCount++;
            }
        }

        uint256[] memory mintedItems = new uint256[](mintedCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (ownerOf(i) == user) {
                mintedItems[index] = i;
                index++;
            }
        }

        return mintedItems;
    }

    // Get all items currently listed for sale
    function getListedItems() public view returns (uint256[] memory) {
        uint256 listedCount = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (itemListed[i]) {
                listedCount++;
            }
        }

        uint256[] memory listedItems = new uint256[](listedCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (itemListed[i]) {
                listedItems[index] = i;
                index++;
            }
        }

        return listedItems;
    }
}
