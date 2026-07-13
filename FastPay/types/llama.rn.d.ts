declare module "llama.rn" {
  export function initLlama(params: {
    model: string;
    n_ctx?: number;
    n_gpu_layers?: number;
  }): Promise<{
    completion: (
      params: { prompt: string; n_predict: number; temperature: number },
      callback: (data: { token: string }) => void,
    ) => Promise<void>;
  }>;
}
