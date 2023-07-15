/*
 * @Author: Songyue-yoyo songyue.zhang@student.maastrichtuniversity.nl
 * @Date: 2023-05-25 23:14:13
 * @LastEditors: Songyue-yoyo songyue.zhang@student.maastrichtuniversity.nl
 * @LastEditTime: 2023-05-26 01:10:34
 * @FilePath: /hardhat-tutorial/hardhat.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const QUICKNODE_HTTP_URL = process.env.QUICKNODE_HTTP_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: QUICKNODE_HTTP_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};