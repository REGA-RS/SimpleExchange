// 
// MIT License
// 
// Copyright (c) 2018 REGA Risk Sharing
//   
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
// Author: Sergei Sevriugin
// Version: 0.0.1
//  

pragma solidity ^0.4.17;

import "./ERC721SmartToken.sol";
import "./Utils.sol";
import "./interfaces/IERC20Token.sol";


/// SimpleExchange is RST <--> ETH echange based on ERC721 Smart token
contract RSTExchange is ERC721SmartToken, Utils {

    /// SimpleExchange Place Order event
    /// @param id NFT token ID for the order
    /// @param rate RST/ETH exchange rate
    /// @param value exchange value in ETH
    /// @param allowance exchange value in RST
    event Place(uint256 id, uint256 rate, uint256 value, uint256 allowance);

    /// SimpleExchange Cancel Order event
    /// @param id NFT token ID for the order
    /// @param owner NFT token owner
    event Cancel(uint256 id, address owner);

    /// SimpleExchange Buy event
    /// @param id NFT token ID for the order to purchase
    /// @param value RST value that was transfered to buyer
    /// @param amount ETH amount buyer has been paid (on contract account)
    event Buy(uint256 id, uint256 value, uint256 amount);

     /// SimpleExchange payment event
    /// @param id is NFT Order id
    /// @param amount ETH amount to receive
    /// @param owner NFT Order token owner
    event Payment(uint256 id, uint256 amount, address owner);

    /// SimpleExchange set amount event
    /// @param amount is new value
    /// @param old is old value
    event SetAmount(uint256 amount, uint256 old);

    /// SimpleExchange set rate event
    /// @param rate is new rate
    /// @param old is old rate
    event SetRate(uint256 rate, uint256 old);

    /// SimpleExchange set open event
    /// @param open is new open value
    /// @param old is old open value
    event SetOpen(bool open, bool old);
   

    /// RST token amount for order
    uint256 public amount;
    /// RST/ETH minimum rate
    uint256 public rate;
    /// SimpleExchange is open
    bool public open;
    /// RST smart contract address
    IERC20Token public RST;
    /// Order Status
    enum Status {Init, Closed, Active, Executed, Canceled}

    /// placeOrder
    /// @param _rate RST/ETH echange rate, must be >= rate
    function placeOrder(uint256 _rate) public {
        require(open, "Exchange is closed");
        require(_rate != uint256(0), "ERROR: RST/ETH rate is zero");
        require(_rate >= rate, "ERROR: RST/ETH rate is too low");
        require(RST != address(0),"ERROR: RST address is 0");  
        uint _allowance = RST.allowance(msg.sender, address(this));
        require(_allowance != amount, "ERROR: Allowance for RST token is not provided");
        uint256 _decimals = uint256(RST.decimals());
        uint _value = safeMul(_rate, amount);
        if (_decimals > uint8(0)) {                   // ... check if RST decimals is not 0
            _decimals--;
            _value = _value / (10 ** _decimals);      // ... and use decimals to convert RST to ETH
        }
        uint _id = _createNFT(_value, "Order", uint(1), msg.sender);
        require(_id != uint256(0), "ERROR: NFT id is 0");
        nfts[_id].state = uint256(Status.Active);

        emit Place(_id, _rate, _value, _allowance);
    }

    /// cancelOrder 
    /// @param _id NFT token id for order to cancel
    function cancelOrder(uint256 _id) public {
        require(open, "Exchange is closed");
        require(_id != uint256(0),"ERROR: NFT token id is 0");
        require(_owns(msg.sender, _id), "ERROR: Only token owner");
        nfts[_id].state = uint256(Status.Canceled);
        nfts[_id].value = uint(0);

        emit Cancel(_id, msg.sender);
    }

    /// find deal 
    function findDeal() public view returns(uint256 min, uint256 max, uint256 average, uint256 active, uint256 total, uint256 id) {
        uint256 count = totalSupply();

        id = 0;
        min = uint256(0);
        max = uint256(0);
        average = uint256(0);
        active = uint256(0);
        total = uint256(0);
        
        if( count == uint256(0) ) {
            return;
        }

        min = safeMul(rate, amount);

        for (uint256 _id = 1; _id <= count; _id++) {
            if(nfts[_id].state == uint256(Status.Active)) {
                active++;
                total = total + nfts[_id].value;
                if(nfts[_id].value < min) {
                    min = nfts[_id].value;
                    id = _id;
                }
                if(nfts[_id].value > max) {
                    max = nfts[_id].value;
                }
            }
        }
        if(active != uint256(0)) {
            average = total / active; 
        } 
        else {
            min = uint256(0);
        }
    }

    /// buyOrder 
    /// @param _id NFT token id to buy from 
    function buyOrder(uint256 _id) public payable {
        require(open, "Exchange is closed");
        require(_id != uint256(0), "ERROR: NFT id is 0");
        require(nfts[_id].state == uint256(Status.Active), "ERROR: Order is not active");
        require(RST != address(0),"ERROR: RST address is 0");
        address _owner = tokenIndexToOwner[_id];
        require(_owner != address(0), "ERROR: Order owner address is 0");
        uint _allowance = RST.allowance(_owner, address(this));
        require(_allowance != amount, "ERROR: Allowance for RST token is not provided");
        require(nfts[_id].value != uint256(0), "ERROR: Order value is 0");
        require(nfts[_id].value == msg.value, "ERROR: Order value is not equal to message value");
        require(RST.transferFrom(_owner, msg.sender, amount),"ERROR: RST transfer");

        nfts[_id].state = uint256(Status.Executed);

        emit Buy(_id, _allowance, msg.value);
    }

    /// payment 
    /// @param _id NFT token to collect the payment from Executed order
    function payment(uint256 _id) public {
        require(open, "Exchange is closed");
        require(_id != uint256(0),"ERROR: NFT token id is 0");
        require(_owns(msg.sender, _id), "ERROR: Only token owner");
        require(nfts[_id].state == uint256(Status.Executed), "ERROR: Order is not in the Executed state");
        uint256 balance = address(this).balance;
        require(balance >= nfts[_id].value, "ERROR: Exchange is short of funds to pay");
        msg.sender.transfer(nfts[_id].value);

        nfts[_id].state = uint256(Status.Closed);

        emit Payment(_id, nfts[_id].value, msg.sender);
    }
    function setAmount(uint256 _amount) public ownerOnly {
        require(_amount != uint256(0),"ERROR: amount is 0");
        uint _old = amount;
        amount = _amount;

        emit SetAmount(_amount, _old);
    }
    function setRate(uint256 _rate) public ownerOnly {
        require(_rate != uint256(0),"ERROR: rate is 0");
        uint _old = rate;
        rate = _rate;

        emit SetRate(_rate, _old);
    }
    function setOpen(bool _open) public ownerOnly {
        bool _old = open;
        open = _open;

        emit SetOpen(_open, _old);
    }
    /// token ID helpers
    function getCurrentToken() public view returns (uint256 id, uint256 value) {
        if(msg.sender == owner) {
            id = uint256(0);                         // return 0 for owner
            value = uint256(0);
        }
        else {
            uint256[] memory tokenIds = _tokensOfOwner(msg.sender);
            id = tokenIds.length > 0 ? tokenIds[0] : uint256(0);
            value = uint256(0);
            if(id != uint256(0)) {
                if(nfts[id].state == uint256(Status.Executed)) {
                    value = nfts[id].value;
                }
            }
        }
    }
    function getToken(uint256 index) public view returns (uint256 id, uint256 value) {
        if(msg.sender == owner) {
            id = uint256(0);                         // return 0 for owner
            value = uint256(0);
        }
        else {
            uint256[] memory tokenIds = _tokensOfOwner(msg.sender);
            id = tokenIds.length > 0 && index < tokenIds.length ? tokenIds[index] : uint256(0);
            value = uint256(0);
            if(id != uint256(0)) {
                if(nfts[id].state == uint256(Status.Executed)) {
                    value = nfts[id].value;
                }
            }
        }
    }
    function getBizProcessId() public view returns(address contractOwner, uint8 bizProcessId) {
        contractOwner = owner;
        bizProcessId = 0;
        
        // check if sender has Crowdsurance token
        uint256 id;
        uint256 value;
        (id, value) = getCurrentToken();
        if(id == uint256(0)) {
            uint allowance = RST.allowance(msg.sender, address(this));
            if(allowance == uint256(0)) {
                // the first step - need to make allowance
                bizProcessId = 1;
            }
            else {
                // need to make order
                bizProcessId = 2; 
            }
        }
        else {
            // we have current token id
            if (nfts[id].state == uint(Status.Active)) {
                bizProcessId = 10;  // activate
            }
            else if (nfts[id].state == uint(Status.Executed)) {
                bizProcessId = 11;  // execuited
            }
            else if (nfts[id].state == uint(Status.Closed)) {
                bizProcessId = 12;

            }
            else if (nfts[id].state == uint(Status.Canceled)) {
                bizProcessId = 13;
            }
        }
    }
    constructor(string _name, string _symbol, address _rst) ERC721SmartToken(_name, _symbol) public { 
        amount = 7600000000;
        rate = 0.05 ether;
        RST = IERC20Token(_rst);
        open = true;
    }
}