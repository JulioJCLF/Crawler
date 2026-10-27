/**
 * Utilitários de categorização refinada de réplicas de Airsoft e componentes de upgrade.
 *
 * Regras de negócio:
 * 1. Tudo que tiver "sniper" e NÃO tiver "spring" na descrição/nome é considerado AEG
 *    (ex.: "M4 Punisher Sniper" -> AEG).
 * 2. Na aba #sniper ("Snipers / Spring"), somente snipers reais a mola (spring / bolt-action)
 *    devem aparecer. AEGs, shotguns (M870) e plataformas M4 sem spring são estritamente excluídas.
 * 3. Na aba #shotgun ("Shotguns"), agregam-se todas as espingardas completas
 *    (Spring, GBB, GBBR, CO2, Elétricas como AA-12, e HPA), excluindo cartuchos e acessórios.
 * 4. Componentes internos e externos de alto valor e volume são separados em categorias próprias:
 *    - #motores: Motores elétricos (High Torque, High Speed, Brushless)
 *    - #canos: Canos de precisão (Inner Barrels)
 *    - #tracers: Unidades de Tracer e Silenciadores/Supressores
 *    - #mosfets: Gatilhos eletrônicos, MOSFETs, ETUs e FCUs
 *    - buckings: Borrachas de Hop-Up (mantidas separadas conforme preferência do usuário)
 */

export function isAccessory(name: string): boolean {
  const n = name.toLowerCase();

  // Se o título indicar claramente que é uma arma completa (ex: "AIRSOFT RIFLE", "AIRSOFT SHOTGUN", "AIRSOFT PISTOL")
  // e NÃO for algo feito "para" uma arma ("... FOR AIRSOFT RIFLE"), então é a réplica em si.
  const isCompleteGunTitle = /\b(airsoft rifle|airsoft shotgun|airsoft pistol|airsoft gun)\b/.test(n);
  const isForGun = /\bfor\b/.test(n);

  if (isCompleteGunTitle && !isForGun) {
    if (
      /^\S+\s+(stock|scope|bipod|mount|cover|magazine|cylinder|rail|barrel|sling|handguard|grip|hop|piston|shell|tracer)\b/.test(
        n
      )
    ) {
      return true;
    }
    if (/micro switch|\bfcu\b|gearbox shell/.test(n)) {
      return true;
    }
    return false;
  }

  if (
    /\bfor\b|magazine|\bmag\b|cylinder|bipod|\bcover\b|scope|mount|\bring\b|\brail\b|barrel|piston|spring guide|\bhop\b|bucking|cheek|sling|camo|tune.?up|gearbox|bearing|nozzle|micro switch|\bfcu\b|tracer|shell holder|pouch|ammo case|carrier for shell|wad\b|cartridge|adapter|\bshells?\b/.test(
      n
    )
  ) {
    return true;
  }
  if (
    /^\S+\s+(stock|scope|bipod|mount|cover|magazine|cylinder|rail|barrel|sling|handguard|grip|hop|piston|shell|tracer)\b/.test(
      n
    )
  ) {
    return true;
  }
  if (/^\S+\s+spring\s+(guide|set|m\d+|s\d+|\d+fps|\d+%|shotgun)/.test(n)) {
    return true;
  }
  return false;
}

export function isReplicaGun(name: string): boolean {
  const n = name.toLowerCase();
  return /\bri[lf]{1,3}e|\bcarbine\b|\bsmg\b|\bdmr\b|\bmarksman\b|machine gun|pdw|bolt.?action|sho[gt]{2}un/.test(
    n
  );
}

export function hasSpringKeyword(product: { name: string; description?: string }): boolean {
  const combined = `${product.name} ${product.description || ""}`.toLowerCase();
  return /\bspring\b|\bspringer\b|bolt.?action|pump.?action/.test(combined);
}

/**
 * Identifica se a réplica é uma Shotgun / Espingarda completa
 * (Spring, GBB, GBBR, CO2, Elétrica ou HPA), excluindo acessórios como cartuchos soltos e porta-cartuchos.
 */
export function isShotgun(product: {
  name: string;
  description?: string;
  category?: string;
}): boolean {
  const { name } = product;
  const n = name.toLowerCase();

  if (isAccessory(name)) {
    return false;
  }

  // Verifica modelos e nomenclaturas de shotguns
  const isShotgunPattern =
    /\bm870\b|sho[gt]{2}un|\bcam870\b|\bsaiga-?12\b|\baa-?12\b|\bsgr-?12\b|\bksg\b|\bm1887\b|\bspas-?12\b|\bm1014\b/.test(
      n
    );

  return isShotgunPattern;
}

// Mantido para retrocompatibilidade
export const isSpringShotgun = isShotgun;

/**
 * Identifica se a réplica é um Sniper a mola legítimo (Spring / Bolt Action).
 */
