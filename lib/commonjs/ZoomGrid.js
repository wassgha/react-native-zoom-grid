"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEBUG = void 0;
exports.ZoomGrid = ZoomGrid;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _reactNativeSafeAreaContext = require("react-native-safe-area-context");
var _ZoomGridList = require("./ZoomGridList");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const {
  width,
  height
} = _reactNative.Dimensions.get('window');
const DEFAULT_ZOOM_LEVELS = [5, 3, 1];
const ZOOM_COLORS = ['#00FF00', '#0000FF', '#FF0000', '#00FFFF', '#FF00FF'];
const DEBUG = exports.DEBUG = false;
function ZoomGrid({
  data,
  onEndReached,
  invert = true,
  zoomLevels = DEFAULT_ZOOM_LEVELS,
  initialNumColumns = 3,
  renderItem,
  renderHeader,
  onZoomChange,
  gridStyle,
  contentInsets,
  ...rest
}) {
  const insets = (0, _reactNativeSafeAreaContext.useSafeAreaInsets)();

  // Default insets logic if not provided - try to be somewhat smart but unopinionated?
  // User should provide these if they have headers/footers.
  const topInset = contentInsets?.top ?? 0;
  const bottomInset = contentInsets?.bottom ?? 0;

  // Assuming data is already in correct order, or handle invert if needed.
  const gridData = (0, _react.useMemo)(() => invert && data ? [...data].reverse() : data, [data, invert]);

  // State
  const [activeColumns, setActiveColumns] = (0, _react.useState)(initialNumColumns);
  const [isPinching, setIsPinching] = (0, _react.useState)(false);

  // Ref for ZoomGridList compatibility
  const isPinchingRef = (0, _react.useRef)(isPinching);
  if (isPinchingRef.current !== isPinching) {
    isPinchingRef.current = isPinching;
  }
  const [layerConfig, setLayerConfig] = (0, _react.useState)(() => {
    const initialConfig = {};
    zoomLevels.forEach(cols => {
      initialConfig[cols] = {
        padding: 0,
        scrollOffset: 0,
        targetIndex: 0
      };
    });
    return initialConfig;
  });
  const layerConfigRef = (0, _react.useRef)(layerConfig);
  (0, _react.useLayoutEffect)(() => {
    layerConfigRef.current = layerConfig;
  }, [layerConfig]);
  const scale = (0, _reactNativeReanimated.useSharedValue)(1);
  const savedScale = (0, _reactNativeReanimated.useSharedValue)(1);
  const focalX = (0, _reactNativeReanimated.useSharedValue)(0);
  const focalY = (0, _reactNativeReanimated.useSharedValue)(0);
  const activeScrollOffset = (0, _reactNativeReanimated.useSharedValue)(0);
  const activeColsShared = (0, _reactNativeReanimated.useSharedValue)(activeColumns);
  const listRefs = (0, _react.useRef)({});
  (0, _react.useLayoutEffect)(() => {
    activeColsShared.value = activeColumns;
  }, [activeColumns]);

  // -------------------------------------------------------------------------
  // Zoom Alignment Logic
  // -------------------------------------------------------------------------

  const calculateLayerConfig = (dataIndex, currentCols, targetCols, fX, fY, currentScroll) => {
    const targetSize = width / targetCols;
    // Use provided topInset
    const headerHeight = topInset;
    const idealCol = Math.floor(fX / targetSize);
    const clampedCol = Math.max(0, Math.min(idealCol, targetCols - 1));
    const currentMod = dataIndex % targetCols;
    const padding = (clampedCol - currentMod + targetCols) % targetCols;
    const paddedIndex = dataIndex + padding;
    const targetRow = Math.floor(paddedIndex / targetCols);
    const targetItemCenterY = targetRow * targetSize + targetSize / 2 + headerHeight;
    const targetScroll = targetItemCenterY - fY;
    const totalItems = (gridData?.length || 0) + padding;
    const totalRows = Math.ceil(totalItems / targetCols);
    const contentHeight = totalRows * targetSize + headerHeight + bottomInset;
    const maxScroll = Math.max(0, contentHeight - height);
    const clampedTargetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    return {
      padding,
      scrollOffset: clampedTargetScroll,
      targetIndex: paddedIndex
    };
  };
  const handleZoomFinish = nextCols => {
    const config = layerConfigRef.current;
    if (config[nextCols]) {
      activeScrollOffset.value = config[nextCols].scrollOffset;
    }
    activeColsShared.value = nextCols;
    savedScale.value = 1;
    scale.value = 1;
    setActiveColumns(nextCols);
    onZoomChange?.(nextCols);
  };
  const prepareZoom = (fX, fY) => {
    const currentCols = activeColumns;
    const currentScroll = activeScrollOffset.value;
    const currentSize = width / currentCols;
    const headerHeight = topInset;
    const currentPadding = layerConfig[currentCols]?.padding || 0;
    const scrollAdjustedY = fY + currentScroll;
    const gridY = scrollAdjustedY - headerHeight;
    const row = Math.floor(gridY / currentSize);
    const col = Math.floor(fX / currentSize);
    const visualIndex = row * currentCols + col;
    const dataIndex = visualIndex - currentPadding;
    if (!gridData || dataIndex < 0 || dataIndex >= gridData.length) return;
    const newConfig = {};
    zoomLevels.forEach(cols => {
      newConfig[cols] = calculateLayerConfig(dataIndex, currentCols, cols, fX, fY, currentScroll);
    });
    layerConfigRef.current = {
      ...layerConfigRef.current,
      ...newConfig
    };
    setLayerConfig(prev => ({
      ...prev,
      ...newConfig
    }));
    setTimeout(() => {
      zoomLevels.forEach(cols => {
        if (cols !== currentCols && listRefs.current[cols]) {
          listRefs.current[cols].scrollToOffset({
            offset: newConfig[cols].scrollOffset,
            animated: false
          });
        } else if (cols === currentCols && listRefs.current[cols]) {
          listRefs.current[cols].scrollToOffset({
            offset: currentScroll,
            animated: false
          });
        }
      });
    }, 0);
  };
  const pinch = _reactNativeGestureHandler.Gesture.Pinch().onStart(e => {
    (0, _reactNativeReanimated.runOnJS)(setIsPinching)(true);
    savedScale.value = scale.value;
    focalX.value = e.focalX;
    focalY.value = e.focalY;
    (0, _reactNativeReanimated.runOnJS)(prepareZoom)(e.focalX, e.focalY);
  }).onUpdate(e => {
    scale.value = savedScale.value * e.scale;
  }).onEnd(() => {
    (0, _reactNativeReanimated.runOnJS)(setIsPinching)(false);
    const s = scale.value;
    let nextCols = activeColumns;

    // Assuming zoomLevels are sorted descending (e.g. 5, 3, 1) or ascending.
    // Original logic assumed descending density (5 items/row, 3 items/row, 1 item/row).
    // s > 1 means zooming in (items get bigger). So columns should decrease (5 -> 3).
    // s < 1 means zooming out (items get smaller). Columns should increase (3 -> 5).

    // Find current index
    const currentIndex = zoomLevels.indexOf(activeColumns);
    if (currentIndex !== -1) {
      // Determine if zoomLevels are descending or ascending
      const isDescending = zoomLevels[0] > zoomLevels[zoomLevels.length - 1];
      if (s > 1.5) {
        // Zoom In (Bigger items -> Fewer columns)
        if (isDescending) {
          if (currentIndex < zoomLevels.length - 1) nextCols = zoomLevels[currentIndex + 1];
        } else {
          if (currentIndex > 0) nextCols = zoomLevels[currentIndex - 1];
        }
      } else if (s < 0.6) {
        // Zoom Out (Smaller items -> More columns)
        if (isDescending) {
          if (currentIndex > 0) nextCols = zoomLevels[currentIndex - 1];
        } else {
          if (currentIndex < zoomLevels.length - 1) nextCols = zoomLevels[currentIndex + 1];
        }
      }
    }
    let targetScale = 1;
    if (nextCols !== activeColumns) {
      targetScale = activeColumns / nextCols;
    }
    scale.value = (0, _reactNativeReanimated.withTiming)(targetScale, {
      duration: 250
    }, finished => {
      if (finished) {
        if (nextCols !== activeColumns) {
          (0, _reactNativeReanimated.runOnJS)(handleZoomFinish)(nextCols);
        } else {
          scale.value = (0, _reactNativeReanimated.withTiming)(1);
        }
      }
    });
  });
  const renderLayer = cols => {
    const isActive = cols === activeColumns;
    const config = layerConfig[cols] || {
      padding: 0
    };
    const color = ZOOM_COLORS[zoomLevels.indexOf(cols) % ZOOM_COLORS.length];
    const layerData = (0, _react.useMemo)(() => {
      if (!gridData) return [];
      if (config.padding === 0) return gridData;
      const emptyItems = Array(config.padding).fill(0).map((_, i) => ({
        type: 'empty',
        id: `pad-${cols}-${i}`
      }));
      return [...emptyItems, ...gridData];
    }, [gridData, config.padding, cols]);
    const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
      const s = scale.value;
      const currentActiveCols = activeColsShared.value;
      let opacity = 0;
      let zIndex = 0;
      const relativeScale = s * (cols / currentActiveCols);
      if (cols === currentActiveCols) {
        zIndex = 10;
        if (s < 1) {
          opacity = (0, _reactNativeReanimated.interpolate)(s, [1, 0.66], [1, 0], _reactNativeReanimated.Extrapolation.CLAMP);
        } else {
          opacity = 1;
        }
      } else {
        const isZoomInTarget = cols < currentActiveCols;
        const isZoomOutTarget = cols > currentActiveCols;
        if (isZoomInTarget) {
          if (s > 1) {
            zIndex = 20;
            const ratio = currentActiveCols / cols;
            opacity = (0, _reactNativeReanimated.interpolate)(s, [1, ratio], [0, 1], _reactNativeReanimated.Extrapolation.CLAMP);
          }
        } else if (isZoomOutTarget) {
          if (s < 1) {
            zIndex = 5;
            opacity = 1;
          }
        }
      }
      const headerHeight = topInset;
      const centerX = width / 2;
      const centerY = height / 2;
      const activeConfig = layerConfig[currentActiveCols] || {
        padding: 0,
        scrollOffset: 0,
        targetIndex: 0
      };
      const activeSize = width / currentActiveCols;
      const activeIdx = activeConfig.targetIndex;
      const activeRow = Math.floor(activeIdx / currentActiveCols);
      const activeCol = activeIdx % currentActiveCols;
      const posAx = activeCol * activeSize;
      const posAy = activeRow * activeSize + headerHeight - activeScrollOffset.value;
      const thisSize = width / cols;
      const thisIdx = config.targetIndex;
      const thisRow = Math.floor(thisIdx / cols);
      const thisCol = thisIdx % cols;
      const thisScroll = isActive ? activeScrollOffset.value : config.scrollOffset;
      const posBx = thisCol * thisSize;
      const posBy = thisRow * thisSize + headerHeight - thisScroll;
      const term1X = (posAx - centerX) * s;
      const term1Y = (posAy - centerY) * s;
      const term2X = (focalX.value - centerX) * (1 - s);
      const term2Y = (focalY.value - centerY) * (1 - s);
      const term3X = (posBx - centerX) * relativeScale;
      const term3Y = (posBy - centerY) * relativeScale;
      return {
        opacity,
        zIndex,
        transform: [{
          translateX: term1X + term2X - term3X
        }, {
          translateY: term1Y + term2Y - term3Y
        }, {
          scale: relativeScale
        }]
      };
    }, [config, layerConfig, activeColumns, cols, invert, insets, topInset]);
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeReanimated.default.View, {
      style: [styles.layer, animatedStyle, DEBUG ? {
        borderColor: color,
        borderWidth: 2
      } : {}],
      pointerEvents: isActive ? 'auto' : 'none',
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_ZoomGridList.ZoomGridList, {
        ref: r => listRefs.current[cols] = r,
        data: layerData,
        numColumns: cols,
        targetIndex: config.targetIndex,
        invert: invert,
        isInteractive: isActive && !isPinching,
        isPinching: isPinchingRef,
        disableAutoScroll: !isActive,
        onEndReached: isActive ? onEndReached : undefined,
        onScroll: isActive ? e => activeScrollOffset.value = e.nativeEvent.contentOffset.y : undefined,
        renderItem: ({
          item,
          index,
          size,
          isTarget
        }) => renderItem({
          item,
          index,
          size,
          isTarget,
          isPinching: isPinchingRef
        }),
        contentContainerStyle: {
          paddingTop: topInset,
          paddingBottom: bottomInset
        },
        ...rest
      })
    }, cols);
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNativeGestureHandler.GestureHandlerRootView, {
    style: [styles.container, gridStyle],
    children: [renderHeader && renderHeader({}), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNativeGestureHandler.GestureDetector, {
      gesture: pinch,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: [styles.container, gridStyle],
        children: zoomLevels.map(renderLayer)
      })
    })]
  });
}
const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    overflow: 'hidden'
  },
  layer: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0
  }
});
//# sourceMappingURL=ZoomGrid.js.map