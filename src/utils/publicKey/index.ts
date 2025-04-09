import { web3 } from 'fbonds-core'
import _ from 'lodash'

export const arePublicKeysEqual = (
  publicKeyA: web3.PublicKey,
  publicKeyB: web3.PublicKey,
): boolean => publicKeyA.equals(publicKeyB)

export const removeDuplicatedPublicKeys = (
  publicKeys: Array<web3.PublicKey>,
): Array<web3.PublicKey> => _.uniqWith(publicKeys, arePublicKeysEqual)
