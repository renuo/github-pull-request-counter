import "../css/options.scss";

const options = () => {
  let healthButton = document.getElementById('health-check');
  if (healthButton) {
    healthButton.addEventListener('click', () => {
      alert('All good');
    });
  }
}

options();
