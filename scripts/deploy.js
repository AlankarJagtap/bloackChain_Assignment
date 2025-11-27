import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  // Deploy the ReverseAuction contract
  const biddingTime = 24 * 60 * 60; // 24 hours in seconds
  const numWinners = 3; // N - number of winners
  const maxBid = ethers.parseEther("1.0"); // M - maximum bid amount (1 ETH)
  const totalRewardPool = BigInt(numWinners) * maxBid; // N * M
  
  console.log(`Deploying ReverseAuction with:`);
  console.log(`- Bidding time: ${biddingTime} seconds (24 hours)`);
  console.log(`- Number of winners (N): ${numWinners}`);
  console.log(`- Max bid amount (M): ${ethers.formatEther(maxBid)} ETH`);
  console.log(`- Total reward pool (N * M): ${ethers.formatEther(totalRewardPool)} ETH`);
  
  const ReverseAuction = await ethers.getContractFactory("ReverseAuction");
  const reverseAuction = await ReverseAuction.deploy(
    biddingTime,
    numWinners,
    maxBid,
    { value: totalRewardPool }
  );

  await reverseAuction.waitForDeployment();

  console.log(`\nReverseAuction deployed to: ${await reverseAuction.getAddress()}`);
  console.log(`Auction will end at: ${new Date((Math.floor(Date.now() / 1000) + biddingTime) * 1000)}`);
  
  // Get initial auction status
  const status = await reverseAuction.getAuctionStatus();
  console.log(`\nInitial auction status:`);
  console.log(`- Number of winners: ${status[0]}`);
  console.log(`- Max bid: ${ethers.formatEther(status[1])} ETH`);
  console.log(`- Total reward pool: ${ethers.formatEther(status[2])} ETH`);
  console.log(`- Number of bidders: ${status[3]}`);
  console.log(`- Remaining time: ${status[4]} seconds`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
