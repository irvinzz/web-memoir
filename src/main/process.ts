import { ChildProcess, exec, ExecException, spawn } from 'node:child_process';
import waitPort from 'wait-port';

import { createLogger } from './logger';

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

      function onClose(exitCode: number | null): void {
        reject({
          exitCode,
          output: Buffer.concat(outputChunks).toString(),
        });
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
    })().then(process => {
      if (!process.exitCode) {
        resolve(process);
      }
    });
  });
}

export async function spawnAsync(command: string, args: string[], title: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'pipe',
    });

    const logger = createLogger(title);

    process.stdout.on('data', (chunk) => {
      logger.debug('out', chunk.toString());
    });

    process.stderr.on('data', (chunk) => {
      logger.error('err', chunk.toString());
    });

    process.on('exit', (code) => {
      if (code !== 0) return reject(`${title} exited with code ${code}`);
      resolve();
    });
  });
}

type ExecAsyncReturnType = {
  err: ExecException | null;
  stdout: NonSharedBuffer;
  stderr: NonSharedBuffer;
};
export async function execAsync(command: string): Promise<ExecAsyncReturnType> {
  return new Promise<ExecAsyncReturnType>((resolve) => {
    exec(command, { encoding: 'buffer' }, (err, stdout, stderr) =>
      resolve({ err, stdout, stderr })
    );
  });
}
