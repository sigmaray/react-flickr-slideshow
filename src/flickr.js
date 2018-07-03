import * as $ from 'jquery';

var API_KEY = '4cc2a6e2419deebfe86eca026cfda157';
var PER_PAGE = 20;

// @param function(data) successCallback
// @param function(errorMessage) errorCallback
// @param string searchQuery | search query for flickr.
// @param string page = 1 
// @param string per_page = PER_PAGE
export default function downloadPics(successCallback, errorCallback, searchQuery = '', page = 1, per_page = PER_PAGE) {
  let imgs = [];
  const method = searchQuery ? 'flickr.photos.search' : 'flickr.photos.getRecent';
  const url = `https://api.flickr.com/services/rest/?method=${method}&api_key=${API_KEY}&text=${searchQuery}&safe_search=1&page=${page}&per_page=${per_page}`;
  $.ajax({
    dataType: "json",
    url: url + '&format=json&jsoncallback=?',
    success: function(data) {
      if (data["photos"] == null) {
        errorCallback(JSON.stringify(["Problem with data", data]));
      } else {
        $.each(data.photos.photo, function(i, item) {
          let flickrUrl, src;
          // const size = `c`;
          // const size = `c`;
          const size = `h`;
          src = `http://farm${item.farm}.static.flickr.com/${item.server}/${item.id}_${item.secret}_${size}.jpg`;
          flickrUrl = `https://www.flickr.com/photos/${item.owner}/${item.id}`;
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
