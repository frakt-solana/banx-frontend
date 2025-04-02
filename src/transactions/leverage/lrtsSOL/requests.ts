import { stakePoolInfo } from '@solana/spl-stake-pool'
import { web3 } from 'fbonds-core'

export const getSolayerConversionRate = async (connection: web3.Connection) => {
  const SOLAYER_RESTAKE_POOL = new web3.PublicKey('po1osKDWYF9oiVEGmzKA4eTs8eMveFRMox3bUKazGN2')

  const info = await stakePoolInfo(connection, SOLAYER_RESTAKE_POOL)
  let nativeSolStaked = info.details.reserveStakeLamports || 0
  for (let i = 0; i < info.details.stakeAccounts.length; i++) {
    nativeSolStaked += parseInt(info.details.stakeAccounts[i].validatorLamports)
  }
  const lstSupply = parseInt(info.poolTokenSupply)
  const conversionRate = lstSupply / nativeSolStaked
  // console.log(`Conversion Rate: 1 SOL = ${conversionRate} sSOL`)
  // console.log(`Total native staked SOL: ${nativeSolStaked / web3.LAMPORTS_PER_SOL}`)
  // console.log(`Total sSOL (Supply): ${lstSupply / web3.LAMPORTS_PER_SOL}`)
  return conversionRate
}
