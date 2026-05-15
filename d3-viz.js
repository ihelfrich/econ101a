/* ============================================================
   d3-viz.js  —  Interactive Economic Diagrams with D3 v7
   ============================================================ */

/* global d3 */

// ── Shared helpers ────────────────────────────────────────────
const BBLUE  = '#003262';
const BGOLD  = '#FDB515';
const GREEN  = '#007840';
const RED    = '#c0392b';
const PURPLE = '#6c3483';
const GRAY   = '#aaa';

function svgSetup(containerId, width, height, margin) {
  const el = document.getElementById(containerId);
  if (!el) return null;
  el.innerHTML = '';
  const svg = d3.select('#' + containerId)
    .append('svg')
    .attr('viewBox', `0 0 ${width + margin.l + margin.r} ${height + margin.t + margin.b}`)
    .attr('width', '100%')
    .style('max-width', width + margin.l + margin.r + 'px');
  return svg.append('g').attr('transform', `translate(${margin.l},${margin.t})`);
}

function addAxes(g, xScale, yScale, W, H, xlbl, ylbl) {
  g.append('g').attr('transform', `translate(0,${H})`).call(d3.axisBottom(xScale).ticks(5))
    .call(ax => ax.select('.domain').attr('stroke', '#999'))
    .call(ax => ax.selectAll('text').attr('fill', '#666').style('font-size', '11px'));
  g.append('g').call(d3.axisLeft(yScale).ticks(5))
    .call(ax => ax.select('.domain').attr('stroke', '#999'))
    .call(ax => ax.selectAll('text').attr('fill', '#666').style('font-size', '11px'));
  if (xlbl) g.append('text').attr('x', W).attr('y', H + 30).attr('fill', '#555')
    .style('font-size', '12px').style('font-family', 'serif').text(xlbl);
  if (ylbl) g.append('text').attr('transform', 'rotate(-90)').attr('x', -10).attr('y', -36)
    .attr('fill', '#555').style('font-size', '12px').style('font-family', 'serif').text(ylbl);
}

// ── 1. BUDGET / INDIFFERENCE CURVE DIAGRAM ───────────────────
function initBudgetIC(containerId) {
  const W = 380, H = 320;
  const M = { l: 46, r: 20, t: 20, b: 44 };
  let alpha = 0.5, m = 20, px = 2, py = 1;

  const xMax = 14, yMax = 26;
  const x = d3.scaleLinear([0, xMax], [0, W]);
  const y = d3.scaleLinear([0, yMax], [H, 0]);

  const g = svgSetup(containerId, W, H, M);
  if (!g) return;

  addAxes(g, x, y, W, H, 'Good x', 'Good y');

  // Budget line
  const budgetLine = g.append('line').attr('stroke', BBLUE).attr('stroke-width', 2.5);
  // IC through optimal point
  const icPath = g.append('path').attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 2);
  // Other ICs (lighter)
  const ic2 = g.append('path').attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 1).attr('stroke-dasharray', '4,3').attr('opacity', 0.45);
  const ic3 = g.append('path').attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 1).attr('stroke-dasharray', '4,3').attr('opacity', 0.45);
  // Optimal point
  const optDot = g.append('circle').attr('r', 6).attr('fill', RED).attr('stroke', '#fff').attr('stroke-width', 1.5);
  const optLabel = g.append('text').attr('fill', RED).style('font-size', '11px').style('font-family', 'sans-serif');
  // MRS label
  const mrsLabel = g.append('text').attr('fill', '#555').style('font-size', '11px').style('font-family', 'sans-serif');

  function icPoints(uVal) {
    const pts = [];
    for (let xi = 0.05; xi <= xMax * 0.98; xi += 0.06) {
      const yi = Math.pow(uVal / Math.pow(xi, alpha), 1 / (1 - alpha));
      if (yi <= 0 || yi > yMax * 1.05) continue;
      pts.push([xi, yi]);
    }
    return pts;
  }

  function draw() {
    const xStar = alpha * m / px;
    const yStar = (1 - alpha) * m / py;
    const uStar = Math.pow(xStar, alpha) * Math.pow(yStar, 1 - alpha);

    // Budget line
    budgetLine
      .attr('x1', x(0)).attr('y1', y(m / py))
      .attr('x2', x(m / px)).attr('y2', y(0));

    // IC through optimal
    const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveCatmullRom);
    icPath.attr('d', line(icPoints(uStar)));
    ic2.attr('d', line(icPoints(uStar * 0.55)));
    ic3.attr('d', line(icPoints(uStar * 1.55)));

    // Optimal point
    optDot.attr('cx', x(xStar)).attr('cy', y(yStar));
    optLabel.attr('x', x(xStar) + 8).attr('y', y(yStar) - 6)
      .text(`(${xStar.toFixed(1)}, ${yStar.toFixed(1)})`);
    mrsLabel.attr('x', 8).attr('y', 16)
      .text(`MRS = pₓ/p_y = ${(px / py).toFixed(2)}`);
  }

  draw();

  // Expose update
  window._budgetIC_update = (a, inc, p_x, p_y) => {
    alpha = a; m = inc; px = p_x; py = p_y;
    draw();
  };
}

