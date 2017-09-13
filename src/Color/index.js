import React from 'react'
import shuffle from 'lodash.shuffle'
import styled from 'styled-components'
import { color } from '../theme'
import { Box, Divider, Flex, Heading, Text } from 'rebass'

const colorList = require('./Color.json')

const StyledHeading = styled(Heading)`
  display: inline-block;
`

const StyledHeadingHex = styled(Text)`
  display: inline-block;
  color: ${color.gray60};
`

export default React.createClass({
  componentWillMount() {
    const colorNames = Object.keys(colorList)
    const randomColor = this.getRandomColor(colorNames)
    const unusedColors = this.removeColor(randomColor, colorNames)

    this.setState({
      name: randomColor,
      details: colorList[randomColor],
      unusedColors
    })
  },

  getRandomColor(colorNames) {
    return shuffle(colorNames)[0]
  },

  removeColor(color, colorNames = this.state.unusedColors) {
    const selectedColorIndex = colorNames.indexOf(color)
    colorNames.splice(selectedColorIndex, 1)
    return colorNames
  },

  handleClick() {
    const newColor = this.getRandomColor(this.state.unusedColors)
    const unusedColors = this.removeColor(newColor)

    this.setState({
      name: newColor,
      details: colorList[newColor],
      unusedColors
    })
  },

  render() {
    const { name, details} = this.state
    const rgb = `rgb: ${details.R}, ${details.G}, ${details.B}`
    const hsv = `hsv: ${details.H}, ${details.S}, ${details.V}`

    const style = {
      background: {
        backgroundColor: `${details.Hexadecimal}`,
        minHeight: '80vh'
      }
    }

    return (
      <Box pt={3} px={3} onClick={this.handleClick}>
        <StyledHeading is={'h1'} f={[5,6]} py={1} px={2}>
          {name}
        </StyledHeading>
        <StyledHeadingHex is={'small'} f={[2,3]} py={1} px={2}>
          {details.Hexadecimal}
        </StyledHeadingHex>

        <Divider color='#e3e3e3' />

        <Text is={'h2'} f={[2, 4]} p={2} pr={[2, 4, 6]}>
          {details.Notes}
        </Text>

        <Divider color={ color.gray30 } />

        <Flex justify={'space-between'}>
          <Text is={'p'} p={2}>
            {rgb}
          </Text>

          <Text is={'p'} p={2} mb={2}>
            {hsv}
          </Text>
        </Flex>

        <Box style={style.background}></Box>
      </Box>
    )
  }
})
