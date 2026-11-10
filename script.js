if (window.lucide) {
  window.lucide.createIcons();
}

document.getElementById('year').textContent = new Date().getFullYear();

const navigationLinks = document.querySelectorAll('nav a');
const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      for (const link of navigationLinks) {
        const isCurrent = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', isCurrent);
        if (isCurrent) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    }
  }
}, { rootMargin: '-15% 0px -45% 0px' });

for (const link of navigationLinks) {
  const section = document.querySelector(link.hash);
  if (section) sectionObserver.observe(section);
}

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

function generateText(element, duration, delay = 0, onFinish = () => {}) {
  const fullText = element.textContent;
  const source = document.createElement('span');
  source.className = 'intro-source';
  source.append(...element.childNodes);

  const generated = document.createElement('span');
  generated.className = 'intro-generated';
  generated.setAttribute('aria-hidden', 'true');
  generated.setAttribute('inert', '');

  const textWalker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  const textSegments = [];
  let textOffset = 0;
  while (textWalker.nextNode()) {
    const node = textWalker.currentNode;
    textSegments.push({ node, start: textOffset, end: textOffset + node.textContent.length });
    textOffset += node.textContent.length;
  }
  const textRange = document.createRange();
  textRange.setStart(source, 0);

  element.replaceChildren(source, generated);
  element.classList.add('generated-text', 'is-typing');

  let startTime;
  let animationFrame;

  function finishTyping() {
    cancelAnimationFrame(animationFrame);
    element.classList.remove('is-typing');
    element.replaceChildren(...source.childNodes);
    motionPreference.removeEventListener('change', finishTyping);
    window.removeEventListener('beforeprint', finishTyping);
    onFinish();
  }

  function typeText(timestamp) {
    if (startTime === undefined) startTime = timestamp;
    const progress = Math.max(0, (timestamp - startTime - delay) / duration);
    const characterCount = Math.floor(progress * fullText.length / 4) * 4;

    if (progress >= 1) {
      finishTyping();
    } else {
      const segment = textSegments.find(item => item.end >= characterCount);
      if (segment) {
        textRange.setEnd(segment.node, characterCount - segment.start);
        generated.replaceChildren(textRange.cloneContents());
      }
      animationFrame = requestAnimationFrame(typeText);
    }
  }

  motionPreference.addEventListener('change', finishTyping);
  window.addEventListener('beforeprint', finishTyping);
  animationFrame = requestAnimationFrame(typeText);
  return finishTyping;
}

if (!motionPreference.matches) {
  document.querySelector('.intro').classList.add('reveal', 'is-introducing');
  const description = document.getElementById('intro-description');
  generateText(description, description.textContent.length / 0.092);
}

if (!motionPreference.matches && typeof Element.prototype.animate === 'function') {
  const activeReveals = new Map();
  const activeGenerations = new Map();
  const narrativeSelector = '.section-heading h2, .project h3, .project > p, .experience-company h3, .experience-detail h4, .experience-detail > p, .experience-detail > ul:not(.tags) > li, .publication-layout > div > p:not(.eyebrow), .skill-group h3, .skill-group > p, .about-copy, .education h4, .education p';
  const placementDuration = 720;

  function trackReveal(element, keyframes, timing) {
    const animation = element.animate(keyframes, timing);
    activeReveals.set(animation, element);
    const removeReveal = () => activeReveals.delete(animation);
    animation.finished.then(removeReveal, removeReveal);
  }

  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      revealObserver.unobserve(entry.target);
      entry.target.classList.remove('scroll-pending');

      if (entry.target.contains(document.activeElement)) continue;

      trackReveal(entry.target, [
        { opacity: 0, transform: 'translateY(36px) scale(0.98)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ], {
        duration: placementDuration,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards'
      });

      const elements = entry.target.matches('.experience-row')
        ? entry.target.querySelectorAll('.experience-company, .experience-detail > *')
        : entry.target.children;

      Array.from(elements).forEach((element, index) => {
        if (element.contains(document.activeElement)) return;

        const contentDelay = placementDuration - 180 + Math.min(index * 70, 210);

        trackReveal(element, [
          { opacity: 0, transform: 'translateY(8px)', clipPath: 'inset(0 0 12% 0)' },
          { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0 0 0 0)' }
        ], {
          duration: 480,
          delay: contentDelay,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards'
        });

        const paragraphs = element.matches(narrativeSelector)
          ? [element]
          : element.querySelectorAll(narrativeSelector);

        for (const [paragraphIndex, paragraph] of Array.from(paragraphs).entries()) {
          const finishGeneration = generateText(
            paragraph,
            Math.min(2000, Math.max(1000, paragraph.textContent.length * 5)),
            placementDuration + Math.min(index * 90, 270) + Math.min(paragraphIndex * 45, 450),
            () => activeGenerations.delete(paragraph)
          );
          activeGenerations.set(paragraph, finishGeneration);
        }
      });
    }
  }, { threshold: 0.08, rootMargin: '0px 0px -7% 0px' });

  const revealTargets = document.querySelectorAll(
    '.discipline-strip, .section-heading, .project, .experience-row, .publication-layout, .skill-group, .about > div, .contact > .container'
  );

  revealTargets.forEach(element => {
    element.classList.add('scroll-pending');
    revealObserver.observe(element);
  });

  function stopScrollReveals() {
    revealObserver.disconnect();
    revealTargets.forEach(element => element.classList.remove('scroll-pending'));
    for (const animation of activeReveals.keys()) animation.cancel();
    activeReveals.clear();
    for (const finishGeneration of activeGenerations.values()) finishGeneration();
    activeGenerations.clear();
  }

  motionPreference.addEventListener('change', stopScrollReveals, { once: true });
  window.addEventListener('beforeprint', stopScrollReveals);
  document.addEventListener('focusin', (event) => {
    const pendingBlock = event.target.closest('.scroll-pending');
    if (pendingBlock) {
      pendingBlock.classList.remove('scroll-pending');
      revealObserver.unobserve(pendingBlock);
    }
    for (const [animation, element] of activeReveals) {
      if (element.contains(event.target)) animation.cancel();
    }
    for (const [element, finishGeneration] of activeGenerations) {
      if (element.contains(event.target)) finishGeneration();
    }
  });
}