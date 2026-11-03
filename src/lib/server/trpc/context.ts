import { db } from '../db/index.ts';
import { createJobboard } from '../jobboard.ts';
import { appRouter } from './router.ts';
const board = createJobboard(db);
export const createContext = (locals: App.Locals) => ({ user: locals.user, board });
// Server loads/actions use the same router without an HTTP round trip.
export const requestApi = (locals: App.Locals) => appRouter.createCaller(createContext(locals));
