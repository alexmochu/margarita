// @flow

import * as React from 'react';
import { View } from 'react-native';
import { defaultTokens } from '@kiwicom/orbit-design-tokens';

import { StyleSheet } from '../../PlatformStyleSheet';
import { ExtendedTouchable } from '../../ExtendedTouchable';
import { type Props } from './DayItemArrowTypes';

export default class DayItemArrow extends React.Component<Props> {
  renderArrow = () => (
    <View style={styles.touchableContainer}>
      <View
        style={[
          styles.arrow,
          this.props.direction === 'left'
            ? styles.arrowLeft
            : styles.arrowRight,
        ]}
      />
    </View>
  );

  render() {
    return (
      <View
        style={[
          styles.container,
          this.props.direction === 'left'
            ? styles.containerArrowLeft
            : styles.containerArrowRight,
          this.props.style,
        ]}
      >
        {this.props.onPress ? (
          <ExtendedTouchable overlap={20} onPress={this.props.onPress}>
            {this.renderArrow()}
          </ExtendedTouchable>
        ) : (
          this.renderArrow()
        )}
      </View>
    );
  }
}

const arrowSize = 4;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: parseFloat(defaultTokens.zIndexModalOverlay),
    width: 20,
    height: '100%',
    alignItems: 'center',
  },
  arrow: {
    marginTop: 20,
    width: 0,
    height: 0,
    borderWidth: arrowSize,
    borderColor: 'transparent',
  },
  containerArrowLeft: {
    alignItems: 'flex-start',
  },
  containerArrowRight: {
    alignItems: 'flex-end',
  },
  arrowLeft: {
    borderEndColor: defaultTokens.backgroundBody,
  },
  arrowRight: {
    borderStartColor: defaultTokens.backgroundBody,
  },
});