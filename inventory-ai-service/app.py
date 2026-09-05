from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from sklearn.linear_model import LinearRegression
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta # <--- Make sure this is imported

app = Flask(__name__)
CORS(app)

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb+srv://MbarathProject:Mbarath123@barathm.bj8jc.mongodb.net/inventory_db?retryWrites=true&w=majority&appName=barath')
client = MongoClient(MONGO_URI)
db = client['inventory_db']
transactions_collection = db['transactions']

def get_forecast(product_id):
    # 1. Fetch historical sales
    query = { "productId": product_id, "type": "SALE" }
    sales_data = list(transactions_collection.find(query))

    if not sales_data or len(sales_data) < 2:
        return {"total_forecast": 0, "trend_data": []}

    # 2. Process Data
    df = pd.DataFrame(sales_data)
    # Ensure we are working with datetime objects
    df['date'] = pd.to_datetime(df['timestamp']).dt.date
    
    daily_sales = df.groupby('date')['quantity'].sum().reset_index()
    
    if len(daily_sales) < 2:
        return {"total_forecast": 0, "trend_data": []}

    daily_sales = daily_sales.sort_values(by='date')
    
    # --- CRITICAL FIX START ---
    # Define the timeline based on the very first sale
    first_day = daily_sales['date'].min()
    
    # Calculate day numbers for history
    daily_sales['day_number'] = (daily_sales['date'] - first_day).apply(lambda x: x.days)

    X = daily_sales[['day_number']]
    y = daily_sales['quantity']

    model = LinearRegression()
    model.fit(X, y)

    # Calculate where "Today" is on the timeline
    today = datetime.now().date()
    current_day_number = (today - first_day).days
    
    # We want to predict Tomorrow (current + 1) to Next Week (current + 7)
    # This ensures the forecast is always in the FUTURE, not stuck at the last sale date.
    future_days = np.array(range(current_day_number + 1, current_day_number + 8)).reshape(-1, 1)
    
    predicted_sales = model.predict(future_days)
    
    # Remove negative predictions (sales can't be negative)
    predicted_sales[predicted_sales < 0] = 0
    total_forecast = int(np.ceil(np.sum(predicted_sales))) # Use ceil to be safe on stock
    # --- CRITICAL FIX END ---

    # 3. Prepare Chart Data
    chart_data = []

    # Add History
    for _, row in daily_sales.iterrows():
        chart_data.append({
            "date": row['date'].strftime('%Y-%m-%d'),
            "Sales": row['quantity'],   # Capital 'S' for consistency
            "Forecast": None            # History has no forecast value
        })

    # Add Forecast
    future_dates = [(first_day + timedelta(days=int(day))) for day in future_days.flatten()]
    
    for i, date in enumerate(future_dates):
        chart_data.append({
            "date": date.strftime('%Y-%m-%d'),
            "Sales": None,              # Future has no actual sales yet
            "Forecast": round(predicted_sales[i], 1) # Add forecast value
        })

    return {"total_forecast": total_forecast, "trend_data": chart_data}

# ... (Rest of your endpoint code remains the same)
@app.route('/forecast', methods=['POST'])
def forecast_product():
    try:
        data = request.get_json()
        product_id = data.get('productId')
        if not product_id: return jsonify({"error": "productId is required"}), 400
        return jsonify(get_forecast(product_id)), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)