export function isTrueSpringSniper(product: {
  name: string;
  description?: string;
  category?: string;
}): boolean {
  const { name, category } = product;
  const n = name.toLowerCase();

  // Exclui handguards e magazines avulsos
  if (isHandguard(product) || isMagazine(product)) {
    return false;
  }

  // Exclui shotguns (como M870) e sistemas HPA da aba de snipers
  if (isShotgun(product) || isHpaEquipment(product) || /\bm870\b|sho[gt]{2}un/.test(n)) {
    return false;
  }

  // Permite categorias replicas, pecas-internas (onde o crawler alocou snipers a mola) e sniper
  if (category && !["replicas", "pecas-internas", "sniper"].includes(category)) {
    return false;
  }

  if (!isReplicaGun(name) || isAccessory(name)) {
    return false;
  }

  // Não pode ser AEG, GBB, GBBR ou CO2 Cowboy
  if (/\baeg\b|\bgbb\b|\bgbbr\b|\bco2\b|cowboy/.test(n)) {
    return false;
  }

  // Não pode ser plataforma M4 / M16 / AR-15
  if (/\bm4\b|\bm16\b|\bar-?15\b/.test(n)) {
    return false;
  }

  // Exige mola / bolt action
  if (!hasSpringKeyword(product)) {
    return false;
  }

  const hasSniperKw =
    /\bsniper\b|bolt.?action|\bvsr\b|\bl96\b|\bawp\b|\bawm\b|tac-?41|\bssg-?(?:10|24|96)\b|\bm40\b|\bm24\b|\bm700\b|\bmsr\b|\bspring\b/.test(
      n
    );

  return hasSniperKw;
}

/**
 * Identifica se a réplica é um AEG (Rifle Elétrico).
 *
 * Aplica a regra:
 * - Se tem "sniper" e não tem "spring" na descrição/nome, é considerado AEG
 *   (ex: "M4 Punisher Sniper" -> AEG).
 * - Na falta de "spring" ou "aeg", considera-se como AEG.
 * - Shotguns (mesmo elétricas como AA-12) são direcionadas para a categoria Shotguns.
 */
export function isAegReplica(product: {
  name: string;
  description?: string;
  category?: string;
}): boolean {
  const { name, category } = product;
  if (category && category !== "replicas") {
    return false;
  }

  // Exclui handguards e magazines avulsos
  if (isHandguard(product) || isMagazine(product)) {
    return false;
  }

  if (isShotgun(product) || isHpaEquipment(product)) {
    return false;
  }

  const n = name.toLowerCase();

  if (!isReplicaGun(name) || isAccessory(name)) {
    return false;
  }

  // Armas a gás pertencem a GBB/GBBR
  if (/\bgbbr?\b|\bgas blowback\b/.test(n)) {
    return false;
  }

  const hasAeg = /\baeg\b/.test(n);
  const hasSniper = /\bsniper\b/.test(n);
  const hasSpring = hasSpringKeyword(product);

  // 1. Tem explicitamente "aeg"
  if (hasAeg) {
    return true;
  }

  // 2. Tem "sniper" mas NÃO tem "spring" (ex: "m4 punisher sniper" ou réplicas sem "aeg" no nome)
  if (hasSniper && !hasSpring) {
    return true;
  }

  return false;
}

/**
 * Identifica se o produto é um motor elétrico de airsoft (High Torque, High Speed, Brushless, etc.),
 * excluindo peças que apenas citam motor (ex.: motor gear, engrenagens, motor grip, motor plate, tampa, parafusos).
 */
export function isAirsoftMotor(product: { name: string }): boolean {
  const n = product.name.toLowerCase();
  if (!/\bmotors?\b/.test(n)) {
    return false;
  }
  // Exclui engrenagens (motor gear), caixas de engrenagem (gearbox), pinos, empunhaduras, etc.
  if (
    /\bgears?\b|engrenag|gearbox|pinion|mount|grip|plate|screw|base|spring|plug|pin|spacer|connector|lead|wire|shaft|sling|housing|cover|bushing|puller/.test(
      n
    )
  ) {
    return false;
  }
  return true;
}

/**
 * Identifica se o produto é um conjunto de engrenagens (Gear Set) ou componente de engrenagem de gearbox
 * (ex.: motor gear da Solink, bevel gear, sector gear, spur gear, engrenagens 18:1, 13:1, 16:1, etc.).
 * Exclui carcaças de gearbox completas e vestuário/marcas táticas.
 */
