// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ReverseAuction {
    // State variables
    address public owner;
    uint public auctionEndTime;
    uint public numWinners; // N - number of winners
    uint public maxBid; // M - maximum bid amount
    uint public totalRewardPool; // N * M
    bool public auctionEnded;
    
    // Arrays to store bids and bidders
    address[] public bidders;
    mapping(address => uint) public bids;
    mapping(address => bool) public hasBid;
    
    // Winners and their bids
    address[] public winners;
    uint[] public winningBids;
    uint public highestWinningBid;
    
    // Events
    event AuctionCreated(uint numWinners, uint maxBid, uint totalRewardPool);
    event BidPlaced(address indexed bidder, uint amount);
    event AuctionEnded(address[] winners, uint rewardAmount, uint refundToOwner);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }
    
    modifier auctionNotEnded() {
        require(block.timestamp < auctionEndTime, "Auction has already ended");
        require(!auctionEnded, "Auction has been ended by owner");
        _;
    }
    
    modifier auctionHasEnded() {
        require(block.timestamp >= auctionEndTime || auctionEnded, "Auction has not ended yet");
        _;
    }
    
    // Constructor
    constructor(uint _biddingTime, uint _numWinners, uint _maxBid) payable {
        require(_numWinners > 0, "Number of winners must be greater than 0");
        require(_maxBid > 0, "Max bid must be greater than 0");
        require(msg.value == _numWinners * _maxBid, "Must send exactly N * M wei");
        
        owner = msg.sender;
        auctionEndTime = block.timestamp + _biddingTime;
        numWinners = _numWinners;
        maxBid = _maxBid;
        totalRewardPool = _numWinners * _maxBid;
        
        emit AuctionCreated(_numWinners, _maxBid, totalRewardPool);
    }
    
    // Place a bid
    function placeBid() public payable auctionNotEnded {
        require(msg.value > 0, "Bid amount must be greater than 0");
        require(msg.value <= maxBid, "Bid cannot exceed maximum bid amount");
        require(!hasBid[msg.sender], "Bidder has already placed a bid");
        
        // Store the bid
        bids[msg.sender] = msg.value;
        hasBid[msg.sender] = true;
        bidders.push(msg.sender);
        
        emit BidPlaced(msg.sender, msg.value);
    }
    
    // End the auction and determine winners
    function endAuction() public onlyOwner auctionHasEnded {
        require(!auctionEnded, "Auction has already ended");
        require(bidders.length >= numWinners, "Not enough bidders to determine winners");
        
        auctionEnded = true;
        
        // Sort bids and determine winners
        _determineWinners();
        
        // Calculate reward amount (highest winning bid)
        uint rewardAmount = highestWinningBid;
        uint totalRewardsPaid = rewardAmount * numWinners;
        
        // Distribute rewards to winners
        for (uint i = 0; i < winners.length; i++) {
            payable(winners[i]).transfer(rewardAmount);
        }
        
        // Return remaining funds to owner
        uint refundToOwner = totalRewardPool - totalRewardsPaid;
        if (refundToOwner > 0) {
            payable(owner).transfer(refundToOwner);
        }
        
        emit AuctionEnded(winners, rewardAmount, refundToOwner);
    }
    
    // Internal function to determine winners
    function _determineWinners() internal {
        // Create array of (bidder, bid) pairs for sorting
        address[] memory tempBidders = new address[](bidders.length);
        uint[] memory tempBids = new uint[](bidders.length);
        
        for (uint i = 0; i < bidders.length; i++) {
            tempBidders[i] = bidders[i];
            tempBids[i] = bids[bidders[i]];
        }
        
        // Sort bids in ascending order (lowest first)
        for (uint i = 0; i < tempBids.length - 1; i++) {
            for (uint j = i + 1; j < tempBids.length; j++) {
                if (tempBids[i] > tempBids[j]) {
                    // Swap bids
                    uint tempBid = tempBids[i];
                    tempBids[i] = tempBids[j];
                    tempBids[j] = tempBid;
                    
                    // Swap bidders
                    address tempBidder = tempBidders[i];
                    tempBidders[i] = tempBidders[j];
                    tempBidders[j] = tempBidder;
                }
            }
        }
        
        // Select the N lowest bids as winners
        winners = new address[](numWinners);
        winningBids = new uint[](numWinners);
        
        for (uint i = 0; i < numWinners; i++) {
            winners[i] = tempBidders[i];
            winningBids[i] = tempBids[i];
        }
        
        // Set the highest winning bid (the Nth lowest bid)
        highestWinningBid = winningBids[numWinners - 1];
    }
    
    // Get auction status
    function getAuctionStatus() public view returns (
        uint _numWinners,
        uint _maxBid,
        uint _totalRewardPool,
        uint _numBidders,
        uint _remainingTime
    ) {
        return (
            numWinners,
            maxBid,
            totalRewardPool,
            bidders.length,
            getRemainingTime()
        );
    }
    
    // Get the remaining time for the auction
    function getRemainingTime() public view returns (uint) {
        if (block.timestamp >= auctionEndTime) {
            return 0;
        }
        return auctionEndTime - block.timestamp;
    }
    
    // Get all bidders and their bids
    function getAllBids() public view returns (address[] memory, uint[] memory) {
        uint length = bidders.length;
        address[] memory bidderAddresses = new address[](length);
        uint[] memory bidAmounts = new uint[](length);
        
        for (uint i = 0; i < length; i++) {
            bidderAddresses[i] = bidders[i];
            bidAmounts[i] = bids[bidders[i]];
        }
        
        return (bidderAddresses, bidAmounts);
    }
    
    // Get winners information (only after auction ends)
    function getWinnersInfo() public view returns (address[] memory, uint[] memory, uint) {
        require(auctionEnded, "Auction has not ended yet");
        return (winners, winningBids, highestWinningBid);
    }
    
    // Fallback function to receive Ether
    receive() external payable {
        placeBid();
    }
}
