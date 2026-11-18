import os
from datetime import datetime

import pandas as pd
from fpdf import FPDF


def export_csv(predictions: list[dict], output_dir: str = "reports") -> str:
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv")
    pd.DataFrame(predictions).to_csv(path, index=False)
    return path


def export_pdf(repo_info, health, predictions: list[dict], output_dir: str = "reports") -> str:
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, f"RepoSense AI Report: {repo_info.name}", ln=True)

    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 8, f"Owner: {repo_info.owner}  |  Stars: {repo_info.stars}  |  Forks: {repo_info.forks}", ln=True)
    pdf.cell(0, 8, f"Health Score: {health.total}/100 ({health.grade})", ln=True)
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, "Health Breakdown", ln=True)
    pdf.set_font("Helvetica", "", 11)
    for key, val in health.breakdown.items():
        pdf.cell(0, 7, f"  {key}: {val}", ln=True)
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 8, "High Risk Files", ln=True)
    pdf.set_font("Helvetica", "", 10)
    high_risk = [p for p in predictions if p["risk_level"] == "High"][:20]
    for p in high_risk:
        pdf.cell(0, 6, f"  {p['file_path']}  (prob: {p['bug_probability']:.2f})", ln=True)

    pdf.output(path)
    return path
