// contracts/RemoraGears.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Main contract to implement RGRS ERC20 token
 * @author Alessandro Calandrelli
 * @author Leonardo Cataldi
 * @author Francesco Goberti
 * @author Martino Porceddu
 * @author Matteo Vicari
 */
contract RemoraGears is ERC20, Ownable(msg.sender) {

    /// @notice Data structure that stores details of a trip 
    struct Trip {
        /// @notice unique id of a trip
        bytes32 tripIdentifier;
        /// @notice number of passengers of the trip 
        uint256 numberOfParticipants;
        /// @notice addresses of passengers of the trip
        address[] addressesOfParticipants;
        /// @notice number of passengers that confirmed participation and paid
        uint256 numberOfConfirmations;
        /// @notice cost of the trip per passenger
        uint256 requiredPayment;
        /// @notice salt used in the hash to compute the identifier
        bytes32 salt;
    }

    /// @notice Data structure that stores details of a closed trip
    struct ClosedTrip{
        /// @notice unique id of a trip
        bytes32 tripIdentifier;
        /// @notice salt used in the hash to compute the identifier
        bytes32 salt;
    }

    /// @notice Event triggered when createNewTrip terminates to share the return value
    event providedTravelIdHash(bytes32 returnValue);

    /// @notice Creates a relation between address and trips created by it
    mapping(address => Trip[]) public ongoingTrips;
    /// @notice Creates a relation between address and closed trips created by it
    mapping(address => ClosedTrip[]) public completedTrips;
    /// @notice Creates a relation between address and the number of unminted trips done by it, used to assign rewards
    mapping(address => uint256) public unmintedTripsNumber;

    /// @notice Number of tokens minted to drivers
    uint256 public mintedTokens;
    /// @notice Cap of trips to complete before reward
    uint256 public tripsBeforeMinting;

    /**
     * @notice Deploy the ERC20 RGRS token with an initial supply sent to the owner of the contract
     * @notice Sets the value of variables mintedTokens and tripsBeforeMinting
     * @param initialSupply the amount of initial supply sent to the owner of the contract
     */
    constructor(uint256 initialSupply) ERC20("RemoraGears", "RGRS") {
        _mint(msg.sender, initialSupply);
        // reward for completing 10 trips
        mintedTokens = 5;
        tripsBeforeMinting = 10;
    }

    /**
     * @notice generates a 32 bytes salt using keccak256 on block and sender parameters
     * @return salt 32 bytes value generated via the hash
     */
    function _generateSalt() internal view returns (bytes32) {

        bytes32 blockHash = blockhash(block.number - 1);
        bytes32 entropy = keccak256(abi.encodePacked(block.timestamp, block.prevrandao, gasleft(), msg.sender, msg.sender.balance));

        bytes32 salt = blockHash ^ entropy;

        return salt;
    }

    /**
     * @notice Creates a new trip 
     * @param _unsaltedIdentifier the unsalted id of the trip
     * @param _numberOfParticipants number of passengers of the trip
     * @param _addressesOfParticipants a list of addresses of the passengers of the trip
     * @param _requiredPayment cost of the trip per passenger
     * @return _tripIdentifier salted trip identifier
     */
    function createNewTrip(bytes32 _unsaltedIdentifier, uint256 _numberOfParticipants, address[] memory _addressesOfParticipants, uint256 _requiredPayment) public returns(bytes32){

        // checks if number of participants concides with the number of provided addresses 
        require(_addressesOfParticipants.length == _numberOfParticipants, "The provided number of participants does not match the length of the participants list");

        // checks if driver's address is not in the passengers list
        for (uint256 i = 0; i < _numberOfParticipants; i++){
            if (_addressesOfParticipants[i] == msg.sender){
                revert("The driver cannot participate the trip as a passenger");
            }
        }

        // generates salt
        bytes32 _salt = _generateSalt();

        // creates salted identifier
        bytes32 _tripIdentifier = keccak256(abi.encodePacked(_salt, _unsaltedIdentifier));

        // creates the new trip
        Trip memory newTrip;

        newTrip.tripIdentifier = _tripIdentifier;
        newTrip.numberOfParticipants = _numberOfParticipants;
        newTrip.addressesOfParticipants = _addressesOfParticipants;
        newTrip.numberOfConfirmations = 0;
        newTrip.requiredPayment = _requiredPayment;
        newTrip.salt = _salt;

        // assigns the trip to the ongoing trips of the driver
        ongoingTrips[msg.sender].push(newTrip);

        // event emitted when a user creates a trip succesfully
        emit providedTravelIdHash(_tripIdentifier);

        return _tripIdentifier;
    }

    /**
     * @notice Closes a completed trip 
     * @param _tripIdentifier salted identifier of the trip to close
     */
    function endTrip(bytes32 _tripIdentifier) public {

        Trip[] storage driver_trips = ongoingTrips[msg.sender];

        for (uint256 i = 0; i < driver_trips.length; i++) {
            // find the trip to close in sender's ongoing trips list
            if (driver_trips[i].tripIdentifier == _tripIdentifier) {
                // checks that every passenger confirmed the participation 
                require(driver_trips[i].numberOfConfirmations == driver_trips[i].numberOfParticipants, "Not every passenger confirmed the trip");
                
                // creates a ClosedTrip instance associated to the completed trip
                ClosedTrip memory doneTrip;

                doneTrip.salt = driver_trips[i].salt;
                doneTrip.tripIdentifier = driver_trips[i].tripIdentifier;

                // assigns the closed trip to the driver's completed trips
                completedTrips[msg.sender].push(doneTrip);

                // the completed trip is removed from the ongoing ones
                _removeTripFromList(driver_trips, i);
                // updates the reward counter
                unmintedTripsNumber[msg.sender] += 1;
                return;
            }
        }

        revert("You don't have any ongoing trip with this identifier");
    }

    /**
     * @notice Removes input trip from list of ongoing trips
     * @param _driver_trips list of trips with msg.sender as driver
     * @param _index index of trip to remove 
     */
    function _removeTripFromList(Trip[] storage _driver_trips, uint256 _index) internal {
        _driver_trips[_index] = _driver_trips[_driver_trips.length - 1];
        _driver_trips.pop();
    }

    /**
     * @notice Confirms the partecipation of a passenger to a trip and performs the payment in tokens
     * @param _driverAddress address of the driver of the trip 
     * @param _tripIdentifier salted identifier of the trip
     */
    function confirmTripParticipation(address _driverAddress, bytes32 _tripIdentifier) public {
    
        Trip[] storage driver_trips = ongoingTrips[_driverAddress];

        bool found = false;

        // find the trip to confirm participation from the driver's list of ongoing trips
        for (uint256 i = 0; i < driver_trips.length; i++) {
            if (driver_trips[i].tripIdentifier == _tripIdentifier) {

                found = true;

                Trip storage tripToUpdate = driver_trips[i];

                // number of participants without confimation
                uint256 remaining_participants = tripToUpdate.addressesOfParticipants.length;
                
                bool participant_found = false;

                // find participant in address list
                for (uint256 j = 0; j < remaining_participants; j++){
                    if (tripToUpdate.addressesOfParticipants[j] == msg.sender){
                        participant_found = true;
                        // payment of required amount of tokens to the driver 
                        bool payment_complete = super.transfer(_driverAddress, tripToUpdate.requiredPayment);
                        if (payment_complete){
                            address[] storage list = tripToUpdate.addressesOfParticipants;
                            // updates the list of unconfirmed passengers
                            _removeParticipantFromTrip(list, j);
                            // updates the number of confirmed participations 
                            tripToUpdate.numberOfConfirmations = tripToUpdate.numberOfConfirmations + 1;

                            break;
                        }
                    } 
                }

                if(!participant_found) {
                    revert("Address not found. You are not part of this trip as a passenger!");
                }
                   
                break;
            }
        }

        // rises an exception if input id is not present in the list of trips
        if (!found){
            revert("The driver has no ongoing trips with the provided trip identifier");
        }
    }

    /**
     * @notice Removes input address from list of uncofirmed participants
     * @param _participants_trips list of unconfirmed participants
     * @param _index index of the address to remove 
     */
    function _removeParticipantFromTrip(address[] storage _participants_trips, uint256 _index) internal{
        _participants_trips[_index] =  _participants_trips[ _participants_trips.length - 1];
        _participants_trips.pop();
    }

    /**
     * @notice Verifies that every passenger has confirmed the participation 
     * @param driver_address address of the driver of the trip
     * @param trip_identifier salted identfier of the trip
     * @return bool true if successful, false otherwise
     */
    function hasEveryOnePaid(address driver_address, bytes32 trip_identifier) public view returns(bool){
        Trip[] memory ongoing = ongoingTrips[driver_address];
        for(uint256 i = 0; i < ongoing.length; i++){
            Trip memory currentTrip = ongoing[i];
            if(currentTrip.tripIdentifier == trip_identifier){
                if(currentTrip.numberOfConfirmations == currentTrip.numberOfParticipants){
                    return true;
                } else {
                    return false;
                }
            }
        }
        return false;
    } 

    // Minting Logic

    /**
     * @notice Owner can mint tokens 
     * @param to address where to send minted tokens
     * @param amount amount of tokens to mint
     */
    function mintTokensForAdmins(address to, uint256 amount) external onlyOwner{
        _mint(to, amount);
    }

    /**
     * @notice Mint reward tokens when counter is sufficent 
     */
    function mintTokensByTrips() public {
        require (unmintedTripsNumber[msg.sender] >= tripsBeforeMinting);
        // updating counter
        unmintedTripsNumber[msg.sender] -= tripsBeforeMinting;
        _mint(msg.sender, mintedTokens);
    }

    /**
     * @notice Owner can adapt the reward amount 
     * @param newValue new amount of tokens given as a reward
     */
    function updateMintingAmount(uint256 newValue) external onlyOwner{
        mintedTokens = newValue;
    }

    /**
     * @notice Owner can adapt the number of necessary trips to complete before a reward can be retrieved
     * @param newValue new amount of trips to complete
     */
    function updateMintingTripsNumber(uint256 newValue) external onlyOwner{
        tripsBeforeMinting = newValue;
    }

    /**
     * @notice Getter function for number of unminted trips of an address 
     * @param target address of the target user 
     * @return unmintedTripsNumber number of unminted trips by target user
     */
    function unmintedTripsOf(address target) public view returns(uint256){
        return unmintedTripsNumber[target];
    }

    /**
     * @notice Contract's owner can withdraw Eth from contract's entire balance
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

    /**
     * @notice Overrides the default amount of decimals defined by ERC20.sol
     * @return 0 is the number of decimals admitted
     */
    function decimals() public view override returns (uint8) {
        return 0;
    }

    /**
     * @notice Getter function of concluded trips of an address
     * @param driver address of the target user
     * @return completedTrips list of completed trips by target user
     */
    function retrieveConcludedTripsFromAddress(address driver) public view returns (ClosedTrip[] memory){
        return completedTrips[driver];
    }

    /**
     * @notice Getter function of ongoing trips of an address
     * @param driver address of the target user
     * @return ongoingTrips list of ongoing trips by target user
     */
    function getOngoingTripsByAddress(address driver) external view returns (Trip[] memory){
        return ongoingTrips[driver];
    }

    /**
     * @dev function used to speed up the test of the minting process
     * @dev DELETE THIS FUNCTION BEFORE DEPLOYMENT ON MAINNET 
     * @param from address of target user on which test is performed
     */
    function addTripsForMinting(address from) public onlyOwner{
        unmintedTripsNumber[from] += 1;
    }
}