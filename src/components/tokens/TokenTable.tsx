import React, { useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { ExtraSmallOnly, HideExtraSmall, TYPE } from 'theme'
import { DarkGreyCard } from 'components/Card'
import { TokenData } from '../../state/tokens/reducer'
import Loader, { LoadingRows } from 'components/Loader'
import { Link } from 'react-router-dom'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { RowFixed } from 'components/Row'
import { formatDollarAmount } from 'utils/numbers'
import Percent from 'components/Percent'
import { Label, ClickableText } from '../Text'
import { PageButtons, Arrow, Break } from 'components/shared'
import HoverInlineText from '../HoverInlineText'
import useTheme from 'hooks/useTheme'
import { TOKEN_HIDE } from '../../constants/index'

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
`

const TableHeader = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 16px 30px;
`

const ResponsiveGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  align-items: center;

  grid-template-columns: 20px 3fr repeat(5, 1fr);

  @media screen and (max-width: 900px) {
    grid-template-columns: 20px 1.5fr repeat(3, 1fr);
    & :nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 20px 1.5fr repeat(2, 1fr);
    & :nth-child(6) {
      display: none;
    }
  }

  @media screen and (max-width: 670px) {
    grid-template-columns: repeat(2, 1fr);
    > *:first-child {
      display: none;
    }
    > *:nth-child(3) {
      display: none;
    }
  }
`

const LinkWrapper = styled(Link)`
  text-decoration: none;
  padding: 15px 30px;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const ResponsiveLogo = styled(CurrencyLogo)`
  @media screen and (max-width: 670px) {
    width: 16px;
    height: 16px;
  }
`

const DataRow = ({ tokenData, index }: { tokenData: TokenData; index: number }) => {
  return (
    <LinkWrapper to={'tokens/' + tokenData.address}>
      <ResponsiveGrid>
        <Label>{index + 1}</Label>
        <Label>
          <RowFixed>
            <ResponsiveLogo address={tokenData.address} />
          </RowFixed>
          <HideExtraSmall style={{ marginLeft: '10px' }}>
            <RowFixed>
              <HoverInlineText text={tokenData.name} />
            </RowFixed>
          </HideExtraSmall>
        </Label>
        <Label>
          <RowFixed>
            <Label ml="8px">
              {tokenData.symbol}
            </Label>
          </RowFixed>
        </Label>
        <Label end={1}>
          {formatDollarAmount(tokenData.tvlUSD)}
        </Label>
        <Label end={1}>
          {formatDollarAmount(tokenData.volumeUSD)}
        </Label>
        <Label end={1}>
          {formatDollarAmount(tokenData.priceUSD)}
        </Label>
        <Label end={1}>
          <Percent value={tokenData.priceUSDChange} />
        </Label>
      </ResponsiveGrid>
    </LinkWrapper>
  )
}

const SORT_FIELD = {
  name: 'name',
  volumeUSD: 'volumeUSD',
  tvlUSD: 'tvlUSD',
  priceUSD: 'priceUSD',
  priceUSDChange: 'priceUSDChange',
  priceUSDChangeWeek: 'priceUSDChangeWeek',
}

const MAX_ITEMS = 10

export default function TokenTable({
  tokenDatas,
  maxItems = MAX_ITEMS,
}: {
  tokenDatas: TokenData[] | undefined
  maxItems?: number
}) {
  // theming
  const theme = useTheme()

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.tvlUSD)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  useEffect(() => {
    let extraPages = 1
    if (tokenDatas) {
      if (tokenDatas.length % maxItems === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(tokenDatas.length / maxItems) + extraPages)
    }
  }, [maxItems, tokenDatas])

  const sortedTokens = useMemo(() => {
    return tokenDatas
      ? tokenDatas
          .filter((x) => !!x && !TOKEN_HIDE.includes(x.address))
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof TokenData] > b[sortField as keyof TokenData]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [tokenDatas, maxItems, page, sortDirection, sortField])

  const handleSort = useCallback(
    (newField: string) => {
      setSortField(newField)
      setSortDirection(sortField !== newField ? true : !sortDirection)
    },
    [sortDirection, sortField]
  )

  const arrow = useCallback(
    (field: string) => {
      return sortField === field ? (!sortDirection ? '↑' : '↓') : ''
    },
    [sortDirection, sortField]
  )

  if (!tokenDatas) {
    return <Loader />
  }

  return (
    <Wrapper>
      {sortedTokens.length > 0 ? (
        <>
          <TableHeader>
            <ResponsiveGrid>
              <Label>#</Label>
              <ClickableText onClick={() => handleSort(SORT_FIELD.name)}>
                Name {arrow(SORT_FIELD.name)}
              </ClickableText>
              <Label>Symbol</Label>
              <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.tvlUSD)}>
                Liquidity {arrow(SORT_FIELD.tvlUSD)}
              </ClickableText>
              <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.volumeUSD)}>
                Volume 24H {arrow(SORT_FIELD.volumeUSD)}
              </ClickableText>
              <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.priceUSD)}>
                Price {arrow(SORT_FIELD.priceUSD)}
              </ClickableText>
              <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.priceUSDChange)}>
                Price Change {arrow(SORT_FIELD.priceUSDChange)}
              </ClickableText>
              {/* <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.priceUSDChangeWeek)}>
            7d {arrow(SORT_FIELD.priceUSDChangeWeek)}
          </ClickableText> */}
            </ResponsiveGrid>
          </TableHeader>
          <Break />
          <AutoColumn>
            {sortedTokens.map((data, i) => {
              if (data) {
                return (
                  <React.Fragment key={i}>
                    <DataRow index={(page - 1) * MAX_ITEMS + i} tokenData={data} />
                    <Break />
                  </React.Fragment>
                )
              }
              return null
            })}
            <PageButtons>
              <div
                onClick={() => {
                  setPage(page === 1 ? page : page - 1)
                }}
              >
                <Arrow faded={page === 1 ? true : false}>←</Arrow>
              </div>
              <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
              <div
                onClick={() => {
                  setPage(page === maxPage ? page : page + 1)
                }}
              >
                <Arrow faded={page === maxPage ? true : false}>→</Arrow>
              </div>
            </PageButtons>
          </AutoColumn>
        </>
      ) : (
        <LoadingRows>
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </LoadingRows>
      )}
    </Wrapper>
  )
}
