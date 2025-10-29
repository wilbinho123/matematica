// Calculadora Z externa
document.addEventListener('DOMContentLoaded', function () {
  // Aproximación erf (Abramowitz & Stegun)
  function erf(x) {
    var sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
    var a1 =  0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    var a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    var t = 1.0 / (1.0 + p * x);
    var y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
    return sign * y;
  }

  function normCDF(z) {
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
  }

  function pValueFromZ(z, type) {
    if (type === 'two') return 2 * (1 - normCDF(Math.abs(z)));
    if (type === 'right') return 1 - normCDF(z);
    return normCDF(z); // left
  }

  const critTable = {
    "0.01": { two: 2.5758, right: 2.3263 },
    "0.05": { two: 1.96, right: 1.6449 },
    "0.10": { two: 1.6449, right: 1.2816 }
  };

  const form = document.getElementById('zForm');
  const resultDiv = document.getElementById('zResult');
  const resetBtn = document.getElementById('resetBtn');

  form.addEventListener('submit', function(e){
    e.preventDefault();

    const mu0 = parseFloat(document.getElementById('mu0').value);
    const xbar = parseFloat(document.getElementById('xbar').value);
    const sigma = parseFloat(document.getElementById('sigma').value);
    const n = parseInt(document.getElementById('n').value, 10);
    const alpha = document.getElementById('alpha').value;
    const type = document.getElementById('testType').value;

    if (!isFinite(mu0) || !isFinite(xbar) || !isFinite(sigma) || !isFinite(n) || n <= 0 || sigma <= 0) {
      resultDiv.innerHTML = '<div class="alert alert-danger small mb-0">Por favor completa todos los campos con valores válidos (σ &gt; 0, n ≥ 1).</div>';
      return;
    }

    const z = (xbar - mu0) / (sigma / Math.sqrt(n));
    const zRounded = Math.round(z*10000)/10000;

    const crit = critTable[alpha];
    let critVal = (type === 'two') ? crit.two : crit.right;
    const critRounded = Math.round(critVal*10000)/10000;

    const p = pValueFromZ(z, type);
    const pRounded = Math.round(p*100000)/100000;

    let decisionText = '';
    if (type === 'two') {
      decisionText = (Math.abs(z) > critVal) ? 'Rechazar H₀' : 'No rechazar H₀';
    } else if (type === 'right') {
      decisionText = (z > critVal) ? 'Rechazar H₀' : 'No rechazar H₀';
    } else {
      decisionText = (z < -critVal) ? 'Rechazar H₀' : 'No rechazar H₀';
    }

    resultDiv.innerHTML = `
      <div class="row g-2">
        <div class="col-12">
          <p class="mb-1"><strong>Z calculado:</strong> ${zRounded}</p>
        </div>
        <div class="col-12 col-md-6">
          <p class="mb-1"><strong>Valor crítico:</strong> ${type === 'two' ? '±' + critRounded : (type === 'right' ? critRounded : '-' + critRounded)}</p>
        </div>
        <div class="col-12 col-md-6">
          <p class="mb-1"><strong>p-valor:</strong> ${pRounded}</p>
        </div>
        <div class="col-12">
          <div class="alert ${decisionText.startsWith('Rechazar') ? 'alert-danger' : 'alert-success'} mb-0" role="alert">
            <strong>Decisión:</strong> ${decisionText}
          </div>
        </div>
      </div>
    `;
  });

  resetBtn.addEventListener('click', function(){
    form.reset();
    resultDiv.innerHTML = '';
  });
});