import sys
import os
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # 无头模式，不弹窗
import matplotlib.pyplot as plt
import io
import base64

# -------------------------- 参数 --------------------------
csv_file_path = sys.argv[1] if len(sys.argv) > 1 else ''
output_html_path = sys.argv[2] if len(sys.argv) > 2 else 'result.html'

if not csv_file_path or not os.path.exists(csv_file_path):
    print("Error: CSV file not found")
    sys.exit(1)

# -------------------------- 核心工具函数 --------------------------
def excel_col_to_index(col_str):
    col_str = col_str.strip().upper()
    index = 0
    for char in col_str:
        if not char.isalpha():
            raise ValueError(f"Invalid column: {col_str}")
        index = index * 26 + (ord(char) - ord('A') + 1)
    return index - 1

# -------------------------- 配置 --------------------------
group_col_str = "B"
group_column_name = "IO Group"
time_col_str = "C"
time_column_name = "Time"
indicator_col_str_list = ["BB"]
indicator_column_name_list = ["CPU Utilization (%)"]

reference_lines = [
    {"value": 30, "color": "red", "linestyle": "--", "linewidth": 1, "label": "30% Threshold"},
    {"value": 60, "color": "orange", "linestyle": "--", "linewidth": 1, "label": "60% Warning"},
    {"value": 80, "color": "black", "linestyle": "--", "linewidth": 1, "label": "80% Saturation"}
]

group_config = {
    "io_grp0": {"color": "#2E86AB", "marker": "o", "label_suffix": "io_grp0"},
    "io_grp1": {"color": "#A23B72", "marker": "s", "label_suffix": "io_grp1"}
}

# 转换列索引
try:
    group_col = excel_col_to_index(group_col_str)
    time_col = excel_col_to_index(time_col_str)
    indicator_col_index_list = [excel_col_to_index(col_str) for col_str in indicator_col_str_list]
except ValueError as e:
    print(f"Column error: {e}")
    sys.exit(1)

# -------------------------- 读取数据 --------------------------
def load_data(file_path):
    try:
        usecols_list = [group_col, time_col] + indicator_col_index_list
        df = pd.read_csv(file_path, usecols=usecols_list, encoding='utf-8')
        df.columns = [group_column_name, time_column_name] + indicator_column_name_list

        df = df.dropna(subset=[group_column_name])
        valid_groups = list(group_config.keys())
        df = df[df[group_column_name].isin(valid_groups)]
        if df.empty:
            return None

        df = df.dropna(subset=[time_column_name])
        df[time_column_name] = pd.to_datetime(df[time_column_name], errors='coerce')
        df = df.dropna(subset=[time_column_name])

        for col in indicator_column_name_list:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            df = df.dropna(subset=[col])

        return df
    except Exception as e:
        print(f"Error: {e}")
        return None

# -------------------------- 生成图表（base64） --------------------------
def plot_to_base64(df):
    plt.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False

    fig, ax = plt.subplots(figsize=(14, 6))

    indicator_col = indicator_column_name_list[0]
    for group in df[group_column_name].unique():
        group_data = df[df[group_column_name] == group]
        config = group_config.get(group, {"color": "#999", "marker": "o", "label_suffix": group})
        ax.plot(
            group_data[time_column_name], group_data[indicator_col],
            color=config["color"], linewidth=1.8, marker=config["marker"],
            markersize=4, label=f"{indicator_col}-{config['label_suffix']}"
        )

    for line in reference_lines:
        ax.axhline(y=line["value"], color=line["color"], linestyle=line["linestyle"],
                    linewidth=line["linewidth"], label=line["label"], alpha=0.8)

    ax.set_title('SVC I/O Group CPU Performance', fontsize=16, pad=15)
    ax.set_xlabel(time_column_name, fontsize=12)
    ax.set_ylabel(indicator_col, fontsize=12)
    ax.tick_params(axis='x', rotation=45)
    ax.grid(True, alpha=0.3, linestyle='--')
    ax.legend(loc='upper right', fontsize=9)
    fig.tight_layout()

    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=150, bbox_inches='tight')
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')

