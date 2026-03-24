import type { FastifyRequest, FastifyReply } from 'fastify';
import type { JwtUser, Permission, Role } from './permissions.js';
import { can } from './permissions.js';

export function getUser(request: FastifyRequest): JwtUser {
  return request.user as JwtUser;
}

/** Returns dealer_id, or 404 if the owner is acting without a specific dealer context. */
export function getDealerId(request: FastifyRequest, reply: FastifyReply): string | null {
  const user = getUser(request);
  // Owner can supply ?dealer_id= to act on behalf of any dealer
  const override = (request.query as Record<string, string>)['dealer_id'];
  if (user.role === 'owner') return override ?? null;
  return user.dealer_id;
}

/** Requires role to be one of the allowed roles, otherwise 403. */
export function requireRole(reply: FastifyReply, user: JwtUser, ...roles: Role[]): boolean {
  if (!roles.includes(user.role)) {
    reply.code(403).send({ error: { code: 'FORBIDDEN', message: `Requires role: ${roles.join(' or ')}` } });
    return false;
  }
  return true;
}

/** Requires the user to have a specific permission (owners/admins always pass). */
export function requirePermission(reply: FastifyReply, user: JwtUser, permission: Permission): boolean {
  if (!can(user, permission)) {
    reply.code(403).send({ error: { code: 'FORBIDDEN', message: `Missing permission: ${permission}` } });
    return false;
  }
  return true;
}