// ── 2. SLUTSKY DECOMPOSITION DIAGRAM ─────────────────────────
function initSlutsky(containerId) {
  const W = 380, H = 320;
  const M = { l: 46, r: 24, t: 24, b: 44 };
  let alpha = 0.5, m = 20, py = 1, px0 = 1, px1 = 4;

  const xMax = 24, yMax = 26;
  const x = d3.scaleLinear([0, xMax], [0, W]);
  const y = d3.scaleLinear([0, yMax], [H, 0]);

  const g = svgSetup(containerId, W, H, M);
  if (!g) return;

  addAxes(g, x, y, W, H, 'Good x', 'Good y');

  const line = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveCatmullRom);

  const bl0  = g.append('line').attr('stroke', BBLUE).attr('stroke-width', 2.2).attr('opacity', 0.85);
  const bl1  = g.append('line').attr('stroke', RED).attr('stroke-width', 2.2);
  const blC  = g.append('line').attr('stroke', PURPLE).attr('stroke-width', 1.8).attr('stroke-dasharray', '5,4');
  const ic0  = g.append('path').attr('fill', 'none').attr('stroke', GREEN).attr('stroke-width', 2);

  const dotA = g.append('circle').attr('r', 6).attr('fill', BBLUE).attr('stroke', '#fff').attr('stroke-width', 1.5);
  const dotH = g.append('circle').attr('r', 6).attr('fill', PURPLE).attr('stroke', '#fff').attr('stroke-width', 1.5);
  const dotB = g.append('circle').attr('r', 6).attr('fill', RED).attr('stroke', '#fff').attr('stroke-width', 1.5);

  const seArrow = g.append('text').style('font-size', '11px').style('font-family', 'sans-serif').attr('fill', PURPLE);
  const ieArrow = g.append('text').style('font-size', '11px').style('font-family', 'sans-serif').attr('fill', RED);
  const legend  = g.append('text').style('font-size', '10px').style('font-family', 'sans-serif').attr('fill', '#555');

  // Arrow marker
  const defs = g.append('defs');
  ['se','ie'].forEach(id => {
    defs.append('marker').attr('id','arr-'+id).attr('markerWidth',8).attr('markerHeight',6)
      .attr('refX',6).attr('refY',3).attr('orient','auto')
      .append('polygon').attr('points','0 0, 8 3, 0 6')
      .attr('fill', id === 'se' ? PURPLE : RED);
  });
  const seArr = g.append('line').attr('stroke', PURPLE).attr('stroke-width', 1.5).attr('marker-end', 'url(#arr-se)');
  const ieArr = g.append('line').attr('stroke', RED).attr('stroke-width', 1.5).attr('marker-end', 'url(#arr-ie)');

  function icPts(uVal, a) {
    const pts = [];
    for (let xi = 0.05; xi <= xMax * 0.98; xi += 0.05) {
      const yi = Math.pow(uVal / Math.pow(xi, a), 1 / (1 - a));
      if (yi <= 0 || yi > yMax * 1.02) continue;
      pts.push([xi, yi]);
    }
    return pts;
  }

  function draw() {
    const xA = alpha * m / px0, yA = (1 - alpha) * m / py;
    const uStar = Math.pow(xA, alpha) * Math.pow(yA, 1 - alpha);
    const kappa = Math.pow(alpha, alpha) * Math.pow(1 - alpha, 1 - alpha);
    const ePrime = uStar * Math.pow(px1, alpha) * Math.pow(py, 1 - alpha) / kappa;
    const xH = alpha * ePrime / px1, yH = (1 - alpha) * ePrime / py;
    const xB = alpha * m / px1,      yB = (1 - alpha) * m / py;

    const SE = xH - xA, IE = xB - xH, TE = xB - xA;

    // Budget lines
    bl0.attr('x1', x(0)).attr('y1', y(m / py)).attr('x2', x(m / px0)).attr('y2', y(0));
    bl1.attr('x1', x(0)).attr('y1', y(m / py)).attr('x2', x(m / px1)).attr('y2', y(0));
    blC.attr('x1', x(0)).attr('y1', y(ePrime / py)).attr('x2', x(ePrime / px1)).attr('y2', y(0));

    // IC
    ic0.attr('d', line(icPts(uStar, alpha)));

    // Dots
    dotA.attr('cx', x(xA)).attr('cy', y(yA));
    dotH.attr('cx', x(xH)).attr('cy', y(yH));
    dotB.attr('cx', x(xB)).attr('cy', y(yB));

    // SE arrow (A → H) at mid-height of diagram
    const yMid = H * 0.88;
    seArr.attr('x1', x(xA)+2).attr('y1', yMid).attr('x2', x(xH)-2).attr('y2', yMid);
    seArrow.attr('x', (x(xA)+x(xH))/2 - 10).attr('y', yMid - 5).text(`SE=${SE.toFixed(2)}`);
    ieArr.attr('x1', x(xH)+2).attr('y1', yMid).attr('x2', x(xB)-2).attr('y2', yMid);
    ieArrow.attr('x', (x(xH)+x(xB))/2 - 10).attr('y', yMid - 5).text(`IE=${IE.toFixed(2)}`);

    legend.attr('x', 4).attr('y', 14)
      .text(`TE=${TE.toFixed(2)} = SE(${SE.toFixed(2)}) + IE(${IE.toFixed(2)})`);
  }

  draw();

  window._slutsky_update = (a, inc, p_y, p_x0, p_x1) => {
    alpha = a; m = inc; py = p_y; px0 = p_x0; px1 = p_x1;
    draw();
  };
}

