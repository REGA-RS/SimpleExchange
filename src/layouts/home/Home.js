import React, { Component } from 'react';
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import rega from '../../simple.png';
import BalanceData  from './BalanceData.js';
import SmartContainer from './SmartContainer.js';
import ContractFormExtension from './ContractFormExtension.js';

class Home extends Component {
  constructor(props, context) {
    super(props);
    console.log(props);
    console.log(context);

    this.contracts = context.drizzle.contracts;

    this.toggleMore = this.toggleMore.bind(this);
   

    this.addresses = {
      RSTToken : context.drizzle.contracts.RSTToken._address,
      ERC721SmartToken: context.drizzle.contracts.ERC721SmartToken._address,
      SimpleExchange: context.drizzle.contracts.SimpleExchange._address,
      ERC20Adapter: context.drizzle.contracts.ERC20Adapter._address
    };

    this.dataKey = this.contracts['SimpleExchange'].methods['getBizProcessId'].cacheCall(...[]);
    this.dealKey = this.contracts['SimpleExchange'].methods['findDeal'].cacheCall(...[]);
    this.currentKey = this.contracts['SimpleExchange'].methods['getCurrentToken'].cacheCall(...[]);
    this.balanceKey = this.contracts['RSTToken'].methods['balanceOf'].cacheCall(...[this.props.accounts[0]]);

    this.index = 0;
    this.short = 'short';

  }
  
  renderSetSender(receiver, sender) {
    return (
      <SmartContainer accountIndex="0" ownerOnly init>
        <h3>{sender} Address</h3>
        <p>{this.addresses[sender]}</p>
        <h3>{receiver} Address</h3>
        <p>{this.addresses[receiver]}</p>
        <h3>Connectors</h3>
        <p><ContractData contract={receiver} method="connectors" methodArgs={[this.addresses[sender]]} /></p>
        <h3>{receiver} : setSender ( {sender} )</h3>
        <ContractForm contract={receiver} method="setSender" labels={[sender]} />

        <br/><br/>
      </SmartContainer>
    )
  }
  renderInit() {
    return (
      <SmartContainer accountIndex="0" ownerOnly init>
        <h3>Initializing...</h3>
        <br/><br/>
      </SmartContainer>
    )
  }

  renderCurrentToken() {

    if(!(this.currentKey in this.props['SimpleExchange']['getCurrentToken'])) {
      return (
        <span>Fetching...</span>
      )
    }
    var currentData = this.props['SimpleExchange']['getCurrentToken'][this.currentKey].value;

    return(
      <div>
        <h3>Current Token ID</h3>
        <p>{currentData.id}</p>
        <h3>Current Token Value</h3>
        <p>{this.precisionRound(this.context.drizzle.web3.utils.fromWei(currentData.value, 'ether'),4)} Ether</p>
      </div>
    )
  }

  renderDealInfo() {

    if(!(this.dealKey in this.props['SimpleExchange']['findDeal'])) {
      return (
        <span>Fetching...</span>
      )
    }

    var dealData = this.props['SimpleExchange']['findDeal'][this.dealKey].value;
    var minAmount = this.precisionRound(this.context.drizzle.web3.utils.fromWei(dealData.min, 'ether'),4);
    var maxAmount = this.precisionRound(this.context.drizzle.web3.utils.fromWei(dealData.max, 'ether'),4);
    var average = this.precisionRound(this.context.drizzle.web3.utils.fromWei(dealData.average, 'ether'),4);
    var orderNumber = dealData.active;
    var totalAmount = this.precisionRound(this.context.drizzle.web3.utils.fromWei(dealData.total, 'ether'),4);

    return(
      <table>
        <tbody>
              <tr>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>Order Amount</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>Value</td>
              </tr>
              <tr>
                <td>Min ask</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /></td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>{minAmount} Ether</td>
              </tr>
              <tr>
                <td>Max ask</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /></td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>{maxAmount} Ether</td>
              </tr>
              <tr>
                <td>Order number</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>{orderNumber}</td>
              </tr>
              <tr>
                <td>Total</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>{totalAmount} Ether</td>
              </tr>

               <tr>
                <td>Average</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /></td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>{average} Ether</td>
              </tr>
              </tbody>
            </table>
    )
  }

