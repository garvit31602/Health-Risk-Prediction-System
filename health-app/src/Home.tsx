import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState } from 'react'
import { Client } from "@gradio/client";

// Encoding maps to match model training (used for range/select values if needed, 
// though Gradio API expects labels for most inputs based on test.js)
const RACE_MAP: { [key: string]: number } = {
  'American Indian/Alaskan Native': 0,
  'Asian': 1,
  'Black': 2,
  'Hispanic': 3,
  'Other': 4,
  'White': 5
};

const AGE_MAP: { [key: string]: string } = {
  '18-24': '18-24', '25-29': '25-29', '30-34': '30-34', '35-39': '35-39', '40-44': '40-44',
  '45-49': '45-49', '50-54': '50-54', '55-59': '55-59', '60-64': '60-64', '65-69': '65-69',
  '70-74': '70-74', '75-79': '75-79', '80 or older': '80 or older'
};

function Home() {
  const [bmi, setBmi] = useState<number>(25.0);
  const [smoking, setSmoking] = useState<number>(0);
  const [alcoholDrinking, setAlcoholDrinking] = useState<number>(0);
  const [stroke, setStroke] = useState<number>(0);
  const [physicalHealth, setPhysicalHealth] = useState<number>(0);
  const [mentalHealth, setMentalHealth] = useState<number>(0);
  const [diffWalking, setDiffWalking] = useState<number>(0);
  const [sex, setSex] = useState<number>(0); // 0: Female, 1: Male
  const [ageCategory, setAgeCategory] = useState<string>('40-44');
  const [race, setRace] = useState<string>('White');
  const [diabetic, setDiabetic] = useState<number>(0);
  const [physicalActivity, setPhysicalActivity] = useState<number>(1);
  const [genHealth, setGenHealth] = useState<string>('Good');
  const [sleepTime, setSleepTime] = useState<number>(7);
  const [asthma, setAsthma] = useState<number>(0);
  const [kidneyDisease, setKidneyDisease] = useState<number>(0);
  const [skinCancer, setSkinCancer] = useState<number>(0);

  const [prediction, setPrediction] = useState<number | null>(null); // stores probability (0-1)
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // BMI Calculator State
  const [showCalc, setShowCalc] = useState(false);
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);

  const calculateBMI = () => {
    if (height > 0) {
      const calculatedBmi = weight / ((height / 100) ** 2);
      setBmi(parseFloat(calculatedBmi.toFixed(1)));
      setShowCalc(false);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const client = await Client.connect("garvit31602/health_risk_predictor");

      const result = await client.predict("/predict", {
        BMI: bmi,
        Smoking: smoking === 1 ? "Yes" : "No",
        AlcoholDrinking: alcoholDrinking === 1 ? "Yes" : "No",
        Stroke: stroke === 1 ? "Yes" : "No",
        PhysicalHealth: physicalHealth,
        MentalHealth: mentalHealth,
        DiffWalking: diffWalking === 1 ? "Yes" : "No",
        Sex: sex === 1 ? "Male" : "Female",
        AgeCategory: ageCategory,
        Race: race,
        Diabetic: diabetic === 1 ? "Yes" : "No",
        PhysicalActivity: physicalActivity === 1 ? "Yes" : "No",
        GenHealth: genHealth,
        SleepTime: sleepTime,
        Asthma: asthma === 1 ? "Yes" : "No",
        KidneyDisease: kidneyDisease === 1 ? "Yes" : "No",
        SkinCancer: skinCancer === 1 ? "Yes" : "No",
      });

      // Based on test.js result.data is logged. 
      // Assuming result.data[0] is the probability or label.
      // If it's a label "Yes"/"No", we might need to adjust.
      // If it's a probability, we use it directly.
      // Usually Gradio returns [label, {label: prob, ...}] or similar.
      console.log("API Result:", result.data);

      const resultData = result.data as any[];
      // If the API returns a label and a dictionary of probabilities:
      if (resultData && resultData.length > 0) {
        const data = resultData[0];
        if (typeof data === 'number') {
          setPrediction(data);
        } else if (typeof data === 'string') {
          // Try to extract percentage from string (e.g., "⚠️ High Risk — 73.55% probability")
          const percentageMatch = data.match(/(\d+\.?\d*)\s*%/);
          if (percentageMatch) {
            const prob = parseFloat(percentageMatch[1]) / 100;
            setPrediction(prob);
          } else {
            // Fallback for simple labels
            setPrediction(data.toLowerCase().includes("yes") || data.toLowerCase().includes("high") ? 1 : 0);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error calling the prediction API. ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-5 d-flex justify-content-center flex-column align-items-center'>
      <h1 className="mt-5 display-2 text-white text-center">
        Heart Health Predictor
      </h1>
      <p className="text-white-50 text-center mb-5">Advanced Risk Assessment using 2020 CDC Analytics</p>

      <div className="form-container">
        <div className="form-grid">
          {/* Sex Selection */}
          <div className="form-section">
            <div className="section-title">Sex</div>
            <div className="option-grid">
              <div
                className={`gender-box small-box ${sex === 1 ? 'selected' : ''}`}
                onClick={() => setSex(1)}
              >
                <span className="gender-icon">♂️</span>
                <span className="gender-label text-white">Male</span>
              </div>
              <div
                className={`gender-box small-box ${sex === 0 ? 'selected' : ''}`}
                onClick={() => setSex(0)}
              >
                <span className="gender-icon">♀️</span>
                <span className="gender-label text-white">Female</span>
              </div>
            </div>
          </div>

          {/* Age Category */}
          <div className="form-section">
            <div className="section-title">Age Category</div>
            <select
              className="form-select bg-dark text-white border-secondary"
              value={ageCategory}
              onChange={(e) => setAgeCategory(e.target.value)}
            >
              {Object.keys(AGE_MAP).map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>

          {/* BMI Slider */}
          <div className="form-section">
            <div className="section-title">
              BMI
              <input
                type="number"
                className="value-input"
                value={bmi}
                step="0.1"
                min="10"
                max="60"
                onChange={(e) => setBmi(parseFloat(e.target.value) || 0)}
              />
            </div>
            <input
              type="range"
              className="custom-slider"
              min="10" max="60" step="0.1"
              value={bmi}
              onChange={(e) => setBmi(parseFloat(e.target.value))}
            />

            <button
              className="calculator-toggle"
              onClick={() => setShowCalc(!showCalc)}
            >
              {showCalc ? 'Close Calculator' : "Don't know your BMI?"}
            </button>

            {showCalc && (
              <div className="bmi-calculator-area">
                <div className="calc-grid">
                  <div className="calc-input-group">
                    <label className="calc-label">Weight (kg)</label>
                    <input
                      type="number"
                      className="calc-input"
                      value={weight}
                      placeholder="Weight (kg)"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="calc-input-group">
                    <label className="calc-label">Height (cm)</label>
                    <input
                      type="number"
                      className="calc-input"
                      value={height}
                      placeholder="Height (cm)"
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <button className="calc-btn" onClick={calculateBMI}>
                  Set BMI
                </button>
              </div>
            )}
          </div>

          {/* Sleep Time */}
          <div className="form-section">
            <div className="section-title">
              Sleep Time
              <div className="d-flex align-items-center">
                <input
                  type="number"
                  className="value-input"
                  value={sleepTime}
                  min="1"
                  max="24"
                  onChange={(e) => setSleepTime(parseInt(e.target.value) || 0)}
                />
                <span className="ms-1">hrs</span>
              </div>
            </div>
            <input
              type="range"
              className="custom-slider"
              min="1" max="24"
              value={sleepTime}
              onChange={(e) => setSleepTime(parseInt(e.target.value))}
            />
          </div>

          {/* Physical Health */}
          <div className="form-section">
            <div className="section-title">
              Poor Physical Health
              <div className="d-flex align-items-center">
                <input
                  type="number"
                  className="value-input"
                  value={physicalHealth}
                  min="0"
                  max="30"
                  onChange={(e) => setPhysicalHealth(parseInt(e.target.value) || 0)}
                />
                <span className="ms-1">days</span>
              </div>
            </div>
            <p className="text-white-50 small mb-2">(Past 30 days)</p>
            <input
              type="range"
              className="custom-slider"
              min="0" max="30"
              value={physicalHealth}
              onChange={(e) => setPhysicalHealth(parseInt(e.target.value))}
            />
          </div>

          {/* Mental Health */}
          <div className="form-section">
            <div className="section-title">
              Poor Mental Health
              <div className="d-flex align-items-center">
                <input
                  type="number"
                  className="value-input"
                  value={mentalHealth}
                  min="0"
                  max="30"
                  onChange={(e) => setMentalHealth(parseInt(e.target.value) || 0)}
                />
                <span className="ms-1">days</span>
              </div>
            </div>
            <p className="text-white-50 small mb-2">(Past 30 days)</p>
            <input
              type="range"
              className="custom-slider"
              min="0" max="30"
              value={mentalHealth}
              onChange={(e) => setMentalHealth(parseInt(e.target.value))}
            />
          </div>

          {/* General Health */}
          <div className="form-section">
            <div className="section-title">General Health</div>
            <select
              className="form-select bg-dark text-white border-secondary"
              value={genHealth}
              onChange={(e) => setGenHealth(e.target.value)}
            >
              {['Poor', 'Fair', 'Good', 'Very good', 'Excellent'].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Race */}
          <div className="form-section">
            <div className="section-title">Ethnicity</div>
            <select
              className="form-select bg-dark text-white border-secondary"
              value={race}
              onChange={(e) => setRace(e.target.value)}
            >
              {Object.keys(RACE_MAP).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Binary Features Grid */}
          <div className="form-section w-100" style={{ gridColumn: '1 / -1' }}>
            <div className="section-title mb-3">Additional Health Indicators</div>
            <div className="row g-3">
              {[
                { label: 'Smoking', val: smoking, set: setSmoking },
                { label: 'Alcohol Drinking', val: alcoholDrinking, set: setAlcoholDrinking },
                { label: 'Prior Stroke', val: stroke, set: setStroke },
                { label: 'Diff Walking', val: diffWalking, set: setDiffWalking },
                { label: 'Diabetic', val: diabetic, set: setDiabetic },
                { label: 'Physical Activity', val: physicalActivity, set: setPhysicalActivity },
                { label: 'Asthma', val: asthma, set: setAsthma },
                { label: 'Kidney Disease', val: kidneyDisease, set: setKidneyDisease },
                { label: 'Skin Cancer', val: skinCancer, set: setSkinCancer },
              ].map((item) => (
                <div key={item.label} className="col-md-4">
                  <div className="d-flex justify-content-between align-items-center p-3 rounded-4 bg-dark border border-secondary shadow-sm">
                    <span className="text-white">{item.label}</span>
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${item.val === 1 ? 'btn-danger' : 'btn-outline-secondary'}`}
                      onClick={() => item.set(item.val === 1 ? 0 : 1)}
                    >
                      {item.val === 1 ? 'Yes' : 'No'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {prediction !== null && (
          <div className={`mt-5 p-4 rounded-4 text-center shadow-sm border border-2 ${prediction > 0.5 ? 'bg-danger-subtle text-danger border-danger' :
            prediction > 0.2 ? 'bg-warning-subtle text-warning-emphasis border-warning' :
              'bg-success-subtle text-success border-success'
            }`}>
            <h2 className="display-6 fw-bold mb-3">
              {(prediction * 100).toFixed(1)}% Chance of Heart Disease
            </h2>

            <div className="progress mb-3" style={{ height: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
              <div
                className={`progress-bar progress-bar-striped progress-bar-animated ${prediction > 0.5 ? 'bg-danger' : prediction > 0.2 ? 'bg-warning' : 'bg-success'
                  }`}
                role="progressbar"
                style={{ width: `${prediction * 100}%` }}
                aria-valuenow={prediction * 100}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>

            <p className="mb-0 fs-5">
              {prediction > 0.5 ? '⚠️ High Risk: Please consult a healthcare professional.' :
                prediction > 0.2 ? '🟡 Moderate Risk: Consideration of lifestyle changes is advised.' :
                  '✅ Low Risk: Stay healthy and keep up your good habits!'}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-5 p-3 rounded-4 bg-warning-subtle text-warning-emphasis text-center">
            {error}
          </div>
        )}

        <div className="mt-5 mb-5 d-flex justify-content-center">
          <button
            onClick={handlePredict}
            disabled={loading}
            className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-lg d-flex align-items-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Analyzing Data...
              </>
            ) : (
              'Check Risk Status'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home