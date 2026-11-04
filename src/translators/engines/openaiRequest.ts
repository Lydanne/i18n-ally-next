import axios from 'axios'

export async function requestOpenAITranslation(apiRoot: string, apiKey: string | null | undefined, model: string, systemPrompt: string, userPrompt: string) {
  const isOpenAI = apiRoot === 'https://api.openai.com'
  try {
    const response = await axios.post(`${apiRoot}/v1/chat/completions`, {
      model,
      // Reasoning models reject the sampling and penalty settings used by
      // legacy models. Bound output for OpenAI without imposing a specific
      // request schema on OpenAI-compatible providers. Keep their previous
      // output limit to avoid unexpectedly increasing usage.
      ...(isOpenAI ? { max_completion_tokens: 4096 } : { max_tokens: 1000 }),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      maxRedirects: 0,
    })
    // Axios response config contains the Authorization header.
    return { data: response.data }
  }
  catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    throw new Error(`OpenAI translation request failed${status ? ` (HTTP ${status})` : ''}`)
  }
}
