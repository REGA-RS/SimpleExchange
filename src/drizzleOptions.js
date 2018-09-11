import SimpleExchange from './../build/contracts/SimpleExchange.json'
import ERC20Adapter from './../build/contracts/ERC20Adapter.json'
import RSTToken from './../build/contracts/RSTToken.json'
import ERC721SmartToken from './../build/contracts/ERC721SmartToken.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:7545'
    }
  },
  contracts: [
    RSTToken,
    ERC20Adapter,
    SimpleExchange,
    ERC721SmartToken
  ],
  events: {
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions