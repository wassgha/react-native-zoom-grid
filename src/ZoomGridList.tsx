import React, { forwardRef } from 'react';
import { View, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { FlashList, FlashListProps } from '@shopify/flash-list';

const { width } = Dimensions.get('window');

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as unknown as React.ComponentType<any>;

export interface ZoomGridListProps<T> extends Omit<FlashListProps<T>, 'renderItem'> {
    numColumns: number;
    isPinching?: React.MutableRefObject<boolean>;
    targetIndex: number;
    invert?: boolean;
    isInteractive?: boolean;
    disableAutoScroll?: boolean;
    renderItem: (props: { item: T; index: number; size: number; isTarget: boolean }) => React.ReactElement | null;
}

export const ZoomGridList = forwardRef(({
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
}: ZoomGridListProps<any>, ref: any) => {
    return (
        <AnimatedFlashList
            ref={ref}
            key={`grid-${numColumns}-${invert}`}
            data={data}
            numColumns={numColumns}
            extraData={{ ...extraData, numColumns, targetIndex }}
            estimatedItemSize={width / numColumns}
            onScroll={onScroll}
            scrollEventThrottle={16}
            renderItem={({ item, index }: { item: any, index: number }) => {
                const size = width / numColumns;
                if (item && item.type === 'empty') {
                    return <View style={{ width: size, height: size }} />;
                }
                return renderItem({
                    item,
                    index,
                    size,
                    isTarget: index === targetIndex
                });
            }}
            keyExtractor={(item: any, index: number) => {
                if (item && item.id) return item.id;
                if (item && item.type === 'empty') return `empty-${index}`;
                return String(index);
            }}
            pointerEvents={isInteractive ? 'auto' : 'none'}
            scrollEnabled={isInteractive}
            {...(invert && !disableAutoScroll ? {
                maintainVisibleContentPosition: {
                    autoscrollToBottomThreshold: 0.2,
                    startRenderingFromBottom: true,
                },
                onStartReached: isInteractive ? onEndReached : undefined,
                onStartReachedThreshold: 0.5,
                contentContainerStyle: contentContainerStyle
            } : {
                onEndReached: isInteractive ? onEndReached : undefined,
                onEndReachedThreshold: 0.5,
                contentContainerStyle: contentContainerStyle
            })}
            {...rest}
        />
    );
});

