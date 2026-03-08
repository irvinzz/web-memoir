import { ChildProcess } from "node:child_process";

export async function stopProcess(
  childProcess: ChildProcess,
): Promise<void> {
  return new Promise<void>((resolve) => {
    childProcess!.on('close', () => {
      resolve();
    });
    childProcess!.kill('SIGTERM');
  });
}
