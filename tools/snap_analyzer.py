#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AIX snap -gc 日志分析工具
分析 AIX snap 采集的 .pax.Z 文件，生成 HTML 巡检报告

用法: python snap_analyzer.py <snap_file> [output.html]
"""

import sys
import os
import re
import gzip
import tempfile
import subprocess
import tarfile
from datetime import datetime
from collections import defaultdict


def decompress_and_extract(snap_file, extract_dir):
    """解压 .pax.Z 并解包 tar"""
    abs_snap = os.path.abspath(snap_file)
    abs_extract = os.path.abspath(extract_dir)

    # 检查文件头判断格式
    with open(abs_snap, 'rb') as f:
        header = f.read(2)

    pax_path = os.path.join(abs_extract, 'snapshot.pax')

    if header == b'\x1f\x9d':
        # Unix compress (.Z) 格式
        # 尝试多种方式解压
        decompressed = False

        # 方式1: Git Bash uncompress (通过 bash)
        git_bash = r'C:\Program Files\Git\bin\bash.exe'
        if os.path.exists(git_bash):
            unix_snap = '/' + abs_snap[0].lower() + abs_snap[2:].replace('\\', '/')
            cmd = f'/usr/bin/uncompress -c \'{unix_snap}\''
            with open(pax_path, 'wb') as f:
                r = subprocess.run([git_bash, '-c', cmd], stdout=f, stderr=subprocess.PIPE)
                if r.returncode == 0 and os.path.getsize(pax_path) > 1000:
                    decompressed = True

        # 方式2: 直接用 PATH 中的 uncompress (可能在 Git Bash 环境)
        if not decompressed:
            try:
                with open(pax_path, 'wb') as f:
                    r = subprocess.run(['uncompress', '-c', abs_snap],
                                       stdout=f, stderr=subprocess.PIPE)
                    if r.returncode == 0 and os.path.getsize(pax_path) > 1000:
                        decompressed = True
            except FileNotFoundError:
                pass

        if not decompressed:
            # 方式3: 检查旁边是否有同名 .pax 文件（已手动解压）
            pax_alter = abs_snap.rsplit('.', 1)[0]
            if os.path.exists(pax_alter):
                pax_path = pax_alter
                decompressed = True

        if not decompressed:
            print("Error: Cannot decompress .Z file.")
            print("Please run: uncompress 1snap.pax.Z")
            print("Then run: python snap_analyzer.py 1snap.pax")
            sys.exit(1)

    elif header == b'\x1f\x8b':
        # gzip 格式
        import gzip
        with gzip.open(abs_snap, 'rb') as gz:
            with open(pax_path, 'wb') as out:
                out.write(gz.read())
    else:
        # 可能已经是 tar/pax 格式
        pax_path = abs_snap

    # 解包 tar - 通过 Git Bash 执行（Windows tar 有路径兼容问题）
    pax_abs = os.path.abspath(pax_path)
    # 转换为 Unix 风格路径: D:\path -> /d/path
    unix_pax = '/' + pax_abs[0].lower() + pax_abs[2:].replace('\\', '/')
    unix_extract = '/' + abs_extract[0].lower() + abs_extract[2:].replace('\\', '/')

    git_bash = r'C:\Program Files\Git\bin\bash.exe'
    if os.path.exists(git_bash):
        cmd = f'cd "{unix_extract}" && tar -x -f "{unix_pax}" 2>/dev/null'
        subprocess.run([git_bash, '-c', cmd], capture_output=True)
    else:
        # 回退：直接在当前目录提取再移动
        subprocess.run(f'tar -x -f "{pax_abs}"', shell=True, capture_output=True)

    # 清理临时 pax 文件
    if pax_path != abs_snap and os.path.exists(pax_path):
        try:
            os.remove(pax_path)
        except Exception:
            pass

    return extract_dir


def read_file(path):
    """安全读取文件"""
    try:
        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    except Exception:
        return ''


def parse_errpt(content):
    """解析 errpt.out"""
    errors = []
    blocks = re.split(r'-{40,}', content)
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        label_m = re.search(r'LABEL:\s*(\S+)', block)
        date_m = re.search(r'Date/Time:\s*(.+)', block)
        type_m = re.search(r'Type:\s*(\S+)', block)
        desc_m = re.search(r'Description\s*\n(.+)', block)
        resource_m = re.search(r'Resource Name:\s*(\S+)', block)

        if label_m:
            errors.append({
                'label': label_m.group(1),
                'date': date_m.group(1).strip() if date_m else '',
                'type': type_m.group(1).strip() if type_m else '',
                'description': desc_m.group(1).strip() if desc_m else '',
                'resource': resource_m.group(1).strip() if resource_m else ''
            })
    return errors


def parse_lparstat(content):
    """解析 lparstat.out"""
    info = {}
    for line in content.split('\n'):
        if ':' in line:
            key, _, val = line.partition(':')
            info[key.strip()] = val.strip()
    return info


def parse_lsdev(content):
    """解析 lsdev 输出"""
    devices = []
    for line in content.split('\n'):
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        if len(parts) >= 3:
            devices.append({
                'name': parts[0],
                'status': parts[1],
                'location': parts[2] if len(parts) > 2 else '',
                'description': ' '.join(parts[3:]) if len(parts) > 3 else ''
            })
    return devices


def parse_instfix(content):
    """解析 instfix.i"""
    fixes = []
    for line in content.split('\n'):
        line = line.strip()
        if not line or line.startswith('File') or line.startswith('---'):
            continue
        parts = line.split()
        if len(parts) >= 3:
            fixes.append({
                'id': parts[0],
                'file': parts[1],
                'date': parts[2] if len(parts) > 2 else ''
            })
    return fixes


def count_errors_by_type(errors):
    """按类型统计错误"""
    counts = defaultdict(int)
    for e in errors:
        counts[e['type']] += 1
    return dict(counts)


def count_errors_by_label(errors):
    """按标签统计错误"""
    counts = defaultdict(int)
    for e in errors:
        counts[e['label']] += 1
    return dict(sorted(counts.items(), key=lambda x: -x[1]))


def analyze_snap(snap_file):
    """分析 snap 文件"""
    result = {
        'system': {},
        'lpar': {},
        'errors': [],
        'error_stats': {},
        'error_by_label': {},
        'disks': [],
        'network': [],
        'oslevel': '',
        'inittab': '',
        'filesystems': [],
        'adapt': [],
    }

    # 使用固定目录
    script_dir = os.path.dirname(os.path.abspath(snap_file))
    extract_dir = os.path.join(script_dir, '.snap_tmp')
    os.makedirs(extract_dir, exist_ok=True)

    # 清理旧数据
    import shutil
    for item in os.listdir(extract_dir):
        path = os.path.join(extract_dir, item)
        if os.path.isdir(path):
            shutil.rmtree(path, ignore_errors=True)
        else:
            os.remove(path)

    # 解压并提取
    extract_dir = decompress_and_extract(snap_file, extract_dir)

    # 查找 general 目录
    general_dir = None
    for root, dirs, files in os.walk(extract_dir):
        if 'errpt.out' in files:
            general_dir = root
            break

    if not general_dir:
        print("Error: Cannot find general directory in snap archive")
        return result, extract_dir

    # OS Level
    content = read_file(os.path.join(general_dir, 'oslevel.info'))
    if content:
        lines = [l.strip() for l in content.strip().split('\n') if l.strip()]
        result['oslevel'] = lines[0] if lines else ''
        result['oslevel_full'] = lines[1] if len(lines) > 1 else lines[0] if lines else ''

    # LPAR info
    content = read_file(os.path.join(general_dir, 'lparstat.out'))
    if content:
        result['lpar'] = parse_lparstat(content)

    # Error log
    content = read_file(os.path.join(general_dir, 'errpt.out'))
    if content:
        result['errors'] = parse_errpt(content)
        result['error_stats'] = count_errors_by_type(result['errors'])
        result['error_by_label'] = count_errors_by_label(result['errors'])

    # Disks
    for fname in ['lsdev.disk', 'lsdev.scsi', 'lsdev.adapter']:
        content = read_file(os.path.join(general_dir, fname))
        if content:
            devs = parse_lsdev(content)
            if fname == 'lsdev.disk':
                result['disks'] = devs
            elif fname == 'lsdev.adapter':
                result['adapt'] = devs

    # Inittab
    content = read_file(os.path.join(general_dir, 'inittab'))
    if content:
        result['inittab'] = content

    # Patches
    content = read_file(os.path.join(general_dir, 'instfix.i'))
    if content:
        result['patches'] = parse_instfix(content)

    return result, extract_dir


def severity_emoji(type_val):
    """返回错误类型的 emoji"""
    mapping = {
        'PERM': '🔴', 'TEMP': '🟠', 'PERF': '🟡', 'INFO': '🔵', 'UNKNOWN': '⚪'
    }
    return mapping.get(type_val, '⚪')


def generate_html(data, snap_name):
    """生成 HTML 报告"""
    now = datetime.now().strftime('%Y/%m/%d %H:%M:%S')
    lpar = data['lpar']

    # 错误统计
    error_stats = data.get('error_stats', {})
    error_by_label = data.get('error_by_label', {})
    errors = data.get('errors', [])
    perm_count = error_stats.get('PERM', 0)
    temp_count = error_stats.get('TEMP', 0)
    perf_count = error_stats.get('PERF', 0)
    info_count = error_stats.get('INFO', 0)
    total_errors = len(errors)

    # 磁盘统计
    disks = data.get('disks', [])
    disk_avail = sum(1 for d in disks if d['status'] == 'Available')
    disk_defined = sum(1 for d in disks if d['status'] == 'Defined')

    # 最近的错误
    recent_errors = errors[:30]

    # Top 错误标签
    top_labels = list(error_by_label.items())[:15]

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AIX Snap Analysis Report - {lpar.get('Node Name', 'Unknown')}</title>
<style>
body {{ margin: 0 auto; max-width: 1100px; font-family: 'Segoe UI', Arial, sans-serif; background: #f5f7fa; color: #333; padding: 20px; }}
h1 {{ font-size: 24px; text-align: center; color: #1a73e8; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }}
h2 {{ font-size: 18px; color: #1a73e8; border-left: 4px solid #1a73e8; padding-left: 10px; margin-top: 30px; }}
table {{ width: 100%; border-collapse: collapse; margin: 10px 0; }}
th, td {{ border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; font-size: 13px; }}
th {{ background: #e8f0fe; color: #1a73e8; font-weight: 600; }}
tr:nth-child(even) {{ background: #f8f9fa; }}
.info-label {{ font-weight: 600; width: 280px; background: #f1f3f4; }}
.stat-cards {{ display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0; }}
.stat-card {{ flex: 1; min-width: 180px; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); text-align: center; }}
.stat-card .number {{ font-size: 32px; font-weight: 700; }}
.stat-card .label {{ font-size: 13px; color: #666; margin-top: 4px; }}
.stat-card.warn .number {{ color: #e74c3c; }}
.stat-card.info .number {{ color: #3498db; }}
.stat-card.ok .number {{ color: #27ae60; }}
.stat-card.caution .number {{ color: #f39c12; }}
.severity-legend {{ display: flex; gap: 12px; margin: 8px 0; font-size: 13px; }}
.severity-legend span {{ display: flex; align-items: center; gap: 4px; }}
pre {{ background: #1e1e2e; color: #cdd6f4; padding: 12px; border-radius: 6px; font-size: 12px; max-height: 400px; overflow: auto; white-space: pre-wrap; word-break: break-all; }}
.header-meta {{ text-align: center; color: #666; font-size: 13px; margin-bottom: 20px; }}
.tag {{ display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }}
.tag-perm {{ background: #fde8e8; color: #c0392b; }}
.tag-temp {{ background: #fef3e2; color: #e67e22; }}
.tag-perf {{ background: #fef9e7; color: #f39c12; }}
.tag-info {{ background: #e8f4fd; color: #2980b9; }}
</style>
</head>
<body>
<h1>AIX System Snap Analysis Report</h1>
<div class="header-meta">
<p><b>Node:</b> {lpar.get('Node Name', '-')} | <b>Partition:</b> {lpar.get('Partition Name', '-')} | <b>OS:</b> {data.get('oslevel_full', data.get('oslevel', '-'))} | <b>Generated:</b> {now}</p>
</div>

<h2>System Information</h2>
<table>
  <tr><td class="info-label">Node Name</td><td>{lpar.get('Node Name', '-')}</td></tr>
  <tr><td class="info-label">Partition Name</td><td>{lpar.get('Partition Name', '-')}</td></tr>
  <tr><td class="info-label">Partition Number</td><td>{lpar.get('Partition Number', '-')}</td></tr>
  <tr><td class="info-label">Type</td><td>{lpar.get('Type', '-')}</td></tr>
  <tr><td class="info-label">Mode</td><td>{lpar.get('Mode', '-')}</td></tr>
  <tr><td class="info-label">Entitled Capacity</td><td>{lpar.get('Entitled Capacity', '-')} cores</td></tr>
  <tr><td class="info-label">Online Virtual CPUs</td><td>{lpar.get('Online Virtual CPUs', '-')}</td></tr>
  <tr><td class="info-label">Online Memory</td><td>{lpar.get('Online Memory', '-')}</td></tr>
  <tr><td class="info-label">Maximum Memory</td><td>{lpar.get('Maximum Memory', '-')}</td></tr>
  <tr><td class="info-label">AIX Level</td><td>{data.get('oslevel_full', data.get('oslevel', '-'))}</td></tr>
  <tr><td class="info-label">Physical CPU Percentage</td><td>{lpar.get('Physical CPU Percentage', '-')}</td></tr>
</table>

<h2>Error Log Summary</h2>
<div class="stat-cards">
  <div class="stat-card {"warn" if total_errors > 100 else "ok"}">
    <div class="number">{total_errors}</div>
    <div class="label">Total Events</div>
  </div>
  <div class="stat-card {"warn" if perm_count > 0 else "ok"}">
    <div class="number">{perm_count}</div>
    <div class="label">🔴 PERM (Permanent)</div>
  </div>
  <div class="stat-card {"caution" if temp_count > 0 else "ok"}">
    <div class="number">{temp_count}</div>
    <div class="label">🟠 TEMP (Temporary)</div>
  </div>
  <div class="stat-card {"caution" if perf_count > 0 else "ok"}">
    <div class="number">{perf_count}</div>
    <div class="label">🟡 PERF (Performance)</div>
  </div>
  <div class="stat-card info">
    <div class="number">{info_count}</div>
    <div class="label">🔵 INFO</div>
  </div>
</div>

<h2>Top Error Labels</h2>
<table>
<tr><th>#</th><th>Label</th><th>Count</th><th>Severity</th></tr>
"""
    for i, (label, count) in enumerate(top_labels, 1):
        # 找到该 label 的最高 severity
        types = set(e['type'] for e in errors if e['label'] == label)
        if 'PERM' in types:
            sev = '<span class="tag tag-perm">PERM</span>'
        elif 'TEMP' in types:
            sev = '<span class="tag tag-temp">TEMP</span>'
        elif 'PERF' in types:
            sev = '<span class="tag tag-perf">PERF</span>'
        else:
            sev = '<span class="tag tag-info">INFO</span>'
        html += f'<tr><td>{i}</td><td>{label}</td><td>{count}</td><td>{sev}</td></tr>\n'

    html += """</table>

<h2>Recent Error Events (Last 30)</h2>
<table>
<tr><th>Date/Time</th><th>Type</th><th>Label</th><th>Resource</th><th>Description</th></tr>
"""
    for e in recent_errors:
        html += f"""<tr>
  <td style="white-space:nowrap;">{e['date']}</td>
  <td>{severity_emoji(e['type'])} {e['type']}</td>
  <td><b>{e['label']}</b></td>
  <td>{e['resource']}</td>
  <td>{e['description']}</td>
</tr>\n"""

    html += """</table>

<h2>Disk Devices</h2>
<table>
<tr><th>Name</th><th>Status</th><th>Location</th><th>Description</th></tr>
"""
    for d in disks:
        status_cls = 'color: #27ae60;' if d['status'] == 'Available' else 'color: #e74c3c;'
        html += f'<tr><td>{d["name"]}</td><td style="{status_cls}">{d["status"]}</td><td>{d["location"]}</td><td>{d["description"]}</td></tr>\n'

    html += f"""</table>
<p><b>Disk Summary:</b> {disk_avail} Available, {disk_defined} Defined, {len(disks)} Total</p>

<hr style="margin-top:30px;">
<p style="text-align:center;color:#999;font-size:12px;">Generated by SHM AIX Snap Analyzer | {now}</p>
</body>
</html>"""
    return html


