/*
 * @Author: Songyue-yoyo songyue.zhang@student.maastrichtuniversity.nl
 * @Date: 2023-05-25 23:14:13
 * @LastEditors: Songyue-yoyo songyue.zhang@student.maastrichtuniversity.nl
 * @LastEditTime: 2023-05-26 01:05:17
 * @FilePath: /hardhat-tutorial/scripts/deploy.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { METADATA_URL } = require("../constants");

async function main() {
  const metadataURL = METADATA_URL;
  const poemContract = await ethers.getContractFactory("PoemAIGC");

  // deploy the contract
  const deployedPoemContract = await poemContract.deploy(
    metadataURL
  );

  // Wait for it to finish deploying
  await deployedPoemContract.deployed();

  // print the address of the deployed contract
  console.log(
    "PoemAIGC Contract Address:",
    deployedPoemContract.address
  );
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });