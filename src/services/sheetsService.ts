export const syncToGoogleSheets = async (data: any[]) => {
  // This is a placeholder for the Google Sheets integration.
  // In a real scenario, you would set up a Google Apps Script Web App
  // and send a POST request to its URL.
  
  const WEBHOOK_URL = import.meta.env.VITE_SHEETS_WEBHOOK_URL;
  
  if (!WEBHOOK_URL) {
    throw new Error('CONFIG_MISSING');
  }

  try {
    // Note: mode 'no-cors' does not allow 'Content-Type: application/json'.
    // The request will be sent as 'text/plain' but contain our JSON string.
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify(data),
    });
    
    return { success: true, message: 'Data dikirim ke Google Sheets' };
  } catch (error) {
    console.error('Error syncing to Sheets:', error);
    throw error;
  }
};
