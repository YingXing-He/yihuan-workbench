// 离线抓取真实论文种子（Node 无 CORS 限制），写入 data/ncbi_seed.json
const fs = require('fs');
const path = require('path');

// 期刊影响因子近似表（2023-2024），用于过滤 IF>=4 并按 IF 排序
const JOURNAL_IF = {
  'nature': 64.8, 'nature communications': 16.6, 'nature food': 23.0, 'nature microbiology': 28.3,
  'science': 56.9, 'cell': 64.5, 'cell reports': 8.8, 'plos biology': 9.8,
  'plos pathogens': 6.7, 'plos neglected tropical diseases': 3.8, 'plos one': 3.7,
  'frontiers in immunology': 7.3, 'frontiers in microbiology': 5.2, 'frontiers in physiology': 4.0,
  'frontiers in marine science': 3.7, 'frontiers in veterinary science': 3.2,
  'fish & shellfish immunology': 4.6, 'aquaculture': 4.5, 'aquaculture reports': 3.5,
  'aquaculture international': 2.8, 'journal of fish diseases': 2.6, 'diseases of aquatic organisms': 2.0,
  'developmental & comparative immunology': 3.2, 'journal of invertebrate pathology': 3.5,
  'veterinary immunology and immunopathology': 2.4, 'immunology': 6.4, 'molecular immunology': 4.5,
  'journal of virology': 5.4, 'viruses': 4.7, 'virus research': 3.7, 'journal of general virology': 3.5,
  'microbiology spectrum': 4.2, 'microbiome': 15.5, 'mSystems': 7.0, 'mbio': 6.4,
  'international journal of molecular sciences': 5.6, 'scientific reports': 4.6,
  'bmc genomics': 4.4, 'bmc microbiology': 4.2, ' genomics': 4.0,
  'journal of proteomics': 4.3, 'fish physiology and biochemistry': 2.4,
  'animal': 3.0, 'animals': 3.0, 'antioxidants': 7.0, 'marine drugs': 5.4,
  'one health': 4.5, 'microorganisms': 4.5, 'cells': 6.0, 'ijms': 5.6,
  'peerj': 3.0, 'scientific data': 9.8, 'food microbiology': 5.3,
  'journal of aquaculture research and development': 1.2
};
function ifOf(journal) {
  if (!journal) return 0;
  const j = journal.toLowerCase().trim();
  if (JOURNAL_IF[j] != null) return JOURNAL_IF[j];
  // 仅以已知期刊名开头匹配，避免贪婪（如 "science" 误命中 "life science alliance"）
  for (const k in JOURNAL_IF) { if (k.length >= 6 && j.startsWith(k)) return JOURNAL_IF[k]; }
  return 0;
}

const TOPICS = [
  '"Litopenaeus vannamei" AND (immun* OR virus* OR bacter*)',
  'shrimp AND aquaculture AND (immun* OR virus* OR bacter*)',
  'fish AND (immun* OR bacter* OR virus*) AND infection',
  'crustacean AND immun*',
  'mollusc AND immun*',
  'aquaculture AND (virus* OR bacter* OR infect*)'
];

async function fetchTopic(topic, pageSize) {
  const q = encodeURIComponent(topic);
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${q}&format=json&pageSize=${pageSize}&sort=P_PDATE_D%20desc&resultType=core`;
  const r = await fetch(url);
  const j = await r.json();
  return (j.resultList && j.resultList.result) || [];
}

(async () => {
  const seen = new Map();
  const raw = [];
  for (const t of TOPICS) {
    try {
      const res = await fetchTopic(t, 25);
      raw.push(...res);
      console.error('topic ok, got', res.length);
    } catch (e) { console.error('topic err', e.message); }
  }
  for (const p of raw) {
    const doi = p.doi;
    if (!doi || seen.has(doi)) continue;
    const journal = (p.journalInfo && p.journalInfo.journal && p.journalInfo.journal.title) || '';
    const year = parseInt(p.pubYear || (p.journalInfo && p.journalInfo.dateOfPublication) || '0', 10);
    if (!year || year < 2023) continue;
    const ifv = ifOf(journal);
    seen.set(doi, {
      doi,
      title: (p.title || '').replace(/<[^>]+>/g, ''),
      authors: (p.authorString || '').split(',').slice(0, 4).join(', ') + (p.authorString && p.authorString.split(',').length > 4 ? ' 等' : ''),
      journal,
      year,
      if: ifv,
      url: 'https://doi.org/' + doi
    });
  }
  let list = Array.from(seen.values());
  // 先按 IF>=4，不足再放宽到 >=3
  let pass = list.filter(x => x.if >= 4);
  if (pass.length < 12) pass = list.filter(x => x.if >= 3);
  pass.sort((a, b) => b.if - a.if || b.year - a.year);
  const top = pass.slice(0, 20);
  console.error('unique', list.length, 'pass>=4', list.filter(x=>x.if>=4).length, 'final', top.length);
  const out = { updated: new Date().toISOString().slice(0, 10), source: 'Europe PMC', list: top };
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'data', 'ncbi_seed.json'), JSON.stringify(out, null, 2), 'utf8');
  console.error('written data/ncbi_seed.json');
})();
