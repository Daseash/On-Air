const os = require('os');
const path = require('path');

let embedder = null;
let warmPromise = null;
let pipelineFn = null;

async function getTransformers() {
  if (!pipelineFn) {
    const { pipeline, env } = await import('@xenova/transformers');
    pipelineFn = pipeline;
    env.cacheDir = process.env.VERCEL
      ? path.join(os.tmpdir(), '.cache', 'transformers')
      : path.join(__dirname, '..', '.cache', 'transformers');
  }
  return pipelineFn;
}

async function getEmbedder() {
  if (!embedder) {
    const pipeline = await getTransformers();
    const modelName = process.env.EMBEDDING_MODEL_NAME || 'Xenova/all-MiniLM-L6-v2';
    embedder = await pipeline('feature-extraction', modelName);
  }
  return embedder;
}

async function embedText(text) {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data); // 384-dim vector
}

// Pre-load the model so the first user query doesn't pay the load cost.
async function warmUpEmbeddings() {
  if (!warmPromise) {
    warmPromise = getEmbedder()
      .then(() => embedText('onair warmup'))
      .catch((err) => {
        console.warn('Embedding model warmup failed (will retry lazily):', err.message);
        warmPromise = null;
      });
  }
  return warmPromise;
}

module.exports = { embedText, warmUpEmbeddings };
