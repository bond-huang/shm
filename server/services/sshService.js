const { Client } = require('ssh2');

/**
 * 通过 SSH 在远程主机上执行命令
 * @param {string} host - IP 地址
 * @param {number} port - SSH 端口，默认 22
 * @param {string} user - 用户名
 * @param {string} password - 密码
 * @param {string} cmd - 要执行的命令
 * @param {number} timeout - 命令超时毫秒数，默认 10000
 * @returns {Promise<string>} 命令输出
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
            // 部分命令退出码非 0 但仍有有效输出，不直接报错
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

module.exports = { execCommand };
