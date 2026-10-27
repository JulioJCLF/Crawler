import { describe, it, expect } from 'vitest';
import { enforceCategory, CATEGORY_WEIGHTS, cleanProductName } from '../src/config';

describe('Crawler Logic', () => {
  describe('cleanProductName', () => {
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
  });

  describe('CATEGORY_WEIGHTS', () => {
    it('should prioritize specific categories over generic ones', () => {
      expect(CATEGORY_WEIGHTS['magazines']).toBeGreaterThan(CATEGORY_WEIGHTS['replicas']);
      expect(CATEGORY_WEIGHTS['pecas-internas']).toBeGreaterThan(CATEGORY_WEIGHTS['replicas']);
      expect(CATEGORY_WEIGHTS['bbs']).toBeGreaterThan(CATEGORY_WEIGHTS['replicas']);
    });
  });
});
