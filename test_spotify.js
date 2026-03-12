import('node-fetch').then(async (fetchModule) => {
  const fetch = fetchModule.default;
  const btoa = (str) => Buffer.from(str).toString('base64');
  
  const SPOTIFY_CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.VITE_SPOTIFY_CLIENT_SECRET;
  
  const credentials = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const token = (await tokenRes.json()).access_token;
  
  console.log("Got token");

  // 1. Test Search Endpoint
  let searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent('Eminem')}&type=${encodeURIComponent('track')}&limit=${encodeURIComponent('20')}`;
  console.log("Searching URL:", searchUrl);
  let searchRes = await fetch(searchUrl, { headers: { 'Authorization': `Bearer ${token}` } });
  console.log("Search Status:", searchRes.status);
  let searchData = await searchRes.json();
  if (!searchRes.ok) console.log("Search Error:", searchData.error);
  
  // 2. Test Recommendations Endpoint
  let recsUrl = `https://api.spotify.com/v1/recommendations?seed_genres=${encodeURIComponent('pop,dance,hip-hop,edm')}&limit=${encodeURIComponent('12')}`;
  console.log("Recommendations URL:", recsUrl);
  let recsRes = await fetch(recsUrl, { headers: { 'Authorization': `Bearer ${token}` } });
  console.log("Recommendations Status:", recsRes.status);
  let recsData = await recsRes.json();
  if (!recsRes.ok) console.log("Recommendations Error:", recsData.error);
});
