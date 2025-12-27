# react-native-zoom-grid

A high-performance, zoomable grid component for React Native, built on top of `@legendapp/list`. It provides seamless pinch-to-zoom transitions between different grid layouts, mimicking the native iOS Photos app experience.

## Features

- 📸 **iOS-style Zoom Transitions:** Smooth, gesture-driven transitions between different column counts.
- ⚡ **High Performance:** Built with `react-native-reanimated` and `@legendapp/list` for 60fps animations and efficient list rendering.
- 🖐 **Gesture Support:** precise pinch-to-zoom interactions using `react-native-gesture-handler`.
- 🎨 **Customizable:** Define your own zoom levels (column counts), render custom items, and headers.
- 🔄 **Infinite Scroll:** Supports `onEndReached` for loading more data.

## Demo

![Demo of react-native-zoom-grid](./screenshots/react-native-zoom-grid.gif)

## Installation

This package requires several peer dependencies:

```bash
npm install react-native-zoom-grid @legendapp/list react-native-reanimated react-native-gesture-handler react-native-safe-area-context
```

or

```bash
yarn add react-native-zoom-grid @legendapp/list react-native-reanimated react-native-gesture-handler react-native-safe-area-context
```

> **Note:** Make sure to complete the installation setup for [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started) and [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/installation) as per their documentation (e.g., adding the babel plugin, wrapping your app in `GestureHandlerRootView`).

## Usage

Here is a basic example of how to use `ZoomGrid`:

```tsx
import React from 'react';
import { View, Image } from 'react-native';
import { ZoomGrid } from 'react-native-zoom-grid';

const MyPhotoGrid = ({ photos }) => {
  return (
    <ZoomGrid
      data={photos}
      initialNumColumns={3}
      zoomLevels={[5, 3, 1]} // Columns for each zoom level
      renderItem={({ item, size, index }) => (
        <Image
          source={{ uri: item.url }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
```

## API Reference

### `<ZoomGrid />`

The main component. It extends most `LegendList` props (except `renderItem` which has a different signature).

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `Array<T>` | **Required** | The array of data items to render. |
| `renderItem` | `Function` | **Required** | Function to render each item. See signature below. |
| `zoomLevels` | `number[]` | `[5, 3, 1]` | Array of column counts for different zoom levels. |
| `initialNumColumns` | `number` | `3` | The number of columns to show initially. |
| `onZoomChange` | `(columns: number) => void` | - | Callback fired when the zoom level changes. |
| `renderHeader` | `Function` | - | Function to render a header component. |
| `contentInsets` | `{ top?: number, bottom?: number }` | - | Insets for the content container. |
| `invert` | `boolean` | `true` | Inverts the list direction (and data order internally). Useful for chat or timeline views. |
| `gridStyle` | `ViewStyle` | - | Style for the grid container. |
| ...LegendListProps | | | Supports most other `LegendList` props like `onEndReached`, `estimatedItemSize`, etc. |

#### `renderItem` Signature

The `renderItem` prop receives an object with the following properties:

```ts
{
  item: T;             // The data item
  index: number;       // Index of the item
  size: number;        // Calculated width/height of the item based on current columns
  isTarget: boolean;   // Whether this item is the target of a zoom operation (internal use)
  isPinching: React.MutableRefObject<boolean>; // Ref indicating if a pinch gesture is active
}
```

## License

MIT

