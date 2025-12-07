"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ZoomGridList = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireDefault(require("react-native-reanimated"));
var _flashList = require("@shopify/flash-list");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const {
  width
} = _reactNative.Dimensions.get('window');
const AnimatedFlashList = _reactNativeReanimated.default.createAnimatedComponent(_flashList.FlashList);
const ZoomGridList = exports.ZoomGridList = /*#__PURE__*/(0, _react.forwardRef)(({
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
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(AnimatedFlashList, {
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
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
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