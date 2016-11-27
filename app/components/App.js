import Marionette from 'backbone.marionette';
import MapView from './MapView';
import toastr from 'toastr';
require('bootstrap-webpack');

export default Marionette.Application.extend({
  region: '#app',

  initialize() {
    Marionette.Object.extend({
      channelName: 'notify',
      radioRequests: {
        'show:success': 'showSuccessMessage',
        'show:error': 'showErrorMessage',
        'get:futsals': 'getFutsals'
      },

      showSuccessMessage: function(message) {
        console.log('Showing success Message');
        toastr.success(message);
      },

      showErrorMessage: function(message) {
        toastr.error(message);
      },

      getFutsals: function() {
        return $.ajax('/public/data.json');
      }
    });

    this.on('start', () => {
      let view = this;
      view.showView(new MapView());
    })
  }
});
