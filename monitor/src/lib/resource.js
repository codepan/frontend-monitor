/*
* 监控静态资源加载时长，也就是静态资源测速
*/
const processData = (p) => {
  const data = {
    name: p.name, // 资源的名称
    initiatorType: p.initiatorType, // 资源加载的类型，如css、js、img等
    duration: p.duration, // 资源加载的时长
  };
  return data;
}
export default {
  init(callback) {
    if (window.PerformanceObserver) {
      // 使用PerformanceObserver来监听资源加载，这样可以监听到所有资源的加载时长，包括图片、js、css等。它不会监控自己。它是浏览器原生提供的API，兼容性非常好，但不支持IE9及以下版本。
      const observer = new PerformanceObserver((list) => {
        let data = list.getEntries();
        data = processData(data[0]);
        callback(data);
      });
      observer.observe({ entryTypes: ['resource'] });
    } else {
      window.addEventListener('load', () => {
        // 这样做会有一个问题，就是它会监控自己加载的资源，但是我们只想监控第三方资源的加载时长，所以需要过滤掉自己加载的资源
        const resourceData = window.performance.getEntriesByType('resource');
        const data = resourceData.map((resource) => processData(resource));
        callback(data)
      }, false);
    }
  }
}