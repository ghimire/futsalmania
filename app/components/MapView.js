import Marionette from 'backbone.marionette';
import template from '../templates/map.jst';
import loadGoogleMapsAPI from 'load-google-maps-api';

export default Marionette.View.extend({
  template: template,
  onRender: function(){
    var view = this;
    loadGoogleMapsAPI().then((googleMaps) => {
      var options = {
          zoom: 14,
          center:  new google.maps.LatLng(27.7172, 85.3240),
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true
      };

      view.map = new google.maps.Map($('#mapDiv')[0], options);
    }).catch((err) => {
      console.error(err);
    });
  }
});