  toggleMore() {
    if(this.short === 'short') {
      this.short = 'long';
    }
    else {
      this.short = 'short';
    }
  }
  renderAbount() {

    // <button className="pure-button more" type="button" onClick={this.toggleMore}>{this.short==='short'?'more...':'less'}</button>

    return (
      <div>
          <h3>Buy and Sell RST tokens from other community members</h3>
          <p><small>
              <strong>Simple Exchange DApp</strong> allows you to buy <strong>RST</strong> tokens from other community members without any centralized exchange. 
              The Order Amount, the number of <strong>RST</strong> tokens that you can buy or sell is fixed. 
              If you need more token than the Order Amount you need to execute more Orders.
          </small></p>
          
          <div hidden={this.short==='long'}>
          <p><small>
              Each Order is ERC721 Smart Token. If you place an Order you will receive a new issued <strong>XRST</strong> Token.
              If you buy <strong>RST</strong> tokens then you should select <strong>XRST</strong> Token ID of the Order that you wish to execute.
              Simple Exchange Smart Contract will find you the best Order to execute with minimum value.
          </small></p>
          <p><small>
              To place the Order you need to have <strong>RST</strong> tokens on your personal account and as the first step should provide an allowance for 
              Simple Exchange Smart contract to transfer your <strong>RST</strong> tokens to buyer when you Order will be executed. For each order you need to enter <strong>RST</strong> token exchange Rate. 
              The Minimum Rate is fixed and you need to select the rate that is more or equal to the Minimum Rate.
          </small></p>
          </div>
          
      </div>
    )

  }

  renderInfoTabs() {

    if(!(this.dataKey in this.props['SimpleExchange']['getBizProcessId'])) {
      return (
        <span>Fetching...</span>
      )
    }

    if(!(this.dealKey in this.props['SimpleExchange']['findDeal'])) {
      return (
        <span>Fetching...</span>
      )
    }

    var displayData = this.props['SimpleExchange']['getBizProcessId'][this.dataKey].value
    var bizProcessId = displayData['bizProcessId'];


    return (
      <Tabs>
      <h2>Information</h2>
        <TabList>
          <Tab>Account</Tab>
          <Tab>Contracts</Tab>
          <Tab>Token</Tab>
          <Tab disabled={bizProcessId === '100'}>Exchange</Tab>
          <Tab>About</Tab>
        </TabList>

        <TabPanel>
          <AccountData accountIndex="0" units="ether" precision="4" />
          <BalanceData contract="RSTToken" method="balanceOf" accountIndex="0" units="nano" precision="3" correction="1" /> <ContractData contract="RSTToken" method="symbol" hideIndicator />
          <p><ContractData contract="ERC721SmartToken" method="balanceOf" methodArgs={[this.props.accounts[0]]} /> <ContractData contract="ERC721SmartToken" method="symbol" hideIndicator /> </p>        
        </TabPanel>

        <TabPanel>
          <h3>Simple Exchange</h3>
          <p><ContractData contract="ERC20Adapter" method="root" /></p>
          <p><ContractData contract="SimpleExchange" method="owner" /> <strong>owner address</strong> </p>
          <p><ContractData contract="ERC721SmartToken" method="totalSupply" /> <ContractData contract="ERC721SmartToken" method="symbol" hideIndicator /></p>
          <h3>RST Token</h3>
          <p><ContractData contract="SimpleExchange" method="RST" /></p>
          <p><BalanceData contract="RSTToken" method="totalSupply" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
          <h3>ERC721 Smart Token</h3>
          <p>{this.addresses.ERC721SmartToken}</p>
          <h3>ERC20 Adapter</h3>
          <p>{this.addresses.ERC20Adapter}</p>
          
        </TabPanel>

        <TabPanel>
          {this.renderCurrentToken()}
          <h3>Token IDs</h3>
          <BalanceData contract="ERC721SmartToken" method="tokensOfOwner" methodArgs={[this.props.accounts[0]]} array/>
          
        </TabPanel>

        <TabPanel>
          <h3>Exchange Info</h3>
          {this.renderDealInfo()}
        </TabPanel>

        <TabPanel>
            {this.renderAbount()}
        </TabPanel>

      </Tabs>
    )
  }

  precisionRound(number, precision) {
    var factor = Math.pow(10, precision)
    return Math.round(number * factor) / factor
  }

  renderOrders() {
    var displayData = this.props['SimpleExchange']['getBizProcessId'][this.dataKey].value
    var bizProcessId = displayData['bizProcessId'];

    var hasOrders = parseInt(bizProcessId,10) >= 10;

    if(hasOrders) {
      return(
        <div>
          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId="10">
            <h2>Current Order is Active</h2>
            {this.renderCurrentToken()}
            <h3>Cancel</h3>
            <p>To cancel current Order enter Token ID</p>
            <ContractForm contract="SimpleExchange" method="cancelOrder" />
            <br/><br/>
          </SmartContainer>

          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId="11">
            <h2>Current Order is Executed</h2>
            {this.renderCurrentToken()}
            <h3>Collect Payment</h3>
            <p>To collect payment enter Token ID</p>
            <ContractForm contract="SimpleExchange" method="payment" labels={['Token ID']}/>
            <br/><br/>
          </SmartContainer>

          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId="12">
            <h2>Current Order is Closed</h2>
            {this.renderCurrentToken()}
            <br/><br/>
          </SmartContainer>

          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId="13">
            <h2>Current Order is Canceled</h2>
            {this.renderCurrentToken()}
            <br/><br/>
          </SmartContainer>
        </div>
      )
    }
    else {
      return(
        <h2>You don't have any Orders</h2>
      )
    }

  }

