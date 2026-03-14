import { ChildProcess } from 'node:child_process';
import waitPort from 'wait-port';

export async function stopProcess(childProcess: ChildProcess): Promise<void> {
  return new Promise<void>((resolve) => {
    childProcess!.on('close', () => {
      resolve();
    });
    childProcess!.kill('SIGTERM');
  });
}

export async function promiseTimeout<T>(cb: Promise<T>, timeout: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${timeout} ms`));
    }, timeout);

    cb.then((result) => {
      clearTimeout(timer);
      resolve(result);
    });
  });
}

export async function asyncTimeout(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export async function waitProcessPort(process: ChildProcess, port: number): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    (async () => {
      const outputChunks: Buffer[] = [];

      function onClose(): void {
        reject(Buffer.concat(outputChunks).toString());
      }
      function onOutputData(chunk: Buffer): void {
        outputChunks.push(chunk);
      }
      process.on('close', onClose);
      process.stdout?.on('data', onOutputData);
      process.stderr?.on('data', onOutputData);

      await asyncTimeout(500);
      await waitPort({
        port: port,
        host: '127.0.0.1',
        timeout: 6000,
        output: 'silent',
      });
      process.removeListener('close', onClose);
      process.stdout?.removeListener('data', onOutputData);
      process.stderr?.removeListener('data', onOutputData);
      return process;
    })().then(resolve);
  });
}
