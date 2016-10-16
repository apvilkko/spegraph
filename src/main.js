const doRequest = url => fetch(url).then(response => response.arrayBuffer());

const loadSample = (ctx, name) => {
  const {buffers, audioContext} = ctx;
  return new Promise(resolve => {
    if (buffers[name]) {
      resolve();
      return;
    }
    doRequest(name).then(rawBuffer => {
      audioContext.decodeAudioData(rawBuffer, buffer => {
        ctx.buffers[name] = buffer;
        resolve();
      }, () => {});
    });
  });
};

const play = ctx => {
  const {audioContext, buffers, analyser} = ctx;
  const sample = 'samples/acdc.ogg';
  if (!buffers[sample]) {
    return;
  }
  const buffer = buffers[sample];
  const node = audioContext.createBufferSource();
  node.buffer = buffer;
  node.connect(audioContext.destination);
  node.connect(analyser);
  node.start(0);

  /*const node = audioContext.createOscillator();
  node.type = 'sine';
  node.frequency.value = 200; // value in hertz
  node.connect(audioContext.destination);
  node.connect(analyser);
  node.start();*/

  ctx.node = node;
};

const setFreq = (ctx, val) => {
  //console.log(val);
  ctx.node.frequency.value = val;
};

const init = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const analyserEl = document.getElementById('analyser');
  const analyserContext = analyserEl.getContext('2d');
  const width = 600;
  const height = 600;
  analyserEl.width = width;
  analyserEl.height = height;

  const ctx = {
    audioContext,
    analyser,
    dataArray,
    bufferLength,
    analyserContext,
    width,
    height,
    buffers: {},
  };

  document.getElementById('play').addEventListener('click', () => play(ctx));
  document.getElementById('range').addEventListener('input', el => setFreq(ctx, el.target.value));

  return ctx;
};

const toLog = (val, max) => {
  const base = 2;
  const log = Math.log(max + 1) / Math.log(base);
  const exp = log * val / max;
  return Math.round(Math.pow(base, exp) - 1);
};

const start = ctx => {
  let frame = -1;
  const {
    analyser, dataArray, analyserContext: context, width, height, bufferLength
  } = ctx;
  context.fillStyle = 'rgb(0, 0, 0)';
  context.fillRect(0, 0, width, height);
  function draw() {
    window.requestAnimationFrame(draw);
    frame++;
    analyser.getByteFrequencyData(dataArray);

    const barWidth = 5;
    const barHeight = height / bufferLength;
    let strength;
    let scaled;
    const x = (frame * barWidth) % width;

    for (let i = 0; i < bufferLength; i++) {
      const index = toLog(i, bufferLength);
      strength = dataArray[index];
      scaled = strength * 50 / 256;
      /*if (frame % 100 === 0) {
        console.log(index, strength);
      }*/

      context.fillStyle = `rgb(${strength},${scaled},${scaled})`;
      context.fillRect(x, height - (i * barHeight), barWidth, barHeight);
    }
  }
  draw();
};

const ctx = init();
loadSample(ctx, 'samples/acdc.ogg');
start(ctx);
play(ctx);
