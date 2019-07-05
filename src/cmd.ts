import { spawn, SpawnOptions } from 'child_process';

export function run(cmd: string, options?: SpawnOptions): Promise<any> {
  const [command, ...args] = cmd.split(/\s+/);
  return new Promise((resolve, reject) => {
    const cp = spawn(command, args, options);
    cp.on('close', code => {
      if (code !== 0) {
        return reject(new Error(`${command} process exited with code ${code}`));
      }
      return resolve();
    });
    cp.on('error', err => {
      return reject(err);
    });
  });
}
