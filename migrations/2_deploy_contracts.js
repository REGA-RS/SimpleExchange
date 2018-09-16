var SimpleExchange = artifacts.require("SimpleExchange");
var RSTToken = artifacts.require("RSTToken");
var ERC20Adapter = artifacts.require("ERC20Adapter");
var ERC721SmartToken = artifacts.require("ERC721SmartToken");

module.exports = function(deployer) {
  // deployer.deploy(RSTToken).then(function() {
    // return deployer.deploy(ERC721SmartToken, "Simple Exchange Smart Token", "XRST", {gas:7000000}).then(function() {
      deployer.deploy(SimpleExchange, "0xEB9cE01f4029AbFC9A576157058E78cC13CC5450",  "0x968045dA499051dc7a23D281c5830B8C31A92C56", {gas:7000000}).then(function() {
        return deployer.deploy(ERC20Adapter, ERC721SmartToken.address, SimpleExchange.address, "ERC20 Simple Exchange Smart Token", "XRST20", 10);
      // });
    // });
  }).catch(function(err) {console.log(err);});
};
