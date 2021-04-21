import '../css/popup.scss';

export const popup = () => {
  const healthButton = document.getElementById('health-check');
  if (healthButton) {
    healthButton.addEventListener('click', () => {
      alert('All good');
    });
  }

  const testExample = () => {
    return 5;
  };

  return { testExample };
};

popup();
