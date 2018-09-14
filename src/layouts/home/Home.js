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

    this.addresses = {
      RSTToken : context.drizzle.contracts.RSTToken._address,
      ERC721SmartToken: context.drizzle.contracts.ERC721SmartToken._address,
      SimpleExchange: context.drizzle.contracts.SimpleExchange._address,
      ERC20Adapter: context.drizzle.contracts.ERC20Adapter._address
    };

    this.dataKey = this.contracts['SimpleExchange'].methods['getBizProcessId'].cacheCall(...[]);

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

  renderInfoTabs() {

    if(!(this.dataKey in this.props['SimpleExchange']['getBizProcessId'])) {
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
        </TabList>

        <TabPanel>
          <AccountData accountIndex="0" units="ether" precision="4" />
          <h3>Tokens</h3>
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
          <h3>LCS Current Token</h3>
          <ContractData contract="SimpleExchange" method="getCurrentToken" />
          <h3>Token IDs</h3>
          <BalanceData contract="ERC721SmartToken" method="tokensOfOwner" methodArgs={[this.props.accounts[0]]} array/>
          
        </TabPanel>

        <TabPanel>
          <h3>Amount</h3>
          <p><BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
          <h3>Rate</h3>
          <p><BalanceData contract="SimpleExchange" method="rate" accountIndex="0" units="ether" precision="4" viewOnly /> Ether </p>
          
        </TabPanel>
        <br/><br/>
      </Tabs>
    )
  }

  renderExchangeTabs() {
    if(!(this.dataKey in this.props['SimpleExchange']['getBizProcessId'])) {
      return (
        <span>Fetching...</span>
      )
    }

    var displayData = this.props['SimpleExchange']['getBizProcessId'][this.dataKey].value
    var bizProcessId = displayData['bizProcessId'];
    var hasOrders = parseInt(bizProcessId,10) >= 10;
    
    return (
      <Tabs>
      <h2>Exchange</h2>
        <TabList>
          <Tab>Buy</Tab>
          <Tab>Sell</Tab>
          <Tab disabled={!hasOrders}>Orders</Tab>
        </TabList>

        <TabPanel>
        <SmartContainer accountIndex="0" notOwnerOnly>
            <h2>Buy</h2>
            <h3>Select best deal to buy <BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> RST </h3>
            <p>Just copy and paste <strong>min</strong> amount in Wei in <strong>Value</strong> field and token ID <strong>id</strong> in the <strong>_id</strong> field in the form below. </p>
            <p>Press <strong>Submit</strong> to confirm transaction in Metamask.</p>
            <h3>Deal</h3>
            <ContractData contract="SimpleExchange" method="findDeal" />
            <h3>Buy RST</h3>
            <ContractFormExtension contract="SimpleExchange" method="buyOrder" />

            <br/><br/>
          </SmartContainer>
        </TabPanel>

        <TabPanel>
          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId={["1","12","13"]} uncheck>
            <h2>Approve</h2>
            <p>Before place the order the new member need to approve token transfer from own account to SimpleExchange smart contract address. The amount to approve is amount in RST</p>
            <h3>Current Account RST Balance</h3>
            <p><BalanceData contract="RSTToken" method="balanceOf" accountIndex="0" units="nano" precision="3" correction="1" /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
            <h3>Allowance</h3>
            <p><BalanceData contract="RSTToken" method="allowance" methodArgs={[this.props.accounts[0],this.addresses.SimpleExchange]} units="nano" precision="3" correction="1" /> <ContractData contract="RSTToken" method="symbol" hideIndicator /></p>
            <h3>Amount</h3>
            <p><BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
            <h3>Approve token transfer</h3>
            <p><strong>To Address</strong>: <ContractData contract="ERC20Adapter" method="root" /></p>
            <p><strong>Amount to Approve</strong>: <ContractData contract="SimpleExchange" method="amount" /></p>
            <p>Just copy and paste information above in the form fields. Please note that <b>Amount to Approve</b> is an integer number and will be adjusted by the smart contract by the number of decimals for the RST token by dividing <b>Amount to Approve</b> by 10 ^ <ContractData contract="RSTToken" method="decimals" />. <br/><br/>If the transaction approval is done then <b>Allowance</b> will be equal to <b>Join Amount [RST]</b></p>
            <ContractForm contract="RSTToken" method="approve" labels={['To Address', 'Amount to Approve']} />
            
            <br/><br/>
          </SmartContainer>

          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId={["2","12","13"]} check>
            <h2>Order</h2>
            <p>Place the order to sell RST</p>
            <h3>Order Info</h3>
            <p><strong>Order Amount</strong>: <BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
            <p><strong>Balance</strong>: <ContractData contract="ERC721SmartToken" method="balanceOf" methodArgs={[this.props.accounts[0]]} /> <ContractData contract="ERC721SmartToken" method="symbol" hideIndicator /> </p>
            <p><strong>Rate</strong>: <ContractData contract="SimpleExchange" method="rate" /></p>
            <p><strong>Amount</strong>: <BalanceData contract="SimpleExchange" method="amount" accountIndex="0" units="nano" correction="1" precision="3" viewOnly /> <ContractData contract="RSTToken" method="symbol" hideIndicator /> </p>
            <p><strong>Check</strong>: <ContractData contract="SimpleExchange" method="checkOrder" /></p>
            <h3>Allowance</h3>
            <p><BalanceData contract="RSTToken" method="allowance" methodArgs={[this.props.accounts[0],this.addresses.SimpleExchange]} units="nano" precision="3" correction="1" /> <ContractData contract="RSTToken" method="symbol" hideIndicator /></p>
            <h3>Order</h3>
            <ContractForm contract="SimpleExchange" method="placeOrder" />

            <br/><br/>
          </SmartContainer>
          
        </TabPanel>

        <TabPanel>
          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId="10">
            <h2>Current Order is Active</h2>
            <ContractData contract="SimpleExchange" method="getCurrentToken" />
            <h3>Cancel</h3>
            <ContractForm contract="SimpleExchange" method="cancelOrder" />
            <br/><br/>
          </SmartContainer>

          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId="11">
            <h2>Current Order is Executed</h2>
            <ContractData contract="SimpleExchange" method="getCurrentToken" />
            <h3>Collect Payment</h3>
            <ContractForm contract="SimpleExchange" method="payment" />
            <br/><br/>
          </SmartContainer>

          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId="12">
            <h2>Current Order is Closed</h2>
            <ContractData contract="SimpleExchange" method="getCurrentToken" />
            <br/><br/>
          </SmartContainer>

          <SmartContainer accountIndex="0" notOwnerOnly bizProcessId="13">
            <h2>Current Order is Canceled</h2>
            <ContractData contract="SimpleExchange" method="getCurrentToken" />
            <br/><br/>
          </SmartContainer>
          
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
            <h3>Smart Contracts &nbsp;<small>v 0.0.1</small></h3>

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
