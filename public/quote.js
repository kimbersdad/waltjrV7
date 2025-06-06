document.addEventListener('DOMContentLoaded', function () {
  const sendButton = document.getElementById('send-quote');
  const quoteInput = document.getElementById('quote-input');

  sendButton.addEventListener('click', async () => {
    const message = quoteInput.value.trim();
    if (!message) {
      alert('Please enter a message.');
      return;
    }

    try {
      const token = Outseta.getAccessToken();
      if (!token) {
        alert('You must be logged in to send a quote request.');
        return;
      }

      const response = await fetch('https://your-backend-endpoint.com/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      alert('Quote request sent successfully!');
      quoteInput.value = '';
    } catch (error) {
      console.error('Error sending quote request:', error);
      alert('There was an error sending your quote request.');
    }
  });
});