export function isGearSet(product: { name: string; category?: string }): boolean {
  const { name, category } = product;
  const n = name.toLowerCase();

  // Exclui ferramentas de saca-pinhão, carcaças de gearbox completas e vestuário/marcas táticas
  if (/gear puller|puller pin|gearbox|tactical gear|head gear|protective gear/.test(n)) {
    return false;
  }
  if (/black owl gear|emerson.?gear|viper.?gear|clawgear/.test(n)) {
    return false;
  }
  if (category && ["vestuario", "suprimentos", "bbs", "gas", "miras"].includes(category)) {
    return false;
  }

  // 1. Motor gear (conjuntos de engrenagens como os da Solink e SHS)
  if (/motor gear/.test(n)) {
    return true;
  }

  // 2. Termos diretos de conjunto de engrenagens
  if (/gear\s*set|gearset|engrenag/.test(n)) {
    return true;
  }

  // 3. Tipos mecânicos de engrenagens de gearbox (sector, bevel, spur, pinion, delayer)
  if (
    /\b(sector|bevel|spur|pinion|delayer)\s+gear|\bgear\s+(sector|bevel|spur|pinion|steel|helical)/.test(
      n
    )
  ) {
    return true;
  }

  // 4. Relações de transmissão comuns de engrenagens (ex.: 18:1, 16:1, 13:1, 12:1, 32:1, 100:200)
  if (/\b\d{1,3}:\d{1,3}\b/.test(n) && /gear|helical|torque/.test(n)) {
    return true;
  }

  // 5. Pinhões de engrenagem
  if (/pinion gear|motor gear pinion|gear pinion/.test(n)) {
    return true;
  }

  return false;
}

/**
 * Identifica se o produto é um cano de precisão interno (Inner Barrel).
 */
