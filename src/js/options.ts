const options = () => {
  console.log('Options loaded');
  let healthButton = document.getElementById('health-check');
  if (healthButton) {
    healthButton.addEventListener('click', () => {
      alert('All healthy');
    });
  }
}

options();
