import React, { useMemo, useState } from 'react'

const TABS = ['Home', 'Calculators', 'MyPlan', 'NewTech', 'Profile']

const upgrades = [
  {
    id: 'LED',
    name: 'LED lighting swap',
    category: 'Lighting',
    payback: '6-12 months',
    saving: '£55-£120/yr',
    featured: true,
    summary: 'Replace halogen bulbs with LED fittings to cut energy use fast.'
  },
  {
    id: 'SMART_PLUG',
    name: 'Smart plug timers',
    category: 'Power',
    payback: '12-18 months',
    saving: '£30-£70/yr',
    featured: true,
    summary: 'Kill standby power on media and kitchen devices with schedules.'
  },
  {
    id: 'DRAUGHT',
    name: 'Draught proofing',
    category: 'Insulation',
    payback: '1-2 years',
    saving: '£60-£90/yr',
    featured: false,
    summary: 'Seal gaps around windows and doors to keep heat inside.'
  }
]

const newTech = [
  {
    id: 'THERMAL_STORAGE',
    name: 'Thermal battery tiles',
    category: 'Energy storage',
    status: 'Early adopter',
    verdict: 'Worth watching',
    summary: 'Store off-peak electricity as heat for evening comfort.'
  },
  {
    id: 'HEAT_PUMP',
    name: 'Compact air-source heat pump',
    category: 'Heating',
    status: 'Available now',
    verdict: 'Recommended',
    summary: 'Lower running costs for well-insulated homes.'
  },
  {
    id: 'SMART_GLASS',
    name: 'Electrochromic smart glass',
    category: 'Materials',
    status: 'Not ready',
    verdict: 'Too early',
    summary: 'Tint-on-demand windows that manage solar gain.'
  }
]

const planItems = [
  {
    id: 'PLAN-1',
    name: 'LED lighting swap',
    status: 'Planned',
    target: 'May 2024'
  },
  {
    id: 'PLAN-2',
    name: 'Smart plug timers',
    status: 'In Progress',
    target: 'April 2024'
  }
]

const calculators = [
  {
    id: 'LED',
    label: 'LED Savings Calculator',
    description: 'Estimate savings from replacing bulbs.'
  },
  {
    id: 'SMART_PLUG',
    label: 'Smart Plug Savings Calculator',
    description: 'Measure standby power savings.'
  }
]

const kpis = [
  { label: 'Estimated savings', value: '£82 - £140 / yr' },
  { label: 'Payback', value: '10 months' },
  { label: '10-year outlook', value: '£820 - £1,400' }
]

const userProfile = {
  electricity_price_p_kwh: 28,
  home_size: 'Medium',
  usage_level: 'Average',
  reminders_enabled: true,
  reminder_day: 'Mon',
  reminder_time: '18:00'
}

function Header({ title, subtitle }) {
  return (
    <header className="header">
      <div>
        <p className="eyebrow">Eco-Nest Living</p>
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      <div className="badge">UK • GBP</div>
    </header>
  )
}

function HomeScreen({ onNavigate }) {
  return (
    <div className="screen">
      <Header
        title="Smarter eco upgrades — with numbers you can trust"
        subtitle="Personalised advice, quick calculators, and future-tech insight in one place."
      />
      <button className="primary" onClick={() => onNavigate('Calculators')}>
        Try a calculator
      </button>
      <section>
        <h2>Featured upgrades</h2>
        <div className="cards">
          {upgrades
            .filter((item) => item.featured)
            .map((item) => (
              <article className="card" key={item.id}>
                <div className="card-top">
                  <span className="tag">{item.category}</span>
                  <span className="chip">{item.payback}</span>
                </div>
                <h3>{item.name}</h3>
                <p>{item.summary}</p>
                <div className="card-meta">Typical saving: {item.saving}</div>
              </article>
            ))}
        </div>
      </section>
      <section>
        <h2>New technology watchlist</h2>
        <div className="list">
          {newTech.map((item) => (
            <div className="list-item" key={item.id}>
              <div>
                <h3>{item.name}</h3>
                <p>{item.summary}</p>
              </div>
              <div className="status">
                <span className="tag">{item.status}</span>
                <span className="chip">{item.verdict}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function CalculatorsScreen() {
  return (
    <div className="screen">
      <Header title="Savings calculators" subtitle="Crunch the numbers in under 60 seconds." />
      <div className="cards">
        {calculators.map((calc) => (
          <article className="card" key={calc.id}>
            <h3>{calc.label}</h3>
            <p>{calc.description}</p>
            <button className="secondary">Start calculation</button>
          </article>
        ))}
      </div>
      <section>
        <h2>Recent results</h2>
        <div className="kpi-grid">
          {kpis.map((kpi) => (
            <div className="kpi" key={kpi.label}>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function MyPlanScreen() {
  return (
    <div className="screen">
      <Header title="My plan" subtitle="Keep track of upgrades that deliver the fastest payback." />
      <div className="list">
        {planItems.map((item) => (
          <div className="list-item" key={item.id}>
            <div>
              <h3>{item.name}</h3>
              <p>Target: {item.target}</p>
            </div>
            <span className={`status-pill status-${item.status.toLowerCase().replace(' ', '-')}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
      <section className="premium">
        <h2>Whole-home savings dashboard</h2>
        <p>Unlock premium to see aggregated annual savings, carbon impact, and progress insights.</p>
        <button className="secondary">Upgrade to Premium</button>
      </section>
    </div>
  )
}

function NewTechScreen() {
  return (
    <div className="screen">
      <Header title="NewTech" subtitle="See what’s coming next in sustainable home living." />
      <div className="cards">
        {newTech.map((item) => (
          <article className="card" key={item.id}>
            <div className="card-top">
              <span className="tag">{item.category}</span>
              <span className="chip">{item.status}</span>
            </div>
            <h3>{item.name}</h3>
            <p>{item.summary}</p>
            <div className="card-meta">Verdict: {item.verdict}</div>
          </article>
        ))}
      </div>
    </div>
  )
}

function ProfileScreen() {
  const fields = useMemo(
    () => [
      { label: 'Electricity price (p/kWh)', value: `${userProfile.electricity_price_p_kwh}p` },
      { label: 'Home size', value: userProfile.home_size },
      { label: 'Usage level', value: userProfile.usage_level },
      { label: 'Reminders enabled', value: userProfile.reminders_enabled ? 'Yes' : 'No' },
      { label: 'Reminder day', value: userProfile.reminder_day },
      { label: 'Reminder time', value: userProfile.reminder_time }
    ],
    []
  )

  return (
    <div className="screen">
      <Header title="Profile" subtitle="Keep your household details up to date." />
      <div className="form">
        {fields.map((field) => (
          <div className="form-row" key={field.label}>
            <span>{field.label}</span>
            <strong>{field.value}</strong>
          </div>
        ))}
      </div>
      <button className="primary">Upgrade to Premium</button>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Home')

  const screen = (() => {
    switch (activeTab) {
      case 'Calculators':
        return <CalculatorsScreen />
      case 'MyPlan':
        return <MyPlanScreen />
      case 'NewTech':
        return <NewTechScreen />
      case 'Profile':
        return <ProfileScreen />
      case 'Home':
      default:
        return <HomeScreen onNavigate={setActiveTab} />
    }
  })()

  return (
    <div className="app">
      <main>{screen}</main>
      <nav className="bottom-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            <span>{tab}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
