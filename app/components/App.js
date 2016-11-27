import Marionette from 'backbone.marionette';
import MapView from './MapView';

export default Marionette.Application.extend({
  region: '#app',

  initialize() {
    this.on('start', () => {
      this.showView(new MapView());
    })
  }
});
