/**
 * 专门用来写页面性能监控的逻辑
 */
const processData = (p, extra = {}) => {
  const data = {
    kind: 'performance',
    prevPage: p.fetchStart - p.navigationStart, // 上一个页面到现在这个页面的时长
    redirect: p.redirectEnd - p.redirectStart, // 重定向时长
    dns: p.domainLookupEnd - p.domainLookupStart, // 域名解析时长
    connect: p.connectEnd - p.connectStart, // tcp建立连接时长
    send: p.responseStart - p.requestStart, // 发送请求时长
    ttfb: p.responseStart - p.navigationStart, // 首字节接收到的时长
    domready: p.domInteractive - p.domLoading, // dom准备的时长
    whiteScreen: p.domLoading - p.navigationStart, // 白屏时长
    dom: p.domComplete - p.domLoading, // dom加载完成时长
    load: p.loadEventEnd - p.loadEventStart, // 页面加载完成时长
    total: p.loadEventEnd - p.navigationStart, // 总时长
    ...extra
  };
  return data;
}

const loaded = (cb) => {
  let timer = null;
  const check = () => {
    if (window.performance.timing.loadEventEnd) {
      window.clearTimeout(timer);
      cb();
    } else {
      timer = setTimeout(check, 100);
    }
  }
  window.addEventListener('load', check, false);
}

const domready = (cb) => {
  let timer = null;
  const check = () => {
    if (window.performance.timing.domInteractive) {
      window.clearTimeout(timer);
      cb();
    } else {
      timer = setTimeout(check, 100);
    }
  }
  window.addEventListener('DOMContentLoaded', check, false);
}

export default {
  init(callback) {
    // 有可能页面资源非常多，没加载完成用户就把页面关闭了，没有触发onload，dom解析完成后先统计一下
    domready(() => {
      const perfData = window.performance.timing;
      const data = processData(perfData, { type: 'domready' });
      callback?.(data);
    })
    loaded(() => {
      const perfData = window.performance.timing;
      const data = processData(perfData, { type: 'loaded' });
      callback?.(data);
    })
  }
}