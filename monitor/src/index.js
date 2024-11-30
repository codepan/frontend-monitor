import performance from './lib/performance.js';
import resource from './lib/resource.js';
import api from './lib/api.js';
import errorCatch from './lib/error-catch.js';
import blankScreen from './lib/blank-screen.js';

performance.init((data) => {
  console.log(data);
});
resource.init((data) => {
  console.log(data);
});
api.init((data) => {
  console.log(data);
});
errorCatch.init((data) => {
  console.log(data);
});
blankScreen.init((data) => {
  console.log(data);
});