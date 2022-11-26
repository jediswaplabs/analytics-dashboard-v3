import {EthereumNetworkInfo, NetworkInfo, StarknetNetworkInfo} from 'constants/networks'

export function networkPrefix(activeNewtork: NetworkInfo) {
  const isEthereum = activeNewtork === EthereumNetworkInfo
  const isStarknet = activeNewtork === StarknetNetworkInfo
  if (isEthereum || isStarknet) {
    return '/'
  }
  const prefix = '/' + activeNewtork.route.toLocaleLowerCase() + '/'
  return prefix
}
