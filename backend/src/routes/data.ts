/**
 * Data routes handler
 */

import { Env } from '../index'
import { dataController } from '../handlers/dataHandler'
import { notFound } from '../utils/responses'

export const dataRoutes = {
  async handle(path: string, method: string, request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // GET /data/dashboard - Get dashboard data
    if (path === '/data/dashboard' && method === 'GET') {
      return dataController.getDashboardData(request, env)
    }

    // GET /data/analytics - Get analytics data
    if (path === '/data/analytics' && method === 'GET') {
      return dataController.getAnalyticsData(request, env)
    }

    return notFound()
  }
}
