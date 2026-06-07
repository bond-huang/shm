const { Client } = require('ssh2');

/**
 * 通过 SSH 在远程主机上执行单个命令
 */
function execCommand(host, port, user, password, cmd, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let timer;

    conn.on('ready', () => {
      conn.exec(cmd, { pty: false }, (err, stream) => {
        if (err) {
          conn.end();
          return reject(new Error(`Exec error: ${err.message}`));
        }

        let stdout = '';
        let stderr = '';

        stream.on('data', (data) => { stdout += data.toString(); });
        stream.stderr.on('data', (data) => { stderr += data.toString(); });

        stream.on('close', (code) => {
          clearTimeout(timer);
          conn.end();
          if (code !== 0 && stderr) {
            console.warn(`SSH cmd exit ${code}: ${stderr.trim()}`);
          }
          resolve(stdout);
        });

        timer = setTimeout(() => {
          stream.close();
          conn.end();
          reject(new Error('Command timeout'));
        }, timeout);
      });
    });

    conn.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`SSH connection error: ${err.message}`));
    });

    conn.connect({
      host,
      port: port || 22,
      username: user,
      password,
      readyTimeout: 5000,
      keepaliveInterval: 0
    });
  });
}

/**
 * 通过单个 SSH 连接顺序执行多个命令（避免并发连接过多被拒绝）
 * @param {string} host
 * @param {number} port
 * @param {string} user
 * @param {string} password
 * @param {string[]} cmds - 命令数组
 * @param {number} timeout - 每条命令超时
 * @returns {Promise<string[]>} 每条命令的输出
 */
function execCommands(host, port, user, password, cmds, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const results = [];
    let index = 0;

    conn.on('ready', () => {
      function runNext() {
        if (index >= cmds.length) {
          conn.end();
          return resolve(results);
        }

        const cmd = cmds[index];
        conn.exec(cmd, { pty: false }, (err, stream) => {
          if (err) {
            results.push('');
            index++;
            return runNext();
          }

          let stdout = '';
          let timer;

          stream.on('data', (data) => { stdout += data.toString(); });
          stream.stderr.on('data', () => {});

          stream.on('close', () => {
            clearTimeout(timer);
            results.push(stdout);
            index++;
            runNext();
          });

          timer = setTimeout(() => {
            stream.close();
            results.push('');
            index++;
            runNext();
          }, timeout);
        });
      }

      runNext();
    });

    conn.on('error', (err) => {
      reject(new Error(`SSH connection error: ${err.message}`));
    });

    conn.connect({
      host,
      port: port || 22,
      username: user,
      password,
      readyTimeout: 5000,
      keepaliveInterval: 0
    });
  });
}

module.exports = { execCommand, execCommands };
