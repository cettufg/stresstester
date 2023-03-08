import os from 'os';
import process from 'process';
import si from 'systeminformation';

export function getSystemInfo() {
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    const cpuUsagePercent = ((cpuUsage.user + cpuUsage.system) / (1000 * 1000 * uptime)) * 100;
    const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;
    // Calcule a porcentagem de uso de disco
    const usedPercent = Math.round((1 - freeMemory / totalMemory) * 100);
    si.networkStats().then((data) => {
        // Itere sobre as interfaces de rede
        data.forEach(({ iface, rx_bytes, tx_bytes }) => {
            // Obtenha o uso de rede da interface
        });
    });
    return { hostname, platform, arch, cpus: cpus.length, totalMemory, freeMemory, cpuUsagePercent, memoryUsagePercent, usedPercent }
}


