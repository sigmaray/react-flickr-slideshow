var ghpages = require('gh-pages');

ghpages.publish('build',
  {repo: 'https://github.com/sigmaray/freact/'},
  function(err) {console.log(err)}
);
