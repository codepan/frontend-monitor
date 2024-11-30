(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[r] = t, e;
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function (r) {
        return Object.getOwnPropertyDescriptor(e, r).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
        _defineProperty(e, r, t[r]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
        Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
      });
    }
    return e;
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  /**
   * 专门用来写页面性能监控的逻辑
   */
  var processData$1 = function processData(p) {
    var extra = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var data = _objectSpread2({
      kind: 'performance',
      prevPage: p.fetchStart - p.navigationStart,
      // 上一个页面到现在这个页面的时长
      redirect: p.redirectEnd - p.redirectStart,
      // 重定向时长
      dns: p.domainLookupEnd - p.domainLookupStart,
      // 域名解析时长
      connect: p.connectEnd - p.connectStart,
      // tcp建立连接时长
      send: p.responseStart - p.requestStart,
      // 发送请求时长
      ttfb: p.responseStart - p.navigationStart,
      // 首字节接收到的时长
      domready: p.domInteractive - p.domLoading,
      // dom准备的时长
      whiteScreen: p.domLoading - p.navigationStart,
      // 白屏时长
      dom: p.domComplete - p.domLoading,
      // dom加载完成时长
      load: p.loadEventEnd - p.loadEventStart,
      // 页面加载完成时长
      total: p.loadEventEnd - p.navigationStart
    }, extra);
    return data;
  };
  var loaded = function loaded(cb) {
    var timer = null;
    var _check = function check() {
      if (window.performance.timing.loadEventEnd) {
        window.clearTimeout(timer);
        cb();
      } else {
        timer = setTimeout(_check, 100);
      }
    };
    window.addEventListener('load', _check, false);
  };
  var domready = function domready(cb) {
    var timer = null;
    var _check2 = function check() {
      if (window.performance.timing.domInteractive) {
        window.clearTimeout(timer);
        cb();
      } else {
        timer = setTimeout(_check2, 100);
      }
    };
    window.addEventListener('DOMContentLoaded', _check2, false);
  };
  var performance = {
    init: function init(callback) {
      // 有可能页面资源非常多，没加载完成用户就把页面关闭了，没有触发onload，dom解析完成后先统计一下
      domready(function () {
        var perfData = window.performance.timing;
        var data = processData$1(perfData, {
          type: 'domready'
        });
        callback === null || callback === void 0 || callback(data);
      });
      loaded(function () {
        var perfData = window.performance.timing;
        var data = processData$1(perfData, {
          type: 'loaded'
        });
        callback === null || callback === void 0 || callback(data);
      });
    }
  };

  /*
  * 监控静态资源加载时长，也就是静态资源测速
  */
  var processData = function processData(p) {
    var data = {
      name: p.name,
      // 资源的名称
      initiatorType: p.initiatorType,
      // 资源加载的类型，如css、js、img等
      duration: p.duration // 资源加载的时长
    };
    return data;
  };
  var resource = {
    init: function init(callback) {
      if (window.PerformanceObserver) {
        // 使用PerformanceObserver来监听资源加载，这样可以监听到所有资源的加载时长，包括图片、js、css等。它不会监控自己。它是浏览器原生提供的API，兼容性非常好，但不支持IE9及以下版本。
        var observer = new PerformanceObserver(function (list) {
          var data = list.getEntries();
          data = processData(data[0]);
          callback(data);
        });
        observer.observe({
          entryTypes: ['resource']
        });
      } else {
        window.addEventListener('load', function () {
          // 这样做会有一个问题，就是它会监控自己加载的资源，但是我们只想监控第三方资源的加载时长，所以需要过滤掉自己加载的资源
          var resourceData = window.performance.getEntriesByType('resource');
          var data = resourceData.map(function (resource) {
            return processData(resource);
          });
          callback(data);
        }, false);
      }
    }
  };

  var api = {
    init: function init(callback) {
      var xhr = window.XMLHttpRequest;
      var nativeOpen = xhr.prototype.open;
      var nativeSend = xhr.prototype.send;
      xhr.prototype.open = function (method, url, async, user, password) {
        this.info = {
          method: method,
          url: url,
          async: async,
          user: user,
          password: password
        };
        return nativeOpen.apply(this, arguments);
      };
      xhr.prototype.send = function (data) {
        var _this = this;
        var start = Date.now();
        var fn = function fn(type) {
          return function () {
            _this.info.kind = 'stability';
            _this.info.type = 'xhr';
            _this.info.eventType = type;
            _this.info.pathname = _this.info.url;
            _this.info.status = _this.status + '-' + _this.statusText, _this.info.duration = Date.now() - start;
            _this.info.response = _this.response ? JSON.stringify(_this.response) : '', _this.info.params = data || '';
            callback(_this.info);
          };
        };
        this.addEventListener('load', fn('load'), false);
        this.addEventListener('error', fn('error'), false);
        this.addEventListener('abort', fn('abort'), false);
        return nativeSend.apply(this, arguments);
      };

      // 这里还要处理fetch，因为异步请求有两种ajax和fetch
    }
  };

  var lastEvent;
  ['click', 'touchstart', 'mousedown', 'keydown', 'mouseover'].forEach(function (eventName) {
    document.addEventListener(eventName, function (event) {
      lastEvent = event;
    }, {
      capture: true,
      passive: true
    });
  });
  var getLastEvent = (function () {
    return lastEvent;
  });

  var getSelectors = function getSelectors(path) {
    return path.reverse().filter(function (el) {
      return el !== window.document && el !== window;
    }).map(function (el) {
      var selector = '';
      if (el.id) {
        return "".concat(el.tagName.toLowerCase(), "#").concat(el.id);
      } else if (el.className && typeof el.className === 'string') {
        return "".concat(el.tagName.toLowerCase(), ".").concat(el.className.split(' ').join('.'));
      } else {
        selector = el.tagName.toLowerCase();
      }
      return selector;
    }).join(' ');
  };
  var getSelector = function getSelector(event) {
    var _event$composedPath;
    if (!event) return '';
    var path = ((_event$composedPath = event.composedPath) === null || _event$composedPath === void 0 ? void 0 : _event$composedPath.call(event)) || event.path;
    if (Array.isArray(path)) {
      return getSelectors(path);
    }
  };

  var getLines = function getLines(stack) {
    return stack.split('\n').slice(1).map(function (line) {
      return line.replace(/^\s+at\s+/g, '');
    }).join('^');
  };
  var errorCatch = {
    init: function init(callback) {
      // 这种写法可以监控到代码报错，图片404
      window.addEventListener('error', function (event) {
        var lastEvent = getLastEvent();

        // 说明这是一个script或者link(css文件)加载错误
        if (event.target && (event.target.src || event.target.href)) {
          var info = {
            kind: 'stability',
            // 监控指标的大类
            type: 'error',
            // 监控指标的小类型 这是一个错误
            errorType: 'resourceError',
            // js执行错误
            filename: event.target.src || event.target.href,
            // 哪个文件报错了
            tagName: event.target.tagName,
            selector: getSelector(lastEvent) // 代表最后一个操作的元素
          };
          callback(info);
        } else {
          var _info = {
            kind: 'stability',
            // 监控指标的大类
            type: 'error',
            // 监控指标的小类型 这是一个错误
            errorType: 'jsError',
            // js执行错误
            message: event.message,
            // 报错的信息
            filename: event.filename,
            // 哪个文件报错了
            position: "".concat(event.lineno, ":").concat(event.colno),
            stack: getLines(event.error.stack),
            selector: getSelector(lastEvent) // 代表最后一个操作的元素
          };
          callback(_info);
        }
      }, true);

      /* 
      这种写法无法监控图片的404
      window.onerror = (message, source, lineno, colno, error) => {
      };
      */

      // 这里监控Promise报错了，但未提供catch对异常进行捕获，promise失败了，无法通过onerror捕获
      window.addEventListener('unhandledrejection', function (event) {
        var lastEvent = getLastEvent();
        var message;
        var filename;
        var lineno;
        var colno;
        var stack;
        if (typeof event.reason === 'string') {
          message = event.reason;
        } else if (_typeof(event.reason) === 'object') {
          if (event.reason.stack) {
            var matchResult = event.reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
            filename = matchResult[1];
            lineno = matchResult[2];
            colno = matchResult[3];
          }
          message = event.reason.message;
          stack = getLines(event.reason.stack);
        }
        var info = {
          kind: 'stability',
          // 监控指标的大类
          type: 'error',
          // 监控指标的小类型 这是一个错误
          errorType: 'promiseError',
          // js执行错误
          message: message,
          // 报错的信息
          filename: filename,
          // 哪个文件报错了
          position: "".concat(lineno, ":").concat(colno),
          stack: stack,
          selector: getSelector(lastEvent) // 代表最后一个操作的元素
        };
        callback(info);
      });
    }
  };

  var blankScreen = {
    init: function init(callback) {
      var wrapperElements = ['html', 'body', '#container', '.content'];
      var emptyPoints = 0;
      var getSelector = function getSelector(element) {
        if (element.id) {
          return "#".concat(element.id);
        }
        if (element.className) {
          return ".".concat(element.className.split(' ').filter(function (item) {
            return !!item;
          }).join('.'));
        }
        return element.tagName.toLowerCase();
      };
      var isWapper = function isWapper(element) {
        var selector = getSelector(element);
        if (wrapperElements.includes(selector)) {
          emptyPoints++;
        }
      };

      // 需要等待页面渲染完成才能判断是否白屏
      window.addEventListener('load', function () {
        for (var i = 0; i <= 9; i++) {
          var xElements = document.elementsFromPoint(window.innerWidth * i / 10, window.innerHeight / 2);
          var yElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight * i / 10);
          isWapper(xElements[0]);
          isWapper(yElements[0]);
        }
        if (emptyPoints >= 18) {
          var centerElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);
          callback({
            kind: 'stability',
            type: 'blank',
            emptyPoints: emptyPoints,
            screen: window.screen.width + 'X' + window.screen.height,
            viewPoint: window.innerWidth + 'X' + window.innerHeight,
            selector: getSelector(centerElements[0])
          });
        }
      });
    }
  };

  performance.init(function (data) {
    console.log(data);
  });
  resource.init(function (data) {
    console.log(data);
  });
  api.init(function (data) {
    console.log(data);
  });
  errorCatch.init(function (data) {
    console.log(data);
  });
  blankScreen.init(function (data) {
    console.log(data);
  });

}));
