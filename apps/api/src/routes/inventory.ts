import type { FastifyInstance } from 'fastify';

export default async function inventoryRoutes(fastify: FastifyInstance) {
  // GET /v1/inventory — list inventory for dealer
  fastify.get('/', async (request, reply) => {
    const { condition, status, search, page = '1', limit = '20' } = request.query as Record<string, string>;
    // TODO: replace with real Prisma query using dealer_id from JWT
    return {
      success: true,
      data: [],
      pagination: { page: parseInt(page), limit: parseInt(limit), total: 0 },
    };
  });

  // POST /v1/inventory — create single vehicle
  fastify.post('/', async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    fastify.log.info(`Creating vehicle: ${JSON.stringify(body)}`);
    return { success: true, id: 'mock-vehicle-id', ...body };
  });

  // PUT /v1/inventory/:id — update vehicle
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    return { success: true, id, ...body };
  });

  // DELETE /v1/inventory/:id
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    return { success: true, message: `Vehicle ${id} deleted` };
  });

  // PATCH /v1/inventory/:id/status — mark sold/reserved/in_stock
  fastify.patch('/:id/status', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status } = request.body as { status: string };
    return { success: true, id, status };
  });

  // POST /v1/inventory/import — CSV/Excel import
  fastify.post('/import', async (request, reply) => {
    // TODO: parse multipart file, map columns, validate, insert via Prisma
    fastify.log.info('Mock CSV import');
    return {
      success: true,
      imported: 47,
      errors: 3,
      warnings: 2,
      error_rows: [],
    };
  });
}
