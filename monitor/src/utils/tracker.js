function getExtraData() {
  return {
    title: document.title,
    url: location.href,
    timestamp: Date.now(),
    userAgent: navigator.userAgent
  }
}

function queryStringify(query) {
  return Object.keys(query).map(k => `${k}=${query[k]}`).join('&');
}

const project = 'codepan-frontend-monitor-demo';
const host = 'cn-chengdu.log.aliyuncs.com';
const logstore = 'frontend-monitor';
class SendTracker {
  constructor() {
    this.url = `http://${project}.${host}/logstores/${logstore}/track?APIVersion=0.6.0`; // 上报的路径
    this.xhr = new XMLHttpRequest();
  }

  send(data) {
    const log = { ...getExtraData(), ...data };
    console.log(log);

    this.xhr.open('GET', `${this.url}&${queryStringify(data)}`, true);

    this.xhr.onload = () => {
    }

    this.xhr.onerror = () => {
    }

    this.xhr.send();
  }
}

export default new SendTracker();