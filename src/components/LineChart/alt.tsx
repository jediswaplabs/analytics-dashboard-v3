/* eslint-disable */
import React, { Dispatch, SetStateAction, ReactNode } from 'react'
import {ResponsiveContainer, XAxis, Tooltip, AreaChart, Area, YAxis} from 'recharts'
import styled from 'styled-components'
import Card, {DarkGreyCard} from 'components/Card'
import { RowBetween } from 'components/Row'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import useTheme from 'hooks/useTheme'
import { darken } from 'polished'
import { LoadingRows } from 'components/Loader'
import {TvlWindow, VolumeWindow} from "../../types";
import {formatDollarAmount} from "../../utils/numbers";
dayjs.extend(utc)

const DEFAULT_HEIGHT = 300

const Wrapper = styled(DarkGreyCard)`
  width: 100%;
  height: ${DEFAULT_HEIGHT}px;
  padding: 32px;
  display: flex;
  //background-color: ${({ theme }) => theme.bg0};
  flex-direction: column;
  > * {
    font-size: 1rem;
  }
`

export type LineChartProps = {
  data: any[]
  color?: string | undefined
  height?: number | undefined
  minHeight?: number
  setValue?: Dispatch<SetStateAction<number | undefined>> // used for value on hover
  setLabel?: Dispatch<SetStateAction<string | undefined>> // used for label of valye
  value?: number
  label?: string
  activeWindow?: TvlWindow
  topLeft?: ReactNode | undefined
  topRight?: ReactNode | undefined
  bottomLeft?: ReactNode | undefined
  bottomRight?: ReactNode | undefined
} & React.HTMLAttributes<HTMLDivElement>

const Chart = ({
  data,
  color = '#56B2A4',
  value,
  label,
  setValue,
  setLabel,
  topLeft,
  activeWindow,
  topRight,
  bottomLeft,
  bottomRight,
  minHeight = DEFAULT_HEIGHT,
  ...rest
}: LineChartProps) => {
  const theme = useTheme()
  const parsedValue = value
  const now = dayjs()
  console.log(data);
  return (
    <Wrapper minHeight={minHeight} {...rest}>
      <RowBetween style={{ alignItems: 'flex-start', marginBottom: 10 }}>
        {topLeft ?? null}
        {topRight ?? null}
      </RowBetween>
      {data?.length === 0 ? (
        <LoadingRows>
          <div />
          <div />
          <div />
        </LoadingRows>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            onMouseLeave={() => {
              setLabel && setLabel(undefined)
              setValue && setValue(undefined)
            }}
          >
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis
              dataKey="value"
              axisLine={false}
              stroke={theme.text1}
              tickLine={false}
              fontSize={12}
              dx={-10}
              tickFormatter={(value) => formatDollarAmount(value, 2)}
              // minTickGap={12}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              stroke={theme.text1}
              dy={10}
              fontSize={12}
              tickFormatter={(time) => dayjs(time).format(activeWindow === TvlWindow.monthly ? 'MMM' : 'DD')}
              minTickGap={10}
            />
            <Tooltip
              cursor={{ stroke: theme.bg2 }}
              contentStyle={{ display: 'none' }}
              formatter={(value: number, name: string, props: { payload: { time: string; value: number } }) => {
                if (setValue && parsedValue !== props.payload.value) {
                  setValue(props.payload.value)
                }

                const formattedTime = dayjs(props.payload.time).format('MMM D')
                const formattedTimeDaily = dayjs(props.payload.time).format('MMM D YYYY')
                const formattedTimePlusWeek = dayjs(props.payload.time).add(1, 'week')
                const formattedTimePlusMonth = dayjs(props.payload.time).add(1, 'month')

                if (setLabel && label !== formattedTime) {
                  if (activeWindow === TvlWindow.weekly) {
                    const isCurrent = formattedTimePlusWeek.isAfter(now)
                    setLabel(
                      formattedTime + '-' + (isCurrent ? 'current' : formattedTimePlusWeek.format('MMM D, YYYY'))
                    )
                  } else if (activeWindow === TvlWindow.monthly) {
                    const isCurrent = formattedTimePlusMonth.isAfter(now)
                    setLabel(
                      formattedTime + '-' + (isCurrent ? 'current' : formattedTimePlusMonth.format('MMM D, YYYY'))
                    )
                  } else {
                    setLabel(formattedTimeDaily)
                  }
                }

                //
                // const formattedTime = dayjs(props.payload.time).format('MMM D, YYYY')
                // if (setLabel && label !== formattedTime) setLabel(formattedTime)
              }}
            />
            <Area dataKey="value" type="monotone" stroke={color} fill="url(#gradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
      <RowBetween>
        {bottomLeft ?? null}
        {bottomRight ?? null}
      </RowBetween>
    </Wrapper>
  )
}

export default Chart