// ── 3. EDGEWORTH BOX (drag-enabled) ──────────────────────────
function initEdgeworthBox(containerId) {
  const W = 420, H = 360;
  const M = { l: 50, r: 30, t: 30, b: 50 };
  // Parameters
  let alphaA = 0.5, alphaB = 0.4;
  let omegaX = 8, omegaY = 6;

  const x = d3.scaleLinear([0, omegaX], [0, W]);
  const y = d3.scaleLinear([0, omegaY], [H, 0]);

  const g = svgSetup(containerId, W, H, M);
  if (!g) return;

  // Box border
  g.append('rect').attr('width', W).attr('height', H)
    .attr('fill', 'none').attr('stroke', '#ccc').attr('stroke-width', 1.5);

  // Axis labels for A (bottom-left)
  g.append('text').attr('x', W/2).attr('y', H+32).attr('text-anchor','middle')
    .attr('fill', BBLUE).style('font-size','12px').style('font-family','sans-serif').text('← Consumer A: x →');
  g.append('text').attr('transform',`rotate(-90)`).attr('x',-H/2).attr('y',-38)
    .attr('text-anchor','middle').attr('fill', BBLUE).style('font-size','12px').style('font-family','sans-serif').text('← Consumer A: y →');

  // Axis labels for B (top-right, reversed)
  g.append('text').attr('x', W/2).attr('y', -14).attr('text-anchor','middle')
    .attr('fill', '#c05000').style('font-size','12px').style('font-family','sans-serif').text('← Consumer B: x →');

  // ICs for A
  const icsA = g.append('g');
  // ICs for B
  const icsB = g.append('g');
  // Contract curve
  const ccPath = g.append('path').attr('fill','none').attr('stroke', '#888').attr('stroke-width',1.5).attr('stroke-dasharray','6,4');
  // Endowment point
  const endowDot = g.append('circle').attr('r', 6).attr('fill', '#888').attr('stroke','#fff').attr('stroke-width',1.5);
  // Draggable allocation
  const allocDot = g.append('circle').attr('r', 9).attr('fill', RED)
    .attr('stroke','#fff').attr('stroke-width', 2).attr('cursor','grab')
    .attr('style','filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))');

  // Info panel
  const infoA = g.append('text').attr('x', 8).attr('y', H - 14).style('font-size','11px').style('font-family','sans-serif').attr('fill', BBLUE);
  const infoB = g.append('text').attr('x', W - 8).attr('y', 22).attr('text-anchor','end').style('font-size','11px').style('font-family','sans-serif').attr('fill','#c05000');
  const pareto = g.append('text').attr('x', W/2).attr('y', H/2).attr('text-anchor','middle').style('font-size','13px').style('font-weight','700').style('font-family','sans-serif');

  let xA = 3, yA = 3; // current allocation for A
  const endowXA = 5, endowYA = 1; // A's endowment

  const icLine = d3.line().x(d => x(d[0])).y(d => y(d[1])).curve(d3.curveCatmullRom);

  function icForA(uA, levels = 1) {
    const pts = [];
    for (let xi = 0.05; xi < omegaX * 0.99; xi += 0.05) {
      const yi = Math.pow(uA / Math.pow(xi, alphaA), 1 / (1 - alphaA));
      if (yi <= 0 || yi >= omegaY) continue;
      pts.push([xi, yi]);
    }
    return pts;
  }

  function icForB(xA_val, yA_val) {
    // B consumes xB = omegaX - xA, yB = omegaY - yA
    const xBpt = omegaX - xA_val, yBpt = omegaY - yA_val;
    const uB = Math.pow(xBpt, alphaB) * Math.pow(yBpt, 1 - alphaB);
    const pts = [];
    for (let xi = 0.05; xi < omegaX * 0.99; xi += 0.05) {
      const xB = omegaX - xi;
      if (xB <= 0.01) continue;
      const yBi = Math.pow(uB / Math.pow(xB, alphaB), 1 / (1 - alphaB));
      const yAi = omegaY - yBi;
      if (yAi < 0 || yAi > omegaY) continue;
      pts.push([xi, yAi]);
    }
    return pts;
  }

  // Contract curve: MRS_A = MRS_B
  // αA*yA/((1-αA)*xA) = αB*yB/((1-αB)*xB) with yB=ωY-yA, xB=ωX-xA
  // solved analytically: yA = rB*ωY*xA / (rA*ωX + xA*(rB-rA))
  // where rA = αA/(1-αA), rB = αB/(1-αB)
  function contractCurve() {
    const rA = alphaA / (1 - alphaA);
    const rB = alphaB / (1 - alphaB);
    const pts = [];
    for (let xi = 0.1; xi < omegaX * 0.99; xi += 0.08) {
      const denom = rA * omegaX + xi * (rB - rA);
      if (Math.abs(denom) < 0.001) continue;
      const yi = rB * omegaY * xi / denom;
      if (yi < 0 || yi > omegaY) continue;
      pts.push([xi, yi]);
    }
    return pts;
  }

  function mrsA(xAv, yAv) { return (alphaA * yAv) / ((1 - alphaA) * xAv); }
  function mrsB(xAv, yAv) {
    const xBv = omegaX - xAv, yBv = omegaY - yAv;
    return (alphaB * yBv) / ((1 - alphaB) * xBv);
  }

  function draw() {
    const uA = Math.pow(xA, alphaA) * Math.pow(yA, 1 - alphaA);
    const xBv = omegaX - xA, yBv = omegaY - yA;
    const mA = mrsA(xA, yA), mB = mrsB(xA, yA);
    const isPO = Math.abs(mA - mB) < 0.08;

    // A's ICs
    icsA.selectAll('path').remove();
    [0.5, 0.75, 1.0, 1.35, 1.75].forEach(f => {
      icsA.append('path').attr('fill','none')
        .attr('stroke', BBLUE).attr('stroke-width', f === 1.0 ? 2.5 : 1)
        .attr('opacity', f === 1.0 ? 0.9 : 0.35)
        .attr('d', icLine(icForA(uA * f)));
    });

    // B's ICs
    icsB.selectAll('path').remove();
    const uBc = Math.pow(xBv, alphaB) * Math.pow(yBv, 1 - alphaB);
    [0.5, 0.75, 1.0, 1.35, 1.75].forEach(f => {
      const pts = [];
      for (let xi = 0.05; xi < omegaX * 0.99; xi += 0.05) {
        const xBi = omegaX - xi;
        if (xBi <= 0.01) continue;
        const yBi = Math.pow((uBc * f) / Math.pow(xBi, alphaB), 1 / (1 - alphaB));
        const yAi = omegaY - yBi;
        if (yAi < 0 || yAi > omegaY) continue;
        pts.push([xi, yAi]);
      }
      if (pts.length < 3) return;
      icsB.append('path').attr('fill','none')
        .attr('stroke','#c05000').attr('stroke-width', f === 1.0 ? 2.5 : 1)
        .attr('opacity', f === 1.0 ? 0.9 : 0.35)
        .attr('d', icLine(pts));
    });

    // Contract curve
    ccPath.attr('d', icLine(contractCurve()));

    // Endowment
    endowDot.attr('cx', x(endowXA)).attr('cy', y(endowYA));

    // Allocation dot
    allocDot.attr('cx', x(xA)).attr('cy', y(yA));

    // Labels
    infoA.text(`A: MRS = ${mA.toFixed(3)}`);
    infoB.text(`B: MRS = ${mB.toFixed(3)}`);
    pareto.attr('fill', isPO ? GREEN : '#c05000')
      .text(isPO ? '✓ Pareto Optimal' : `ΔMRS = ${Math.abs(mA - mB).toFixed(3)} — room for trade`);
  }

  // Drag
  const drag = d3.drag()
    .on('start', () => allocDot.attr('cursor','grabbing'))
    .on('drag', (event) => {
      const nx = Math.max(0.1, Math.min(omegaX - 0.1, x.invert(event.x)));
      const ny = Math.max(0.1, Math.min(omegaY - 0.1, y.invert(event.y)));
      xA = nx; yA = ny;
      draw();
    })
    .on('end', () => allocDot.attr('cursor','grab'));

  allocDot.call(drag);

  draw();

  window._edgeworth_update = (aA, aB, wX, wY) => {
    alphaA = aA; alphaB = aB; omegaX = wX; omegaY = wY;
    xA = Math.min(xA, omegaX * 0.9);
    yA = Math.min(yA, omegaY * 0.9);
    draw();
  };
}

