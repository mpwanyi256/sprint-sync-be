export default async function globalTeardown() {
  const mongod = (global as any).__MONGOD__;

  if (mongod) {
    await mongod.stop();
    console.log('Test database stopped');
  }
}
