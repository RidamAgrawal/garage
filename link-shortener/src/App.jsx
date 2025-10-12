import { useState } from 'react'
import './App.css'

function App() {
  const [shortUrl, setShortUrl] = useState('');
  const [longUrl, setLongUrl] = useState('');

  const getBackendUrl = () => {
    return 'http://localhost:3001';
  }

  const getRedirectUrl = (shortCode) => {
    return getBackendUrl() + '/find/' + shortCode;
  }

  const generateShortUrl = async () => {
    if (!longUrl) {
      setShortUrl('Please Enter a valid URL!');
      return;
    }

    try {
      const backendDomain = getBackendUrl();

      const response = await fetch(`${backendDomain}/shorten`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longUrl })
      });

      const data = await response.json();

      if (data.shortCode) {
        setShortUrl(backendDomain + '/' + data.shortCode)
      }
      else {
        setShortUrl('Error generating short URL');
      }
    }
    catch (err) {
      console.error('API error:', err);
      setShortUrl('Server Error');
    }
  }

  return (
    <>
      <div className='container'>
        <h1>URL SHORTENER</h1>
        <input type="text" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} placeholder='Enter URL' />
        <br />
        <button onClick={generateShortUrl}>
          shorten URL
        </button>
        <p>
          {shortUrl && (
            <>
              <a href={getRedirectUrl(shortUrl.split('/').at(-1))} target='_blank' rel='noopener noreferrer'>
                {shortUrl}
              </a>
            </>
          )}
        </p>
      </div>
    </>
  )
}

export default App
