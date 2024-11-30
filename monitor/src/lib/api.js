export default {
  init(callback) {
    const xhr = window.XMLHttpRequest;
    const nativeOpen = xhr.prototype.open;
    const nativeSend = xhr.prototype.send;
    xhr.prototype.open = function(method, url, async, user, password) {
      this.info = {
        method,
        url,
        async,
        user,
        password
      }
      return nativeOpen.apply(this, arguments);
    }

    xhr.prototype.send = function(data) {
      const start = Date.now();
      const fn = (type) => () => {
        this.info.kind = 'stability';
        this.info.type = 'xhr';
        this.info.eventType = type;
        this.info.pathname = this.info.url;
        this.info.status = this.status + '-' + this.statusText,
        this.info.duration = Date.now() - start;
        this.info.response = this.response ? JSON.stringify(this.response) : '',
        this.info.params = data || '';
        callback(this.info);
      }
      this.addEventListener('load', fn('load'), false);
      this.addEventListener('error', fn('error'), false);
      this.addEventListener('abort', fn('abort'), false);
      return nativeSend.apply(this, arguments);
    };


    // 这里还要处理fetch，因为异步请求有两种ajax和fetch
  }
}