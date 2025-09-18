import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import { 
  createItemInputSchema, 
  updateItemInputSchema, 
  deleteItemInputSchema, 
  getItemInputSchema 
} from './schema';

// Import handlers
import { createItem } from './handlers/create_item';
import { getItems } from './handlers/get_items';
import { getItem } from './handlers/get_item';
import { updateItem } from './handlers/update_item';
import { deleteItem } from './handlers/delete_item';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Item management endpoints
  createItem: publicProcedure
    .input(createItemInputSchema)
    .mutation(({ input }) => createItem(input)),

  getItems: publicProcedure
    .query(() => getItems()),

  getItem: publicProcedure
    .input(getItemInputSchema)
    .query(({ input }) => getItem(input)),

  updateItem: publicProcedure
    .input(updateItemInputSchema)
    .mutation(({ input }) => updateItem(input)),

  deleteItem: publicProcedure
    .input(deleteItemInputSchema)
    .mutation(({ input }) => deleteItem(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();