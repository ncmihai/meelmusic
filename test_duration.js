// Quick Node.js script to test the JioSaavn matching logic
const title = "Blinding Lights";
const artist = "The Weeknd";
const expectedDurationSec = 200; // 3:20 exact duration

const url = `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(title + " " + artist)}`;

/* Logic */
fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.status === "SUCCESS" && data.data?.results?.length > 0) {
      const exactMatch = data.data.results.find((track) => {
        const saavnDuration = parseInt(track.duration, 10);
        return Math.abs(saavnDuration - expectedDurationSec) <= 15;
      });
      
      if (exactMatch) {
         console.log(`✅ MATCHED: ${exactMatch.name} - Duration: ${exactMatch.duration}s`);
      } else {
         console.log(`❌ NO MATCH. Expected ${expectedDurationSec}s.`);
         console.log('Available options were:', data.data.results.map(r => r.duration + 's').join(', '));
      }
    }
  });
