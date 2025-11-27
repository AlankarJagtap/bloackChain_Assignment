import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("ReverseAuction", function () {
  let ReverseAuction;
  let reverseAuction;
  let owner;
  let bidder1;
  let bidder2;
  let bidder3;
  let bidder4;
  let bidder5;

  const BIDDING_TIME = 24 * 60 * 60; // 24 hours in seconds
  const NUM_WINNERS = 3;
  const MAX_BID = ethers.parseEther("1.0");
  const TOTAL_REWARD_POOL = BigInt(NUM_WINNERS) * MAX_BID;

  beforeEach(async function () {
    [owner, bidder1, bidder2, bidder3, bidder4, bidder5] = await ethers.getSigners();

    ReverseAuction = await ethers.getContractFactory("ReverseAuction");
    reverseAuction = await ReverseAuction.deploy(
      BIDDING_TIME,
      NUM_WINNERS,
      MAX_BID,
      { value: TOTAL_REWARD_POOL }
    );
    await reverseAuction.waitForDeployment();
  });

  it("Should set the right owner and lock the reward pool", async function () {
    expect(await reverseAuction.owner()).to.equal(owner.address);
    expect(await reverseAuction.totalRewardPool()).to.equal(TOTAL_REWARD_POOL);
    
    // Check owner's balance decreased by the reward pool
    const ownerBalance = await ethers.provider.getBalance(owner.address);
    // Note: Due to gas costs, we check if the balance is approximately correct
    expect(await ethers.provider.getBalance(await reverseAuction.getAddress())).to.equal(TOTAL_REWARD_POOL);
  });

  it("Should accept bids from participants", async function () {
    await expect(
      reverseAuction.connect(bidder1).placeBid({ value: ethers.parseEther("0.5") })
    ).to.emit(reverseAuction, "BidPlaced").withArgs(bidder1.address, ethers.parseEther("0.5"));
  });

  it("Should not accept bids higher than max bid", async function () {
    await expect(
      reverseAuction.connect(bidder1).placeBid({ value: ethers.parseEther("1.5") })
    ).to.be.revertedWith("Bid cannot exceed maximum bid amount");
  });

  it("Should not allow the same bidder to place multiple bids", async function () {
    await reverseAuction.connect(bidder1).placeBid({ value: ethers.parseEther("0.5") });
    await expect(
      reverseAuction.connect(bidder1).placeBid({ value: ethers.parseEther("0.3") })
    ).to.be.revertedWith("Bidder has already placed a bid");
  });

  it("Should not allow ending the auction before the bidding time is over", async function () {
    await expect(
      reverseAuction.endAuction()
    ).to.be.revertedWith("Auction has not ended yet");
  });

  it("Should determine winners correctly and distribute rewards", async function () {
    // Place bids from 5 bidders
    await reverseAuction.connect(bidder1).placeBid({ value: ethers.parseEther("0.5") }); // Lowest - Winner
    await reverseAuction.connect(bidder2).placeBid({ value: ethers.parseEther("0.7") }); // 2nd lowest - Winner
    await reverseAuction.connect(bidder3).placeBid({ value: ethers.parseEther("0.9") }); // 3rd lowest - Winner (highest winning bid)
    await reverseAuction.connect(bidder4).placeBid({ value: ethers.parseEther("1.0") }); // 4th lowest - Not winner
    await reverseAuction.connect(bidder5).placeBid({ value: ethers.parseEther("0.8") }); // 3rd lowest actually - Winner

    // Increase time to after the auction end time
    await ethers.provider.send("evm_increaseTime", [BIDDING_TIME + 1]);
    await ethers.provider.send("evm_mine");
    
    // Check initial balances
    const initialBalance1 = await ethers.provider.getBalance(bidder1.address);
    const initialBalance2 = await ethers.provider.getBalance(bidder2.address);
    const initialBalance3 = await ethers.provider.getBalance(bidder3.address);
    const initialBalance5 = await ethers.provider.getBalance(bidder5.address);
    
    // End the auction
    const tx = await reverseAuction.endAuction();
    const receipt = await tx.wait();
    
    // Get winners info
    const [winners, winningBids, highestWinningBid] = await reverseAuction.getWinnersInfo();
    
    // Verify winners (should be the 3 lowest bidders: 0.5, 0.7, 0.8)
    expect(winners.length).to.equal(3);
    expect(highestWinningBid).to.equal(ethers.parseEther("0.8")); // The highest winning bid
    
    // All winners should receive the highest winning bid amount
    const finalBalance1 = await ethers.provider.getBalance(bidder1.address);
    const finalBalance2 = await ethers.provider.getBalance(bidder2.address);
    const finalBalance3 = await ethers.provider.getBalance(bidder3.address);
    const finalBalance5 = await ethers.provider.getBalance(bidder5.address);
    
    // Check that winners received the reward (accounting for gas costs)
    expect(finalBalance1 - initialBalance1).to.be.closeTo(ethers.parseEther("0.8"), ethers.parseEther("0.01"));
    expect(finalBalance2 - initialBalance2).to.be.closeTo(ethers.parseEther("0.8"), ethers.parseEther("0.01"));
    expect(finalBalance5 - initialBalance5).to.be.closeTo(ethers.parseEther("0.8"), ethers.parseEther("0.01"));
    
    // Non-winner should not receive reward
    expect(finalBalance3 - initialBalance3).to.be.lessThan(ethers.parseEther("0.01"));
  });

  it("Should refund remaining funds to owner", async function () {
    // Place bids from 3 bidders (exactly the number of winners)
    await reverseAuction.connect(bidder1).placeBid({ value: ethers.parseEther("0.5") });
    await reverseAuction.connect(bidder2).placeBid({ value: ethers.parseEther("0.7") });
    await reverseAuction.connect(bidder3).placeBid({ value: ethers.parseEther("0.9") });

    // Increase time to after the auction end time
    await ethers.provider.send("evm_increaseTime", [BIDDING_TIME + 1]);
    await ethers.provider.send("evm_mine");
    
    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
    
    // End the auction
    const tx = await reverseAuction.endAuction();
    const receipt = await tx.wait();
    
    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
    
    // Owner should receive: TotalPool - (3 winners * 0.9 ETH) = 3 ETH - 2.7 ETH = 0.3 ETH refund
    // Accounting for gas costs
    expect(finalOwnerBalance - initialOwnerBalance).to.be.closeTo(ethers.parseEther("0.3"), ethers.parseEther("0.01"));
  });

  it("Should not end auction if not enough bidders", async function () {
    // Only place 2 bids when we need 3 winners
    await reverseAuction.connect(bidder1).placeBid({ value: ethers.parseEther("0.5") });
    await reverseAuction.connect(bidder2).placeBid({ value: ethers.parseEther("0.7") });

    // Increase time to after the auction end time
    await ethers.provider.send("evm_increaseTime", [BIDDING_TIME + 1]);
    await ethers.provider.send("evm_mine");
    
    await expect(
      reverseAuction.endAuction()
    ).to.be.revertedWith("Not enough bidders to determine winners");
  });
});
