import "../css/popup.scss";

const popup = () => {
  let healthButton = document.getElementById('health-check');
  if (healthButton) {
    healthButton.addEventListener('click', () => {
      alert('All good');
    });
  }
}

popup();
