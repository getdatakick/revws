if (window.revwsData) {
  console.log('bootstrap', revwsData);
  window.revwsApp = function(action) {
    console.log('action: ', action);
  }
}
