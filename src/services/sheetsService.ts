export const syncToGoogleSheets = async (data: any[]) => {
  // This is a placeholder for the Google Sheets integration.
  // In a real scenario, you would set up a Google Apps Script Web App
  // and send a POST request to its URL.
  
  const WEBHOOK_URL = import.meta.env.VITE_SHEETS_WEBHOOK_URL;
  
  if (!WEBHOOK_URL) {
    throw new Error('CONFIG_MISSING');
  }

  try {
    // We use a proxy-like fetch or standard fetch
    // Note: mode 'no-cors' will always return an opaque response (status 0)
    // but the request usually reaches the server.
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return { success: true, message: 'Data dikirim ke Google Sheets' };
  } catch (error) {
    console.error('Error syncing to Sheets:', error);
    throw error;
  }
};
