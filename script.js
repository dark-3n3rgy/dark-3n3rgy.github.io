const expertise = [
  ['01','Cybersecurity','Security strategy, assessments & practical hardening.'],
  ['02','Ethical Hacking','Adversary-minded testing with an authorized, defensive purpose.'],
  ['03','Security Research','Investigating weaknesses, threats & emerging attack patterns.'],
  ['04','VAPT','Vulnerability assessment and penetration testing across environments.'],
  ['05','Web & App Security','Application-layer thinking from attack surface to remediation.'],
  ['06','Network Security','Infrastructure visibility, segmentation, exposure & defense.'],
  ['07','Threat Analysis','Turning technical signals into actionable security insight.'],
  ['08','OSINT','Structured intelligence gathering from open sources.'],
  ['09','Cyber Defense','Detection-minded engineering and resilient security operations.'],
  ['10','Security Architecture','Designing security controls into systems, not around them.'],
  ['11','Incident Response','Investigation, containment and recovery-oriented thinking.'],
  ['12','Risk Management','Prioritization that connects technical risk with business context.'],
];
const timeline = [
  ['Current','Founder & CEO','eXecure','Building cybersecurity initiatives and practical security solutions focused on research, defense, and professional development.','Founder'],
  ['Current','Founder & Director of Administration','ZedX EYE','Leading administration, strategy, and organizational development.','Leadership'],
  ['Current','Ethical Hacking & Cyber Security Instructor','eShikhon.com','Training and mentoring learners in Ethical Hacking, Cybersecurity, AI, and cyber awareness; 7+ years of training experience.','Education'],
  ['Former','Director (Board) — IT & Operations','Skills Hut Limited','Led technology, IT operations, infrastructure, security, and organizational technology initiatives.','Executive'],
  ['Former','Deputy Manager (IT) & Security Researcher','Tradewave Technology','Technology and security research responsibilities across organizational environments.','Security'],
  ['Former','Cyber Security Team Lead & Trainer','National Emergency Service 999','Security leadership and cybersecurity training in a mission-critical public-service environment.','Public Service'],
];
const press = ['Ekushey Television (ETV)','Prothom Alo','Kalbela','Somoy TV','Jugantor','Ittefaq','The Bangladesh Today','More'];

const expertiseGrid = document.getElementById('expertiseGrid');
expertiseGrid.innerHTML = expertise.map(([n,t,d]) => `<article class="expertise-card reveal"><span class="expertise-index">${n}</span><h3>${t}</h3><p>${d}</p></article>`).join('');

document.getElementById('timeline').innerHTML = timeline.map(([period,role,org,desc,tag]) => `<article class="timeline-item reveal"><div class="timeline-year">${period.toUpperCase()}</div><div><div class="timeline-role">${role}</div><div class="timeline-org">${org}</div><div class="timeline-desc">${desc}</div></div><div class="timeline-tag">${tag}</div></article>`).join('');
document.getElementById('pressWall').innerHTML = press.map((name,i) => `<div class="press-chip"><div><strong>${name}</strong><small>${i === press.length-1 ? 'And more' : 'National media'}</small></div></div>`).join('');
document.getElementById('year').textContent = new Date().getFullYear();

const header = document.querySelector('.site-header');
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => { header.classList.toggle('scrolled', scrollY > 24); toTop.classList.toggle('show', scrollY > 600); }, {passive:true});
toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

const menuBtn = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
menuBtn.addEventListener('click', () => { const open = mobileNav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open); });
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { mobileNav.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); }));

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) entry.target.classList.add('visible'); }), {threshold:.13});
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => card.addEventListener('pointermove', e => { const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5; const y=(e.clientY-r.top)/r.height-.5; card.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${y*-8}deg) translateZ(4px)`; }));
tiltCards.forEach(card => card.addEventListener('pointerleave', () => card.style.transform=''));

const heroVisual = document.getElementById('heroVisual');
heroVisual.addEventListener('pointermove', e => { const r=heroVisual.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5; const y=(e.clientY-r.top)/r.height-.5; const core=heroVisual.querySelector('.core-card'); core.style.transform=`rotateY(${x*5}deg) rotateX(${y*-5}deg)`; });
heroVisual.addEventListener('pointerleave', () => heroVisual.querySelector('.core-card').style.transform='');

const counters = document.querySelectorAll('.stat-value');
const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting || entry.target.dataset.done) return; entry.target.dataset.done='1'; const target=Number(entry.target.dataset.target); const duration=target > 1000 ? 1300 : 900; const start=performance.now(); const step=now => { const p=Math.min((now-start)/duration,1); const eased=1-Math.pow(1-p,3); entry.target.textContent=Math.round(target*eased).toLocaleString(); if(p<1) requestAnimationFrame(step); }; requestAnimationFrame(step); }), {threshold:.5});
counters.forEach(c => counterObserver.observe(c));

const toast = document.getElementById('toast');
const email = 'raiyanmalik07@gmail.com';
const emailLink = document.querySelector('.mail-link');
emailLink.addEventListener('click', async e => { if (!navigator.clipboard) return; try { await navigator.clipboard.writeText(email); toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),1800); } catch {} });

// Lightweight animated background particles — no dependencies.
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles=[]; let mouse={x:-9999,y:-9999};
function resize(){ canvas.width=innerWidth*devicePixelRatio; canvas.height=innerHeight*devicePixelRatio; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); const count=Math.min(80, Math.floor(innerWidth/18)); particles=Array.from({length:count},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.18,vy:(Math.random()-.5)*.18,r:Math.random()*1.3+.35})); }
function animate(){ ctx.clearRect(0,0,innerWidth,innerHeight); for(const p of particles){ p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1; const dx=p.x-mouse.x,dy=p.y-mouse.y,d=Math.hypot(dx,dy); if(d<130){p.x+=dx/d*.22;p.y+=dy/d*.22;} ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(24,216,255,.55)';ctx.fill(); }
  requestAnimationFrame(animate);
}
addEventListener('resize',resize); addEventListener('pointermove',e=>mouse={x:e.clientX,y:e.clientY},{passive:true}); resize(); animate();
