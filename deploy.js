var ghpages = require('gh-pages');

ghpages.publish('build',
  {repo: 'https://github.com/sigmaray/react-flickr-slideshow-demo/'},
  function(err) {console.log(err)}
);
