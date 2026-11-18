import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st


def render_repo_overview(repo_info):
    st.subheader("Repository Overview")
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("⭐ Stars", repo_info.stars)
    c2.metric("🍴 Forks", repo_info.forks)
    c3.metric("👥 Contributors", repo_info.contributors)
    c4.metric("📝 Commits", repo_info.total_commits)
    c5.metric("🐛 Open Issues", repo_info.open_issues)

    st.caption(f"**{repo_info.owner}/{repo_info.name}** · Created: {repo_info.created_at} · Updated: {repo_info.updated_at}")
    if repo_info.description:
        st.info(repo_info.description)


def render_language_chart(repo_info):
    if not repo_info.languages:
        return
    df = pd.DataFrame(list(repo_info.languages.items()), columns=["Language", "Bytes"])
    fig = px.pie(df, names="Language", values="Bytes", title="Language Distribution", hole=0.4)
    fig.update_traces(textposition="inside", textinfo="percent+label")
    st.plotly_chart(fig, use_container_width=True)


def render_risk_distribution(predictions: list[dict]):
    if not predictions:
        return
    df = pd.DataFrame(predictions)
    counts = df["risk_level"].value_counts().reset_index()
    counts.columns = ["Risk Level", "Count"]
    color_map = {"High": "#e74c3c", "Medium": "#f39c12", "Low": "#2ecc71"}
    fig = px.bar(counts, x="Risk Level", y="Count", color="Risk Level",
                 color_discrete_map=color_map, title="File Risk Distribution")
    st.plotly_chart(fig, use_container_width=True)


def render_file_size_distribution(predictions: list[dict]):
    if not predictions:
        return
    df = pd.DataFrame(predictions)
    fig = px.histogram(df, x="loc", nbins=30, title="File Size Distribution (LOC)",
                       color_discrete_sequence=["#3498db"])
    fig.update_layout(xaxis_title="Lines of Code", yaxis_title="File Count")
    st.plotly_chart(fig, use_container_width=True)


def render_risk_scatter(predictions: list[dict]):
    if not predictions:
        return
    df = pd.DataFrame(predictions)
    color_map = {"High": "#e74c3c", "Medium": "#f39c12", "Low": "#2ecc71"}
    fig = px.scatter(
        df, x="loc", y="avg_complexity", color="risk_level",
        color_discrete_map=color_map,
        hover_data=["file_path", "bug_probability"],
        title="LOC vs Complexity (colored by Risk)",
        labels={"loc": "Lines of Code", "avg_complexity": "Avg Complexity"},
    )
    st.plotly_chart(fig, use_container_width=True)


def render_health_score(health):
    st.subheader("Repository Health Score")
    color = "#2ecc71" if health.total >= 70 else "#f39c12" if health.total >= 50 else "#e74c3c"

    fig = go.Figure(go.Indicator(
        mode="gauge+number",
        value=health.total,
        title={"text": health.grade},
        gauge={
            "axis": {"range": [0, 100]},
            "bar": {"color": color},
            "steps": [
                {"range": [0, 50], "color": "#fadbd8"},
                {"range": [50, 70], "color": "#fdebd0"},
                {"range": [70, 100], "color": "#d5f5e3"},
            ],
        },
    ))
    fig.update_layout(height=280)
    st.plotly_chart(fig, use_container_width=True)

    cols = st.columns(len(health.badges))
    for col, badge in zip(cols, health.badges):
        icon = "✅" if badge["ok"] else "⚠️"
        col.markdown(f"{icon} {badge['label']}")


def render_predictions_table(predictions: list[dict]):
    if not predictions:
        st.warning("No predictions available.")
        return

    df = pd.DataFrame(predictions)
    display_cols = ["file_path", "risk_level", "bug_probability", "loc", "avg_complexity",
                    "commit_count", "churn", "contributor_count"]
    display_cols = [c for c in display_cols if c in df.columns]

    for risk, color in [("High", "#e74c3c"), ("Medium", "#f39c12"), ("Low", "#2ecc71")]:
        subset = df[df["risk_level"] == risk][display_cols]
        if not subset.empty:
            st.markdown(f"#### {risk} Risk Files ({len(subset)})")
            st.dataframe(subset.reset_index(drop=True), use_container_width=True)


def render_ai_insights(predictions: list[dict], insight_fn):
    st.subheader("🤖 AI Insights")
    high_risk = [p for p in predictions if p["risk_level"] == "High"][:5]
    if not high_risk:
        st.success("No high-risk files detected. Repository looks healthy!")
        return
    for p in high_risk:
        st.warning(insight_fn(p))
