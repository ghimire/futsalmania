import Backbone from 'backbone';
import Marionette from 'backbone.marionette';
import template from '../templates/map.jst';
import infoTemplate from '../templates/infoWindow.jst';
import loadGoogleMapsAPI from 'load-google-maps-api';
import futsals from '../assets/data.json';
import _ from 'underscore';


export default Marionette.View.extend({
  template: template,
  infoTemplate: infoTemplate,
  markers: [],
  userLocation: null,

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

  _getReverseGeocodingData: function(infowindow, futsal) {
    let view = this;
    let latlng = new view.googleMaps.LatLng(futsal.get('lat'), futsal.get('lng'));
    // This is making the Geocode request
    let geocoder = new view.googleMaps.Geocoder();
    geocoder.geocode({ 'latLng': latlng }, function(results, status) {
      if (status !== view.googleMaps.GeocoderStatus.OK) {
        // Error retrieving geocoded data
      }
      if (status === view.googleMaps.GeocoderStatus.OK) {
        let address = (results[0].formatted_address);
        infowindow.setContent(view.infoTemplate({futsal: futsal, address: address}));
      }
    });
  },

  onRender: function() {
    let view = this;
    loadGoogleMapsAPI().then((googleMaps) => {
      view.googleMaps = googleMaps;
      view.infowindow = new googleMaps.InfoWindow({content: ''});

      let markerCol = new view.Markers(futsals);
      view.map = new googleMaps.Map(document.getElementById('mapDiv'), {
        center: {lat: 27.7172, lng: 85.3240},
        zoom: 13,
        mapTypeId: view.googleMaps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
      });

      // Create the DIV to hold the control and call the CenterControl()
      // constructor passing in this DIV.
      let centerControlDiv = document.createElement('div');
      view._CenterControl(centerControlDiv, view.map);

      centerControlDiv.index = 1;
      view.map.controls[view.googleMaps.ControlPosition.TOP_CENTER].push(centerControlDiv);
      // End of CenterControl

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          if(view.userLocation){
            view.userLocation.setMap(null);
          }
          view.userLocation = new googleMaps.Marker({
            position: new googleMaps.LatLng(position.coords.latitude , position.coords.longitude),
            map: view.map,
            title: 'Your Current Location',
          });

          view.googleMaps.event.addListener(view.userLocation, 'click', function() {
            view.infowindow.setContent('Your Current Location');
            view.infowindow.open(view.map, this);
          });
        }, _.noop());
      }

      markerCol.each(function(futsal) {
        let profilePicture;
        try {
          profilePicture = require('../assets/images/futsals/' + futsal.get('profilePicture'));
        } catch (e) {
          profilePicture = require('../assets/images/placeholder.png');
        }
        futsal.set('profilePicture', profilePicture);

        let marker = new googleMaps.Marker({
          position: new googleMaps.LatLng(futsal.get('lat'), futsal.get('lng')),
          map: view.map,
          title: futsal.get('name'),
          icon: require('../assets/images/marker.png')
        });

        view.googleMaps.event.addListener(marker, 'click', function() {
          view.infowindow.setContent(view.infoTemplate({futsal: futsal, address: null}));
          view.infowindow.open(view.map, this);
          view._getReverseGeocodingData(view.infowindow, futsal);
        });

        view.markers.push(marker);
      });
    }).catch((err) => {
      console.error(err);
    });
  },

});
