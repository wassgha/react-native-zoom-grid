"use strict";

import React, { forwardRef } from 'react';
import { View, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { jsx as _jsx } from "react/jsx-runtime";
const {
  width
} = Dimensions.get('window');
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
export const ZoomGridList = /*#__PURE__*/forwardRef(({
  data,
  numColumns,
  isPinching,
  targetIndex,
  onScroll,
  invert,
  onEndReached,
  contentContainerStyle,
  isInteractive = true,
  disableAutoScroll = false,
  renderItem,
  extraData,
  ...rest
}, ref) => {
  return /*#__PURE__*/_jsx(AnimatedFlashList, {
    ref: ref,
    data: data,
    numColumns: numColumns,
    extraData: {
      ...extraData,
      numColumns,
      targetIndex
    },
    estimatedItemSize: width / numColumns,
    onScroll: onScroll,
    scrollEventThrottle: 16,
    renderItem: ({
      item,
      index
    }) => {
      const size = width / numColumns;
      if (item && item.type === 'empty') {
        return /*#__PURE__*/_jsx(View, {
          style: {
            width: size,
            height: size
          }
        });
      }
      return renderItem({
        item,
        index,
        size,
        isTarget: index === targetIndex
      });
    },
    keyExtractor: (item, index) => {
      if (item && item.id) return item.id;
      if (item && item.type === 'empty') return `empty-${index}`;
      return String(index);
    },
    pointerEvents: isInteractive ? 'auto' : 'none',
    scrollEnabled: isInteractive,
    ...(invert && !disableAutoScroll ? {
      maintainVisibleContentPosition: {
        autoscrollToBottomThreshold: 0.2,
        startRenderingFromBottom: true
      },
      onStartReached: isInteractive ? onEndReached : undefined,
      onStartReachedThreshold: 0.5,
      contentContainerStyle: contentContainerStyle
    } : {
      onEndReached: isInteractive ? onEndReached : undefined,
      onEndReachedThreshold: 0.5,
      contentContainerStyle: contentContainerStyle
    }),
    ...rest
  }, `grid-${numColumns}-${invert}`);
});
//# sourceMappingURL=ZoomGridList.js.map