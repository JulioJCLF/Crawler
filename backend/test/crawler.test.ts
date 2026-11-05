import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { enforceCategory, CATEGORY_WEIGHTS, cleanProductName, extractSku } from '../src/config';
import { extractProductDetails } from '../src/crawler';

describe('Crawler Logic', () => {
  describe('extractSku (REQ-025 / PM-012)', () => {
    it('should extract numeric SKU from "Ref.: XXXXX"', () => {
      expect(extractSku('Ref.: 329859')).toBe('329859');
      expect(extractSku('Ref: 329859')).toBe('329859');
      expect(extractSku('ref.: 46237')).toBe('46237');
    });

    it('should extract SKU embedded in card HTML text', () => {
      const cardText = `
        Ref.: 329859
        ACTION ARMY PRECISION INNER BARREL 6.03/125MM FOR GBB KWA KRISS VECTOR
        USD 7,00
      `;
      expect(extractSku(cardText)).toBe('329859');
    });

    it('should return undefined when no Ref is present', () => {
      expect(extractSku('ACTION ARMY BARREL USD 7,00')).toBeUndefined();
      expect(extractSku('')).toBeUndefined();
    });
  });

  describe('cleanProductName', () => {
    it('should remove leading "Ref.: XXXXX" from product titles', () => {
      expect(cleanProductName('Ref.: 329859 ACTION ARMY PRECISION INNER BARREL')).toBe('ACTION ARMY PRECISION INNER BARREL');
      expect(cleanProductName('Ref: 46237 APS STOCK TUBE SLIM')).toBe('APS STOCK TUBE SLIM');
    });
    it('should remove trailing "Arsenal Sports"', () => {
      expect(cleanProductName('APS MAGAZINE 23R CO2 FOR ACP601 BLACK Arsenal Sports')).toBe('APS MAGAZINE 23R CO2 FOR ACP601 BLACK');
    });

    it('should remove "Arsenal Sports" with dash or pipe separator', () => {
      expect(cleanProductName('Red Dot Sight - Arsenal Sports')).toBe('Red Dot Sight');
      expect(cleanProductName('M4 Tactical Grip | Arsenal Sports')).toBe('M4 Tactical Grip');
    });

    it('should remove "Arsenal Sports" when in brackets or parentheses', () => {
      expect(cleanProductName('Speedloader (Arsenal Sports)')).toBe('Speedloader');
      expect(cleanProductName('Speedloader [Arsenal Sports]')).toBe('Speedloader');
    });

    it('should remove leading "Arsenal Sports"', () => {
      expect(cleanProductName('Arsenal Sports - BBs 0.25g 1kg')).toBe('BBs 0.25g 1kg');
      expect(cleanProductName('ARSENAL SPORTS BATERIA NI-MH 9.6V')).toBe('BATERIA NI-MH 9.6V');
    });

    it('should remove "Arsenal Sports" in the middle of a string', () => {
      expect(cleanProductName('G&G POLO SHIRT WITH LOGO ARSENAL SPORTS PINK SIZE L')).toBe('G&G POLO SHIRT WITH LOGO PINK SIZE L');
      expect(cleanProductName('KRISS VECTOR AEG SMG ( TAN - BLACK CUSTOM PAINT ARSENAL SPORTS)')).toBe('KRISS VECTOR AEG SMG ( TAN - BLACK CUSTOM PAINT)');
    });

    it('should preserve technical suffixes like 14MM-', () => {
      expect(cleanProductName('CYMA ADAPTER ALUMINUM AIRSOFT THREAD 14MM+ TO 14MM- Arsenal Sports')).toBe('CYMA ADAPTER ALUMINUM AIRSOFT THREAD 14MM+ TO 14MM-');
    });

    it('should handle empty or null string gracefully', () => {
      expect(cleanProductName('')).toBe('');
    });
  });
  describe('enforceCategory', () => {
    it('should convert magazines incorrectly placed in replicas to magazines', () => {
      const result = enforceCategory('Magazine for M4 AEG', 'replicas');
      expect(result.categorySlug).toBe('magazines');
    });

    it('should convert internal parts incorrectly placed in replicas to pecas-internas', () => {
      const result1 = enforceCategory('Cylinder Head for V2 Gearbox', 'replicas');
      const result2 = enforceCategory('Spring M120', 'replicas');
      expect(result1.categorySlug).toBe('pecas-internas');
      expect(result2.categorySlug).toBe('pecas-internas');
    });

    it('should convert external parts incorrectly placed in replicas to pecas-externas', () => {
      const result = enforceCategory('M-LOK Handguard for M4', 'replicas');
      expect(result.categorySlug).toBe('pecas-externas');
    });

    it('should not modify a real replica', () => {
      const result = enforceCategory('Rifle de Airsoft AEG M4A1', 'replicas');
      expect(result.categorySlug).toBe('replicas');
    });

    it('should not modify parts if they are already in the correct category', () => {
      // The function only targets 'replicas' currently for generic overrides
      const result = enforceCategory('Magazine for M4 AEG', 'pecas-externas');
      expect(result.categorySlug).toBe('pecas-externas');
    });

    it('should force a gun cross-listed in pecas-externas back to replicas with max weight', () => {
      const result = enforceCategory('M4A1 Airsoft Rifle', 'pecas-externas');
      expect(result.categorySlug).toBe('replicas');
      expect(result.weight).toBe(100);
    });

    it('should force a sniper to replicas with max weight', () => {
      const result = enforceCategory('VSR-10 Sniper Rifle', 'sniper');
      expect(result.categorySlug).toBe('replicas');
      expect(result.weight).toBe(100);
    });

    it('should force a blowback pistol to replicas with max weight', () => {
      const result = enforceCategory('G17 Blowback Airsoft Pistol', 'pistolas');
      expect(result.categorySlug).toBe('replicas');
      expect(result.weight).toBe(100);
    });

    it('should route buckings to their own category from any source', () => {
      const fromReplicas = enforceCategory('MAPLE LEAF HOP-UP BUCKING AEG 70º', 'replicas');
      const fromGas = enforceCategory('KINGARMS HOP-UP BUCKING TM GBB', 'rifles-gas');
      expect(fromReplicas.categorySlug).toBe('buckings');
      expect(fromGas.categorySlug).toBe('buckings');
    });

    it('should win over the AEG gun rule (bucking with "aeg" in name is not a gun)', () => {
      const result = enforceCategory('G&G HOP-UP BUCKING 50º FOR AEG', 'replicas');
      expect(result.categorySlug).toBe('buckings');
      expect(result.weight).toBeGreaterThan(100);
    });

    it('should route speed loaders from bbs to magazines (PM-009)', () => {
      const result1 = enforceCategory('CYMA SPEED LOADER 100R BLACK', 'bbs');
      const result2 = enforceCategory('PTS ODIN INNOVATIONS SPEED LOADER 1600R M12 BLACK', 'bbs');
      const result3 = enforceCategory('PTS ODIN M12 SIDEWINDER REBUILD REAPAIR KIT', 'bbs');
      expect(result1.categorySlug).toBe('magazines');
      expect(result2.categorySlug).toBe('magazines');
      expect(result3.categorySlug).toBe('magazines');
    });

    it('should route tracer units from bbs to pecas-externas (PM-009)', () => {
      const result1 = enforceCategory('ACETECH TRACER AT2000 WITH S0006-CB CK043 AND BB KING BBS 0.25GR', 'bbs');
      const result2 = enforceCategory('ACETECH TRACER AT2000 FOR GREEN BBS ONLY', 'pecas-externas');
      expect(result1.categorySlug).toBe('pecas-externas');
      expect(result2.categorySlug).toBe('pecas-externas');
    });

    it('should preserve genuine tracer BBs in bbs category (PM-009)', () => {
      const result1 = enforceCategory('ACETECH BBS RED TRACER 0.25G / 2700R BOTTLE', 'bbs');
      const result2 = enforceCategory('G&G BBS GREEN TRACER 0.20G / 2700R BOTTLE', 'bbs');
      expect(result1.categorySlug).toBe('bbs');
      expect(result2.categorySlug).toBe('bbs');
    });

    it('should route gun cases, rifle bags and hard protective cases to cases (PM-010)', () => {
      const result1 = enforceCategory('ARMADILLO CASE 28LT FOR RIFLE ASSAULT / DMR / SNIPER', 'vestuario');
      const result2 = enforceCategory('WOSPORT RIFLE BAG DOUBLE CARBINE CASE 107CM MULTICAM', 'vestuario');
      const result3 = enforceCategory('SRC PISTOL CASE POLYMER - INSIDE DIAMETER 29CM BLACK', 'vestuario');
      const result4 = enforceCategory('WADSN CASE PROTECTIVE BOX LARGE 175X110X50MM BLACK', 'vestuario');
      const result5 = enforceCategory('ARMADILLO CASE 02LT FOR BATTERY OR ACESSORIES', 'baterias');
      expect(result1.categorySlug).toBe('cases');
      expect(result2.categorySlug).toBe('cases');
      expect(result3.categorySlug).toBe('cases');
      expect(result4.categorySlug).toBe('cases');
      expect(result5.categorySlug).toBe('cases');
    });

    it('should not route mechanical parts or PEQ battery cases to cases (PM-010)', () => {
      const result1 = enforceCategory('CLASSIC ARMY GEARBOX CASE 9MM FOR M14', 'pecas-internas');
      const result2 = enforceCategory('G&G GEARBOX CASE FOR EBR ETU', 'pecas-internas');
      const result3 = enforceCategory('WOSPORT BATTERY CASE PICATINNY MOCK LASER MAWL-C1 BLACK', 'baterias');
      const result4 = enforceCategory('ESHOOTER TRACER CARBON FIBER CASE BLACK', 'pecas-externas');
      const result5 = enforceCategory('CTM-TAC BARREL CASE CNC TYPE E FOR AAP01 GREEN', 'pistolas');
      expect(result1.categorySlug).not.toBe('cases');
      expect(result2.categorySlug).not.toBe('cases');
      expect(result3.categorySlug).not.toBe('cases');
      expect(result4.categorySlug).not.toBe('cases');
      expect(result5.categorySlug).not.toBe('cases');
    });

    it('should keep complete replica rifles/snipers/pistols in replicas even when title contains handguard, gearbox, spring or color suffix', () => {
      const mcxRattler = enforceCategory(
        'VFC APFG GBBR MCX RATTLER LT 5.75 HANDGUARD RAIL BLOWBACK AIRSOFT RIFLE BLACK',
        'replicas'
      );
      const mcxSpear = enforceCategory(
        'VFC APFG GBBR MCX SPEAR LT 13.1 M-LOK HANDGUARD RAIL BLOWBACK AIRSOFT RIFLE TAN',
        'replicas'
      );
      const mcxVirtus = enforceCategory(
        'SIG SAUER VFC AVALON AEG MCX VIRTUS 11.5 BARREL WITH GEARBOX AIRSOFT RIFLE BLACK',
        'replicas'
      );
      const springSniper = enforceCategory(
        'ACTION ARMY SPRING SNIPER BOLT ACTION ACC-T10 AIRSOFT RIFLE BLACK',
        'replicas'
      );
      const tac41 = enforceCategory(
        'SILVERBACK SPRING SNIPER TAC41 LR BOLT ACTION AIRSOFT BLACK',
        'replicas'
      );
      const pistolCombo = enforceCategory(
        'ICS GBB SAR9 BLOWBACK WITH OPTICS RED DOT & MAGAZINE AIRSOFT PISTOL BLACK COMBO',
        'replicas'
      );

      expect(mcxRattler.categorySlug).toBe('replicas');
      expect(mcxSpear.categorySlug).toBe('replicas');
      expect(mcxVirtus.categorySlug).toBe('replicas');
      expect(springSniper.categorySlug).toBe('replicas');
      expect(tac41.categorySlug).toBe('replicas');
      expect(pistolCombo.categorySlug).toBe('replicas');
    });
  });

  describe('CATEGORY_WEIGHTS', () => {
    it('should prioritize specific categories over generic ones', () => {
      expect(CATEGORY_WEIGHTS['magazines']).toBeGreaterThan(CATEGORY_WEIGHTS['replicas']);
      expect(CATEGORY_WEIGHTS['pecas-internas']).toBeGreaterThan(CATEGORY_WEIGHTS['replicas']);
      expect(CATEGORY_WEIGHTS['bbs']).toBeGreaterThan(CATEGORY_WEIGHTS['replicas']);
    });
  });

  describe('extractProductDetails (REQ-026 / PM-014)', () => {
    it('should extract gallery images, clean description and deduplicated specs from product detail HTML', () => {
      const html = `
        <div class="product-gallery">
          <figure class="product-image">
            <a href="https://www.arsenalsports.com/img/34272/produtos/1200/img1.jpg" class="fancybox">
              <img src="https://www.arsenalsports.com/img/34272/produtos/600/img1.jpg" data-zoom-image="https://www.arsenalsports.com/img/34272/produtos/1200/img1.jpg" />
            </a>
          </figure>
          <figure class="product-image">
            <img src="/img/34272/produtos/600/img2.jpg" />
          </figure>
        </div>
        <div id="product-tab-description">
          <p><strong>Características:</strong></p>
          <ul>
            <li>Estilo Rattler LT na Arsenal Sports.</li>
            <li>HandGuard M-LOK em alumínio CNC.</li>
            <li>ACOMPANHA 03 MAGAZINES EXTRAS.</li>
          </ul>
          <p>Veja mais em https://www.arsenalsports.com/produto/mcx.html</p>
        </div>
        <div id="product-tab-additional">
          <table class="table">
            <tbody>
              <tr><th>SKU</th><td>549998</td></tr>
              <tr><th>Código Fabricante</th><td>APFG-S-004BK</td></tr>
              <tr><th>Marca</th><td>VFC</td></tr>
              <tr><th>PESO</th><td>2185 Gramas</td></tr>
              <tr><th>MARCA</th><td>VFC</td></tr>
            </tbody>
          </table>
        </div>
      `;

      const $ = cheerio.load(html);
      const details = extractProductDetails($);

      expect(details.images).toEqual([
        'https://www.arsenalsports.com/img/34272/produtos/1200/img1.jpg',
        'https://www.arsenalsports.com/img/34272/produtos/600/img2.jpg',
      ]);
      expect(details.description).toContain('Características:');
      expect(details.description).toContain('• Estilo Rattler LT na .');
      expect(details.description).toContain('• HandGuard M-LOK em alumínio CNC.');
      expect(details.description).not.toMatch(/Arsenal Sports/i);
      expect(details.description).not.toMatch(/arsenalsports\.com/i);
      expect(details.sku).toBe('549998');
      expect(details.specs).toEqual({
        SKU: '549998',
        'Código Fabricante': 'APFG-S-004BK',
        Marca: 'VFC',
        PESO: '2185 Gramas',
      });
    });
  });
});
