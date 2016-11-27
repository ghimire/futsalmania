import './styles/application.css';
import App from 'components/App';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  window.App = app;
  app.start();
});
