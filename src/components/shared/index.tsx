import Row from 'components/Row'
import React from 'react'
import styled from 'styled-components'

export const PageButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.5em;
  margin-bottom: 1.5em;
`

export const Arrow = styled.div<{ faded: boolean }>`
  color: ${({ theme }) => theme.primary1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

export const Break = styled.div`
  height: 1px;
  // background-color: ${({ theme }) => theme.bg1};
  background-color: rgba(255, 255, 255, 0.2);
  width: 100%;
`

export const FixedSpan = styled.span<{ width?: string | null }>`
  width: ${({ width }) => width ?? ''};
`

export const MonoSpace = styled.span`
  font-variant-numeric: tabular-nums;
`
