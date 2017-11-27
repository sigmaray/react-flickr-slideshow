import * as $ from 'jquery';

var API_KEY = '4cc2a6e2419deebfe86eca026cfda157';
var PER_PAGE = 20;

// @param function(data) successCallback
// @param function(errorMessage) errorCallback
// @param string pic - Search query for flickr.
// @param string page = 1 
// @param string per_page = PER_PAGE
export default function downloadPics(successCallback, errorCallback, pic = 'chicago', page = 1, per_page = PER_PAGE) {
  var imgs = [];
  var url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + API_KEY + '&text=' + pic + '&safe_search=1&page=' + page + '&per_page=' + per_page;
  $.ajax({
    dataType: "json",
    url: url + '&format=json&jsoncallback=?',
    success: function(data) {
      if (data["photos"] == null) {
        errorCallback(JSON.stringify(["Problem with data", data]));
      } else {
        $.each(data.photos.photo, function(i, item) {
          var flickrUrl, src;
          // src = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg'
          src = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_h.jpg';
          // bigImageSrc = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_c.jpg'
          // bigImageSrc = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_h.jpg'
          flickrUrl = 'https://www.flickr.com/photos/' + item.owner + '/' + item.id;
          imgs.push({
            src: src,
            flickrUrl: flickrUrl
          });
        });
        successCallback(imgs);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      errorCallback(JSON.stringify(['AJAX Error', jqXHR, textStatus, errorThrown]));
    }
  });
};