// ── 4. COURNOT BEST-RESPONSE DIAGRAM ─────────────────────────
function initCournotBR(containerId) {
  const W = 360, H = 320;
  const M = { l: 50, r: 20, t: 20, b: 48 };
  let a = 90, b = 1, c = 15;

  const qMax = () => (a - c) / b * 1.1;
  const xSc = () => d3.scaleLinear([0, qMax()], [0, W]);
  const ySc = () => d3.scaleLinear([0, qMax()], [H, 0]);

  const g = svgSetup(containerId, W, H, M);
  if (!g) return;

  const br1Path = g.append('path').attr('fill','none').attr('stroke', BBLUE).attr('stroke-width', 2.5);
  const br2Path = g.append('path').attr('fill','none').attr('stroke', '#c05000').attr('stroke-width', 2.5);
  const neDot   = g.append('circle').attr('r', 7).attr('fill', RED).attr('stroke','#fff').attr('stroke-width', 1.5);
  const neLabel = g.append('text').style('font-size','11px').style('font-family','sans-serif').attr('fill', RED);
  const monoLine = g.append('line').attr('stroke','#888').attr('stroke-width',1).attr('stroke-dasharray','5,3');
  const monoLabel= g.append('text').style('font-size','10px').style('font-family','sans-serif').attr('fill','#888');
  const xAx = g.append('g').attr('transform', `translate(0,${H})`);
  const yAx = g.append('g');
  const xl = g.append('text').attr('x', W).attr('y', H+32).style('font-size','12px').style('font-family','sans-serif').attr('fill','#555');
  const yl = g.append('text').attr('transform','rotate(-90)').attr('x',-10).attr('y',-38).style('font-size','12px').style('font-family','sans-serif').attr('fill','#555');

  // Legend
  g.append('line').attr('x1',8).attr('y1',12).attr('x2',30).attr('y2',12).attr('stroke',BBLUE).attr('stroke-width',2.5);
  g.append('text').attr('x',34).attr('y',16).style('font-size','11px').style('font-family','sans-serif').attr('fill',BBLUE).text('BR₁(q₂)');
  g.append('line').attr('x1',8).attr('y1',28).attr('x2',30).attr('y2',28).attr('stroke','#c05000').attr('stroke-width',2.5);
  g.append('text').attr('x',34).attr('y',32).style('font-size','11px').style('font-family','sans-serif').attr('fill','#c05000').text('BR₂(q₁)');

  function draw() {
    const qm = qMax();
    const xs = xSc(), ys = ySc();

    xAx.call(d3.axisBottom(xs).ticks(5))
      .call(ax => ax.selectAll('text').style('font-size','11px').attr('fill','#666'));
    yAx.call(d3.axisLeft(ys).ticks(5))
      .call(ax => ax.selectAll('text').style('font-size','11px').attr('fill','#666'));
    xl.text('q₁ (Firm 1)');
    yl.text('q₂ (Firm 2)');

    // BR1: q1 = (a-c)/(2b) - q2/2  (firm 1's best response to q2)
    // Expressed as: for a given q2, BR1 gives q1.
    // On plot: x-axis = q1, y-axis = q2
    // BR1 is a line in q2-space: q2 = (a-c)/b - 2*q1
    // BR2: q2 = (a-c)/(2b) - q1/2

    const halfMkt = (a - c) / b;
    const qNE = (a - c) / (3 * b);  // symmetric Cournot NE: q* = (a-c)/(3b) per firm

    // BR1: q2 = (a-c)/b - 2*q1  (x: q1, y: q2)
    const br1pts = [[0, halfMkt], [halfMkt / 2, 0]].filter(p => p[0] >= 0 && p[1] >= 0);
    const lineFn = d3.line().x(d => xs(d[0])).y(d => ys(d[1]));
    br1Path.attr('d', lineFn(br1pts));

    // BR2: q2 = (a-c)/(2b) - q1/2 (x: q1, y: q2)
    const br2pts = [[0, halfMkt / 2], [halfMkt, 0]].filter(p => p[0] >= 0 && p[1] >= 0);
    br2Path.attr('d', lineFn(br2pts));

    // Nash Equilibrium point
    neDot.attr('cx', xs(qNE)).attr('cy', ys(qNE));
    neLabel.attr('x', xs(qNE) + 8).attr('y', ys(qNE) - 6)
      .text(`NE: (${qNE.toFixed(2)}, ${qNE.toFixed(2)})`);

    // Monopoly line q1+q2 = (a-c)/(2b)
    const qMono = halfMkt / 2;
    monoLine.attr('x1', xs(0)).attr('y1', ys(qMono)).attr('x2', xs(qMono)).attr('y2', ys(0));
    monoLabel.attr('x', xs(qMono * 0.5) + 4).attr('y', ys(qMono * 0.5) - 5).text('Monopoly Q');
  }

  draw();

  window._cournot_update = (av, bv, cv) => {
    a = av; b = bv; c = cv;
    draw();
  };
}

