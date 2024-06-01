export class Result<T> {
  data: T;
  success: boolean;
  traceId: string;
  error: string;
  _result: Result<T>;

  builder() {
    this._result = new Result();
    return this;
  }

  setData(data: T) {
    this._result.data = data;
    return this;
  }

  setMessage(message: string) {
    try {
      this._result.error = JSON.parse(message);
    } catch (error) {
      this._result.error = message;
    }
    return this;
  }

  setSuccess(success: boolean) {
    this._result.success = success;
    return this;
  }

  setTransactionId(tid: string) {
    this._result.traceId = tid || 'Unknown';
    return this;
  }

  build() {
    const response = this._result as any;
    delete response['_result'];
    return response;
  }

  public static success<T>(data: T, tid: string) {
    return new Result<T>()
      .builder()
      .setData(data)
      .setTransactionId(tid)
      .setSuccess(true)
      .build();
  }

  public static error<T>(errorMessage: string, tid: string) {
    return new Result<T>()
      .builder()
      .setMessage(errorMessage)
      .setTransactionId(tid)
      .setSuccess(false)
      .build();
  }
}

export type ResponseType<T> = Promise<Result<T>>;
