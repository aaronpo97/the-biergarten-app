class ServerError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ServerError';
  }
}

export default ServerError;
