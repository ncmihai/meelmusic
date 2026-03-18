const yt = require('youtube-ext');
async function test() {
  try {
    const stream = await yt.stream('https://www.youtube.com/watch?v=aqz-KE-bpKQ');
    console.log('Success:', stream.audio[0].url);
  } catch (err) {
    console.error(err);
  }
}
test();
