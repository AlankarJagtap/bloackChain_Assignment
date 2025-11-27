// scripts/demo.js
import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const reverseAuction = await ethers.getContractAt("ReverseAuction", contractAddress);
  
  const [owner, bidder1, bidder2, bidder3, bidder4, bidder5] = await ethers.getSigners();
  
  console.log("=== REVERSE AUCTION DEMO ===\n");
  
  // Check initial status
  let status = await reverseAuction.getAuctionStatus();
  console.log("Initial Status:");
  console.log(`- Winners (N): ${status[0]}`);
  console.log(`- Max Bid (M): ${ethers.formatEther(status[1])} ETH`);
  console.log(`- Reward Pool: ${ethers.formatEther(status[2])} ETH`);
  console.log(`- Bidders: ${status[3]}`);
  console.log(`- Time Remaining: ${status[4]} seconds\n`);
  
  // Place bids
  console.log("Placing bids...\n");
  
  await reverseAuction.connect(bidder1).placeBid({ value: ethers.parseEther("0.5") });
  console.log(`Bidder1 placed bid: 0.5 ETH`);
  
  await reverseAuction.connect(bidder2).placeBid({ value: ethers.parseEther("0.7") });
  console.log(`Bidder2 placed bid: 0.7 ETH`);
  
  await reverseAuction.connect(bidder3).placeBid({ value: ethers.parseEther("0.9") });
  console.log(`Bidder3 placed bid: 0.9 ETH`);
  
  await reverseAuction.connect(bidder4).placeBid({ value: ethers.parseEther("1.0") });
  console.log(`Bidder4 placed bid: 1.0 ETH`);
  
  await reverseAuction.connect(bidder5).placeBid({ value: ethers.parseEther("0.8") });
  console.log(`Bidder5 placed bid: 0.8 ETH\n`);
  
  // Show all bids
  const [bidders, bids] = await reverseAuction.getAllBids();
  console.log("All Bids:");
  for (let i = 0; i < bidders.length; i++) {
    console.log(`- ${bidders[i].slice(0, 8)}...: ${ethers.formatEther(bids[i])} ETH`);
  }
  console.log();
  
  // Fast forward time
  console.log("Fast forwarding time to end auction...\n");
  await ethers.provider.send("evm_increaseTime", [24 * 60 * 60 + 1]);
  await ethers.provider.send("evm_mine");
  
  // End auction
  console.log("Ending auction...\n");
  const tx = await reverseAuction.endAuction();
  const receipt = await tx.wait();
  
  // Get winners info
  const [winners, winningBids, highestWinningBid] = await reverseAuction.getWinnersInfo();
  
  console.log("=== AUCTION RESULTS ===\n");
  console.log(`Winners (${winners.length}):`);
  for (let i = 0; i < winners.length; i++) {
    console.log(`- Winner ${i + 1}: ${winners[i].slice(0, 8)}... with bid ${ethers.formatEther(winningBids[i])} ETH`);
  }
  console.log(`\nReward per winner: ${ethers.formatEther(highestWinningBid)} ETH`);
  console.log(`Total rewards paid: ${ethers.formatEther(highestWinningBid * BigInt(winners.length))} ETH`);
  
  const TOTAL_REWARD_POOL = ethers.parseEther("3.0");
  const refundToOwner = TOTAL_REWARD_POOL - (highestWinningBid * BigInt(winners.length));
  console.log(`Refund to owner: ${ethers.formatEther(refundToOwner)} ETH`);
}

main().catch(console.error);
