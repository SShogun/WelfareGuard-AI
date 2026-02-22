import streamlit as st
import pandas as pd
import requests

st.set_page_config(page_title="WelfareGuard AI Dashboard", layout="wide")

st.title("WelfareGuard AI - Bureaucrat Dashboard")
st.markdown("Anti-spoofing and cross-verification engine for government scheme applications.")

@st.cache_data(ttl=5)
def fetch_data():
    try:
        response = requests.get("http://127.0.0.1:8000/api/applications")
        if response.status_code == 200:
            return response.json()
        return []
    except:
        return []

data = fetch_data()

if not data:
    st.info("No applications found or backend is unreachable.")
else:
    df = pd.DataFrame(data)
    df = df.sort_values(by="fraud_probability_score", ascending=False).reset_index(drop=True)
    
    st.markdown("### High-Risk Applications")
    
    # Filter only applications with a score > 0
    high_risk_df = df[df['fraud_probability_score'] > 0]
    
    if high_risk_df.empty:
        st.success("No high-risk applications detected.")
    else:
        for idx, row in high_risk_df.iterrows():
            with st.expander(f"Applicant: {row['name']} | Aadhaar: {row['aadhaar_id']} | Score: {row['fraud_probability_score']}/100"):
                st.markdown(f"**Stated Income:** {row['stated_income']}")
                st.markdown(f"**Bank Account:** {row['bank_account']}")
                st.markdown(f"**Vehicle Registration:** {row['rto_vehicle_reg_number']}")
                st.markdown(f"**Flag Reason:** {row['flag_reason']}")
                
        st.markdown("### Live Data Table")
        
        def highlight_fraud(row):
            score = row['fraud_probability_score']
            if score >= 80:
                return ['background-color: #ffcccc; color: #990000'] * len(row)
            elif score >= 40:
                return ['background-color: #ffe6cc; color: #b35900'] * len(row)
            else:
                return [''] * len(row)
                
        cols_to_show = ['aadhaar_id', 'name', 'stated_income', 'bank_account', 'rto_vehicle_reg_number', 'fraud_probability_score', 'flag_reason']
        display_df = df[cols_to_show]
        
        st.dataframe(
            display_df.style.apply(highlight_fraud, axis=1),
            use_container_width=True,
            hide_index=True
        )
