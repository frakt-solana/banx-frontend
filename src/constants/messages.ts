// * Static messages * //
export const MESSAGES = {
  //? Common
  NO_MARKETS_AVAILABLE: 'No markets here for now. Check back later!',
  NO_MULTIPLIER_POSITIONS:
    'No multiplier positions available yet. Start leveraging your assets today!',
  NO_VAULTS_AVAILABLE: 'No vaults here for now. Check back later!',

  //? Borrower
  BORROWER_NO_LOANS: 'No loans right now. Ready to borrow? Start today!',
  BORROWER_NO_LISTINGS: 'No listings yet. Create one with terms that suit you!',

  //? Lender
  LENDER_NO_OFFERS: 'No offers here yet. Lend USDC or SOL and grow your earnings!',
  LENDER_NO_LOANS: 'No loans available yet. Start lending today and earn!',

  //? Filters
  EMPTY_FILTERED_LIST: 'The list’s empty. Try tweaking your filters!',
  EMPTY_SEARCH_RESULTS: 'Looks like a miss. Try a different search term!',

  //? Not connected
  NO_CONNECTED_LOANS: 'Connect your wallet to see your loans',
  NO_CONNECTED_OFFERS: 'Connect your wallet to see your offers',

  //? Activity-related messages
  NOT_CONNECTED_ACTIVITY: 'Connect your wallet to view your activity history',
  NO_LENDING_ACTIVITY: 'No lending activity yet. Lend USDC or SOL and watch your earnings grow!',
  NO_BORROWING_ACTIVITY: 'No borrowing activity yet. Borrow assets and track it here!',
}

// * Dynamic messages * //
export const NO_LOANS_IN_MARKET_MESSAGE = (loansCount: number) =>
  loansCount > 0
    ? `No loans here, but you have ${loansCount} in other markets. Adjust your filters to view them!`
    : MESSAGES.EMPTY_FILTERED_LIST

export const NO_OFFERS_IN_MARKET_MESSAGE = (offersCount: number) =>
  offersCount > 0
    ? `No offers here, but you have ${offersCount} in other markets. Adjust your filters to find them!`
    : MESSAGES.EMPTY_FILTERED_LIST