export function isPrecisionBarrel(product: { name: string }): boolean {
  const n = product.name.toLowerCase();
  if (
    /inner barrel|precision barrel|\b6\.0[1-8]\b/.test(n) &&
    !/barrel nut|barrel spacer|barrel extension|outer barrel|lock|spring|cleaning|cap|adapter|mock/.test(
      n
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Identifica se o produto é um speed loader, carregador rápido ou acessório/reparo de loader.
 */
export function isSpeedLoader(product: { name: string }): boolean {
  return /\b(speed\s*loader|speedloader|bb\s*loader|bb\s*loading|magazine\s*loader|odin\s*m12)\b/i.test(
    product.name
  );
}

/**
 * Identifica se o produto é uma unidade de traçador (Tracer Unit) ou supressor/silenciador.
 */
export function isTracerOrSilencer(product: { name: string }): boolean {
  const n = product.name.toLowerCase();
  if (!/\b(tracer|silencer|suppressor|silenciador)\b/i.test(n)) {
    return false;
  }
  if (/\b(adapter|cable|case|pouch|mount|battery|handguard)\b/i.test(n)) {
    return false;
  }
  // Modelos e termos explícitos de unidades de tracer (AT2000, Bifrost, etc.)
  if (
    /\b(unit|at2000|at1000|bifrost|blaster|lighter|predator|quark|raider|thor|spitfire|griffon|storm|swift|flare|cube|smoke|wolf|drop-in)\b/i.test(
      n
    )
  ) {
    return true;
  }
  // Exclui munição traçante (BBs com gramatura, ex.: '0.25g', '0.28g')
  if (/\bbbs?\b/i.test(n) && /\b0\.\d{2}g?\b/i.test(n)) {
    return false;
  }
  return true;
}

/**
 * Identifica se o produto é um MOSFET, ETU, FCU ou Gatilho Eletrônico avulso.
 */
export function isElectronicTrigger(product: { name: string }): boolean {
  const n = product.name.toLowerCase();
  if (
    /\bmosfet\b|\betu\b|\bfcu\b|electronic trigger|gate titan|gate aster|perun|trigger unit/.test(
      n
    ) &&
    !/airsoft rifle|airsoft pistol|airsoft shotgun/.test(n)
  ) {
    return true;
  }
  return false;
}

/**
 * Identifica produtos relacionados a HPA e Ar Comprimido (PCP):
 * - Compressores e bombas PCP (12V, 110V, 220V, auto-stop)
 * - Reguladoras de pressão HPA (Storm, Redline, Polarstar, Armadillo)
 * - Tanques e cilindros de ar comprimido (Carbono, Alumínio, 3000/4500 PSI)
 * - Mangueiras, canos/linhas de ar (Remote lines, braided lines, microbore)
 * - Engines, solenoides e kits de conversão HPA (Inferno, Reaper, N7, Pulsar, SDiK)
 * - Adaptadores e conectores HPA (foster fittings, QD, mag adapters)
 * - Réplicas alimentadas diretamente por HPA
 */
export function isHpaEquipment(product: {
  name: string;
  description?: string;
  category?: string;
}): boolean {
  const { name, description } = product;
  const n = name.toLowerCase();
  const combined = `${n} ${(description || "").toLowerCase()}`;

  // 1. Compressores e bombas de ar comprimido PCP
  if (/compressor|\bbomba pcp\b/.test(n)) {
    return true;
  }

  // 2. Reguladoras de pressão para ar comprimido / HPA
  if (/regulat|regulador|guage.*storm|gauge.*storm|manometer|manometro/.test(n) && !/voltage regulat/.test(n)) {
    if (/\bhpa\b|\bpcp\b|air|storm|redline|mancraft|polarstar|armadillo|tank|psi|remote|wolverine/.test(combined)) {
      return true;
    }
  }

  // 3. Tanques e Cilindros HPA / PCP (3000 PSI / 4500 PSI)
  if (
    /\bhpa\b.*\btank\b|\btank\b.*(?:carbon|psi|\bhpa\b|\bpcp\b|wraith)|cilindro.*(?:carbon|psi|\bpcp\b|\bhpa\b|4500|3000|mergulho|diving)/.test(
      n
    )
  ) {
    return true;
  }

  // 4. Mangueiras, linhas e canos de ar HPA (remote lines, braided air lines, microbore)
  if (/remote line|air line|linha hpa|mangueira hpa|hose.*hpa|hpa.*line|microbore|braided line|airline/.test(n)) {
    return true;
  }

  // 5. Engines, solenóides e kits de conversão HPA
  if (/polarstar|redline n7|inferno gen|reaper gen|f2 engine|jack engine|kythera|pulsar|sdik/.test(n)) {
    return true;
  }
  if (/engine.*hpa|hpa.*engine|solenoid.*hpa|hpa.*solenoid|hpa.*kit|kit.*hpa/.test(n)) {
    return true;
  }

  // 6. Adaptadores e conectores HPA / Foster
  if (/\bhpa adapter\b|adaptador.*hpa|hpa.*adapt|hpa.*connector|conector.*hpa|foster|quick disconnect.*hpa|quick fill|fill station/.test(n)) {
    return true;
  }

  // 7. Menção explícita de HPA no título
  if (/\bhpa\b/.test(n)) {
    return true;
  }

  // 8. Menção explícita de PCP no título
  if (/\bpcp\b/.test(n)) {
    return true;
  }

  return false;
}

/**
 * Identifica se o produto é um guarda-mão avulso (Handguard), extensão ou acessório direto de handguard.
 * Exclui armas completas que citam o handguard nas especificações (ex: "CYMA AEG M4 ... HANDGUARD 10 AIRSOFT RIFLE"),
 * exceto quando explicitamente indicado como peça avulsa para réplica ("... HANDGUARD ... FOR M4 AEG").
 * Também exclui chicotes elétricos e componentes de gearbox que apenas passam pelo handguard ("WIRED TO HANDGUARD").
 */
export function isHandguard(product: { name: string; category?: string }): boolean {
  const n = product.name.toLowerCase();
  if (!/\bhandguards?\b|\bhand\s*guards?\b/.test(n)) {
    return false;
  }

  // Fiações, microswitches e componentes internos de gearbox que apenas passam pelo handguard
  if (/switch|assembly|gearbox|mosfet wire/.test(n) && !/rail|kit|set|extension/.test(n)) {
    return false;
  }

  // Armas completas geralmente têm "airsoft rifle", "airsoft shotgun", "airsoft pistol" ou "airsoft gun"
  const isCompleteGun = /\b(airsoft rifle|airsoft shotgun|airsoft pistol|airsoft gun)\b/.test(n);
  const hasFor = /\bfor\b/.test(n);

  if (isCompleteGun && !hasFor) {
    return false;
  }

  return true;
}

/**
 * Identifica se o produto é um coldre ou porta-coldre tático (Holster).
 * Exclui lanternas e itens que apenas acompanham coldre como brinde/estojo ("WITH HOLSTER").
 */
export function isHolster(product: { name: string; category?: string }): boolean {
  const n = product.name.toLowerCase();
  if (/with\s+holster/.test(n)) {
    return false;
  }
  return /\bcoldres?\b|\bholsters?\b/.test(n);
}

/**
 * Identifica se o produto é um carregador avulso (Magazine) ou speed loader de airsoft.
 * Exclui porta-carregadores (mag pouches), cases, sensores, botões liberadores e armas completas.
 */
export function isMagazine(product: { name: string; category?: string }): boolean {
  if (isSpeedLoader(product)) {
    return true;
  }
  const { name, category } = product;
  if (category === "magazines") {
    return true;
  }
  const n = name.toLowerCase();
  if (
    /sensor|pouch|case|holder|clamp|coupler|puller|base pad|plate|spring|lip|follower|release|catch/.test(
      n
    )
  ) {
    return false;
  }
  if (/\b(airsoft rifle|airsoft shotgun|airsoft pistol|airsoft gun)\b/.test(n) && !/\bfor\b/.test(n)) {
    return false;
  }
  return /\b(magazine|mag\b|mid.?cap|hi.?cap|drum\s*mag)\b/i.test(n);
}
