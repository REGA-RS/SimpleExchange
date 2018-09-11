import Home from './Home'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    SimpleExchange: state.contracts.SimpleExchange,
    RSTToken: state.contracts.RSTToken,
    ERC20Adapter: state.contracts.ERC20Adapter,
    ERC721SmartToken: state.contracts.ERC721SmartToken,
    drizzleStatus: state.drizzleStatus
  }
}

Home.contextTypes = {
  drizzle: PropTypes.object
}

const HomeContainer = drizzleConnect(Home, mapStateToProps);

export default HomeContainer