  renderExchangeTabs() {
    if(!(this.dataKey in this.props['SimpleExchange']['getBizProcessId'])) {
      return (
        <span>Fetching...</span>
      )
    }

    if(!(this.dealKey in this.props['SimpleExchange']['findDeal'])) {
      return (
        <span>Fetching...</span>
      )
    }

    if(!(this.currentKey in this.props['SimpleExchange']['getCurrentToken'])) {
      return (
        <span>Fetching...</span>
      )
    }

    if(!(this.balanceKey in this.props['RSTToken']['balanceOf'])) {
      return (
        <span>Fetching...</span>
      )
    }

    var displayData = this.props['SimpleExchange']['getBizProcessId'][this.dataKey].value
    var bizProcessId = displayData['bizProcessId'];
    var contractOwner = displayData['contractOwner'];

    var itisOwner = contractOwner === this.props.accounts[0];

    var dealData = this.props['SimpleExchange']['findDeal'][this.dealKey].value;
    var balanceData = this.props['RSTToken']['balanceOf'][this.balanceKey].value;
   
    var orderNumber = dealData.active;
    
    var minOrderId = dealData.id;

    var nothingToBuy = parseInt(orderNumber,10) === 0;

    var nothingToSell = parseInt(balanceData,10) === 0;

    if(nothingToBuy) {
      this.index = 1;
    }
    if(bizProcessId === '11') {
      this.index = 2;
    }

    return (
      !itisOwner &&
      <Tabs defaultIndex={this.index}>
      <h2>Trading</h2>
        <TabList>
          <Tab>Buy</Tab>
          <Tab>Sell</Tab>
          <Tab>Orders</Tab>
        </TabList>

        <TabPanel>
          <SmartContainer accountIndex="0" notOwnerOnly nothingToBuy={nothingToBuy}>
            <h3>Best Deal</h3>
            <p>Just copy and paste Min Order ID and Value in the form below.<br/> See Exchange Tab above for more informatoion.</p>
            
            <h3>Min Order ID</h3>
            <p>{minOrderId}</p>
            <h3>Value [Wei]</h3>
            <p>{dealData.min}</p>
            <h3>Buy RST</h3>
            <ContractFormExtension contract="SimpleExchange" method="buyOrder" labels={['Min Order ID']}/>

            <br/><br/>
          </SmartContainer>
        </TabPanel>

        <TabPanel>
        
          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId={["10"]}>
            <h2>You have active order!</h2>
            <p>The order need to be executed and collected before you will be able to place a new one</p>
          </SmartContainer>

          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId={["11"]}>
            <h2>You have executed order!</h2>
            <p>Please collect the payment in the <a >Order tab</a> and then you will be able to place a new one</p>
          </SmartContainer>

          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId={["1","12","13"]} uncheck nothingToSell={nothingToSell}>
            <h2>Approve</h2>
            <p>Before place the order you should provide an allowance for Simple Exchange Smart contract to transfer your RST tokens to buyer when you Order will be executed. The amount to be approved is the Order Amount in RST.</p>
            <h3>Current Account RST Balance</h3>
            <p><BalanceData contract="RSTToken" method="balanceOf" accountIndex="0" units="nano" precision="3" correction="1" /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
            <h3>Allowance</h3>
            <p><BalanceData contract="RSTToken" method="allowance" methodArgs={[this.props.accounts[0],this.addresses.SimpleExchange]} units="nano" precision="3" correction="1" /> <ContractData contract="RSTToken" method="symbol" hideIndicator /></p>
            <h3>Order Amount</h3>
            <p><BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
            <h3>Approve token transfer</h3>
            <p><strong>To Address</strong>: <ContractData contract="ERC20Adapter" method="root" /></p>
            <p><strong>Amount to Approve</strong>: <ContractData contract="SimpleExchange" method="amount" /></p>
            <p>Just copy and paste information above in the form fields. Please note that <b>Amount to Approve</b> is an integer number and will be adjusted by the smart contract by the number of decimals for the RST token by dividing <b>Amount to Approve</b> by 10 ^ <ContractData contract="RSTToken" method="decimals" />. <br/><br/>If the transaction approval is done then <b>Allowance</b> will be equal to <b>Join Amount [RST]</b></p>
            <ContractForm contract="RSTToken" method="approve" labels={['To Address', 'Amount to Approve']} />
            
            <br/><br/>
          </SmartContainer>

          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId={["2","12","13"]} check>
          <h2>Order Info</h2>
            <table>
              <tbody>
              <tr>
                <td>XRST Balance</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><ContractData contract="ERC721SmartToken" method="balanceOf" methodArgs={[this.props.accounts[0]]} /> <ContractData contract="ERC721SmartToken" method="symbol" hideIndicator /></td>
              </tr>
              <tr>
                <td>Minimum Rate</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><BalanceData contract="SimpleExchange" method="rate" accountIndex="0" units="ether" precision="4" viewOnly /> Ether </td>
              </tr>
              <tr>
                <td>Order Amount</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </td>
              </tr>
              <tr>
                <td>Allowance</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><BalanceData contract="RSTToken" method="allowance" methodArgs={[this.props.accounts[0],this.addresses.SimpleExchange]} units="nano" precision="3" correction="1" /> <ContractData contract="RSTToken" method="symbol" hideIndicator /></td>
              </tr>
              <tr>
                <td>Pre-Order check</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td>&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td><ContractData contract="SimpleExchange" method="checkOrder" /></td>
              </tr>
              </tbody>
            </table>
            
            <h2>Place Order</h2>
            <p>To place the an order just copy and paste Min rate [Wei] in the field below and change it if needed.</p>
            <p>Plese note that the Order rate must be at least <ContractData contract="SimpleExchange" method="rate" /> Wei</p>
            <h2>Min rate [Wei]</h2>
            <p><ContractData contract="SimpleExchange" method="rate" /></p>
            <ContractForm contract="SimpleExchange" method="placeOrder" labels={['Order rate']}/>

            <br/><br/>
          </SmartContainer>
          
        </TabPanel>

        <TabPanel>
          {this.renderOrders()}
        </TabPanel>
      </Tabs>
    )

  }

  renderInfo(t) {
    return (
     <div>
        <h2>Smart Contract Information</h2>
        <h3>Current Account</h3>
        <AccountData accountIndex="0" units="ether" precision="4" />
        <BalanceData contract="RSTToken" method="balanceOf" accountIndex="0" units="nano" precision="3" correction="1" /> <ContractData contract="RSTToken" method="symbol" hideIndicator />
        <h3>RST Token Address</h3>
        <p><ContractData contract="SimpleExchange" method="RST" /></p>
        <p><BalanceData contract="RSTToken" method="totalSupply" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
        <h3>SimpleExchange Address</h3>
        <p><ContractData contract="ERC20Adapter" method="root" /></p>
        <p><ContractData contract="ERC721SmartToken" method="balanceOf" methodArgs={[this.props.accounts[0]]} /> <ContractData contract="ERC721SmartToken" method="symbol" hideIndicator /> </p>
        <p><BalanceData contract="ERC20Adapter" method="balanceOf" accountIndex="0" units="ether" precision="4" /> Ether </p>
        <h3>XRST Current Token</h3>
        <ContractData contract="SimpleExchange" method="getCurrentToken" />
        <h3>XRST Total Supply</h3>
        <p><ContractData contract="ERC721SmartToken" method="totalSupply" /> </p>
        <h3>SimpleExchange Owner</h3>
        <p><ContractData contract="SimpleExchange" method="owner" /></p>
        {t && 
          <div>
            <h3>Amount</h3>
            <p><BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
            <h3>Rate</h3>
            <p><BalanceData contract="SimpleExchange" method="rate" accountIndex="0" units="ether" precision="4" viewOnly /> Ether </p>
          </div>
        }
        <br/><br/>
      </div>
    )
  }
  render() {
    return (
      <main className="container">
       
        <div className="pure-g">
          <div className="pure-u-1-1 header">
            <img src={rega} alt="drizzle-logo" />
            <h1>REGA Simple Exchange</h1>
            <h3>Smart Contracts &nbsp;<small>v 0.1.0</small></h3>

            <br/><br/>
          </div>

          {this.renderInfoTabs()}

          {this.renderSetSender("ERC721SmartToken", "SimpleExchange")}
          {this.renderSetSender("SimpleExchange", "ERC721SmartToken")}
          {this.renderInit()}
          

           <SmartContainer accountIndex="0" ownerOnly>
            <h2>Transfer</h2>
            <p>Transfer some RST Tokens to the new member if needed.</p>
            <h3>Current Account RST Balance</h3>
            <p><BalanceData contract="RSTToken" method="balanceOf" accountIndex="0" units="nano" precision="3" correction="1" /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
            <h3>Amount to transfer</h3>
            <p>100000000000</p>
            <h3>Token transfer</h3>
            <ContractForm contract="RSTToken" method="transfer" labels={['To Address', 'Amount to Transfer']} />
            
            <br/><br/>
          </SmartContainer>

          {this.renderExchangeTabs()}

        </div>
      </main>
    )
  }
}

export default Home
