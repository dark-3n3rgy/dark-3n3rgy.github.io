(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  const loader = $('#loader');
  const canvas = $('#hero-canvas');
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const hideLoader = () => loader?.classList.add('hide');
  addEventListener('load', hideLoader, { once: true });
  setTimeout(hideLoader, 1800);

  const palette = {
    blue: 0x1aa6ff,
    blueBright: 0x75c9ff,
    wine: 0x8f1739,
    wineBright: 0xc63c68,
    ink: 0x05060a,
    steel: 0x263544
  };

  function initThree() {
    if (!canvas || !window.THREE || !window.WebGLRenderingContext) return false;
    try {
      const THREE = window.THREE;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(innerWidth, innerHeight, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020308, 0.018);
      const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
      camera.position.set(0.15, 0.05, 10.6);

      const universe = new THREE.Group();
      scene.add(universe);

      // Central security singularity.
      const singularity = new THREE.Group();
      singularity.position.set(2.55, 0.15, 0.15);
      universe.add(singularity);

      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.18, 5),
        new THREE.MeshPhysicalMaterial({
          color: 0x02050a,
          metalness: 0.72,
          roughness: 0.14,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          emissive: 0x071c2c,
          emissiveIntensity: 1.55,
          transmission: 0.08
        })
      );
      singularity.add(core);

      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(1.45, 96, 96),
        new THREE.MeshBasicMaterial({ color: palette.blue, transparent: true, opacity: 0.045, side: THREE.BackSide })
      );
      singularity.add(shell);

      const wire = new THREE.Mesh(
        new THREE.TorusKnotGeometry(1.52, 0.075, 220, 22, 2, 3),
        new THREE.MeshBasicMaterial({ color: palette.blueBright, transparent: true, opacity: 0.62, wireframe: true })
      );
      singularity.add(wire);

      // Layered orbital rings.
      const orbitSpecs = [
        { r: 2.15, tube: 0.025, color: palette.blueBright, rx: 0.75, ry: 0.05, rz: 0.4, speed: 0.0027 },
        { r: 2.65, tube: 0.012, color: palette.wineBright, rx: 1.05, ry: 0.8, rz: 0.1, speed: -0.0018 },
        { r: 3.15, tube: 0.009, color: palette.blue, rx: 0.32, ry: 1.32, rz: 0.55, speed: 0.0012 },
        { r: 3.62, tube: 0.007, color: palette.wine, rx: 0.85, ry: 0.28, rz: 1.1, speed: -0.00085 }
      ];
      const orbiters = orbitSpecs.map(spec => {
        const mesh = new THREE.Mesh(
          new THREE.TorusGeometry(spec.r, spec.tube, 10, 260),
          new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0.62 })
        );
        mesh.rotation.set(spec.rx, spec.ry, spec.rz);
        mesh.userData.speed = spec.speed;
        singularity.add(mesh);
        return mesh;
      });

      // Accretion-disc style shards.
      const shardGroup = new THREE.Group();
      singularity.add(shardGroup);
      for (let i = 0; i < 42; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 1.55 + Math.random() * 2.1;
        const shard = new THREE.Mesh(
          new THREE.BoxGeometry(0.055 + Math.random() * 0.13, 0.015 + Math.random() * 0.035, 0.015 + Math.random() * 0.06),
          new THREE.MeshBasicMaterial({ color: i % 5 === 0 ? palette.wineBright : palette.blueBright, transparent: true, opacity: 0.25 + Math.random() * 0.45 })
        );
        shard.position.set(Math.cos(a) * r, (Math.random() - 0.5) * 0.48, Math.sin(a) * r * 0.54);
        shard.rotation.y = a;
        shard.userData.angular = 0.003 + Math.random() * 0.007;
        shardGroup.add(shard);
      }

      // Floating holographic panels around the hero object.
      const panelGroup = new THREE.Group();
      universe.add(panelGroup);
      const panels = [];
      const panelData = [
        { x: 0.2, y: 2.65, z: -0.4, w: 1.25, h: 0.72, accent: palette.blue },
        { x: 4.95, y: 1.15, z: -0.65, w: 1.15, h: 0.72, accent: palette.wineBright },
        { x: 4.55, y: -2.25, z: 0.25, w: 1.4, h: 0.7, accent: palette.blueBright },
        { x: 0.05, y: -2.55, z: -0.8, w: 1.15, h: 0.62, accent: palette.wine }
      ];
      panelData.forEach((p, idx) => {
        const g = new THREE.Group();
        g.position.set(p.x, p.y, p.z);
        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(p.w, p.h, 0.025),
          new THREE.MeshBasicMaterial({ color: 0x0b1220, transparent: true, opacity: 0.48 })
        );
        const edge = new THREE.LineSegments(
          new THREE.EdgesGeometry(frame.geometry),
          new THREE.LineBasicMaterial({ color: p.accent, transparent: true, opacity: 0.55 })
        );
        g.add(frame, edge);
        // Tiny bars create a HUD feel without requiring textures.
        for (let b = 0; b < 5; b++) {
          const bar = new THREE.Mesh(
            new THREE.BoxGeometry(p.w * (0.18 + Math.random() * 0.25), 0.018, 0.012),
            new THREE.MeshBasicMaterial({ color: p.accent, transparent: true, opacity: 0.38 })
          );
          bar.position.set(-p.w * 0.3 + b * p.w * 0.12, -p.h * 0.22 + Math.random() * p.h * 0.5, 0.03);
          g.add(bar);
        }
        g.rotation.set((Math.random() - 0.5) * 0.22, (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.16);
        g.userData.baseY = p.y;
        g.userData.phase = idx * 1.7;
        panelGroup.add(g);
        panels.push(g);
      });

      // Particle field.
      const pgeo = new THREE.BufferGeometry();
      const count = 1800;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const blueC = new THREE.Color(palette.blueBright);
      const wineC = new THREE.Color(palette.wineBright);
      for (let i = 0; i < count; i++) {
        const radius = 5.5 + Math.random() * 8.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.cos(phi);
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        const c = Math.random() > 0.78 ? wineC : blueC;
        colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
      }
      pgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pgeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const stars = new THREE.Points(
        pgeo,
        new THREE.PointsMaterial({ size: 0.018, transparent: true, opacity: 0.56, vertexColors: true, sizeAttenuation: true })
      );
      scene.add(stars);

      // Perspective grid floor.
      const grid = new THREE.GridHelper(28, 28, palette.blue, 0x1b2633);
      grid.position.set(1.5, -4.2, -2.5);
      grid.rotation.x = 0.04;
      grid.material.transparent = true;
      grid.material.opacity = 0.09;
      scene.add(grid);

      // Floating 3D security nodes and transparent cubes add depth around the main singularity.
      const nodeGroup = new THREE.Group();
      universe.add(nodeGroup);
      const nodes = [];
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        const radius = 3.9 + (i % 3) * 0.55;
        const g = new THREE.Group();
        g.position.set(Math.cos(angle) * radius, (Math.sin(i * 1.91) * 0.42), Math.sin(angle) * radius * 0.62);
        const size = 0.07 + (i % 4) * 0.025;
        const node = new THREE.Mesh(
          new THREE.IcosahedronGeometry(size, 1),
          new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? palette.wineBright : palette.blueBright, transparent: true, opacity: 0.75 })
        );
        const halo = new THREE.Mesh(
          new THREE.SphereGeometry(size * 2.9, 20, 20),
          new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? palette.wine : palette.blue, transparent: true, opacity: 0.035 })
        );
        g.add(node, halo);
        g.userData.phase = i * 0.7;
        g.userData.spin = 0.002 + (i % 5) * 0.0007;
        nodeGroup.add(g);
        nodes.push(g);
      }
      const cubeGroup = new THREE.Group();
      universe.add(cubeGroup);
      const cubes = [];
      [
        {p:[-1.5,1.8,-1.4],s:.58,c:palette.wine},
        {p:[4.5,.35,-2],s:.42,c:palette.blue},
        {p:[3.6,-2.1,-1.3],s:.28,c:palette.wineBright},
        {p:[-2.6,-1.9,-1.8],s:.34,c:palette.blueBright}
      ].forEach((d, i) => {
        const geo = new THREE.BoxGeometry(d.s,d.s,d.s);
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({color:d.c,transparent:true,opacity:.42}));
        edges.position.set(...d.p);
        edges.rotation.set(.3+i*.2,.5-i*.1,.2);
        cubeGroup.add(edges);
        cubes.push(edges);
      });

      scene.add(new THREE.AmbientLight(0x8eabc8, 0.7));
      const blueLight = new THREE.PointLight(palette.blue, 18, 28); blueLight.position.set(3.2, 3.3, 5.5); scene.add(blueLight);
      const wineLight = new THREE.PointLight(palette.wine, 14, 24); wineLight.position.set(-4.3, -2.3, 3); scene.add(wineLight);
      const rimLight = new THREE.DirectionalLight(0x8bcaff, 2.2); rimLight.position.set(-2, 4, 4); scene.add(rimLight);

      let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
      addEventListener('pointermove', e => {
        targetX = (e.clientX / innerWidth - 0.5) * 1.0;
        targetY = (e.clientY / innerHeight - 0.5) * 0.7;
      }, { passive: true });

      const resize = () => {
        renderer.setSize(innerWidth, innerHeight, false);
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
      };
      addEventListener('resize', resize, { passive: true });

      let t = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        t += 0.006;
        currentX += (targetX - currentX) * 0.035;
        currentY += (targetY - currentY) * 0.035;

        universe.rotation.y = currentX * 0.05;
        universe.rotation.x = currentY * 0.028;
        universe.position.x += (currentX * 0.15 - universe.position.x) * 0.018;
        universe.position.y += (-currentY * 0.1 - universe.position.y) * 0.018;

        singularity.rotation.y += 0.0014;
        singularity.rotation.x = Math.sin(t * 0.75) * 0.055;
        core.rotation.y -= 0.0018;
        core.rotation.z += 0.0007;
        shell.scale.setScalar(1 + Math.sin(t * 1.2) * 0.025);
        wire.rotation.z += 0.0015;
        orbiters.forEach((o, i) => { o.rotation.z += o.userData.speed; o.rotation.y += o.userData.speed * (i % 2 ? 0.65 : -0.42); });
        shardGroup.rotation.y -= 0.0019;
        stars.rotation.y -= 0.00018;
        grid.rotation.z = Math.sin(t * 0.18) * 0.008;

        panels.forEach((p, i) => {
          p.position.y = p.userData.baseY + Math.sin(t * 0.7 + p.userData.phase) * 0.08;
          p.rotation.z += (i % 2 ? -1 : 1) * 0.00055;
        });
        nodes.forEach((n, i) => {
          n.position.y += Math.sin(t * 0.8 + n.userData.phase) * 0.0009;
          n.rotation.x += n.userData.spin;
          n.rotation.y -= n.userData.spin * 0.7;
        });
        cubes.forEach((cube, i) => {
          cube.rotation.x += 0.0012 + i * 0.00015;
          cube.rotation.y -= 0.001 + i * 0.00018;
        });

        blueLight.position.x = 3.2 + Math.sin(t) * 1.2;
        wineLight.position.y = -2.3 + Math.cos(t * 0.8) * 1.1;
        renderer.render(scene, camera);
      };
      animate();
      return true;
    } catch (err) {
      console.warn('3D renderer unavailable; using canvas fallback.', err);
      return false;
    }
  }

  function initFallback() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const particles = Array.from({ length: 180 }, () => ({
      x: Math.random(), y: Math.random(), z: Math.random(), speed: 0.00045 + Math.random() * 0.0015, wine: Math.random() > 0.8
    }));
    const resize = () => {
      w = innerWidth; h = innerHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); addEventListener('resize', resize, { passive: true });
    let phase = 0;
    const draw = () => {
      requestAnimationFrame(draw); phase += 0.006; ctx.clearRect(0, 0, w, h);
      const cx = w * 0.76, cy = h * 0.48, base = Math.min(w, h) * 0.22;
      for (const p of particles) {
        p.z = (p.z + p.speed) % 1; const depth = 0.1 + p.z * 0.9;
        const x = cx + (p.x - 0.5) * base * 6.4 * depth;
        const y = cy + (p.y - 0.5) * base * 6.4 * depth;
        ctx.fillStyle = p.wine ? `rgba(198,60,104,${0.05 + depth * 0.25})` : `rgba(117,201,255,${0.06 + depth * 0.3})`;
        ctx.beginPath(); ctx.arc(x, y, Math.max(0.45, 2.2 * depth), 0, Math.PI * 2); ctx.fill();
      }
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(phase * 0.35);
      for (let i = 0; i < 6; i++) {
        ctx.save(); ctx.rotate(i * Math.PI / 6 + phase * (i % 2 ? -0.14 : 0.08));
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(198,60,104,.54)' : 'rgba(117,201,255,.5)';
        ctx.lineWidth = i % 2 ? 1 : 1.6;
        ctx.beginPath(); ctx.ellipse(0, 0, base * (1.45 - i * 0.08), base * (0.28 + i * 0.025), 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      const grad = ctx.createRadialGradient(0, 0, base * .08, 0, 0, base * 1.1);
      grad.addColorStop(0, 'rgba(0,0,0,.95)'); grad.addColorStop(.38, 'rgba(15,38,55,.72)'); grad.addColorStop(.64, 'rgba(26,166,255,.18)'); grad.addColorStop(1, 'rgba(3,4,7,0)');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, base * 1.05, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };
    draw();
  }

  if (!initThree()) initFallback();

  // Project modal data.
  const projects = {
    guardian: { title: 'Guardian Watch', body: 'A digital-security project associated with public-service technology and child-focused monitoring. Portfolio framing emphasizes the engineering objective and societal impact rather than operational implementation details.', meta: 'DIGITAL SECURITY · MOBILE · PUBLIC SERVICE' },
    wintel: { title: 'WIntel', body: 'A Python OSINT utility for WHOIS data retrieval, designed to support reconnaissance, bug hunting and penetration-testing workflows within authorized environments.', meta: 'PYTHON · OSINT · RECONNAISSANCE' },
    ophunter: { title: 'OPHunter', body: 'A lightweight open-port discovery utility focused on identifying exposed network services during authorized security assessment work.', meta: 'NETWORK SECURITY · PYTHON · DISCOVERY' },
    lazypusher: { title: 'LazyPusher', body: 'A Python developer-automation utility that streamlines common Git initialization, commit and push tasks with interactive branch and commit-message handling.', meta: 'PYTHON · AUTOMATION · GIT' },
    shareforce: { title: 'ShareForce', body: 'An authorized SharePoint directory enumeration and security-testing tool intended to identify common paths, exposure and misconfiguration during controlled assessments.', meta: 'SHAREPOINT · WEB SECURITY · AUTHORIZED TESTING' }
  };
  const modal = $('#project-modal'), mt = $('#modal-title'), mb = $('#modal-body'), mm = $('#modal-meta');
  $$('.project-row').forEach(btn => btn.addEventListener('click', () => {
    const p = projects[btn.dataset.project]; if (!p || !modal) return;
    mt.textContent = p.title; mb.textContent = p.body; mm.textContent = p.meta;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
  }));
  const closeModal = () => { modal?.classList.remove('open'); modal?.setAttribute('aria-hidden', 'true'); };
  $('.modal-close')?.addEventListener('click', closeModal); $('.modal-backdrop')?.addEventListener('click', closeModal);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Nav state.
  const nav = $('#nav'); let lastY = 0;
  addEventListener('scroll', () => {
    if (!nav) return; const y = scrollY;
    nav.style.background = y > 30 ? 'rgba(5,6,10,.78)' : 'linear-gradient(180deg,rgba(5,6,10,.94),rgba(5,6,10,0))';
    nav.style.transform = y > lastY && y > 140 ? 'translateY(-6px)' : 'translateY(0)';
    lastY = y;
  }, { passive: true });

  // Premium pointer-reactive 3D cards.
  const cards = $$('.cap-card, .project-row, .stats > div');
  cards.forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
      card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      card.classList.add('tilting');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      card.classList.remove('tilting');
    });
  });

  // Reveal-on-scroll.
  const revealTargets = $$('.section-kicker, .manifesto-layout, .cap-card, .research-head, .project-row, .timeline-item, .impact-hero, .stats > div, .media-strip, .contact-copy');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); io.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealTargets.forEach(el => io.observe(el));
  } else revealTargets.forEach(el => el.classList.add('in-view'));
})();

/* Extra 3D visual layer — deliberately additive so the core portfolio remains resilient. */
(() => {
  const c = document.getElementById('hero-canvas');
  if (!c || !window.THREE) return;
  try {
    const THREE = window.THREE;
    // The existing scene owns the renderer/camera; this layer is represented through DOM for reliable compositing.
    const huds = document.querySelectorAll('.hero-hud');
    let t = 0;
    const tick = () => {
      t += 0.01;
      huds.forEach((el, i) => {
        const x = Math.sin(t * (i + 1) * 0.35) * 8;
        const y = Math.cos(t * (i + 1) * 0.24) * 6;
        el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      });
      requestAnimationFrame(tick);
    };
    tick();
  } catch (_) {}
})();
