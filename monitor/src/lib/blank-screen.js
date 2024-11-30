export default {
  init(callback) {
    const wrapperElements = ['html', 'body', '#container', '.content'];
    let emptyPoints = 0;

    const getSelector = (element) => {
      if (element.id) {
        return `#${element.id}`;
      }

      if (element.className) {
        return `.${element.className.split(' ').filter(item => !!item).join('.')}`;
      }

      return element.tagName.toLowerCase();
    }

    const isWapper = (element) => {
      let selector = getSelector(element);
      if (wrapperElements.includes(selector)) {
        emptyPoints++;
      }
    }

    // 需要等待页面渲染完成才能判断是否白屏
    window.addEventListener('load', () => {
      for (let i = 0; i <= 9; i++) {
        const xElements = document.elementsFromPoint(window.innerWidth * i / 10, window.innerHeight /2);
        const yElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight * i / 10);
        isWapper(xElements[0]);
        isWapper(yElements[0]);
      }
  
      if (emptyPoints >= 18) {
        const centerElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2);
        callback({
          kind: 'stability',
          type: 'blank',
          emptyPoints,
          screen: window.screen.width + 'X' + window.screen.height,
          viewPoint: window.innerWidth + 'X' + window.innerHeight,
          selector: getSelector(centerElements[0])
        });
      }
    });
  }
}