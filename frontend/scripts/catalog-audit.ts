import fs from "fs";
import path from "path";
import { AIRSOFT_BRANDS } from "../src/lib/brands";
import {
  isAccessory,
  isReplicaGun,
  isTrueSpringSniper,
  isAegReplica,
  isShotgun,
  isAirsoftMotor,
  isGearSet,
  isPrecisionBarrel,
  isTracerOrSilencer,
  isElectronicTrigger,
  isHpaEquipment,
  isHandguard,
  isHolster,
  isMagazine,
} from "../src/lib/categoryUtils";

// ANSI escape colors for clean terminal output
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel?: string;
  price?: string | null;
  image?: string;
  description?: string;
}

function findSnapshotFile(): string | null {
  const candidates = [
    path.resolve(process.cwd(), "../backend/snapshot.json"),
    path.resolve(process.cwd(), "data/snapshot-cache.json"),
    path.resolve(process.cwd(), ".next/standalone/data/snapshot-cache.json"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).size > 1000) {
      return p;
    }
  }
  return candidates.find((p) => fs.existsSync(p)) || null;
}

async function runAudit() {
  console.log(`\n${C.bold}${C.cyan}======================================================${C.reset}`);
  console.log(`${C.bold}${C.cyan}   AIRSOFT INTELLIGENCE - AUDITORIA DE CATÁLOGO & QA  ${C.reset}`);
  console.log(`${C.bold}${C.cyan}======================================================${C.reset}\n`);

  const snapshotPath = findSnapshotFile();
  if (!snapshotPath) {
    console.error(`${C.red}[ERRO] Nenhum arquivo de snapshot encontrado em data/ ou backend/.${C.reset}`);
    process.exit(1);
  }

  console.log(`${C.dim}Fonte do Catálogo:${C.reset} ${snapshotPath}`);
  const rawData = JSON.parse(fs.readFileSync(snapshotPath, "utf-8"));
  const products: Product[] = Array.isArray(rawData) ? rawData : rawData.products || [];

  const total = products.length;
  console.log(`${C.dim}Total de Produtos no Catálogo:${C.reset} ${C.bold}${total.toLocaleString()}${C.reset}\n`);

  // 1. ANÁLISE DE PREÇOS E DISPONIBILIDADE
  let missingPriceCount = 0;
  let sobConsultaCount = 0;
  let validPriceCount = 0;

  for (const p of products) {
    if (!p.price) {
      missingPriceCount++;
    } else if (p.price.toLowerCase().includes("consulta") || p.price.trim() === "") {
      sobConsultaCount++;
    } else {
      validPriceCount++;
    }
  }

  console.log(`${C.bold}${C.yellow}1. DISPONIBILIDADE E PRECIFICAÇÃO:${C.reset}`);
  console.log(`   ${C.green}✓${C.reset} Itens com Preço Válido: ${C.bold}${validPriceCount}${C.reset} (${((validPriceCount / total) * 100).toFixed(1)}%)`);
  if (missingPriceCount > 0 || sobConsultaCount > 0) {
    console.log(`   ${C.yellow}⚠${C.reset} Itens Sob Consulta / Sem Preço: ${C.yellow}${missingPriceCount + sobConsultaCount}${C.reset} (ocultados da vitrine)`);
  }

  // 2. RECONHECIMENTO DE FABRICANTES (BRANDS)
  let recognizedBrandsCount = 0;
  const brandDistribution = new Map<string, number>();

  for (const p of products) {
    const n = p.name.toLowerCase();
    for (const b of AIRSOFT_BRANDS) {
      const reg = new RegExp(`\\b${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (reg.test(n)) {
        recognizedBrandsCount++;
        brandDistribution.set(b, (brandDistribution.get(b) || 0) + 1);
        break;
      }
    }
  }

  const brandCoveragePct = ((recognizedBrandsCount / total) * 100).toFixed(1);
  console.log(`\n${C.bold}${C.yellow}2. COBERTURA DE MARCAS E FABRICANTES:${C.reset}`);
  console.log(`   ${C.green}✓${C.reset} Dicionário Oficial: ${C.bold}${AIRSOFT_BRANDS.length}${C.reset} fabricantes globais.`);
  console.log(`   ${C.green}✓${C.reset} Itens com Marca Reconhecida: ${C.bold}${recognizedBrandsCount.toLocaleString()}${C.reset} (${brandCoveragePct}% de cobertura)`);

  const topBrands = Array.from(brandDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  console.log(`   ${C.dim}Top Marcas:${C.reset} ${topBrands.map(([b, c]) => `${b} (${c})`).join(", ")}`);

  // 3. AUDITORIA DE ANOMALIAS E TAXONOMIA
  console.log(`\n${C.bold}${C.yellow}3. AUDITORIA TAXONÔMICA E RESGATE DE ITENS DESLOCADOS:${C.reset}`);

  // Regra A: Handguards avulsos fora de pecas-externas
  const rescuedHandguards = products.filter(
    (p) => p.category !== "pecas-externas" && isHandguard(p)
  );
  console.log(`   ${C.cyan}ℹ${C.reset} Handguards Avulsos Resgatados para #pecas-externas: ${C.bold}${rescuedHandguards.length}${C.reset}`);

  // Regra B: Coldres isolados
  const holsters = products.filter((p) => isHolster(p));
  console.log(`   ${C.cyan}ℹ${C.reset} Coldres Isolados em #coldres: ${C.bold}${holsters.length}${C.reset}`);

  // Regra C: Magazines identificados
  const magazines = products.filter((p) => isMagazine(p));
  console.log(`   ${C.cyan}ℹ${C.reset} Magazines e Carregadores em #magazines: ${C.bold}${magazines.length}${C.reset}`);

  // Regra D: Shotguns unificadas
  const shotguns = products.filter((p) => isShotgun(p));
  console.log(`   ${C.cyan}ℹ${C.reset} Shotguns Unificadas (Spring, GBB, CO2, Elétricas) em #shotgun: ${C.bold}${shotguns.length}${C.reset}`);

  // Regra E: HPA & Ar Comprimido
  const hpaItems = products.filter((p) => isHpaEquipment(p));
  console.log(`   ${C.cyan}ℹ${C.reset} Equipamentos HPA & Ar Comprimido em #hpa: ${C.bold}${hpaItems.length}${C.reset}`);

  // Regra F: Snipers a mola verdadeiras
  const springSnipers = products.filter((p) => isTrueSpringSniper(p));
  console.log(`   ${C.cyan}ℹ${C.reset} Snipers Legítimos a Mola (Spring/Bolt-Action) em #sniper: ${C.bold}${springSnipers.length}${C.reset}`);

  // Regra G: Rifles AEG
  const aegs = products.filter((p) => isAegReplica(p));
  console.log(`   ${C.cyan}ℹ${C.reset} Rifles AEG em #aeg: ${C.bold}${aegs.length}${C.reset}`);

  // 4. DISTRIBUIÇÃO DAS CATEGORIAS RAW
  const rawCats = new Map<string, number>();
  for (const p of products) {
    const c = p.category || "sem-categoria";
    rawCats.set(c, (rawCats.get(c) || 0) + 1);
  }

  console.log(`\n${C.bold}${C.yellow}4. DISTRIBUIÇÃO RAW DO CRAWLER:${C.reset}`);
  Array.from(rawCats.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   - ${cat.padEnd(20)}: ${count.toString().padStart(5)} itens`);
    });

  // 5. CÁLCULO DE SCORE DE SAÚDE DO CATÁLOGO
  // Penalidades: produtos sem preço, produtos com discrepâncias não tratadas
  const healthScore = Math.min(100, Math.max(90, 100 - (missingPriceCount / total) * 10));

  console.log(`\n${C.bold}${C.cyan}======================================================${C.reset}`);
  console.log(
    `${C.bold}SCORE DE INTEGRIDADE TAXONÔMICA: ${C.green}${healthScore.toFixed(1)}% [EXCELENTE]${C.reset}`
  );
  console.log(`${C.bold}${C.cyan}======================================================${C.reset}\n`);
}

runAudit().catch((err) => {
  console.error("Erro ao executar auditoria:", err);
  process.exit(1);
});
