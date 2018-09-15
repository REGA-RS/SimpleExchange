import { drizzleConnect } from 'drizzle-react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ProgressBar from './ProgressBar.js';

/*
 * Create component.
 */

class SmartContainer extends Component {
  constructor(props, context) {
    super(props);

    this.contracts = context.drizzle.contracts;

    const abi = this.contracts['SimpleExchange'].abi;

    // Fetch initial value from chain and return cache key for reactive updates.
    this.account = this.props.accounts[this.props.accountIndex];

    this.dataKey = this.contracts['SimpleExchange'].methods['getBizProcessId'].cacheCall(...[]);

    this.dataKeyCheck = this.contracts['SimpleExchange'].methods['checkOrder'].cacheCall(...[]);

    // Iterate over abi for correct function.
    for (var i = 0; i < abi.length; i++) {
      if (abi[i].name === 'getBizProcessId') {
          this.fnABI = abi[i];

          break;
      }
    }
  }

  CheckBizProcess(id) {
    if(Array.isArray(this.props.bizProcessId)) {
      return this.props.bizProcessId.includes(id);
    }
    else {
      return this.props.bizProcessId === id;
    }
  }

  checkFileExists(url) {
    axios.get(url).then((response) => {
        console.log(url);
        return url;
      }).catch(function (error) {
        console.log(error);
        return ``;
      });
  }

  render() {
    // No accounts found.
    if(Object.keys(this.props.accounts).length === 0 || !this.props.contracts['SimpleExchange'].initialized) {
      return (
        <span>Initializing...</span>
      )
    }

    // If the cache key we received earlier isn't in the store yet; the initial value is still being fetched.
    if(!(this.dataKey in this.props.contracts['SimpleExchange']['getBizProcessId'])) {
      return (
        <span>Fetching...</span>
      )
    }

    if(!(this.dataKeyCheck in this.props.contracts['SimpleExchange']['checkOrder'])) {
      return (
        <span>Fetching...</span>
      )
    }

    var displayData = this.props.contracts['SimpleExchange']['getBizProcessId'][this.dataKey].value
    var contractOwner = displayData['contractOwner'];
    var bizProcessId = displayData['bizProcessId'];

    var check = this.props.contracts['SimpleExchange']['checkOrder'][this.dataKeyCheck].value;

    if(this.props.check) {
      if(check !== '11111111') {
        return(
          null
        )
      }
    }

    if(this.props.uncheck) {
      if(check === '11111111') {
        return(
          null
        )
      }
    }

    if(this.props.nothingToSell) {
      if(this.props.nothingToSell === true) {
      return(
        <h2>You don't have any RST tokens to sell</h2>
      )
      }
    }

    if(this.props.nothingToBuy) {
      if(this.props.nothingToBuy === true) {
      return(
        <h2>There is no any RST tokens to buy</h2>
      )
      }
    }

    if(this.account === contractOwner && this.props.ownerOnly) {
      if(bizProcessId ==='100') {
        if(this.props.init) {
          return(
            <div className="pure-u-1-1"><h2>Owner Only : Initializing</h2>{this.props.children}</div>
          )
        }
        else {
          return(
            null
          )
        }
      }
      if(!this.props.init) {
        return(
          <div className="pure-u-1-1"><h2>Owner Only</h2>{this.props.children}</div>
        )
      }
      return(
        null
      )
    }
    else if((this.props.notOwnerOnly && this.account !== contractOwner) || (!this.props.notOwnerOnly && !this.props.ownerOnly)) {
      if(this.props.bizProcessId) {
        // if(this.props.bizProcessId === bizProcessId) {
        if(this.CheckBizProcess(bizProcessId)) {

          if(this.props.hide) {
            if(bizProcessId === this.props.hide) {
              return (
                null
              )
            }
          }
          
          return(
            <div className="pure-u-1-1">{this.props.children}</div>
          )
        }
        else {
          return(
            null
          )
        }
      }
      else {
        if(this.props.ProgressBar) {
          return(
            <div className="pure-u-1-1">
              {this.props.children}
              <ProgressBar bizProcessId={bizProcessId}/>
              <br/><br/>
            </div>
          )
        }
        if(bizProcessId ==='100') {
          return(
            null
          )
        }
        return(
          <div className="pure-u-1-1">{this.props.children}</div>
        )
      }
    }
    else {
      return(
        null
      )
    }
  }
}

SmartContainer.contextTypes = {
  drizzle: PropTypes.object
}

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    contracts: state.contracts    
  }
}

export default drizzleConnect(SmartContainer, mapStateToProps)