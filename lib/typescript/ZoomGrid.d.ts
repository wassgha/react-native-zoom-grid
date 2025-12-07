import React from 'react';
import { ViewStyle } from 'react-native';
import { FlashListProps } from '@shopify/flash-list';
export declare const DEBUG = false;
export interface ZoomGridProps<T> extends Omit<FlashListProps<T>, 'renderItem'> {
    zoomLevels?: number[];
    initialNumColumns?: number;
    renderItem: (props: {
        item: T;
        index: number;
        size: number;
        isTarget: boolean;
        isPinching: React.MutableRefObject<boolean>;
    }) => React.ReactElement | null;
    renderHeader?: (props: {
        isSelectionMode?: boolean;
    }) => React.ReactNode;
    onZoomChange?: (columns: number) => void;
    gridStyle?: ViewStyle;
    contentInsets?: {
        top?: number;
        bottom?: number;
    };
    invert?: boolean;
}
export declare function ZoomGrid<T>({ data, onEndReached, invert, zoomLevels, initialNumColumns, renderItem, renderHeader, onZoomChange, gridStyle, contentInsets, ...rest }: ZoomGridProps<T>): React.JSX.Element;
//# sourceMappingURL=ZoomGrid.d.ts.map