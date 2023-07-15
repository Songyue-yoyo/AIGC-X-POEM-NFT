// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PoemAIGC is ERC721Enumerable, Ownable {

    string _baseTokenURI;

    uint256 public _price = 0.01 ether;

    bool public _paused;

    uint256 public maxTokenIds = 12;

    using Strings for uint256;   

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
    }

    constructor (string memory baseURI) ERC721("POEM X AIGC", "PXAI") {
        _baseTokenURI = baseURI;
    }

    function mint(uint256 tokenIds) public payable onlyWhenNotPaused {
        require(!_exists(tokenIds),"This token has been minted");
        require(msg.value >= _price, "Ether sent is not enough");
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view override virtual returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory baseURI = _baseURI();

        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json")) : "";
        // return Strings.strConcat()
    }

    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    function checkMinted() public view returns (bool[] memory) {
        // bool[maxTokenIds] memory existsArr;
        bool[] memory existsArr = new bool[](maxTokenIds);
        for (uint i = 0; i < maxTokenIds; i++) {
            existsArr[i] = _exists(i);
        }
        return existsArr;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value:amount}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {}

    fallback() external payable {}

}