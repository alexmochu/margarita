// @flow

import * as React from 'react';
import { Timeline } from '@kiwicom/margarita-core';
import { View } from 'react-native';
import { StyleSheet } from '@kiwicom/universal-components';
import { type NavigationScreenProp } from 'react-navigation';
import { MMB_BACKGROUND_COLOR } from '@kiwicom/margarita-config';

type NavigationParams = {||};

type Props = {|
  +navigation: NavigationScreenProp<NavigationParams>,
|};

export default function TimelineScreen(props: Props) {
  return (
    <View style={styles.container}>
      <Timeline />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MMB_BACKGROUND_COLOR,
  },
});