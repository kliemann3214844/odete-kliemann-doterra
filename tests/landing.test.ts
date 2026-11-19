import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const htmlPath = path.resolve(process.cwd(), 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

test('index.html has zero external frameworks, CDNs, or stylesheet links', () => {
  assert.equal(/<script[^>]+src=/i.test(html), false, 'Should not load external scripts');
  assert.equal(/<link[^>]+rel=["']stylesheet["']/i.test(html), false, 'Should not load external stylesheets');
  assert.equal(/cdn\.|unpkg\.com|jsdelivr\.net|fonts\.googleapis/i.test(html), false, 'Should not reference CDNs');
});

test('index.html has all 6 required sections in exact order', () => {
  const body = html.slice(html.indexOf('<body>'));
  const headerIdx = body.indexOf('<header class="hero-header">');
  const inviteIdx = body.indexOf('Venha empreender comigo na doTERRA');
  const benefitsIdx = body.indexOf('Produtos de qualidade');
  const stepsIdx = body.indexOf('Como começar?');
  const contactIdx = body.indexOf('(43) 98670-3070');
  const footerIdx = body.indexOf('<footer class="site-footer">');

  assert.ok(headerIdx > -1, 'Header exists');
  assert.ok(inviteIdx > headerIdx, 'Invite section follows header');
  assert.ok(benefitsIdx > inviteIdx, 'Benefits follow invite section');
  assert.ok(stepsIdx > benefitsIdx, 'How to start follows benefits');
  assert.ok(contactIdx > stepsIdx, 'Contact block follows how to start');
  assert.ok(footerIdx > contactIdx, 'Footer follows contact block');
});

test('required copy and 4 benefit cards exist', () => {
  assert.ok(html.includes('Odete Kliemann'));
  assert.equal(html.includes('Ana Clara'), false);
  assert.ok(html.includes('Consultora doTERRA'));
  assert.ok(html.includes('Você não vai começar sozinha: eu te acompanho em cada passo'));
  assert.ok(html.includes('Produtos de qualidade'));
  assert.ok(html.includes('Negócio de casa'));
  assert.ok(html.includes('Renda extra'));
  assert.ok(html.includes('Equipe e apoio'));
  assert.ok(html.includes('@doterraemgotas_'));
});

test('Instagram is never a clickable link anywhere', () => {
  const anchorMatches = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) || [];
  for (const anchor of anchorMatches) {
    assert.equal(
      /instagram|doterraemgotas_/i.test(anchor),
      false,
      `Instagram must not be inside an <a> tag: ${anchor}`
    );
  }
  assert.equal(/href=["'][^"']*instagram/i.test(html), false);
});

test('WhatsApp builder generates encoded distinct messages per section', () => {
  const waLinks = html.match(/data-wa-section=["'][^"']+["']/g) || [];
  assert.equal(waLinks.length, 3, 'Should have 3 WhatsApp CTA links');
  assert.ok(html.includes('encodeURIComponent(mensagem)'));
  assert.ok(html.includes('Quero saber mais sobre os óleos doTERRA'));
  assert.ok(html.includes('Quero empreender com você na doTERRA'));
});

test('uploaded consultant photos are placed in the requested sections', () => {
  assert.ok(
    html.includes('id="profile-photo"\n                src="./assets/aistudio/509171015_17871135657379371_8738767895161975833_n_18c81bdc.jpg"'),
    'Header profile photo should use the second uploaded image'
  );
  assert.ok(
    html.includes('id="main-invite-photo"\n                    src="./assets/aistudio/b3944394-d2c0-4c89-8821-516beded26a6_3b5c6201.jfif"'),
    'Main invite photo should use the first uploaded image'
  );
});

test('testimonials carousel includes 4 real photos, 5-star ratings, and navigation controls', () => {
  const body = html.slice(html.indexOf('<body>'));
  const stepsIdx = body.indexOf('Como começar?');
  const testimonialsIdx = body.indexOf('Quem já caminha comigo recomenda');
  const contactIdx = body.indexOf('(43) 98670-3070');

  assert.ok(testimonialsIdx > stepsIdx && contactIdx > testimonialsIdx, 'Testimonials sit between steps and contact');
  const cards = html.match(/<article class="testimonial-card">/g) || [];
  assert.equal(cards.length, 4, 'Should include 4 testimonial cards');
  const starBlocks = html.match(/aria-label="Avaliação: 5 de 5 estrelas"/g) || [];
  assert.equal(starBlocks.length, 4, 'Each testimonial should have a 5-star rating');
  assert.ok(html.includes('id="carousel-prev"'));
  assert.ok(html.includes('id="carousel-next"'));
  assert.ok(html.includes('./src/assets/images/depoimento_mariana_1795129773170.jpg'));
  assert.ok(html.includes('./src/assets/images/depoimento_camila_1795129773967.jpg'));
  assert.ok(html.includes('./src/assets/images/depoimento_juliana_1795129773248.jpg'));
  assert.ok(html.includes('./src/assets/images/depoimento_patricia_1795129773188.jpg'));
});

test('Dúvidas Frequentes accordion section sits after testimonials and before contact', () => {
  const body = html.slice(html.indexOf('<body>'));
  const testimonialsIdx = body.indexOf('Quem já caminha comigo recomenda');
  const faqIdx = body.indexOf('Dúvidas Frequentes');
  const contactIdx = body.indexOf('(43) 98670-3070');

  assert.ok(faqIdx > testimonialsIdx && contactIdx > faqIdx, 'FAQ sits between testimonials and contact');
  const faqButtons = html.match(/class="faq-trigger"/g) || [];
  assert.equal(faqButtons.length, 5, 'Should include 5 FAQ accordion items');
  assert.ok(html.includes('aria-expanded="true"'));
  assert.ok(html.includes('aria-expanded="false"'));
});

test('reference videos section appears lower on the page after FAQ and before contact', () => {
  const body = html.slice(html.indexOf('<body>'));
  const faqIdx = body.indexOf('Dúvidas Frequentes');
  const videoIdx = body.indexOf('O que dizem sobre a Odete Kliemann');
  const contactIdx = body.indexOf('(43) 98670-3070');

  assert.ok(videoIdx > faqIdx && contactIdx > videoIdx, 'Videos sit after FAQ and before contact');
  assert.ok(html.includes('./assets/aistudio/odete_1_dca551ea.mov'));
  assert.ok(html.includes('./assets/aistudio/odete_60dc28db.mov'));
});

test('footer provides direct downloadable ZIP link for the project', () => {
  assert.ok(html.includes('id="download-zip-btn"'));
  assert.ok(html.includes('href="./odete-kliemann-doterra.zip"'));
  assert.ok(html.includes('download="odete-kliemann-doterra.zip"'));
});