# -------------------------- 生成统计表格 --------------------------
def generate_stats_table(df):
    indicator_col = indicator_column_name_list[0]
    rows = []
    for group in df[group_column_name].unique():
        g = df[df[group_column_name] == group]
        rows.append({
            'group': group,
            'min': f"{g[indicator_col].min():.2f}",
            'max': f"{g[indicator_col].max():.2f}",
            'avg': f"{g[indicator_col].mean():.2f}",
            'count': len(g)
        })

    html = '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;">'
    html += '<tr style="background:#f0f2f5;"><th>IO Group</th><th>Min(%)</th><th>Max(%)</th><th>Avg(%)</th><th>Samples</th></tr>'
    for r in rows:
        html += f'<tr><td>{r["group"]}</td><td>{r["min"]}</td><td>{r["max"]}</td><td>{r["avg"]}</td><td>{r["count"]}</td></tr>'
    html += '</table>'
    return html

# -------------------------- 生成 HTML 报告 --------------------------
def generate_html(df, chart_b64):
    time_min = df[time_column_name].min().strftime('%Y-%m-%d %H:%M')
    time_max = df[time_column_name].max().strftime('%Y-%m-%d %H:%M')
    groups = ', '.join(df[group_column_name].unique())

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>SVC IO Group Performance Report</title>
<style>
body {{ font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: #f8f9fa; color: #333; }}
h1 {{ color: #1a73e8; border-bottom: 3px solid #1a73e8; padding-bottom: 10px; }}
h2 {{ color: #1a73e8; border-left: 4px solid #1a73e8; padding-left: 10px; margin-top: 30px; }}
table {{ border-collapse: collapse; width: 100%; margin: 10px 0; }}
th, td {{ border: 1px solid #dee2e6; padding: 8px 12px; text-align: left; font-size: 13px; }}
th {{ background: #e8f0fe; color: #1a73e8; }}
.info {{ background: #fff; padding: 16px; border-radius: 8px; margin: 10px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
.chart {{ text-align: center; margin: 20px 0; }}
.chart img {{ max-width: 100%; border: 1px solid #dee2e6; border-radius: 8px; }}
</style></head><body>
<h1>SVC I/O Group Performance Report</h1>
<div class="info">
<p><b>Data File:</b> {os.path.basename(csv_file_path)}</p>
<p><b>Time Range:</b> {time_min} ~ {time_max}</p>
<p><b>IO Groups:</b> {groups}</p>
<p><b>Total Samples:</b> {len(df)}</p>
</div>

<h2>CPU Utilization Trend</h2>
<div class="chart"><img src="data:image/png;base64,{chart_b64}" /></div>

<h2>Statistics Summary</h2>
{generate_stats_table(df)}

<h2>Reference Lines</h2>
<table>
<tr><th>Line</th><th>Value</th><th>Meaning</th></tr>
<tr><td style="color:red;">30% Threshold</td><td>30%</td><td>Normal range boundary</td></tr>
<tr><td style="color:orange;">60% Warning</td><td>60%</td><td>Warning level, attention needed</td></tr>
<tr><td>80% Saturation</td><td>80%</td><td>Critical level, immediate action required</td></tr>
</table>

<hr/>
<p style="text-align:center;color:#999;font-size:12px;">Generated by SHM Analytical Tool</p>
</body></html>"""
    return html

# -------------------------- 主函数 --------------------------
if __name__ == "__main__":
    df = load_data(csv_file_path)
    if df is None or df.empty:
        print("Error: No valid data found")
        sys.exit(1)

    chart_b64 = plot_to_base64(df)
    html = generate_html(df, chart_b64)

    with open(output_html_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(html)