def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <snap_file.pax.Z> [output.html]")
        print(f"Example: {sys.argv[0]} 1snap.pax.Z report.html")
        sys.exit(1)

    snap_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else snap_file.rsplit('.', 2)[0] + '_report.html'

    if not os.path.exists(snap_file):
        print(f"Error: File not found: {snap_file}")
        sys.exit(1)

    print(f"Analyzing: {snap_file}")
    data, extract_dir = analyze_snap(snap_file)

    # Print summary
    lpar = data['lpar']
    print(f"\n=== Analysis Summary ===")
    print(f"Node: {lpar.get('Node Name', '-')}")
    print(f"Partition: {lpar.get('Partition Name', '-')}")
    print(f"AIX Level: {data.get('oslevel_full', data.get('oslevel', '-'))}")
    print(f"CPUs: {lpar.get('Online Virtual CPUs', '-')} VCPUs, {lpar.get('Entitled Capacity', '-')} Entitled")
    print(f"Memory: {lpar.get('Online Memory', '-')}")
    print(f"Total Error Events: {len(data.get('errors', []))}")
    error_stats = data.get('error_stats', {})
    print(f"  PERM: {error_stats.get('PERM', 0)}, TEMP: {error_stats.get('TEMP', 0)}, PERF: {error_stats.get('PERF', 0)}, INFO: {error_stats.get('INFO', 0)}")
    print(f"Disks: {len(data.get('disks', []))}")

    # Generate HTML
    html = generate_html(data, os.path.basename(snap_file))
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)

    # 清理解压的临时文件
    import shutil
    dirs_to_clean = set()
    dirs_to_clean.add(extract_dir)
    snap_items = ['general', 'other', 'pcixscsi', 'sissas', 'client_collect',
                  'vfc_client_collect', 'testcase', 'script.log']
    for d in [os.path.dirname(os.path.abspath(snap_file)), os.getcwd()]:
        for item in snap_items:
            path = os.path.join(d, item)
            if os.path.exists(path):
                dirs_to_clean.add(path)
        tmp = os.path.join(d, '.snap_tmp')
        if os.path.exists(tmp):
            dirs_to_clean.add(tmp)

    for d in dirs_to_clean:
        if not os.path.exists(d):
            continue
        try:
            shutil.rmtree(d)
        except Exception:
            # Windows 上 rmtree 可能失败，用 rmdir /s /q 强制删除
            win_path = d.replace('/', '\\')
            os.system(f'rmdir /s /q "{win_path}" 2>nul')

    print(f"\nReport generated: {output_file}")


if __name__ == '__main__':
    main()
