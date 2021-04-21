import '../css/options.scss';

const options = () => {
  const healthButton = document.getElementById('health-check');
  if (healthButton) {
    healthButton.addEventListener('click', () => {
      alert('All good');
    });
  }
};

options();
