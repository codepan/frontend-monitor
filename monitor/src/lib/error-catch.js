import getLastEvent from "../utils/getLastEvent";
import getSelector from "../utils/getSelector";
const getLines = (stack) => {
  return stack.split('\n').slice(1).map(line => line.replace(/^\s+at\s+/g, '')).join('^');
};


export default {
  init(callback) {
    // 这种写法可以监控到代码报错，图片404
    window.addEventListener('error', (event) => {
      const lastEvent = getLastEvent();

      // 说明这是一个script或者link(css文件)加载错误
      if (event.target && (event.target.src || event.target.href)) {
        const info = {
          kind: 'stability', // 监控指标的大类
          type: 'error', // 监控指标的小类型 这是一个错误
          errorType: 'resourceError', // js执行错误
          filename: event.target.src || event.target.href, // 哪个文件报错了
          tagName: event.target.tagName,
          selector: getSelector(lastEvent) // 代表最后一个操作的元素
        };
        callback(info);
      } else {
        const info = {
          kind: 'stability', // 监控指标的大类
          type: 'error', // 监控指标的小类型 这是一个错误
          errorType: 'jsError', // js执行错误
          message: event.message, // 报错的信息
          filename: event.filename, // 哪个文件报错了
          position: `${event.lineno}:${event.colno}`,
          stack: getLines(event.error.stack),
          selector: getSelector(lastEvent) // 代表最后一个操作的元素
        };
        callback(info);
      }
    }, true);


    /* 
    这种写法无法监控图片的404
    window.onerror = (message, source, lineno, colno, error) => {
    };
    */


    // 这里监控Promise报错了，但未提供catch对异常进行捕获，promise失败了，无法通过onerror捕获
    window.addEventListener('unhandledrejection', (event) => {
      const lastEvent = getLastEvent();
      let message;
      let filename;
      let lineno;
      let colno;
      let stack
      if (typeof event.reason === 'string') {
        message = event.reason;
      } else if (typeof event.reason === 'object') {
        if (event.reason.stack) {
          let matchResult = event.reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
          filename = matchResult[1];
          lineno = matchResult[2];
          colno = matchResult[3];
        }
        message = event.reason.message;
        stack = getLines(event.reason.stack);
      }
      const info = {
        kind: 'stability', // 监控指标的大类
        type: 'error', // 监控指标的小类型 这是一个错误
        errorType: 'promiseError', // js执行错误
        message, // 报错的信息
        filename, // 哪个文件报错了
        position: `${lineno}:${colno}`,
        stack,
        selector: getSelector(lastEvent) // 代表最后一个操作的元素
      };
      callback(info);
    });
  }
}