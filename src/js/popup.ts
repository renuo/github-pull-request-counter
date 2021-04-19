const popup = () => {
  console.log('Popup loaded');
  let healthButton = document.getElementById('health-check');
  if (healthButton) {
    healthButton.addEventListener('click', () => {
      alert('All healthy');
    });
  }
}

popup();
