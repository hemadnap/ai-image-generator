/**
 * Image Generation routes handler
 */

import { Env } from '../index'
import { imageGenerationController } from '../handlers/imageGenerationHandler'
import { notFound } from '../utils/responses'

export const imageGenerationRoutes = {
  async handle(path: string, method: string, request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // POST /images/generate - Generate image from prompt
    if (path === '/images/generate' && method === 'POST') {
      return imageGenerationController.generateImage(request, env)
    }

    // GET /images - Get user's generated images
    if (path === '/images' && method === 'GET') {
      return imageGenerationController.getUserImages(request, env)
    }

    // GET /prompts - Get prompt history
    if (path === '/prompts' && method === 'GET') {
      return imageGenerationController.getPromptHistory(request, env)
    }

    return notFound()
  }
}
