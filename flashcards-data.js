// Econ 101A flashcard deck — Gaubert Spring 2026
// Each card: { id, deck, type, front, back }
// Types: def, formula, theorem, pattern, trap
// MathJax-friendly: use $...$ inline, $$...$$ display.

window.FC_DECK = [

// ── Consumer Theory: preferences & utility ──────────────────────
{ id:"c01", deck:"consumer", type:"def",
  front:"A preference relation $\\succsim$ is <b>rational</b> when it satisfies which two axioms?",
  back:"<b>Completeness</b> (for all $x,y$: $x\\succsim y$ or $y\\succsim x$) and <b>transitivity</b> (no cycles). Plus continuity, you get a continuous utility representation (Debreu)." },

{ id:"c02", deck:"consumer", type:"def",
  front:"What does it mean for preferences to be <b>convex</b>? Why do we assume it?",
  back:"For any $x,y$ with $x\\succsim z, y\\succsim z$: $\\alpha x + (1-\\alpha)y \\succsim z$. Intuitively: averages weakly preferred to extremes. Gives <b>diminishing MRS</b> and convex upper-contour sets, so FOCs identify a maximum." },

{ id:"c03", deck:"consumer", type:"trap",
  front:"$u_1(x,y)=xy$ and $u_2(x,y)=\\ln x+\\ln y$ — same preferences or different?",
  back:"<b>Same.</b> $u_2$ is a strictly increasing monotone transform of $u_1$. MRS is identical; ICs are identical. Marginal utilities differ — but those aren't observable." },

{ id:"c04", deck:"consumer", type:"formula",
  front:"Define MRS at $(x,y)$ for $u(x,y)$. What does it equal at the optimum?",
  back:"$$\\mathrm{MRS}_{xy} = \\frac{\\partial u/\\partial x}{\\partial u/\\partial y}$$ At an interior optimum: $\\mathrm{MRS}_{xy} = p_x/p_y$. Geometrically: the IC is tangent to the budget line." },

// ── UMP / Marshallian demand ─────────────────────────────────
{ id:"u01", deck:"consumer", type:"def",
  front:"State the UMP.",
  back:"$$\\max_{x\\ge 0}\\ u(x) \\quad \\text{s.t.}\\quad p\\cdot x\\le m$$ Solution $x^*(p,m)$ = <b>Marshallian demand</b>. Optimal value $v(p,m)$ = <b>indirect utility</b>." },

{ id:"u02", deck:"consumer", type:"pattern",
  front:"You see Cobb–Douglas $u=x^\\alpha y^{1-\\alpha}$. Demands?",
  back:"$$x^* = \\frac{\\alpha m}{p_x},\\quad y^* = \\frac{(1-\\alpha) m}{p_y}$$ Constant <b>expenditure shares</b>: $\\alpha$ on $x$, $1-\\alpha$ on $y$. Memorize." },

{ id:"u03", deck:"consumer", type:"pattern",
  front:"You see quasilinear $u = x + f(y)$ with $f$ concave. Demands?",
  back:"FOC in $y$: $f'(y) = p_y/p_x$, so $y^*$ depends only on the price ratio (no income effect on $y$). Then $x^* = (m - p_y y^*)/p_x$ absorbs all income changes." },

{ id:"u04", deck:"consumer", type:"pattern",
  front:"$u = x + 4\\ln y$, $p_x=1$, $p_y=p$, income $m$. Demands?",
  back:"$f(y)=4\\ln y \\Rightarrow f'(y)=4/y$. Setting $4/y = p$ gives $y^* = 4/p$ and $x^* = m - 4$. Watch: <b>$y^*$ ignores $m$</b>." },

{ id:"u05", deck:"consumer", type:"pattern",
  front:"Linear utility $u = x + y$ with $p_x = 1$, $p_y = p$. Demand?",
  back:"<b>Corner solutions.</b> If $p<1$: spend all on $y$, $y^*=m/p$, $x^*=0$. If $p>1$: spend all on $x$, $x^*=m$, $y^*=0$. If $p=1$: indifferent (any feasible split)." },

{ id:"u06", deck:"consumer", type:"pattern",
  front:"Leontief $u = \\min(\\alpha x, \\beta y)$. Demand?",
  back:"Optimum satisfies $\\alpha x = \\beta y$. Combined with budget: $x^* = \\dfrac{m}{p_x + (\\alpha/\\beta)p_y}$, $y^* = \\dfrac{m}{(\\beta/\\alpha)p_x + p_y}$. ICs are L-shaped — no substitution." },

// ── Duality & EMP ────────────────────────────────────────────
{ id:"d01", deck:"duality", type:"def",
  front:"State the EMP.",
  back:"$$\\min_{x\\ge 0}\\ p\\cdot x \\quad \\text{s.t.}\\quad u(x)\\ge \\bar u$$ Solution $h(p,\\bar u)$ = <b>Hicksian (compensated) demand</b>. Optimal value $e(p,\\bar u)$ = <b>expenditure function</b>." },

{ id:"d02", deck:"duality", type:"theorem",
  front:"State <b>Roy's Identity</b>.",
  back:"$$x_i(p,m) = -\\frac{\\partial v/\\partial p_i}{\\partial v/\\partial m}$$ Recovers Marshallian demand from indirect utility — no need to redo the UMP." },

{ id:"d03", deck:"duality", type:"theorem",
  front:"State <b>Shephard's Lemma</b>.",
  back:"$$h_i(p,\\bar u) = \\frac{\\partial e(p,\\bar u)}{\\partial p_i}$$ The Hicksian demand IS the derivative of the expenditure function in the corresponding price." },

{ id:"d04", deck:"duality", type:"def",
  front:"What four properties does $e(p,\\bar u)$ have in $p$?",
  back:"(1) Homogeneous of degree 1 in $p$. (2) Non-decreasing in each $p_i$. (3) Concave in $p$. (4) Continuous. Plus strictly increasing in $\\bar u$." },

{ id:"d05", deck:"duality", type:"trap",
  front:"What's the relationship $x(p,m)\\leftrightarrow h(p,\\bar u)$ at the optimum?",
  back:"<b>Duality identity:</b> $x(p, e(p,\\bar u)) = h(p,\\bar u)$ and $h(p, v(p,m)) = x(p,m)$. Marshallian and Hicksian agree at the right income/utility." },

// ── Slutsky ─────────────────────────────────────────────────
{ id:"s01", deck:"slutsky", type:"formula",
  front:"State the <b>Slutsky equation</b>.",
  back:"$$\\frac{\\partial x_i}{\\partial p_j} = \\underbrace{\\frac{\\partial h_i}{\\partial p_j}}_{\\text{substitution}} - \\underbrace{x_j\\,\\frac{\\partial x_i}{\\partial m}}_{\\text{income effect}}$$ Total = sub effect (along IC) − income effect (lost purchasing power)." },

{ id:"s02", deck:"slutsky", type:"pattern",
  front:"$p_x \\uparrow$. Sign of substitution effect on $x$? Of income effect on $x$ if $x$ is normal?",
  back:"Substitution: $\\partial h_x/\\partial p_x \\le 0$ (always, by Slutsky symmetry/concavity of $e$). Income (normal): $-x_x\\cdot \\partial x_x/\\partial m < 0$. Total: both push $x$ down." },

{ id:"s03", deck:"slutsky", type:"trap",
  front:"Giffen good — possible? What's the chain?",
  back:"$p \\uparrow \\Rightarrow$ income effect (real income falls) dominates substitution effect, AND $x$ is inferior, so quantity rises. Theoretically possible, empirically rare." },

{ id:"s04", deck:"slutsky", type:"theorem",
  front:"Why is the <b>Slutsky matrix</b> $S$ symmetric and negative semi-definite?",
  back:"$S_{ij}=\\partial h_i/\\partial p_j = \\partial^2 e/\\partial p_i \\partial p_j$. (1) Symmetry: cross-partials of $e$ are equal (Young's thm). (2) NSD: $e$ is concave in $p$." },

// ── Welfare: CV, EV, CS ──────────────────────────────────────
{ id:"w01", deck:"slutsky", type:"def",
  front:"Define <b>CV</b> (compensating variation).",
  back:"Income transfer required AFTER the price change to restore the OLD utility. Formally: $\\mathrm{CV} = e(p^1,u^0) - e(p^0,u^0) = e(p^1,u^0) - m$." },

{ id:"w02", deck:"slutsky", type:"def",
  front:"Define <b>EV</b> (equivalent variation).",
  back:"Income change at OLD prices equivalent (in welfare) to the price change. Formally: $\\mathrm{EV} = e(p^1,u^1) - e(p^0,u^1) = m - e(p^0,u^1)$." },

{ id:"w03", deck:"slutsky", type:"trap",
  front:"For a price increase, rank: ΔCS, CV, EV.",
  back:"For normal goods: $\\mathrm{EV} \\le \\Delta\\mathrm{CS} \\le \\mathrm{CV}$ (in absolute terms). They <b>coincide</b> for quasilinear preferences (no income effect)." },

{ id:"w04", deck:"slutsky", type:"pattern",
  front:"How do you compute CV as an integral?",
  back:"$$\\mathrm{CV} = \\int_{p^0}^{p^1} h(p,u^0)\\,dp$$ Area under the Hicksian demand. For quasilinear, $h=x$, so area under Marshallian works too." },

// ── Risk & EU ───────────────────────────────────────────────
{ id:"r01", deck:"risk", type:"def",
  front:"State <b>von Neumann–Morgenstern</b> expected utility.",
  back:"$$U(L) = \\sum_s \\pi_s\\,u(c_s)$$ where $u$ is the Bernoulli utility over outcomes. Unique up to positive affine transform — $u$ and $a+bu$ ($b>0$) represent same preferences." },

{ id:"r02", deck:"risk", type:"def",
  front:"<b>Risk aversion</b> ⇔ what curvature on $u$?",
  back:"<b>$u$ concave</b> (i.e., $u''<0$). By Jensen: $\\mathbb{E}[u(c)] < u(\\mathbb{E}[c])$ — the agent prefers the sure thing to the gamble of equal mean." },

{ id:"r03", deck:"risk", type:"formula",
  front:"Define <b>Arrow–Pratt</b> coefficients.",
  back:"Absolute: $A(c) = -u''(c)/u'(c)$. Relative: $R(c) = -c\\,u''(c)/u'(c)$. CARA = constant $A$ ($u=-e^{-\\alpha c}$). CRRA = constant $R$ ($u=c^{1-\\rho}/(1-\\rho)$)." },

{ id:"r04", deck:"risk", type:"def",
  front:"What is the <b>certainty equivalent</b> $\\mathrm{CE}$ of lottery $L$? The <b>risk premium</b>?",
  back:"$\\mathrm{CE}$: amount that makes you indifferent — $u(\\mathrm{CE}) = \\mathbb{E}[u(L)]$. Risk premium $\\pi = \\mathbb{E}[L] - \\mathrm{CE}$. For risk-averse $u$: $\\pi > 0$." },

{ id:"r05", deck:"risk", type:"pattern",
  front:"CARA utility $u(c)=-e^{-\\alpha c}$ with normal $c\\sim N(\\mu,\\sigma^2)$. CE?",
  back:"$$\\mathrm{CE} = \\mu - \\tfrac{1}{2}\\alpha\\sigma^2$$ Beautiful: mean penalized linearly by variance × half coefficient of absolute risk aversion. This is why finance loves CARA + Gaussian." },

// ── Intertemporal ───────────────────────────────────────────
{ id:"i01", deck:"consumer", type:"pattern",
  front:"Two-period consumption: $\\max u(c_1) + \\beta u(c_2)$ s.t. $c_1 + c_2/(1+r) = m_1 + m_2/(1+r)$. Euler equation?",
  back:"$$u'(c_1) = \\beta(1+r)\\,u'(c_2)$$ Marginal cost of saving today = marginal benefit tomorrow. With $u=\\ln c$: $c_2/c_1 = \\beta(1+r)$." },

// ── Producer Theory ─────────────────────────────────────────
{ id:"p01", deck:"producer", type:"def",
  front:"State the <b>cost-minimization problem (CMP)</b>.",
  back:"$$\\min_{L,K\\ge0}\\ wL + rK \\quad \\text{s.t.}\\quad f(L,K)\\ge y$$ Solution $L^*,K^*$ = conditional factor demands. Optimal value $C(w,r,y)$ = cost function." },

{ id:"p02", deck:"producer", type:"formula",
  front:"Optimality condition for CMP — tangency?",
  back:"$$\\mathrm{MRTS} = \\frac{f_L}{f_K} = \\frac{w}{r}$$ Slope of isoquant = factor-price ratio. With Cobb–Douglas $f=L^\\alpha K^\\beta$: $\\dfrac{\\alpha K}{\\beta L} = \\dfrac{w}{r}$." },

{ id:"p03", deck:"producer", type:"pattern",
  front:"$f(L,K)=L^{1/4}K^{1/4}$, $w=r=1$. Cost function $C(y)$?",
  back:"Symmetric ⇒ $L^*=K^*$. From $f=y$: $L^*=K^*=y^2$. So $C(y) = wL^* + rK^* = 2y^2$. Add fixed cost $F$: $C(y) = 2y^2 + F$." },

{ id:"p04", deck:"producer", type:"formula",
  front:"From $C(y) = 2y^2 + F$, find MC, AC, and $y$ at min AC.",
  back:"$\\mathrm{MC} = C'(y) = 4y$. $\\mathrm{AC} = 2y + F/y$. Min AC: $\\mathrm{MC=AC}$ ⇒ $4y = 2y + F/y$ ⇒ $y^2 = F/2$, so $y_{\\min}=\\sqrt{F/2}$, $\\mathrm{AC}_{\\min} = 4\\sqrt{F/2}$." },

{ id:"p05", deck:"producer", type:"pattern",
  front:"Competitive firm's supply curve?",
  back:"$p = \\mathrm{MC}(y)$ above the shut-down price. <b>Short run</b>: shut down if $p < \\min \\mathrm{AVC}$. <b>Long run</b>: exit if $p < \\min \\mathrm{AC}$." },

{ id:"p06", deck:"producer", type:"pattern",
  front:"<b>Free-entry long-run equilibrium</b> with identical firms?",
  back:"Profit = 0 ⇒ $p^* = \\min \\mathrm{AC}$. Each firm produces at $y_{\\min}$. $N^* = Q^*(p^*) / y_{\\min}$ where $Q^*$ comes from market demand at $p^*$." },

// ── Monopoly & oligopoly ────────────────────────────────────
{ id:"m01", deck:"markets", type:"formula",
  front:"<b>Lerner index</b> for monopolist?",
  back:"$$\\frac{p-\\mathrm{MC}}{p} = -\\frac{1}{\\varepsilon_d}$$ Markup is inverse of (absolute) elasticity. Inelastic demand ⇒ huge markup. Elastic ⇒ close to MC." },

{ id:"m02", deck:"markets", type:"pattern",
  front:"<b>Cournot</b> duopoly, linear demand $p=a-bQ$, MC$=c$. Best response of firm $i$?",
  back:"$$q_i^*(q_j) = \\frac{a-c}{2b} - \\frac{q_j}{2}$$ Symmetric Nash: $q^* = (a-c)/(3b)$ each. Total $Q = 2(a-c)/(3b)$, between monopoly and competitive." },

{ id:"m03", deck:"markets", type:"pattern",
  front:"<b>Bertrand</b> duopoly with homogeneous goods, identical MC$=c$. Equilibrium?",
  back:"$p^* = c$ for both. Undercutting unravels any $p>c$. Counterintuitive: two firms enough to get competitive outcome — Bertrand paradox." },

{ id:"m04", deck:"markets", type:"def",
  front:"<b>Stackelberg</b>: how does the leader benefit?",
  back:"Leader chooses $q_1$ knowing follower will play best response $q_2^*(q_1)$. Substitutes into own profit, optimizes — produces more, gets higher profit than Cournot (first-mover advantage)." },

{ id:"m05", deck:"markets", type:"def",
  front:"<b>Nash equilibrium</b>?",
  back:"Strategy profile where each player's strategy is a best response to the others'. No unilateral profitable deviation. Doesn't have to be Pareto efficient (Prisoner's Dilemma)." },

{ id:"m06", deck:"markets", type:"def",
  front:"<b>Subgame-perfect equilibrium</b>?",
  back:"A Nash equilibrium where players' strategies form a Nash equilibrium in <b>every subgame</b>. Solved by <b>backward induction</b> in finite games. Eliminates non-credible threats." },

// ── GE ──────────────────────────────────────────────────────
{ id:"g01", deck:"ge", type:"def",
  front:"State a <b>Walrasian (competitive) equilibrium</b> in an exchange economy.",
  back:"A price vector $p^*$ and allocation $(x_A^*, x_B^*)$ such that each agent maximizes utility at $p^*$ subject to budget $p^*\\cdot x_i \\le p^*\\cdot \\omega_i$, and markets clear: $\\sum x_i^* = \\sum \\omega_i$." },

{ id:"g02", deck:"ge", type:"pattern",
  front:"Walrasian 4-step recipe?",
  back:"(1) Write each agent's UMP, find demands $x_i(p)$. (2) Impose market clearing $\\sum x_i = \\sum \\omega_i$. (3) Solve for relative prices $p_y/p_x$ (normalize one). (4) Plug back to get allocation. Verify Walras' Law." },

{ id:"g03", deck:"ge", type:"theorem",
  front:"State the <b>First Welfare Theorem</b>.",
  back:"Every Walrasian equilibrium is <b>Pareto efficient</b>. Assumes locally non-satiated preferences. No assumption of convexity or completeness." },

{ id:"g04", deck:"ge", type:"theorem",
  front:"State the <b>Second Welfare Theorem</b>.",
  back:"Under convex preferences + production sets, every Pareto-efficient allocation can be supported as a Walrasian equilibrium <b>after a suitable redistribution of endowments</b>. Key caveat: not from original endowment." },

{ id:"g05", deck:"ge", type:"trap",
  front:"FWT vs SWT — which one needs convexity?",
  back:"<b>SWT</b> needs convexity (to use separating hyperplane). <b>FWT</b> doesn't — it just needs LNS. FWT says \"markets ⇒ efficient.\" SWT says \"any efficient point reachable via prices, after redistribution.\"" },

{ id:"g06", deck:"ge", type:"def",
  front:"<b>Edgeworth box</b> — what's the contract curve?",
  back:"Locus of Pareto-efficient allocations — where A's and B's ICs are tangent: $\\mathrm{MRS}^A = \\mathrm{MRS}^B$. The Walrasian equilibrium lives on this curve, on the line through the endowment with slope $-p_x/p_y$." },

// ── Externalities / market failure ──────────────────────────
{ id:"e01", deck:"markets", type:"def",
  front:"<b>Pigouvian tax</b> — what does it do?",
  back:"A per-unit tax equal to the <b>marginal external damage</b> at the social optimum: $t^* = \\mathrm{MEC}(q^*)$. Internalizes the externality and restores efficiency in a perfect-info world." },

{ id:"e02", deck:"markets", type:"def",
  front:"<b>Coase theorem</b> — what's the punchline?",
  back:"With well-defined property rights and zero transaction costs, parties bargain to the efficient outcome <b>regardless of who has the rights</b>. The allocation of rights affects distribution, not efficiency." },

// ── Exam traps ──────────────────────────────────────────────
{ id:"t01", deck:"traps", type:"trap",
  front:"You're forming $\\mathcal L = u(x,y) - \\lambda(p_x x + p_y y - m)$. What is $\\partial \\mathcal L/\\partial x$ when $u = x + 4\\ln y$?",
  back:"$$\\frac{\\partial \\mathcal L}{\\partial x} = 1 - \\lambda p_x$$ <b>NOT</b> $1 + 4\\ln y - \\lambda p_x$. The term $4\\ln y$ has no $x$ in it — its partial w.r.t. $x$ is <b>zero</b>. This is the single highest-cost mistake on Gaubert exams." },

{ id:"t02", deck:"traps", type:"trap",
  front:"At an interior optimum, when does $\\lambda$ equal 1?",
  back:"When the marginal utility of the linear good (in quasilinear $u = x + f(y)$ with $p_x = 1$) equals 1. Here $\\partial u/\\partial x = 1$, so FOC gives $1 - \\lambda\\cdot 1 = 0 \\Rightarrow \\lambda=1$. <b>Always check this before computing demands.</b>" },

{ id:"t03", deck:"traps", type:"trap",
  front:"Linear utility $u=x+y$: what determines the equilibrium price in an Edgeworth box?",
  back:"<b>Market clearing</b>, not utility maximization. At $p_x=p_y$ the linear-utility consumer is indifferent and can absorb the residual; the price ratio is pinned to 1 by the kink in aggregate demand." },

{ id:"t04", deck:"traps", type:"trap",
  front:"You wrote $\\frac{\\partial}{\\partial y}[x + 4\\ln y]$. What's the answer?",
  back:"$$= 0 + 4\\cdot\\frac{1}{y} = \\frac{4}{y}$$ The $x$ is a constant w.r.t. $y$, so its partial is 0. Don't write $1 + 4/y$." },

{ id:"t05", deck:"traps", type:"trap",
  front:"In the producer chain: when does shut-down happen in the short run vs long run?",
  back:"Short run: shut down if $p < \\min \\mathrm{AVC}$ (fixed costs are sunk). Long run: exit if $p < \\min \\mathrm{AC}$ (everything is variable). Long-run zero-profit ⇒ $p^* = \\min \\mathrm{AC}$." },

{ id:"t06", deck:"traps", type:"trap",
  front:"You computed Cournot best response and got $q_i = (a-c)/(2b) - q_j/2$. Symmetric Nash $q^*$?",
  back:"Set $q_i=q_j=q$: $q = (a-c)/(2b) - q/2 \\Rightarrow (3/2)q = (a-c)/(2b) \\Rightarrow q^* = (a-c)/(3b)$. <b>Don't forget the factor of 3.</b>" },

// ── Envelope theorem etc ────────────────────────────────────
{ id:"x01", deck:"duality", type:"theorem",
  front:"<b>Envelope theorem</b> for $v(p,m) = \\max_x u(x)$ s.t. $p\\cdot x = m$.",
  back:"$$\\frac{\\partial v}{\\partial m} = \\lambda^*, \\quad \\frac{\\partial v}{\\partial p_i} = -\\lambda^* x_i^*$$ Roy's identity is just $\\partial v/\\partial p_i \\div \\partial v/\\partial m = -x_i^*$." },

{ id:"x02", deck:"duality", type:"theorem",
  front:"What is $\\partial e(p,\\bar u)/\\partial \\bar u$?",
  back:"$$\\frac{\\partial e}{\\partial \\bar u} = \\frac{1}{\\lambda^*_{UMP}} = \\mu^*_{EMP}$$ The shadow price of the utility constraint — marginal cost of one more util." },

// ── Adverse selection ───────────────────────────────────────
{ id:"a01", deck:"markets", type:"pattern",
  front:"Akerlof's <b>lemons</b> model — why does the market unravel?",
  back:"Buyer's WTP = $\\mathbb{E}[\\text{quality}|\\text{for sale}]$. High-quality sellers exit at low prices, dropping average quality, dropping WTP further. Equilibrium: only lowest-quality cars trade." },

];
