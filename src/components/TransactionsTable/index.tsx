import React, {useCallback, useState, useMemo, useEffect, useRef} from 'react'
import styled from 'styled-components'
import { DarkGreyCard } from 'components/Card'
import Loader from 'components/Loader'
import { AutoColumn } from 'components/Column'
import { formatDollarAmount, formatAmount } from 'utils/numbers'
import { shortenAddress, getEtherscanLink } from 'utils'
import { Label, ClickableText } from 'components/Text'
import { Transaction, TransactionType } from 'types'
import { formatTime } from 'utils/date'
import { RowFixed } from 'components/Row'
import { ExternalLink, TYPE } from 'theme'
import { PageButtons, Arrow, Break } from 'components/shared'
import useTheme from 'hooks/useTheme'
import HoverInlineText from 'components/HoverInlineText'
import { useActiveNetworkVersion } from 'state/application/hooks'
import {CeloNetworkInfo, EthereumNetworkInfo, OptimismNetworkInfo, PolygonNetworkInfo} from 'constants/networks'
import { Link } from 'react-router-dom'
import {useOnClickOutside} from "../../hooks/useOnClickOutside";
import {ChevronDown} from "react-feather";

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

  grid-template-columns: 1.5fr repeat(5, 1fr);

  @media screen and (max-width: 940px) {
    grid-template-columns: 1.5fr repeat(4, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
  }

  @media screen and (max-width: 800px) {
    grid-template-columns: 1.5fr repeat(2, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
  }

  @media screen and (max-width: 500px) {
    grid-template-columns: 1.5fr repeat(1, 1fr);
    & > *:nth-child(5) {
      display: none;
    }
    & > *:nth-child(3) {
      display: none;
    }
    & > *:nth-child(4) {
      display: none;
    }
    & > *:nth-child(2) {
      display: none;
    }
  }
`

const FlyOut = styled.div`
  top: 100%;
  color: #fff;
  text-align: left;
  width: auto;
  padding: 0;
  background-color: ${({ theme }) => theme.bg1};
  position: absolute;
  left: 0;
  border-radius: 12px;
`

const MenuContainer = styled.div`
  position: relative;
`;

const SelectedMenuItem = styled.div`
  position: relative;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
`;

const MenuItem = styled.button`
  cursor: pointer;
  border: none;
  background-color: transparent;
  font-size: 14px;
  padding: 10px;
  color: #fff;
  text-align: left;
  outline: none;
  @media screen and (max-width: 600px) {
    font-size: 14px;
  }
`

const ResponsiveGridWrapper = styled(ResponsiveGrid)`
  padding: 15px 30px;
`

const SORT_FIELD = {
  amountUSD: 'amountUSD',
  timestamp: 'timestamp',
  sender: 'sender',
  amountToken0: 'amountToken0',
  amountToken1: 'amountToken1',
}

const DataRow = ({ transaction, color }: { transaction: Transaction; color?: string }) => {
  const abs0 = Math.abs(transaction.amountToken0)
  const abs1 = Math.abs(transaction.amountToken1)
  const outputTokenSymbol = transaction.amountToken0 < 0 ? transaction.token0Symbol : transaction.token1Symbol
  const inputTokenSymbol = transaction.amountToken1 < 0 ? transaction.token0Symbol : transaction.token1Symbol
  const [activeNetwork] = useActiveNetworkVersion()
  const theme = useTheme()

  return (
    <ResponsiveGridWrapper>
      <ExternalLink href={getEtherscanLink(1, transaction.hash, 'transaction', activeNetwork)}>
        <Label color={color ?? theme.blue1}>
          {transaction.type === TransactionType.MINT
            ? `Add ${transaction.token0Symbol} and ${transaction.token1Symbol}`
            : transaction.type === TransactionType.SWAP
            ? `Swap ${inputTokenSymbol} for ${outputTokenSymbol}`
            : `Remove ${transaction.token0Symbol} and ${transaction.token1Symbol}`}
        </Label>
      </ExternalLink>
      <Label end={1}>
        {formatDollarAmount(transaction.amountUSD)}
      </Label>
      <Label end={1}>
        <HoverInlineText text={`${formatAmount(abs0)}  ${transaction.token0Symbol}`} maxCharacters={16} />
      </Label>
      <Label end={1}>
        <HoverInlineText text={`${formatAmount(abs1)}  ${transaction.token1Symbol}`} maxCharacters={16} />
      </Label>
      <Label end={1}>
        <ExternalLink
          href={getEtherscanLink(1, transaction.sender, 'address', activeNetwork)}
          style={{ color: color ?? theme.blue1 }}
        >
          {shortenAddress(transaction.sender)}
        </ExternalLink>
      </Label>
      <Label end={1}>
        {formatTime(transaction.timestamp, activeNetwork === OptimismNetworkInfo ? 8 : 0)}
      </Label>
    </ResponsiveGridWrapper>
  )
}

export default function TransactionTable({
  transactions,
  maxItems = 10,
  color,
}: {
  transactions: Transaction[]
  maxItems?: number
  color?: string
}) {
  // theming
  const theme = useTheme()

  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    console.log(showMenu);
  }, [showMenu])
  const node = useRef<HTMLDivElement>(null)
  useOnClickOutside(node, () => setShowMenu(false))

  // for sorting
  const [sortField, setSortField] = useState(SORT_FIELD.timestamp)
  const [sortDirection, setSortDirection] = useState<boolean>(true)

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)

  useEffect(() => {
    let extraPages = 1
    if (transactions.length % maxItems === 0) {
      extraPages = 0
    }
    setMaxPage(Math.floor(transactions.length / maxItems) + extraPages)
  }, [maxItems, transactions])

  // filter on txn type
  const [txFilter, setTxFilter] = useState<TransactionType | undefined>(undefined)

  const sortedTransactions = useMemo(() => {
    return transactions
      ? transactions
          .slice()
          .sort((a, b) => {
            if (a && b) {
              return a[sortField as keyof Transaction] > b[sortField as keyof Transaction]
                ? (sortDirection ? -1 : 1) * 1
                : (sortDirection ? -1 : 1) * -1
            } else {
              return -1
            }
          })
          .filter((x) => {
            return txFilter === undefined || x.type === txFilter
          })
          .slice(maxItems * (page - 1), page * maxItems)
      : []
  }, [transactions, maxItems, page, sortField, sortDirection, txFilter])

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

  if (!transactions) {
    return <Loader />
  }

  return (
    <Wrapper>
      <TableHeader>
        <ResponsiveGrid>
          <MenuContainer ref={node}>
            <SelectedMenuItem className={"wrapper"} onClick={() => setShowMenu(!showMenu)}>
              <RowFixed style={{display: 'inline-flex'}}>
                {txFilter === undefined && 'All'}
                {txFilter === TransactionType.SWAP && 'Swaps'}
                {txFilter === TransactionType.MINT && 'Adds'}
                {txFilter === TransactionType.BURN && 'Removes'}
                <ChevronDown size="20px" />
              </RowFixed>
            </SelectedMenuItem>
            {showMenu && (
              <FlyOut>
                <AutoColumn gap="10px" style={{padding: '10px'}}>
                  {txFilter != undefined && (
                    <MenuItem onClick={() => {setTxFilter(undefined)}}>All</MenuItem>
                  )}
                  {txFilter != TransactionType.SWAP && (
                    <MenuItem onClick={() => {setTxFilter(TransactionType.SWAP)}}>Swaps</MenuItem>
                  )}
                  {txFilter != TransactionType.MINT && (
                    <MenuItem onClick={() => {setTxFilter(TransactionType.MINT)}}>Adds</MenuItem>
                  )}
                  {txFilter != TransactionType.BURN && (
                    <MenuItem onClick={() => {setTxFilter(TransactionType.BURN)}}>Removes</MenuItem>
                  )}
                </AutoColumn>
              </FlyOut>
            )}

          </MenuContainer>




          {/*</RowFixed>*/}
          <ClickableText onClick={() => handleSort(SORT_FIELD.amountUSD)} end={1}>
            Total Value {arrow(SORT_FIELD.amountUSD)}
          </ClickableText>
          <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.amountToken0)}>
            Token Amount {arrow(SORT_FIELD.amountToken0)}
          </ClickableText>
          <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.amountToken1)}>
            Token Amount {arrow(SORT_FIELD.amountToken1)}
          </ClickableText>
          <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.sender)}>
            Account {arrow(SORT_FIELD.sender)}
          </ClickableText>
          <ClickableText end={1} onClick={() => handleSort(SORT_FIELD.timestamp)}>
            Time {arrow(SORT_FIELD.timestamp)}
          </ClickableText>
        </ResponsiveGrid>
      </TableHeader>
      <Break />
      <AutoColumn>
        {sortedTransactions.map((t, i) => {
          if (t) {
            return (
              <React.Fragment key={i}>
                <DataRow transaction={t} color={color} />
                <Break />
              </React.Fragment>
            )
          }
          return null
        })}
        {sortedTransactions.length === 0 ? <TYPE.main>No Transactions</TYPE.main> : undefined}
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
    </Wrapper>
  )
}
