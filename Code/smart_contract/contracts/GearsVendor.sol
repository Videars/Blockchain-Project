// SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.17;

import "./RemoraGears.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Vendor contract used to implement a marketplace for RGRS
 * @author Alessandro Calandrelli
 * @author Leonardo Cataldi
 * @author Francesco Goberti
 * @author Martino Porceddu
 * @author Matteo Vicari 
 */
contract GearsVendor is Ownable(msg.sender), ReentrancyGuard{
    
    /// @notice Definition of the RemoraGears ERC20 token's contract variable
    RemoraGears GearToken;
    
    /// @notice This constructor links this GearsVendor smart contract to RemoraGears smart contract 
    constructor(address tokenAddress) {
        GearToken = RemoraGears(tokenAddress);
    }
    
    /// @notice Data structure that stores details of a sale of tokens on the market
    struct Offer{
        /// @notice Needed to check if a user has an active offer (maximum offers per address = 1)
        bool updated;
        /// @notice Amount of tokens to put on market
        uint256 offerAmount;
        /// @notice Price per token expressed in ethereum
        uint256 tokenPrice; 
    }

    /// @notice Event triggered when a user updates/creates an offer succesfully
    event OfferUpdated(address owner, uint256 newAmount, uint256 newPrice);
    
    /// @notice Array of users with an active offer
    address[] public offerOwners;
    /// @notice Creates a unique relation between address and offer
    mapping(address => Offer) public offersList;
    
    /** 
     * @notice Updates an offer or creates it if non existant 
     * @param _offerAmount amount of tokens to put on market
     * @param _tokenPrice price per token expressed in ethereum
     */
    function updateOffer(uint256 _offerAmount, uint256 _tokenPrice) public nonReentrant{
        // positivity checks of the parameters
        require(_offerAmount>0,"You have to add at least some tokens");
        require(_tokenPrice>0,"Specify a price different from zero");

        // smart contract tranfers the tokens from the offerer address (requires a prior ERC20 approve from msg.sender) to itself
        (bool sent) = GearToken.transferFrom(msg.sender, address(this), _offerAmount);
        // catch of any error that could occur in the transferFrom
        require(sent, "Failed to transfer tokens from user to vendor");
  
        // creating/updating the offer associated to the sender's address
        Offer storage offer = offersList[msg.sender];

        // check if a user has an active offer
        if(offer.updated==false){
            offer.updated=true;
            // if the user is creating the offer for the first time, it must be added to the list of offer owners
            offerOwners.push(msg.sender);
        }
        
        offer.offerAmount += _offerAmount;
        offer.tokenPrice = _tokenPrice;

        offersList[msg.sender] = offer;

        // event emitted when a user updates/creates an offer succesfully
        emit OfferUpdated(msg.sender, offer.offerAmount, offer.tokenPrice);
    }

    /**
     * @notice Updates the price per token expressed in ethereum of an existing offer
     * @param _tokenPrice the new price per token expressed in ethereum
     */
    function updatePrice(uint256 _tokenPrice) public{
        // positivity check of the parameter
        require(_tokenPrice>0,"Specify a price different from zero");
        Offer storage offer = offersList[msg.sender];
        // check if msg.sender is trying to update a non existant offer
        require(offer.updated, "You have not created your offer yet");
        offer.tokenPrice = _tokenPrice;

        // event emitted when a user updates the price of an offer succesfully
        emit OfferUpdated(msg.sender, offer.offerAmount, offer.tokenPrice);
    }

    /**
     * @notice allows a user to withdraw some or all of the tokens in his/her offer
     * @param _tokenAmount amount of tokens to withdraw
     */
    function retrieveToken(uint256 _tokenAmount) public nonReentrant{

        // positivity check of the parameter
        require(_tokenAmount>0,"You have to retrieve at least some tokens");

        Offer storage offer = offersList[msg.sender];

        // checks if msg.sender has an active offer with enough tokens
        require(offer.updated, "You have not created your offer yet");
        require(offer.offerAmount>=_tokenAmount,"You're asking too many token");

        offer.offerAmount -= _tokenAmount;

        (bool sent) = GearToken.transfer(msg.sender,_tokenAmount);

        // checks if transer was successfull otherwise reverts the state
        if (!sent){
            revert("Failed to retrieve tokens from offer");
        }

        // event emitted when a user withdraws tokens from an offer succesfully
        emit OfferUpdated(msg.sender, offer.offerAmount, offer.tokenPrice);
    }
    
    /**
     * @notice Getter function for msg.sender offer
     * @return offerList offer associated to msg.sender 
     */
    function getMyOffer() public view returns(Offer memory) {
        return offersList[msg.sender];
    }

    /**
     * @notice Getter function for an offer associated to an input address
     * @param vendor The address associated to the offer to retrieve
     * @return offerList offer associated to the input address
     */
    function getOfferByAddress(address vendor) public view returns(Offer memory) {
        return offersList[vendor];
    }
    
    /**
     * @notice Getter function for all the owners of active offers 
     * @return offerOwners list of all the addresses associated to active offers
     */
    function getAllAddresses() public view returns(address[] memory){
        return offerOwners;
    }
    
    /**
     * @notice Allows a user to buy tokens from an active offer
     * @param _offerOwner the address of the owner of the offer, payable to enable it to receive funds
     * @param _buyAmount the number of tokens to buy
     * @param _tokenPrice purchase price per token expressed in ethereum 
     */
    function buyOffer(address payable _offerOwner, uint256 _buyAmount, uint256 _tokenPrice) public payable nonReentrant{
        
        Offer storage offer = offersList[_offerOwner];

        // checks if input address has an active offer 
        require(offer.updated, "You are trying to buy from a non-existing offer");
        // checks if input address is different from msg.sender
        require(msg.sender != _offerOwner, "You can't buy from yourself");
        // positivity check of the parameter
        require(_buyAmount > 0, "Specify a non-zero amount of tokens to buy");
        // checks if the token amount in the offer is greater or equal than the amount msg.sender is trying to buy
        require(offer.offerAmount >= _buyAmount, "You are trying to buy too many tokens");

        // checks if price per token has not increased 
        require(offer.tokenPrice <= _tokenPrice, "The price has increased");

        // computing total cost
        uint256 totalPrice = _buyAmount*(offer.tokenPrice);
        // checks if buyer sent enough ethereum
        require(msg.value >= totalPrice, "You didn't send enough ETH");

        // computing the rest
        uint256 rest = msg.value - totalPrice;

        // decreasing the value of the initial offer
        offer.offerAmount -= _buyAmount;
        // offerer is paid ETH 
        _offerOwner.transfer(totalPrice);

        // positive rest is refunded to buyer
        if (rest > 0){
            payable(msg.sender).transfer(rest);
        }

        // transfer of tokens to the buyer
        GearToken.transfer(msg.sender, _buyAmount);

        // event emitted when a user buys tokens from an offer succesfully
        emit OfferUpdated(_offerOwner, offer.offerAmount, offer.tokenPrice);
    }
    
    /**
     * @notice Contract's owner can withraw eth from contract's entire balance
     */
    function transferBalance() external payable onlyOwner{
        address payable ownerAddress = payable(owner());
        ownerAddress.transfer(address(this).balance);
    }

    /**
     * @notice Owner can destroy the contract withdrawing its balance
     */
    function terminate() external onlyOwner{
        selfdestruct(payable(owner()));
    }
}