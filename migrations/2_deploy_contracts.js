var SimpleExchange = artifacts.require("SimpleExchange");
var RSTToken = artifacts.require("RSTToken");
var ERC20Adapter = artifacts.require("ERC20Adapter");
var ERC721SmartToken = artifacts.require("ERC721SmartToken");

module.exports = function(deployer) {
  deployer.deploy(RSTToken).then(function() {
    return deployer.deploy(ERC721SmartToken, "Simple Exchange Smart Token", "XRST", {gas:7000000}).then(function() {
      return deployer.deploy(SimpleExchange, RSTToken.address,  ERC721SmartToken.address, {gas:7000000}).then(function() {
        return deployer.deploy(ERC20Adapter, ERC721SmartToken.address, SimpleExchange.address, "ERC20 Simple Exchange Smart Token", "XRST20", 10);
      });
    });
  }).catch(function(err) {console.log(err);});
};
