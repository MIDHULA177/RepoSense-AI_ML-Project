import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import streamlit as st

from analyzer.github_fetch import fetch_repo_info, cleanup_repo
from analyzer.parser import parse_repository
from analyzer.metrics import extract_git_metrics, merge_metrics
from ml.predict import predict_risk, generate_insights
from utils.health import calculate_health
from utils.report import export_csv, export_pdf
from app.dashboard import (
    render_repo_overview,
    render_language_chart,
    render_risk_distribution,
    render_file_size_distribution,
    render_risk_scatter,
    render_health_score,
    render_predictions_table,
    render_ai_insights,
)

st.set_page_config(
    page_title="RepoSense AI",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded",
)


def main():
    st.title("🔍 RepoSense AI")
    st.caption("Intelligent Software Repository Analyzer using Machine Learning")

    with st.sidebar:
        st.header("⚙️ Settings")
        github_token = st.text_input("GitHub Token (optional)", type="password",
                                     help="Increases API rate limit from 60 to 5000 req/hr")
        st.markdown("---")
        st.markdown("**How it works:**")
        st.markdown("1. Enter a public GitHub URL\n2. Click Analyze\n3. View ML predictions & health score")

    st.markdown("### Enter Repository URL")
    col1, col2 = st.columns([4, 1])
    with col1:
        repo_url = st.text_input("", placeholder="https://github.com/owner/repository", label_visibility="collapsed")
    with col2:
        analyze_btn = st.button("🚀 Analyze", use_container_width=True, type="primary")

    if not analyze_btn or not repo_url.strip():
        st.info("Enter a public GitHub repository URL and click Analyze to get started.")
        return

    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml", "model.pkl")
    if not os.path.exists(model_path):
        st.error("⚠️ ML model not found. Please run `python ml/train.py --data data/defects.csv` first.")
        return

    repo_info = None
    try:
        with st.spinner("📥 Cloning repository..."):
            repo_info = fetch_repo_info(repo_url.strip(), github_token or None)

        with st.spinner("🔍 Parsing source files..."):
            file_metrics = parse_repository(repo_info.local_path)

        with st.spinner("📊 Extracting git history..."):
            git_metrics = extract_git_metrics(repo_info.local_path)
            merged = merge_metrics(repo_info.local_path, file_metrics, git_metrics)

        with st.spinner("🤖 Running ML predictions..."):
            predictions = predict_risk(merged)

        health = calculate_health(repo_info, predictions)

        tab1, tab2, tab3, tab4 = st.tabs(["📋 Overview", "📊 Visualizations", "🎯 ML Predictions", "📄 Report"])

        with tab1:
            render_repo_overview(repo_info)
            st.markdown("---")
            render_health_score(health)

        with tab2:
            col_l, col_r = st.columns(2)
            with col_l:
                render_language_chart(repo_info)
                render_file_size_distribution(predictions)
            with col_r:
                render_risk_distribution(predictions)
                render_risk_scatter(predictions)

        with tab3:
            render_ai_insights(predictions, generate_insights)
            st.markdown("---")
            render_predictions_table(predictions)

        with tab4:
            st.subheader("Download Report")
            col_a, col_b = st.columns(2)
            with col_a:
                if st.button("📥 Export CSV"):
                    path = export_csv(predictions)
                    with open(path, "rb") as f:
                        st.download_button("Download CSV", f, file_name=os.path.basename(path), mime="text/csv")
            with col_b:
                if st.button("📄 Export PDF"):
                    path = export_pdf(repo_info, health, predictions)
                    with open(path, "rb") as f:
                        st.download_button("Download PDF", f, file_name=os.path.basename(path), mime="application/pdf")

    except ValueError as e:
        st.error(f"❌ Invalid URL: {e}")
    except Exception as e:
        st.error(f"❌ Error: {e}")
    finally:
        if repo_info:
            cleanup_repo(repo_info)


if __name__ == "__main__":
    main()
