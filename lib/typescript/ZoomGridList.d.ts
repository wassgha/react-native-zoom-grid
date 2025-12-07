import React from 'react';
import { FlashListProps } from '@shopify/flash-list';
export interface ZoomGridListProps<T> extends Omit<FlashListProps<T>, 'renderItem'> {
    numColumns: number;
    isPinching?: React.MutableRefObject<boolean>;
    targetIndex: number;
    invert?: boolean;
    isInteractive?: boolean;
    disableAutoScroll?: boolean;
    renderItem: (props: {
        item: T;
        index: number;
        size: number;
        isTarget: boolean;
    }) => React.ReactElement | null;
}
export declare const ZoomGridList: React.ForwardRefExoticComponent<ZoomGridListProps<any> & React.RefAttributes<unknown>>;
//# sourceMappingURL=ZoomGridList.d.ts.map