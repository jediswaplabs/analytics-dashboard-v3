import React, { useMemo } from 'react'
import styled, {
  ThemeProvider as StyledComponentsThemeProvider,
  createGlobalStyle,
  css,
  DefaultTheme,
} from 'styled-components'
import { useIsDarkMode } from '../state/user/hooks'
import { Text, TextProps } from 'rebass'
import { Colors } from './styled'

export * from './components'

export const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToSmall: 720,
  upToMedium: 960,
  upToLarge: 1280,
}

const mediaWidthTemplates: { [width in keyof typeof MEDIA_WIDTHS]: typeof css } = Object.keys(MEDIA_WIDTHS).reduce(
  (accumulator, size) => {
    ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
      @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
        ${css(a, b, c)}
      }
    `
    return accumulator
  },
  {}
) as any

const white = '#FFFFFF'
const black = '#000000'

const jediBlue = '#50D5FF'
const jediPink = '#FF00E9'
const jediWhite = white
const jediGrey = '#959595'
const jediNavyBlue = '#141451'

const signalRed = '#FF3257'
const signalGreen = '#21E70F'

export function colors(darkMode: boolean): Colors {
  return {
    // base
    white,
    black,

    // Jedi Colors
    jediBlue,
    jediPink,
    jediWhite,
    jediGrey,
    jediNavyBlue,

    // Signal Colors
    signalRed,
    signalGreen,

    // text
    text1: jediWhite,
    text2: jediPink,
    text3: '#6C7284',
    text4: '#565A69',
    text5: '#2C2F36',

    // backgrounds / greys
    bg0: darkMode ? '#c4c4c403' : '#ffffff03',
    bg1: '#212429',
    bg2: '#2C2F36',
    bg3: '#40444F',
    bg4: '#565A69',
    bg5: '#6C7284',

    jediBg: '#5D5DDF',
    jediGradientBg: 'linear-gradient(95.64deg, #29AAFD 8.08%, #FF00E9 105.91%)',

    //specialty colors
    modalBG: 'rgba(0,0,0,.425)',
    advancedBG: 'rgba(0,0,0,0.1)',

    //primary colors
    primary1: jediBlue,
    primary2: jediPink,
    primary3: '#4D8FEA',
    primary4: '#376bad70',
    primary5: '#153d6f70',

    // color text
    primaryText1: '#6da8ff',

    // secondary colors
    secondary1: '#2172E5',
    secondary2: '#17000b26',
    secondary3: '#17000b26',

    // other
    pink1: '#ff007a',
    red1: signalRed,
    red2: signalRed,
    red3: '#D60000',
    green1: signalGreen,
    yellow1: '#FFE270',
    yellow2: '#F3841E',
    yellow3: '#F3B71E',
    blue1: '#2172E5',
    blue2: '#5199FF',

    // dont wanna forget these blue yet
    // blue4: darkMode ? '#153d6f70' : '#C4D9F8',
    // blue5: darkMode ? '#153d6f70' : '#EBF4FF',
  }
}

export function theme(darkMode: boolean): DefaultTheme {
  return {
    ...colors(darkMode),

    grids: {
      sm: 8,
      md: 12,
      lg: 24,
    },

    //shadows
    shadow1: '#000',

    // media queries
    mediaWidth: mediaWidthTemplates,

    // css snippets
    flexColumnNoWrap: css`
      display: flex;
      flex-flow: column nowrap;
    `,
    flexRowNoWrap: css`
      display: flex;
      flex-flow: row nowrap;
    `,
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'primary1'} {...props} />
  },
  label(props: TextProps) {
    return <TextWrapper fontWeight={700} color={'text1'} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text1'} {...props} />
  },
  white(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'white'} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={16} color={'text1'} {...props} />
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontWeight={600} fontSize={24} color={'text1'} {...props} />
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={20} color={'white'} {...props} />
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontWeight={400} fontSize={14} {...props} />
  },
  small(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={11} {...props} />
  },
  blue(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'blue1'} {...props} />
  },
  yellow(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'yellow3'} {...props} />
  },
  darkGray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'text3'} {...props} />
  },
  gray(props: TextProps) {
    return <TextWrapper fontWeight={500} color={'bg3'} {...props} />
  },
  italic(props: TextProps) {
    return <TextWrapper fontWeight={500} fontSize={12} fontStyle={'italic'} color={'text2'} {...props} />
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper fontWeight={500} color={error ? 'red1' : 'text2'} {...props} />
  },
}

export const FixedGlobalStyle = createGlobalStyle`
html, input, textarea, button {
  font-family: 'DM Sans', sans-serif;
  font-display: fallback;
 }
@supports (font-variation-settings: normal) {
  html, input, textarea, button {
    font-family: 'DM Sans', sans-serif;
   }
}

html,
body {
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

button {
  user-select: none;
}

html {
  font-size: 16px;
  font-variant: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
  
}
`

export const ThemedGlobalStyle = createGlobalStyle`
html {
  color: ${({ theme }) => theme.text1};
  //background-color: ${({ theme }) => theme.jediBg};
  background-color: #fff;
  //background: rgb(35,9,48);
  //background: linear-gradient(108.58deg, #03001E 20.7%, #EC38BC 36.65%, #7303C0 57.02%, #2A3EF5 71.08%, #38742F 93.32%);
  //backdrop-filter: blur(400px);
  background-repeat: no-repeat;
  background-size: cover;
}

body {
  min-height: 100vh;
  //background: linear-gradient(66.46deg, #03001E 24.27%, rgba(3, 0, 30, 0.612102) 57.29%, rgba(3, 0, 30, 0) 100%);
  //backdrop-filter: blur(400px);
  background: rgb(35,9,48);
  background: linear-gradient(140deg, rgba(39,9,47,1) 0%, rgba(16, 9, 40, 1) 15%, rgba(0,9,36,1) 100%);
  background-repeat: no-repeat;
  background-size: cover;
}
`
