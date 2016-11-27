import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import template from '../templates/map.jst';
import infoTemplate from '../templates/infoWindow.jst';
import loadGoogleMapsAPI from 'load-google-maps-api';
import futsals from '../assets/data.json';


export default Marionette.View.extend({
  template: template,
  infoTemplate: infoTemplate,
  markers: [],

  initialize: function() {
    let view = this;
    view.Marker = Backbone.Model.extend({
      defaults: {
        id: null,
        name: '',
        lat: null,
        lng: null,
        profilePicture: null
      }
    });

    view.Markers = Backbone.Collection.extend({
      model: view.Marker
    });
  },

  _CenterControl: function(controlDiv, map) {

    // Set CSS for the control border.
    let controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Raleway,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Nepal Futsal Community';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function() {
      //
    });

  },

  onRender: function() {
    let view = this;
    loadGoogleMapsAPI().then((googleMaps) => {
      let markerCol = new view.Markers(futsals);
      view.map = new googleMaps.Map(document.getElementById('mapDiv'), {
        center: {lat: 27.7172, lng: 85.3240},
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
      });

      // Create the DIV to hold the control and call the CenterControl()
      // constructor passing in this DIV.
      let centerControlDiv = document.createElement('div');
      new view._CenterControl(centerControlDiv, view.map);

      centerControlDiv.index = 1;
      view.map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

      markerCol.each(function(futsal) {
        let profilePicture;
        try {
          profilePicture = require('../assets/images/futsals/' + futsal.get('profilePicture'));
        } catch(e){
          profilePicture = require('../assets/images/placeholder.png');
        }
        futsal.set('profilePicture', profilePicture);

        let infowindow = new googleMaps.InfoWindow({
          content: view.infoTemplate({futsal: futsal})
        });
        let marker = new googleMaps.Marker({
          position: new googleMaps.LatLng(futsal.get('lat'), futsal.get('lng')),
          map: view.map,
          title: futsal.get('name'),
          icon: require('../assets/images/marker.png')
        });
        marker.addListener('click', function() {
          infowindow.open(view.map, marker);
        });
        view.markers.push(marker);
      });
    }).catch((err) => {
      console.error(err);
    });
  },

});
