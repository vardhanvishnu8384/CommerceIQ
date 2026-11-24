
import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, Package, BrainCircuit,
  RefreshCw, ShoppingBag, IndianRupee, Receipt,
  TrendingUp, Sparkles
} from 'lucide-react';

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const money = n =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(n || 0);

const colors = ['#6d5dfc', '#17b890', '#ffad5c', '#ef6b83'];

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon"><Icon size={18} /></span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('Overview');

  const [data, setData] = useState(null);
  const [segments, setSegments] = useState({ segments: [], customers: [] });
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // NEW: Customer recommendations
  const [recommendations, setRecommendations] = useState({
    total_customers: 0,
    recommendations: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    recency_days: 30,
    frequency: 4,
    monetary: 8500,
    tenure_days: 240
  });

  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  async function load() {
    setLoading(true);
    setError('');

    try {
      const [d, s, p, m, r] = await Promise.all([
        fetch(`${API}/api/dashboard`),
        fetch(`${API}/api/segments`),
        fetch(`${API}/api/products`),
        fetch(`${API}/api/model/metrics`),
        fetch(`${API}/api/recommendations`)
      ]);

      if (!d.ok || !s.ok || !p.ok || !m.ok || !r.ok) {
        throw new Error('Could not load API data. Check the FastAPI server.');
      }

      setData(await d.json());
      setSegments(await s.json());
      setProducts(await p.json());
      setMetrics(await m.json());

      // Save recommendation data from backend
      setRecommendations(await r.json());

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function predict(e) {
    e.preventDefault();
    setPredicting(true);
    setPrediction(null);

    try {
      const r = await fetch(`${API}/api/predict/repeat-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          recency_days: +form.recency_days,
          frequency: +form.frequency,
          monetary: +form.monetary,
          tenure_days: +form.tenure_days
        })
      });

      if (!r.ok) throw new Error('Prediction request failed');

      setPrediction(await r.json());

    } catch (e) {
      setError(e.message);
    } finally {
      setPredicting(false);
    }
  }

  const nav = [
    ['Overview', LayoutDashboard],
    ['Customers', Users],
    ['Products', Package],
    ['Recommendations', Sparkles],
    ['ML Prediction', BrainCircuit]
  ];

  return (
    <div className="app-shell">

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">C</div>
          <div>
            <b>CommerceIQ</b>
            <small>INTELLIGENCE SUITE</small>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        {nav.map(([name, Icon]) => (
          <button
            key={name}
            className={`nav-item ${page === name ? 'active' : ''}`}
            onClick={() => setPage(name)}
          >
            <Icon size={18} />
            {name}
          </button>
        ))}

        <div className="side-bottom">
          <div className="avatar">VI</div>
          <div>
            <b>Demo Workspace</b>
            <small>Portfolio project</small>
          </div>
        </div>
      </aside>

      <main className="main">

        <header className="topbar">
          <div>
            <div className="eyebrow">ECOMMERCE ANALYTICS</div>
            <h1>{page}</h1>
          </div>

          <button className="refresh" onClick={load}>
            <RefreshCw size={16} />
            Refresh data
          </button>
        </header>

        {error && (
          <div className="error">
            {error}
            <button onClick={() => setError('')}>Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading your analytics...</div>
        ) : !data ? (
          <div className="empty">
            Start the backend server to view the dashboard.
          </div>
        ) : (
          <>

            {/* OVERVIEW PAGE */}
            {page === 'Overview' && (
              <>
                <div className="welcome">
                  <div>
                    <span className="pill">LIVE DEMO DATA</span>
                    <h2>Good insights start with good data.</h2>
                    <p>Here’s what’s happening across your store.</p>
                  </div>
                  <div className="welcome-art">
                    <TrendingUp size={48} />
                  </div>
                </div>

                <div className="stats-grid">
                  <Stat
                    icon={IndianRupee}
                    label="Total revenue"
                    value={money(data.revenue)}
                    sub="Across all recorded orders"
                  />

                  <Stat
                    icon={ShoppingBag}
                    label="Total orders"
                    value={data.orders.toLocaleString('en-IN')}
                    sub="Completed demo orders"
                  />

                  <Stat
                    icon={Users}
                    label="Customers"
                    value={data.customers.toLocaleString('en-IN')}
                    sub="Unique customers"
                  />

                  <Stat
                    icon={Receipt}
                    label="Average order value"
                    value={money(data.average_order_value)}
                    sub="Revenue per order"
                  />
                </div>

                <div className="charts-grid">

                  <section className="panel wide">
                    <div className="panel-head">
                      <div>
                        <h3>Revenue overview</h3>
                        <p>Monthly sales performance</p>
                      </div>
                      <span className="mini-tag">INR</span>
                    </div>

                    <div className="chart">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.monthly_sales}>
                          <defs>
                            <linearGradient
                              id="fillRevenue"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#6d5dfc"
                                stopOpacity={0.25}
                              />
                              <stop
                                offset="100%"
                                stopColor="#6d5dfc"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#edf0f5"
                          />

                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            tick={{ fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={v => `₹${Math.round(v / 1000)}k`}
                          />

                          <Tooltip formatter={v => money(v)} />

                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#6d5dfc"
                            strokeWidth={3}
                            fill="url(#fillRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </section>

                  <section className="panel">
                    <div className="panel-head">
                      <div>
                        <h3>Customer segments</h3>
                        <p>RFM-based groups</p>
                      </div>
                    </div>

                    <div className="donut-wrap">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={segments.segments}
                            dataKey="customers"
                            nameKey="segment"
                            innerRadius={58}
                            outerRadius={83}
                            paddingAngle={4}
                          >
                            {segments.segments.map((x, i) => (
                              <Cell
                                key={x.segment}
                                fill={colors[i % colors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="legend">
                      {segments.segments.map((s, i) => (
                        <div key={s.segment}>
                          <span>
                            <i style={{ background: colors[i % colors.length] }} />
                            {s.segment}
                          </span>
                          <b>{s.customers}</b>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h3>Top products</h3>
                      <p>Ranked by sales revenue</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setPage('Products')}
                    >
                      View all →
                    </button>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>PRODUCT</th>
                          <th>REVENUE</th>
                          <th>UNITS SOLD</th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.top_products.map((p, i) => (
                          <tr key={p.product}>
                            <td>
                              <span className="product-dot">{i + 1}</span>
                              {p.product}
                            </td>
                            <td>{money(p.revenue)}</td>
                            <td>{p.units}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}

            {/* CUSTOMERS PAGE */}
            {page === 'Customers' && (
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h3>Customer intelligence</h3>
                    <p>Customer value and RFM segmentation</p>
                  </div>
                </div>

                <div className="segment-cards">
                  {segments.segments.map((s, i) => (
                    <div className="segment-card" key={s.segment}>
                      <span
                        className="segment-dot"
                        style={{ background: colors[i % colors.length] }}
                      />
                      <b>{s.segment}</b>
                      <strong>{s.customers}</strong>
                      <small>customers</small>
                    </div>
                  ))}
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>CUSTOMER</th>
                        <th>SEGMENT</th>
                        <th>RECENCY</th>
                        <th>ORDERS</th>
                        <th>SPEND</th>
                      </tr>
                    </thead>

                    <tbody>
                      {segments.customers.map(c => (
                        <tr key={c.customer_id}>
                          <td>
                            <b>{c.name}</b>
                            <small className="sub-cell">{c.customer_id}</small>
                          </td>
                          <td><span className="status">{c.segment}</span></td>
                          <td>{c.recency_days} days</td>
                          <td>{c.frequency}</td>
                          <td>{money(c.monetary)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* PRODUCTS PAGE */}
            {page === 'Products' && (
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h3>Product performance</h3>
                    <p>Revenue, units sold and order count</p>
                  </div>
                </div>

                <div className="chart product-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={products}
                      layout="vertical"
                      margin={{ left: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        tickFormatter={v => `₹${Math.round(v / 1000)}k`}
                      />

                      <YAxis
                        type="category"
                        dataKey="product"
                        width={125}
                        tick={{ fontSize: 11 }}
                      />

                      <Tooltip formatter={v => money(v)} />

                      <Bar
                        dataKey="revenue"
                        fill="#6d5dfc"
                        radius={[0, 7, 7, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>PRODUCT</th>
                        <th>CATEGORY</th>
                        <th>REVENUE</th>
                        <th>UNITS</th>
                        <th>ORDERS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.map(p => (
                        <tr key={p.product}>
                          <td>{p.product}</td>
                          <td>{p.category}</td>
                          <td>{money(p.revenue)}</td>
                          <td>{p.units}</td>
                          <td>{p.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* NEW: RECOMMENDATIONS PAGE */}
            {page === 'Recommendations' && (
              <section className="panel">

                <div className="panel-head">
                  <div>
                    <h3>Customer business recommendations</h3>
                    <p>
                      Suggested actions based on customer purchase behaviour
                    </p>
                  </div>
                  <Sparkles color="#6d5dfc" />
                </div>

                <div className="stats-grid">
                  <Stat
                    icon={Users}
                    label="Customers analysed"
                    value={recommendations.total_customers}
                    sub="Customers with recorded orders"
                  />
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>CUSTOMER ID</th>
                        <th>CUSTOMER SEGMENT</th>
                        <th>RECOMMENDED BUSINESS ACTION</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recommendations.recommendations.map(item => (
                        <tr key={item.customer_id}>
                          <td><b>{item.customer_id}</b></td>
                          <td>
                            <span className="status">{item.segment}</span>
                          </td>
                          <td>{item.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {recommendations.recommendations.length === 0 && (
                  <p className="muted">
                    No customer recommendations are available.
                  </p>
                )}

                <div className="notice">
                  Recommendations are generated using rule-based customer
                  segmentation and purchase history.
                </div>

              </section>
            )}

            {/* ML PREDICTION PAGE */}
            {page === 'ML Prediction' && (
              <div className="ml-layout">

                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <h3>Repeat-purchase predictor</h3>
                      <p>
                        Estimate the likelihood that a customer purchases again
                      </p>
                    </div>
                    <BrainCircuit color="#6d5dfc" />
                  </div>

                  <form className="predict-form" onSubmit={predict}>
                    {[
                      ['recency_days', 'Days since last order'],
                      ['frequency', 'Number of previous orders'],
                      ['monetary', 'Total customer spend (₹)'],
                      ['tenure_days', 'Customer age (days)']
                    ].map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <input
                          type="number"
                          min="0"
                          required
                          value={form[key]}
                          onChange={e =>
                            setForm({ ...form, [key]: e.target.value })
                          }
                        />
                      </label>
                    ))}

                    <button className="primary" disabled={predicting}>
                      {predicting ? 'Predicting...' : 'Run prediction'}
                    </button>
                  </form>

                  {prediction && (
                    <div className="prediction">
                      <span className="pill">MODEL RESULT</span>
                      <h2>
                        {(prediction.repeat_purchase_probability * 100).toFixed(1)}%
                      </h2>
                      <b>{prediction.prediction} to purchase again</b>
                      <p>{prediction.note}</p>
                    </div>
                  )}
                </section>

                <section className="panel model-panel">
                  <h3>Model information</h3>
                  <p className="muted">Random Forest classifier</p>

                  {metrics && (
                    <div className="metric-list">
                      {[
                        ['Accuracy', metrics.accuracy],
                        ['Precision', metrics.precision],
                        ['Recall', metrics.recall],
                        ['F1 score', metrics.f1_score],
                        ['ROC-AUC', metrics.roc_auc ?? 'N/A']
                      ].map(([k, v]) => (
                        <div key={k}>
                          <span>{k}</span>
                          <b>
                            {typeof v === 'number'
                              ? (v * 100).toFixed(1) + '%'
                              : v}
                          </b>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="notice">
                    These metrics use a synthetic demonstration dataset.
                    They are not evidence of real-world business performance.
                  </div>
                </section>

              </div>
            )}

          </>
        )}

        <footer>
          CommerceIQ · Built with React, FastAPI, SQLAlchemy & Scikit-learn
          <span>Demo dataset · INR</span>
        </footer>

      </main>
    </div>
  );
}

export default App;