// ── 5. SUPPLY-DEMAND WITH TAX WEDGE ──────────────────────────
function initSupplyDemand(containerId) {
  const W = 380, H = 320;
  const M = { l: 50, r: 20, t: 20, b: 48 };

  let a = 100, b = 1, supSlope = 0.8, tax = 15;
  // Demand: P = a - b*Q; Supply: P = supSlope * Q
  // With tax on producers: P_s = P_c - tax => supply: P_c = supSlope*Q + tax
  // Eq: a - b*Q = supSlope*Q + tax => Q* = (a-tax)/(b+supSlope)
  // No-tax: Q0 = a/(b+supSlope)

  const qMax = 80, pMax = 110;
  const xs = d3.scaleLinear([0, qMax], [0, W]);
  const ys = d3.scaleLinear([0, pMax], [H, 0]);

  const g = svgSetup(containerId, W, H, M);
  if (!g) return;

  addAxes(g, xs, ys, W, H, 'Quantity Q', 'Price P');

  const demandPath  = g.append('path').attr('fill','none').attr('stroke', BBLUE).attr('stroke-width', 2.5);
  const supplyPath0 = g.append('path').attr('fill','none').attr('stroke', GREEN).attr('stroke-width', 1.5).attr('stroke-dasharray','5,4').attr('opacity',0.5);
  const supplyPathT = g.append('path').attr('fill','none').attr('stroke', GREEN).attr('stroke-width', 2.5);
  const csArea = g.append('path').attr('opacity', 0.2);
  const psArea = g.append('path').attr('opacity', 0.2);
  const dwlArea= g.append('path').attr('opacity', 0.5);
  const taxRect= g.append('rect').attr('fill','#FDB515').attr('opacity',0.18);
  const wedge  = g.append('line').attr('stroke','#FDB515').attr('stroke-width',1.5).attr('stroke-dasharray','4,3');

  const dotEq  = g.append('circle').attr('r', 5).attr('fill', RED).attr('stroke','#fff').attr('stroke-width',1.5);
  const dotEq0 = g.append('circle').attr('r', 4).attr('fill', '#888').attr('stroke','#fff').attr('stroke-width',1).attr('opacity',0.6);
  const infoTxt= g.append('text').attr('x', 4).attr('y', 14).style('font-size','11px').style('font-family','sans-serif').attr('fill','#555');

  const ln = d3.line().x(d => xs(d[0])).y(d => ys(d[1]));

  function draw() {
    const Q0 = a / (b + supSlope);
    const P0 = a - b * Q0;

    const QT = Math.max(0, (a - tax) / (b + supSlope));
    const Pc = a - b * QT;   // consumer price
    const Ps = Pc - tax;      // producer net price

    // Demand line
    demandPath.attr('d', ln([[0, a], [a/b, 0]].filter(p=>p[1]>=0)));

    // Original supply
    supplyPath0.attr('d', ln([[0,0],[qMax, supSlope*qMax]]));

    // Tax-shifted supply
    supplyPathT.attr('d', ln([[0,tax],[qMax, supSlope*qMax+tax]]));

    // CS: triangle above Pc, below demand, from 0 to QT
    csArea.attr('fill', BBLUE)
      .attr('d', `M${xs(0)},${ys(a)} L${xs(QT)},${ys(Pc)} L${xs(0)},${ys(Pc)} Z`);

    // PS: triangle below Ps, above supply, from 0 to QT
    psArea.attr('fill', GREEN)
      .attr('d', `M${xs(0)},${ys(Ps)} L${xs(QT)},${ys(Ps)} L${xs(0)},${ys(0)} Z`);

    // DWL: triangle between old and new equilibrium
    dwlArea.attr('fill', RED)
      .attr('d', `M${xs(QT)},${ys(Pc)} L${xs(Q0)},${ys(P0)} L${xs(QT)},${ys(Ps)} Z`);

    // Tax rectangle (government revenue)
    taxRect.attr('x', xs(0)).attr('y', ys(Pc))
      .attr('width', xs(QT) - xs(0))
      .attr('height', ys(Ps) - ys(Pc));

    // Tax wedge line
    wedge.attr('x1', xs(QT)).attr('y1', ys(Pc))
      .attr('x2', xs(QT)).attr('y2', ys(Ps));

    // Dots
    dotEq0.attr('cx', xs(Q0)).attr('cy', ys(P0));
    dotEq.attr('cx', xs(QT)).attr('cy', ys(Pc));

    const govRev = tax * QT;
    const dwl = 0.5 * tax * (Q0 - QT);
    const consShare = b > 0 ? ((Pc - P0) / tax * 100) : 0;
    infoTxt.text(`τ=${tax} | Q*=${QT.toFixed(1)} | Pc=${Pc.toFixed(1)} | Ps=${Ps.toFixed(1)} | Rev=${govRev.toFixed(0)} | DWL=${dwl.toFixed(1)}`);
  }

  draw();

  window._supplyDemand_update = (av, bv, sv, tv) => {
    a = av; b = bv; supSlope = sv; tax = tv;
    draw();
  };
}

// ── Auto-init all diagrams ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initBudgetIC('d3-budgetic');
  initSlutsky('d3-slutsky');
  initEdgeworthBox('d3-edgeworth');
  initCournotBR('d3-cournot');
  initSupplyDemand('d3-supplydemand');
});
