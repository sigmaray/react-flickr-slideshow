import * as $ from 'jquery';

export default function gitFlickrPicsList(apiKey, successCallback, errorCallback, searchQuery = '', page = 1, per_page = 20) {
  let imgs = [];
  const method = searchQuery ? 'flickr.photos.search' : 'flickr.photos.getRecent';
  const url = `https://api.flickr.com/services/rest/?method=${method}&api_key=${apiKey}&text=${searchQuery}&safe_search=1&page=${page}&per_page=${per_page}`;
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
          const size = `b`;
          // src = `http://farm${item.farm}.static.flickr.com/${item.server}/${item.id}_${item.secret}_${size}.jpg`;
          src = `https://live.staticflickr.com/${item.server}/${item.id}_${item.secret}_${size}.jpg`;
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
