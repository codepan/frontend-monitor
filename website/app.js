// 服务端 koa
const path = require('path');
const Koa = require('koa');
const static = require('koa-static');;

const app = new Koa();

app.use(async (ctx, next) => {
  if (ctx.path === '/api/list') {
    ctx.body = { name: 'codepan', age: 18 };
  } else {
    return next();
  }
});

app.use(async (ctx, next) => {
  if (ctx.path === '/api/delete') {
    ctx.response.status = 500;
  } else {
    return next();
  }
});

app.use(static(path.join(__dirname, 'client')));
app.use(static(path.join(__dirname, 'node_modules')));

app.listen(4567, () => {
  console.log('server is running at port 4567');
});