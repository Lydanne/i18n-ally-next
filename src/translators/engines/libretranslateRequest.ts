import axios from 'axios'

export async function requestLibreTranslation(apiRoot: string, text: string, from: string, to: string, apiKey?: string | null) {
  try {
    return await axios.post(`${apiRoot}/translate`, {
      q: text,
      source: from,
      target: to,
      format: 'html',
      ...(apiKey ? { api_key: apiKey } : {}),
    }, {
      headers: { 'Content-Type': 'application/json' },
      // A 307/308 redirect could otherwise forward the key to another host.
      ...(apiKey ? { maxRedirects: 0 } : {}),
    })
  }
  catch (error) {
    // Axios errors include request bodies and headers, which would expose the
    // API key when the caller logs the error. Do not retain the original error.
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    throw new Error(`LibreTranslate request failed${status ? ` (HTTP ${status})` : ''}`)
  }
}
