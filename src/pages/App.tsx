import React, { Suspense, useState, useEffect } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Header from '../components/Header'
import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import Home from './Home'
import PoolsOverview from './Pool/PoolsOverview'
import TokensOverview from './Token/TokensOverview'
import SearchSmall from 'components/Search'
import { RedirectInvalidToken } from './Token/redirects'
import { LocalLoader } from 'components/Loader'
import PoolPage from './Pool/PoolPage'
import { ExternalLink, TYPE } from 'theme'
import { useActiveNetworkVersion, useSubgraphStatus } from 'state/application/hooks'
import { DarkGreyCard } from 'components/Card'
import {
  SUPPORTED_NETWORK_VERSIONS,
  EthereumNetworkInfo,
  OptimismNetworkInfo,
  StarknetNetworkInfo
} from 'constants/networks'
import {ThemedBackgroundGlobal} from "./styled";
import {AutoColumn} from "../components/Column";

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  overflow-x: hidden;
  min-height: 100vh;
`

const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  width: 100%;
  position: fixed;
  justify-content: space-between;
  z-index: 2;
`

const BodyWrapper = styled.div<{ warningActive?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 40px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;

  > * {
    max-width: 1200px;
  }

  @media (max-width: 1080px) {
    padding-top: 2rem;
    margin-top: 140px;
  }
`

const Marginer = styled.div`
  margin-top: 5rem;
`

export const PageWrapper = styled.div`
  width: 90%;
  padding: 85px 30px 50px;
  background: rgba(196, 196, 196, 0.01);
  border: 2px solid #FFFFFF;
  box-shadow: inset 0px 30.0211px 43.1072px -27.7118px rgba(255, 255, 255, 0.5), inset 0px 5.38841px 8.46749px -3.07909px #FFFFFF, inset 0px -63.1213px 52.3445px -49.2654px rgba(96, 68, 145, 0.3), inset 0px 75.4377px 76.9772px -36.9491px rgba(202, 172, 255, 0.3), inset 0px 3.07909px 13.8559px rgba(154, 146, 210, 0.3), inset 0px 0.769772px 30.7909px rgba(227, 222, 255, 0.2);
  //backdrop-filter: blur(38.4886px);
  border-radius: 16px;
`

const BLOCK_DIFFERENCE_THRESHOLD = 30

export default function App() {
  // pretend load buffer
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setLoading(false), 1300)
  }, [])

  // update network based on route
  // TEMP - find better way to do this
  const location = useLocation()
  const [activeNetwork, setActiveNetwork] = useActiveNetworkVersion()
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveNetwork(StarknetNetworkInfo)
    } else {
      SUPPORTED_NETWORK_VERSIONS.map((n) => {
        if (location.pathname.includes(n.route.toLocaleLowerCase())) {
          setActiveNetwork(n)
        }
      })
    }
  }, [location.pathname, setActiveNetwork])

  // subgraph health
  const [subgraphStatus] = useSubgraphStatus()

  const showNotSyncedWarning =
    subgraphStatus.headBlock && subgraphStatus.syncedBlock && activeNetwork === OptimismNetworkInfo
      ? subgraphStatus.headBlock - subgraphStatus.syncedBlock > BLOCK_DIFFERENCE_THRESHOLD
      : false

  return (
    <Suspense fallback={null}>
      {loading ? (
        <LocalLoader />
      ) : (
        <AppWrapper>
          <URLWarning />
          {subgraphStatus.available === false ? (
            <AppWrapper>
              <BodyWrapper>
                <DarkGreyCard style={{ maxWidth: '340px' }}>
                  <TYPE.label>
                    The Graph hosted network which provides data for this site is temporarily experiencing issues. Check
                    current status{' '}
                    <ExternalLink href="https://thegraph.com/hosted-service/subgraph/uniswap/uniswap-v3">
                      here.
                    </ExternalLink>
                  </TYPE.label>
                </DarkGreyCard>
              </BodyWrapper>
            </AppWrapper>
          ) : (
            <BodyWrapper warningActive={showNotSyncedWarning}>
              <Popups />

              <PageWrapper>
                <AutoColumn gap="32px">
                  <ThemedBackgroundGlobal backgroundColor={activeNetwork.bgColor} />
                  <SearchSmall />
                  <Switch>
                    <Route exact strict path="/:networkID?/pools/:address" component={PoolPage} />
                    <Route exact strict path="/:networkID?/pools" component={PoolsOverview} />
                    <Route exact strict path="/:networkID?/tokens/:address" component={RedirectInvalidToken} />
                    <Route exact strict path="/:networkID?/tokens" component={TokensOverview} />
                    <Route exact path="/:networkID?" component={Home} />
                  </Switch>
                  <Marginer />
                </AutoColumn>
              </PageWrapper>

            </BodyWrapper>
          )}
        </AppWrapper>
      )}
    </Suspense>
  )
}
